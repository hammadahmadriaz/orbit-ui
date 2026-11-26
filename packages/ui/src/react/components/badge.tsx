import * as React from "react";
import { cx, type Color } from "../utils";
import { useOrbit, type InteractionProps } from "../engine";

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

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, InteractionProps {
  color?: Color;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** A ring pulses out, for live states such as "Recording" or "Online". */
  pulse?: boolean;
  /** Show a leading status dot. */
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { color, variant = "solid", size, pulse, dot, className, ...input },
  ref,
) {
  const { orbitProps, rest: props } = useOrbit("Badge", input);
  return (
    <span
      ref={ref}
      className={cx(
        "badge",
        color && colors[color],
        variants[variant],
        size && sizes[size],
        pulse && "badge-pulse",
        dot && "badge-dot",
        className,
      )}
      {...orbitProps}
      {...props}
    />
  );
});
