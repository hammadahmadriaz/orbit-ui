import * as React from "react";
import { cx, type Color } from "../utils";

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
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "color">, ControlProps {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { color, inputSize, ghost, className, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cx("input", color && colors[color], inputSize && sizes[inputSize], ghost && "input-ghost", className)}
      {...props}
      {...useFieldProps(props)}
    />
  );
});

export interface TextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "color">,
    Omit<ControlProps, "inputSize"> {}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { color, ghost, className, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      className={cx("textarea", color && colors[color], ghost && "input-ghost", className)}
      {...props}
      {...useFieldProps(props)}
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
