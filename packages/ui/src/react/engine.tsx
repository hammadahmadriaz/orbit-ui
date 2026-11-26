import * as React from "react";

/**
 * Orbit Interaction Engine (React side).
 *
 * The engine itself is CSS: a mode is a set of --orbit-* custom properties.
 * This file only turns props and provider config into data attributes and
 * inline CSS variables. It holds no state and runs no effects, so the server
 * and client render the same markup (no hydration mismatch).
 */

export type OrbitMode = "standard" | "enhanced" | "holo" | "custom";

export interface OrbitEffects {
  /** Glow strength. `true` = 0.6, a number = 0 to 1. */
  glow?: boolean | number;
  /** Lift and elevation on interaction. `true` = 0.8, a number = 0 to 1. */
  depth?: boolean | number;
  /** Scanning effects (focus scans, scan lines). */
  scan?: boolean;
  /** Energy and charge effects (energy lines, press waves, charge bars). */
  energy?: boolean;
  /** Pointer reactive light and tilt. */
  ambient?: boolean;
  /** Holographic layers such as corner frames. */
  holo?: boolean;
}

export interface OrbitMotion {
  /** Base transition duration in milliseconds. */
  duration?: number;
  /** Any CSS easing, e.g. "ease-out" or "cubic-bezier(.2,.8,.2,1)". */
  easing?: string;
  /** Scale while pressing, e.g. 0.96. Use 1 to disable. */
  press?: number;
}

/** Props shared by every component that takes part in the interaction engine. */
export interface InteractionProps {
  /** Interaction mode for this element and its children. Inherited when omitted. */
  mode?: OrbitMode;
  /** Turn individual effects on or off, or tune their strength. */
  effects?: OrbitEffects;
  /** Motion overrides. */
  motion?: OrbitMotion;
  /** Shortcut for `effects.glow`. */
  glow?: boolean | number;
}

/** Engine config of one component type, set on the provider. */
export type OrbitComponentConfig = InteractionProps;

export type OrbitComponentName =
  | "Alert"
  | "Avatar"
  | "Badge"
  | "Button"
  | "Card"
  | "Checkbox"
  | "Dropdown"
  | "Input"
  | "Modal"
  | "Progress"
  | "Spinner"
  | "Tabs"
  | "Toast"
  | "Toggle"
  | "Tooltip";

export interface OrbitConfig extends InteractionProps {
  /** Default engine config per component type. Instance props win over these. */
  components?: Partial<Record<OrbitComponentName, OrbitComponentConfig>>;
}

const OrbitContext = React.createContext<OrbitConfig>({});

/** Read the nearest provider config. Returns `{}` without a provider. */
export function useOrbitConfig(): OrbitConfig {
  return React.useContext(OrbitContext);
}

const toLevel = (v: boolean | number | undefined, on: number): number | undefined =>
  v === undefined ? undefined : v === true ? on : v === false ? 0 : Math.min(1, Math.max(0, v));
const toFlag = (v: boolean | undefined): number | undefined => (v === undefined ? undefined : v ? 1 : 0);

/** Convert engine options into --orbit-* CSS variables. Only set values become variables. */
export function orbitVars(config: InteractionProps): Record<string, string | number> {
  const e = { ...config.effects, ...(config.glow !== undefined && { glow: config.glow }) };
  const m = config.motion ?? {};
  const vars: Record<string, string | number | undefined> = {
    "--orbit-glow": toLevel(e.glow, 0.6),
    "--orbit-depth": toLevel(e.depth, 0.8),
    "--orbit-scan": toFlag(e.scan),
    "--orbit-energy": toFlag(e.energy),
    "--orbit-ambient": toFlag(e.ambient),
    "--orbit-holo": toFlag(e.holo),
    "--orbit-duration": m.duration !== undefined ? `${m.duration}ms` : undefined,
    "--orbit-ease": m.easing,
    "--orbit-press": m.press,
  };
  const out: Record<string, string | number> = {};
  for (const k in vars) if (vars[k] !== undefined) out[k] = vars[k]!;
  return out;
}

export interface OrbitProviderProps extends OrbitConfig {
  children: React.ReactNode;
  /** Color theme for this subtree (sets data-theme). */
  theme?: string;
}

/**
 * Global engine configuration. Renders a `display: contents` wrapper that
 * carries the mode, theme and variables, so it does not affect layout.
 *
 * Nest providers to change the config for part of the page.
 */
export function OrbitProvider({ children, theme, components, ...config }: OrbitProviderProps) {
  const parent = React.useContext(OrbitContext);
  const value = React.useMemo<OrbitConfig>(
    () => ({ ...parent, ...config, components: { ...parent.components, ...components } }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parent, config.mode, config.glow, JSON.stringify(config.effects), JSON.stringify(config.motion), JSON.stringify(components)],
  );

  return (
    <OrbitContext.Provider value={value}>
      <div
        data-orbit-provider=""
        data-orbit-mode={config.mode}
        data-theme={theme}
        style={{ display: "contents", ...orbitVars(config) } as React.CSSProperties}
      >
        {children}
      </div>
    </OrbitContext.Provider>
  );
}

/**
 * Resolve engine props for one component.
 * Precedence: provider `components[name]` < instance props < instance `style`.
 * The global mode is already applied by the provider wrapper, so it is not repeated here.
 *
 * Returns props to spread on the element: `data-orbit-mode` (only when set on the
 * component or its type) and `style` with the resulting CSS variables.
 */
export function useOrbit<P extends InteractionProps & { style?: React.CSSProperties }>(
  name: OrbitComponentName,
  props: P,
): { orbitProps: { "data-orbit-mode"?: OrbitMode; style?: React.CSSProperties }; rest: Omit<P, keyof InteractionProps> } {
  const { components } = React.useContext(OrbitContext);
  const { mode, effects, motion, glow, style, ...rest } = props;
  const defaults = components?.[name] ?? {};

  const resolved: InteractionProps = {
    mode: mode ?? defaults.mode,
    glow: glow ?? defaults.glow,
    effects: { ...defaults.effects, ...effects },
    motion: { ...defaults.motion, ...motion },
  };
  const vars = orbitVars(resolved);
  const hasVars = Object.keys(vars).length > 0;

  return {
    orbitProps: {
      ...(resolved.mode && { "data-orbit-mode": resolved.mode }),
      ...((hasVars || style) && { style: { ...vars, ...style } as React.CSSProperties }),
    },
    rest: rest as Omit<P, keyof InteractionProps>,
  };
}

/** True when the user asked the OS to reduce motion. Always false on the server. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
