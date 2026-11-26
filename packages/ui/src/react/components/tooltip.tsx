import * as React from "react";
import { cx } from "../utils";
import { useOrbit, type InteractionProps } from "../engine";

const sides = {
  top: "tooltip-top",
  bottom: "tooltip-bottom",
  left: "tooltip-left",
  right: "tooltip-right",
} as const;

const colors = {
  primary: "tooltip-primary",
  secondary: "tooltip-secondary",
  accent: "tooltip-accent",
  info: "tooltip-info",
  success: "tooltip-success",
  warning: "tooltip-warning",
  error: "tooltip-error",
} as const;

export interface TooltipProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content" | "color">,
    InteractionProps {
  /** Text or any element shown in the tooltip. */
  content: React.ReactNode;
  side?: keyof typeof sides;
  color?: keyof typeof colors;
  /** Force the tooltip to stay visible. */
  open?: boolean;
  /** Milliseconds before it appears. Default 120. */
  delay?: number;
  /** A single element that triggers the tooltip on hover and focus. */
  children: React.ReactElement;
}

/** CSS powered tooltip. Shows on hover and keyboard focus, no positioning library needed. */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    content,
    side = "top",
    color,
    open,
    delay,
    className,
    children,
    onKeyDown,
    onPointerEnter,
    onPointerLeave,
    onBlur,
    ...input
  },
  ref,
) {
  const { orbitProps, rest: props } = useOrbit("Tooltip", input);
  const id = `oui-tt-${React.useId().replace(/:/g, "")}`;
  const [dismissed, setDismissed] = React.useState(false);
  const hovered = React.useRef(false);

  // Escape hides the tooltip (WCAG 1.4.13). While the pointer is over it, focus may be
  // elsewhere, so a document listener is added on enter and removed on leave.
  const onDocKey = React.useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") setDismissed(true);
  }, []);
  React.useEffect(() => () => document.removeEventListener("keydown", onDocKey), [onDocKey]);

  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        "aria-describedby": cx((children.props as any)["aria-describedby"], id),
      })
    : children;

  const style =
    delay === undefined
      ? orbitProps.style
      : ({ "--tt-delay": `${delay}ms`, ...orbitProps.style } as React.CSSProperties);

  return (
    <span
      ref={ref}
      className={cx(
        "tooltip",
        sides[side],
        color && colors[color],
        open && "tooltip-open",
        dismissed && "tooltip-dismissed",
        className,
      )}
      data-orbit-mode={orbitProps["data-orbit-mode"]}
      style={style}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.key === "Escape" && !dismissed) {
          // Close the tooltip first, not a surrounding dialog.
          e.stopPropagation();
          e.preventDefault();
          setDismissed(true);
        }
      }}
      onPointerEnter={(e) => {
        onPointerEnter?.(e);
        hovered.current = true;
        document.addEventListener("keydown", onDocKey);
      }}
      onPointerLeave={(e) => {
        onPointerLeave?.(e);
        hovered.current = false;
        document.removeEventListener("keydown", onDocKey);
        if (!e.currentTarget.contains(document.activeElement)) setDismissed(false);
      }}
      onBlur={(e) => {
        onBlur?.(e);
        if (!e.currentTarget.contains(e.relatedTarget as Node) && !hovered.current) setDismissed(false);
      }}
      {...props}
    >
      {child}
      <span id={id} role="tooltip" className="tooltip-content">
        {content}
      </span>
    </span>
  );
});
