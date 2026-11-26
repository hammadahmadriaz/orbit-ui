import * as React from "react";
import { cx } from "../utils";

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

export interface TooltipProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "content" | "color"> {
  /** Text or any element shown in the tooltip. */
  content: React.ReactNode;
  side?: keyof typeof sides;
  color?: keyof typeof colors;
  /** Force the tooltip to stay visible. */
  open?: boolean;
  /** A single element that triggers the tooltip on hover and focus. */
  children: React.ReactElement;
}

/** CSS powered tooltip. Shows on hover and keyboard focus, no positioning library needed. */
export const Tooltip = React.forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { content, side = "top", color, open, className, children, ...props },
  ref,
) {
  const id = `oui-tt-${React.useId().replace(/:/g, "")}`;
  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<any>, {
        "aria-describedby": cx((children.props as any)["aria-describedby"], id),
      })
    : children;

  return (
    <span
      ref={ref}
      className={cx("tooltip", sides[side], color && colors[color], open && "tooltip-open", className)}
      {...props}
    >
      {child}
      <span id={id} role="tooltip" className="tooltip-content">
        {content}
      </span>
    </span>
  );
});
