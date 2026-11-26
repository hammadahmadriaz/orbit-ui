import * as React from "react";
import { cx } from "../utils";
import { Alert, type AlertProps } from "./alert";

const positions = {
  "top-start": "toast-top-start",
  "top-center": "toast-top-center",
  "top-end": "toast-top-end",
  "bottom-start": "toast-bottom-start",
  "bottom-center": "toast-bottom-center",
  "bottom-end": "toast-bottom-end",
} as const;

export type ToastPosition = keyof typeof positions;

export interface ToastOptions {
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?: AlertProps["status"];
  variant?: AlertProps["variant"];
  /** Milliseconds before it closes. Use Infinity to keep it open. Default from the provider. */
  duration?: number;
  /** Optional element shown under the text, e.g. an Undo button. */
  action?: React.ReactNode;
}

interface ToastItem extends ToastOptions {
  id: number;
  closing: boolean;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id?: number) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

/** Show notifications from anywhere inside <ToastProvider>. */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
  /** Default duration in milliseconds. Default 4000. */
  duration?: number;
  /** Maximum toasts on screen. Older ones are removed first. Default 5. */
  limit?: number;
}

const EXIT_MS = 180;

export function ToastProvider({ children, position = "bottom-end", duration = 4000, limit = 5 }: ToastProviderProps) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const counter = React.useRef(0);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const remove = React.useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    timers.current.delete(id);
  }, []);

  const dismiss = React.useCallback(
    (id?: number) => {
      setItems((list) =>
        list.map((t) => (id === undefined || t.id === id ? { ...t, closing: true } : t)),
      );
      setTimeout(() => {
        if (id === undefined) setItems([]);
        else remove(id);
      }, EXIT_MS);
    },
    [remove],
  );

  const toast = React.useCallback(
    (options: ToastOptions) => {
      const id = ++counter.current;
      setItems((list) => [...list, { ...options, id, closing: false }].slice(-limit));
      const ms = options.duration ?? duration;
      if (Number.isFinite(ms)) {
        timers.current.set(
          id,
          setTimeout(() => dismiss(id), ms),
        );
      }
      return id;
    },
    [duration, limit, dismiss],
  );

  React.useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div role="region" aria-label="Notifications" className={cx("toast", positions[position])}>
        {items.map((t) => (
          <Alert
            key={t.id}
            status={t.status}
            variant={t.variant ?? "soft"}
            title={t.title}
            className="toast-item"
            data-state={t.closing ? "closed" : "open"}
          >
            {t.description}
            {t.action && <div className="mt-2">{t.action}</div>}
            <button
              type="button"
              aria-label="Close notification"
              className="btn btn-ghost btn-xs btn-circle toast-close"
              onClick={() => dismiss(t.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ width: "0.875rem", height: "0.875rem" }}>
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </Alert>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
