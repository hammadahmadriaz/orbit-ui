import * as React from "react";
import { cx, type Color } from "../utils";

const colors: Record<Color, string> = {
  primary: "progress-primary",
  secondary: "progress-secondary",
  accent: "progress-accent",
  neutral: "progress-neutral",
  info: "progress-info",
  success: "progress-success",
  warning: "progress-warning",
  error: "progress-error",
};
const sizes = { xs: "progress-xs", sm: "progress-sm", md: "progress-md", lg: "progress-lg" } as const;

export interface ProgressProps
  extends Omit<React.ProgressHTMLAttributes<HTMLProgressElement>, "color" | "value"> {
  /** Current value. Leave undefined for an indeterminate (loading) bar. */
  value?: number;
  max?: number;
  color?: Color;
  size?: keyof typeof sizes;
  /** Animated diagonal stripes. */
  striped?: boolean;
}

export const Progress = React.forwardRef<HTMLProgressElement, ProgressProps>(function Progress(
  { value, max = 100, color, size, striped, className, ...props },
  ref,
) {
  return (
    <progress
      ref={ref}
      value={value}
      max={max}
      className={cx("progress", color && colors[color], size && sizes[size], striped && "progress-striped", className)}
      {...props}
    />
  );
});

export interface RadialProgressProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** 0 to 100. */
  value: number;
  /** Diameter as a CSS length. Default "4rem". */
  size?: string;
  /** Ring thickness as a CSS length. Default 10% of size. */
  thickness?: string;
  color?: Color;
  /** Content in the middle. Defaults to the rounded percentage. */
  children?: React.ReactNode;
}

/** Circular gauge, HUD style. The ring animates when the value changes. */
export const RadialProgress = React.forwardRef<HTMLDivElement, RadialProgressProps>(function RadialProgress(
  { value, size, thickness, color, className, style, children, ...props },
  ref,
) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cx("progress-radial", color && colors[color], className)}
      style={
        {
          "--value": clamped,
          ...(size && { "--size": size }),
          ...(thickness && { "--thickness": thickness }),
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {children ?? `${Math.round(clamped)}%`}
    </div>
  );
});
