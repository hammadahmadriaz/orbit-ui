import * as React from "react";
import { cx } from "../utils";

const sizes = {
  xs: "spinner-xs",
  sm: "spinner-sm",
  md: "spinner-md",
  lg: "spinner-lg",
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: keyof typeof sizes;
  /** Accessible label. Ignored when aria-hidden is set. */
  label?: string;
}

export const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size, label = "Loading", className, ...props },
  ref,
) {
  const hidden = props["aria-hidden"];
  return (
    <span
      ref={ref}
      role={hidden ? undefined : "status"}
      aria-label={hidden ? undefined : label}
      className={cx("spinner", size && sizes[size], className)}
      {...props}
    />
  );
});
