import * as React from "react";
import { cx, mergeRefs } from "../utils";

const sizes = { sm: "modal-sm", md: "", lg: "modal-lg", full: "modal-full" } as const;

export interface ModalProps extends Omit<React.DialogHTMLAttributes<HTMLDialogElement>, "open"> {
  open: boolean;
  onClose: () => void;
  size?: keyof typeof sizes;
  /** Close when the backdrop is clicked. Default true. */
  closeOnBackdrop?: boolean;
  /** Show the X button in the corner. Default true. */
  showClose?: boolean;
}

/**
 * Controlled modal on top of the native <dialog>.
 * The browser handles focus trapping, Escape and stacking.
 */
export const Modal = React.forwardRef<HTMLDialogElement, ModalProps>(function Modal(
  { open, onClose, size = "md", closeOnBackdrop = true, showClose = true, className, children, onClick, onCancel, ...props },
  ref,
) {
  const innerRef = React.useRef<HTMLDialogElement>(null);

  React.useEffect(() => {
    const dialog = innerRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal?.();
    if (!open && dialog.open) dialog.close?.();
  }, [open]);

  return (
    <dialog
      ref={mergeRefs(ref, innerRef)}
      className={cx("modal", sizes[size], className)}
      onCancel={(e) => {
        onCancel?.(e);
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        onClick?.(e);
        if (closeOnBackdrop && e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
          if (!inside) onClose();
        }
      }}
      {...props}
    >
      {showClose && (
        <button type="button" aria-label="Close" className="btn btn-ghost btn-sm btn-circle modal-close" onClick={onClose}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ width: "1.25rem", height: "1.25rem" }}>
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      {children}
    </dialog>
  );
});

const part = <T extends HTMLElement>(tag: keyof React.JSX.IntrinsicElements, base: string, name: string) => {
  const C = React.forwardRef<T, React.HTMLAttributes<T>>(({ className, ...props }, ref) =>
    React.createElement(tag, { ref, className: cx(base, className), ...props }),
  );
  C.displayName = name;
  return C;
};

export const ModalHeader = part<HTMLDivElement>("div", "modal-header", "ModalHeader");
export const ModalTitle = part<HTMLHeadingElement>("h2", "modal-title", "ModalTitle");
export const ModalDescription = part<HTMLParagraphElement>("p", "modal-description", "ModalDescription");
export const ModalBody = part<HTMLDivElement>("div", "modal-body", "ModalBody");
export const ModalActions = part<HTMLDivElement>("div", "modal-actions", "ModalActions");
