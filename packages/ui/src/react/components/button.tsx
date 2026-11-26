import * as React from "react";
import { cx, Slot, type Color, type Size } from "../utils";
import { Spinner } from "./spinner";
import { useOrbit, type InteractionProps } from "../engine";

const cssLength = (v: string | number) => (typeof v === "number" ? `${v}px` : v);

/* Full class strings (no template literals) so Tailwind can detect them. */
const colors: Record<Color, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  accent: "btn-accent",
  neutral: "btn-neutral",
  info: "btn-info",
  success: "btn-success",
  warning: "btn-warning",
  error: "btn-error",
};

const variants = {
  solid: "",
  outline: "btn-outline",
  soft: "btn-soft",
  ghost: "btn-ghost",
  link: "btn-link",
} as const;

const sizes: Record<Size, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

const shapes = {
  default: "",
  square: "btn-square",
  circle: "btn-circle",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, InteractionProps {
  color?: Color;
  variant?: keyof typeof variants;
  size?: Size;
  shape?: keyof typeof shapes;
  /** Stretch to the full width of the parent. */
  block?: boolean;
  /** Show a spinner and disable the button. */
  loading?: boolean;
  /** Render the child element instead of a <button>, e.g. a link. */
  asChild?: boolean;
  /** Corner radius. Number = px, or any CSS length. Sets --btn-radius. */
  radius?: number | string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    color,
    variant = "solid",
    size,
    shape = "default",
    block,
    loading,
    asChild,
    disabled,
    className,
    children,
    type,
    radius,
    onPointerDown,
    ...input
  },
  ref,
) {
  const { orbitProps, rest: props } = useOrbit("Button", input);
  const style =
    radius === undefined
      ? orbitProps.style
      : ({ "--btn-radius": cssLength(radius), ...orbitProps.style } as React.CSSProperties);

  // Remember where the press started, so the holo press wave starts there.
  // Writes two CSS variables directly: no state, no re-render.
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    onPointerDown?.(e as React.PointerEvent<HTMLButtonElement>);
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--orbit-px", `${e.clientX - r.left}px`);
    el.style.setProperty("--orbit-py", `${e.clientY - r.top}px`);
  };

  const classes = cx(
    "btn",
    color && colors[color],
    variants[variant],
    size && sizes[size],
    shapes[shape],
    block && "btn-block",
    loading && "btn-loading",
    className,
  );

  if (asChild) {
    return (
      <Slot
        ref={ref as React.Ref<HTMLElement>}
        className={classes}
        data-orbit-mode={orbitProps["data-orbit-mode"]}
        style={style}
        onPointerDown={handlePointerDown}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      data-orbit-mode={orbitProps["data-orbit-mode"]}
      style={style}
      onPointerDown={handlePointerDown}
      {...props}
    >
      {loading && <Spinner size="sm" aria-hidden />}
      {children}
    </button>
  );
});
