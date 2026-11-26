import * as React from "react";
import { cx } from "../utils";

const variants = { line: "tabs-line", boxed: "tabs-boxed", pill: "tabs-pill" } as const;
const colors = {
  primary: "tabs-primary",
  secondary: "tabs-secondary",
  accent: "tabs-accent",
  neutral: "tabs-neutral",
} as const;
const sizes = { sm: "tabs-sm", md: "tabs-md", lg: "tabs-lg" } as const;

interface TabsContextValue {
  value: string;
  select: (value: string) => void;
  baseId: string;
  variant: keyof typeof variants;
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabs(component: string) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Tabs>`);
  return ctx;
}

const safe = (v: string) => v.replace(/[^a-zA-Z0-9_-]/g, "_");

export interface TabsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue" | "onChange"> {
  /** Selected tab (controlled). */
  value?: string;
  /** Initially selected tab (uncontrolled). */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: keyof typeof variants;
  color?: keyof typeof colors;
  size?: keyof typeof sizes;
}

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { value, defaultValue = "", onValueChange, variant = "line", color, size, className, children, ...props },
  ref,
) {
  const [inner, setInner] = React.useState(defaultValue);
  const current = value ?? inner;
  const baseId = `oui-tabs-${React.useId().replace(/:/g, "")}`;

  const select = React.useCallback(
    (v: string) => {
      if (value === undefined) setInner(v);
      onValueChange?.(v);
    },
    [value, onValueChange],
  );

  return (
    <TabsContext.Provider value={{ value: current, select, baseId, variant, color, size }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
});

export const TabList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function TabList({ className, onKeyDown, ...props }, ref) {
    const { variant, color, size } = useTabs("TabList");

    // Arrow keys, Home and End move between tabs (WAI-ARIA tabs pattern).
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      const keys = ["ArrowRight", "ArrowLeft", "Home", "End"];
      if (!keys.includes(e.key)) return;
      const tabs = Array.from(
        e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]:not(:disabled)'),
      );
      const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
      let next = index;
      if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = tabs.length - 1;
      e.preventDefault();
      tabs[next]?.focus();
      tabs[next]?.click();
    };

    return (
      <div
        ref={ref}
        role="tablist"
        className={cx("tabs", variants[variant], color && colors[color], size && sizes[size], className)}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  },
);

export interface TabProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "value"> {
  value: string;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(function Tab(
  { value, className, onClick, ...props },
  ref,
) {
  const ctx = useTabs("Tab");
  const selected = ctx.value === value;
  return (
    <button
      ref={ref}
      type="button"
      role="tab"
      id={`${ctx.baseId}-tab-${safe(value)}`}
      aria-selected={selected}
      aria-controls={`${ctx.baseId}-panel-${safe(value)}`}
      tabIndex={selected ? 0 : -1}
      className={cx("tab", className)}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) ctx.select(value);
      }}
      {...props}
    />
  );
});

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  /** Keep the panel in the DOM when hidden. Default false. */
  keepMounted?: boolean;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(function TabPanel(
  { value, keepMounted, className, children, ...props },
  ref,
) {
  const ctx = useTabs("TabPanel");
  const selected = ctx.value === value;
  if (!selected && !keepMounted) return null;
  return (
    <div
      ref={ref}
      role="tabpanel"
      id={`${ctx.baseId}-panel-${safe(value)}`}
      aria-labelledby={`${ctx.baseId}-tab-${safe(value)}`}
      hidden={!selected}
      tabIndex={0}
      className={cx("tab-panel", className)}
      {...props}
    >
      {children}
    </div>
  );
});
