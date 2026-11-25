import * as React from "react";
import { cx, type Color } from "../utils";

const colors: Record<Color, string> = {
  primary: "badge-primary",
  secondary: "badge-secondary",
  accent: "badge-accent",
  neutral: "badge-neutral",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

const variants = { solid: "", outline: "badge-outline", soft: "badge-soft" } as const;
const sizes = { sm: "badge-sm", md: "badge-md", lg: "badge-lg" } as const;

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: Color;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { color, variant = "solid", size, className, ...props },
  ref,
) {
  return (
    <span
      ref={ref}
      className={cx("badge", color && colors[color], variants[variant], size && sizes[size], className)}
      {...props}
    />
  );
});
