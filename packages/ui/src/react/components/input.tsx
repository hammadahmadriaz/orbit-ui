import * as React from "react";
import { cx, type Color } from "../utils";
import { useOrbit, type InteractionProps } from "../engine";

type InputColor = Exclude<Color, "neutral">;

const colors: Record<InputColor, string> = {
  primary: "input-primary",
  secondary: "input-secondary",
  accent: "input-accent",
  info: "input-info",
  success: "input-success",
  warning: "input-warning",
  error: "input-error",
};
const sizes = { sm: "input-sm", md: "input-md", lg: "input-lg" } as const;

/* Field context wires label, hint and error to the control automatically. */
interface FieldContextValue {
  id: string;
  hintId?: string;
  errorId?: string;
  invalid: boolean;
}
const FieldContext = React.createContext<FieldContextValue | null>(null);

function useFieldProps(props: { id?: string; "aria-describedby"?: string; "aria-invalid"?: any }) {
  const field = React.useContext(FieldContext);
  if (!field) return {};
  const describedBy = [props["aria-describedby"], field.hintId, field.errorId].filter(Boolean).join(" ");
  return {
    id: props.id ?? field.id,
    "aria-describedby": describedBy || undefined,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
  };
}

interface ControlProps {
  color?: InputColor;
  inputSize?: keyof typeof sizes;
  ghost?: boolean;
  /** Validation state. "error" also sets aria-invalid. Overrides `color`. */
  status?: "success" | "error";
}

const statusClass = { success: "input-success", error: "input-error" } as const;

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color" | "prefix">,
    ControlProps,
    InteractionProps {
  /** Content before the text, e.g. an icon or "https://". */
  prefix?: React.ReactNode;
  /** Content after the text, e.g. a unit, icon or button. */
  suffix?: React.ReactNode;
  /** Corner radius. Number = px, or any CSS length. Sets --input-radius. */
  radius?: number | string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { color, inputSize, ghost, status, prefix, suffix, radius, className, ...input },
  ref,
) {
  const { orbitProps, rest: props } = useOrbit("Input", input);
  const field = useFieldProps(props);
  const style =
    radius === undefined
      ? orbitProps.style
      : ({ "--input-radius": typeof radius === "number" ? `${radius}px` : radius, ...orbitProps.style } as React.CSSProperties);
  const invalid = status === "error" ? true : (field["aria-invalid"] ?? props["aria-invalid"]);
  const classes = cx(
    "input",
    status ? statusClass[status] : color && colors[color],
    inputSize && sizes[inputSize],
    ghost && "input-ghost",
    className,
  );

  if (prefix == null && suffix == null) {
    return (
      <input
        ref={ref}
        className={classes}
        data-orbit-mode={orbitProps["data-orbit-mode"]}
        style={style}
        {...props}
        {...field}
        aria-invalid={invalid || undefined}
      />
    );
  }

  // With prefix or suffix, the styled box is a wrapper and the real input sits inside.
  return (
    <div
      className={classes}
      data-orbit-mode={orbitProps["data-orbit-mode"]}
      style={style}
      aria-disabled={props.disabled || undefined}
      aria-invalid={invalid || undefined}
      onPointerDown={(e) => {
        const target = e.target as HTMLElement;
        if (target.closest("button, a, input, select, textarea")) return;
        e.preventDefault();
        e.currentTarget.querySelector("input")?.focus();
      }}
    >
      {prefix != null && <span className="input-addon">{prefix}</span>}
      <input ref={ref} className="input-bare" {...props} {...field} aria-invalid={invalid || undefined} />
      {suffix != null && <span className="input-addon">{suffix}</span>}
    </div>
  );
});

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "color">,
    Omit<ControlProps, "inputSize"> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { color, ghost, status, className, ...props },
  ref,
) {
  const field = useFieldProps(props);
  const invalid = status === "error" ? true : (field["aria-invalid"] ?? props["aria-invalid"]);
  return (
    <textarea
      ref={ref}
      className={cx("textarea", status ? statusClass[status] : color && colors[color], ghost && "input-ghost", className)}
      {...props}
      {...field}
      aria-invalid={invalid || undefined}
    />
  );
});

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "color">, ControlProps {}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { color, inputSize, ghost, className, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cx("select", color && colors[color], inputSize && sizes[inputSize], ghost && "input-ghost", className)}
      {...props}
      {...useFieldProps(props)}
    />
  );
});

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  hint?: React.ReactNode;
  error?: React.ReactNode;
  /** Id for the control. Generated when omitted. */
  htmlFor?: string;
}

/**
 * Field wraps one control with a label, hint and error message,
 * and connects them with the right aria attributes.
 */
export const Field = React.forwardRef<HTMLDivElement, FieldProps>(function Field(
  { label, hint, error, htmlFor, className, children, ...props },
  ref,
) {
  const autoId = React.useId();
  const id = htmlFor ?? `oui-${autoId}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <FieldContext.Provider value={{ id, hintId, errorId, invalid: Boolean(error) }}>
      <div ref={ref} className={cx("field", className)} {...props}>
        {label && (
          <label htmlFor={id} className="field-label">
            {label}
          </label>
        )}
        {children}
        {hint && !error && (
          <p id={hintId} className="field-hint">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="field-error" role="alert">
            {error}
          </p>
        )}
      </div>
    </FieldContext.Provider>
  );
});
