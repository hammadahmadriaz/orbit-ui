import * as React from "react";
import { cx } from "../utils";

const statuses = {
  info: "alert-info",
  success: "alert-success",
  warning: "alert-warning",
  error: "alert-error",
} as const;
const variants = { soft: "", solid: "alert-solid", outline: "alert-outline" } as const;

type Status = keyof typeof statuses;

const svg = (path: React.ReactNode) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {path}
  </svg>
);

const icons: Record<Status, React.ReactNode> = {
  info: svg(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>),
  success: svg(<><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></>),
  warning: svg(<><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4M12 17h.01" /></>),
  error: svg(<><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6M9 9l6 6" /></>),
};

export interface AlertProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  status?: Status;
  variant?: keyof typeof variants;
  title?: React.ReactNode;
  /** Custom icon. Pass `false` to hide it. Defaults to an icon for the status. */
  icon?: React.ReactNode | false;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { status, variant = "soft", title, icon, className, children, ...props },
  ref,
) {
  const resolvedIcon = icon === false ? null : icon ?? (status ? icons[status] : null);
  return (
    <div
      ref={ref}
      role={status === "error" || status === "warning" ? "alert" : "status"}
      className={cx("alert", status && statuses[status], variants[variant], className)}
      {...props}
    >
      {resolvedIcon && <span className="alert-icon">{resolvedIcon}</span>}
      {title && <div className="alert-title">{title}</div>}
      {children && <div className="alert-description">{children}</div>}
    </div>
  );
});
