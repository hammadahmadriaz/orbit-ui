import * as React from "react";
import { cx, Slot, type Color, type Size } from "../utils";
import { Spinner } from "./spinner";

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

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    ...props
  },
  ref,
) {
  const classes = cx(
    "btn",
    color && colors[color],
    variants[variant],
    size && sizes[size],
    shapes[shape],
    block && "btn-block",
    className,
  );

  if (asChild) {
    return (
      <Slot ref={ref as React.Ref<HTMLElement>} className={classes} {...props}>
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
      {...props}
    >
      {loading && <Spinner size="sm" aria-hidden />}
      {children}
    </button>
  );
});
