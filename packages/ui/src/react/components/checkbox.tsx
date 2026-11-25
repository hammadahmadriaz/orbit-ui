import * as React from "react";
import { cx, mergeRefs } from "../utils";

type CheckColor = "primary" | "secondary" | "accent" | "success" | "warning" | "error";

const checkboxColors: Record<CheckColor, string> = {
  primary: "checkbox-primary",
  secondary: "checkbox-secondary",
  accent: "checkbox-accent",
  success: "checkbox-success",
  warning: "checkbox-warning",
  error: "checkbox-error",
};
const toggleColors: Record<CheckColor, string> = {
  primary: "toggle-primary",
  secondary: "toggle-secondary",
  accent: "toggle-accent",
  success: "toggle-success",
  warning: "toggle-warning",
  error: "toggle-error",
};
const checkboxSizes = { sm: "checkbox-sm", md: "", lg: "checkbox-lg" } as const;
const toggleSizes = { sm: "toggle-sm", md: "", lg: "toggle-lg" } as const;

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "color"> {
  color?: CheckColor;
  size?: keyof typeof checkboxSizes;
  indeterminate?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { color, size, indeterminate = false, className, ...props },
  ref,
) {
  const inner = React.useRef<HTMLInputElement>(null);
  React.useEffect(() => {
    if (inner.current) inner.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <input
      ref={mergeRefs(ref, inner)}
      type="checkbox"
      className={cx("checkbox", color && checkboxColors[color], size && checkboxSizes[size], className)}
      {...props}
    />
  );
});

export interface ToggleProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "color"> {
  color?: CheckColor;
  size?: keyof typeof toggleSizes;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(function Toggle(
  { color, size, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type="checkbox"
      role="switch"
      className={cx("toggle", color && toggleColors[color], size && toggleSizes[size], className)}
      {...props}
    />
  );
});
