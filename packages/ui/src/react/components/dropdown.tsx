import * as React from "react";
import { cx } from "../utils";
import { Button, type ButtonProps } from "./button";
import { useOrbit, type InteractionProps } from "../engine";
import { usePresence } from "../internal";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  menuId: string;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

function useDropdown(component: string) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error(`<${component}> must be used inside <Dropdown>`);
  return ctx;
}

export interface DropdownProps extends React.HTMLAttributes<HTMLDivElement>, InteractionProps {
  /** Controlled open state. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Align the menu to the start or end of the trigger. */
  align?: "start" | "end";
  /** Open below (default) or above the trigger. */
  side?: "bottom" | "top";
}

export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(function Dropdown(
  { open, defaultOpen = false, onOpenChange, align = "start", side = "bottom", className, children, ...input },
  ref,
) {
  const { orbitProps, rest: props } = useOrbit("Dropdown", input);
  const [inner, setInner] = React.useState(defaultOpen);
  const isOpen = open ?? inner;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuId = `oui-menu-${React.useId().replace(/:/g, "")}`;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (open === undefined) setInner(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange],
  );

  // Close on outside click and Escape.
  React.useEffect(() => {
    if (!isOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, setOpen]);

  return (
    <DropdownContext.Provider value={{ open: isOpen, setOpen, triggerRef, menuId }}>
      <div
        ref={(node) => {
          rootRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={cx("dropdown", align === "end" && "dropdown-end", side === "top" && "dropdown-top", className)}
        {...orbitProps}
        {...props}
      >
        {children}
      </div>
    </DropdownContext.Provider>
  );
});

/** The button that opens the menu. Accepts every Button prop. */
export const DropdownTrigger = React.forwardRef<HTMLButtonElement, ButtonProps>(function DropdownTrigger(
  { onClick, ...props },
  ref,
) {
  const { open, setOpen, triggerRef, menuId } = useDropdown("DropdownTrigger");
  return (
    <Button
      ref={(node) => {
        triggerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      }}
      aria-haspopup="menu"
      aria-expanded={open}
      aria-controls={open ? menuId : undefined}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) setOpen(!open);
      }}
      {...props}
    />
  );
});

export const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownMenu({ className, onKeyDown, ...props }, ref) {
    const { open, setOpen, menuId } = useDropdown("DropdownMenu");
    const menuRef = React.useRef<HTMLDivElement | null>(null);
    const { mounted, state } = usePresence(open, menuRef);
    const typeahead = React.useRef({ text: "", time: 0 });

    const items = () =>
      Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not(:disabled)') ?? []);

    React.useEffect(() => {
      if (open) items()[0]?.focus();
    }, [open]);

    if (!mounted) return null;

    // Jump to the next item that starts with the typed letters.
    const handleTypeahead = (key: string) => {
      const now = Date.now();
      const t = typeahead.current;
      t.text = now - t.time > 600 ? key : t.text + key;
      t.time = now;
      const list = items();
      const start = list.indexOf(document.activeElement as HTMLElement);
      // Pressing the same letter again cycles through items with that letter.
      const repeated = t.text.length > 1 && t.text.split("").every((c) => c === t.text[0]);
      const query = (repeated ? t.text[0] : t.text).toLowerCase();
      const cycle = t.text.length === 1 || repeated;
      const ordered = cycle ? [...list.slice(start + 1), ...list.slice(0, start + 1)] : list;
      ordered.find((el) => (el.textContent ?? "").trim().toLowerCase().startsWith(query))?.focus();
    };

    return (
      <div
        ref={(node) => {
          menuRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        id={menuId}
        role="menu"
        data-state={state}
        className={cx("dropdown-content menu", className)}
        onKeyDown={(e) => {
          onKeyDown?.(e);
          const list = items();
          const i = list.indexOf(document.activeElement as HTMLElement);
          if (e.key === "ArrowDown") list[(i + 1) % list.length]?.focus();
          else if (e.key === "ArrowUp") list[(i - 1 + list.length) % list.length]?.focus();
          else if (e.key === "Home") list[0]?.focus();
          else if (e.key === "End") list[list.length - 1]?.focus();
          else if (e.key === "Tab") setOpen(false);
          else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") handleTypeahead(e.key);
          else return;
          if (e.key !== "Tab") e.preventDefault();
        }}
        {...props}
      />
    );
  },
);

export interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Called when the item is chosen. The menu closes afterwards. */
  onSelect?: () => void;
  /** Red, for destructive actions. */
  danger?: boolean;
  /** Keyboard shortcut hint shown on the right, e.g. "Ctrl+D". Display only. */
  shortcut?: string;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(function DropdownItem(
  { onSelect, danger, shortcut, className, onClick, children, ...props },
  ref,
) {
  const { setOpen, triggerRef } = useDropdown("DropdownItem");
  return (
    <button
      ref={ref}
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cx("menu-item", danger && "menu-item-danger", className)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        onSelect?.();
        setOpen(false);
        triggerRef.current?.focus();
      }}
      {...props}
    >
      {children}
      {shortcut && (
        <span className="menu-shortcut" aria-hidden="true">
          {shortcut}
        </span>
      )}
    </button>
  );
});

export const DropdownLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownLabel({ className, ...props }, ref) {
    return <div ref={ref} className={cx("menu-label", className)} {...props} />;
  },
);

export const DropdownSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function DropdownSeparator({ className, ...props }, ref) {
    return <div ref={ref} role="separator" className={cx("menu-divider", className)} {...props} />;
  },
);
