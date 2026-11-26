import * as React from "react";
import { cx } from "../utils";
import { prefersReducedMotion, useOrbit, type InteractionProps } from "../engine";

const elevations = { 0: "card-flat", 1: "", 2: "card-raised", 3: "card-floating" } as const;

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, InteractionProps {
  /** Smaller padding. */
  compact?: boolean;
  /** Remove the shadow. Same as `elevation={0}`. */
  flat?: boolean;
  /** Put media on the side instead of the top. */
  side?: boolean;
  /** Shadow depth, 0 to 3. Default 1. */
  elevation?: keyof typeof elevations;
  /** Always show the HUD corner indicators (otherwise only on hover in holo mode). */
  framed?: boolean;
  /** Clickable card: lifts on hover and, in holo mode, tilts toward the pointer. */
  interactive?: boolean;
  /** Corner radius. Number = px, or any CSS length. Sets --card-radius. */
  radius?: number | string;
}

const TILT = 3; // degrees

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    compact,
    flat,
    side,
    elevation,
    framed,
    interactive,
    radius,
    className,
    onPointerEnter,
    onPointerMove,
    onPointerLeave,
    ...input
  },
  ref,
) {
  const { orbitProps, rest: props } = useOrbit("Card", input);
  const active = React.useRef(false);
  const frame = React.useRef(0);

  const style =
    radius === undefined
      ? orbitProps.style
      : ({ "--card-radius": typeof radius === "number" ? `${radius}px` : radius, ...orbitProps.style } as React.CSSProperties);

  // Pointer light and tilt. React delegates events, so this adds no DOM listeners.
  // The engine state is read once on enter; moves are batched to one frame.
  const handleEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerEnter?.(e);
    const ambient = getComputedStyle(e.currentTarget).getPropertyValue("--orbit-ambient").trim();
    active.current = e.pointerType === "mouse" && ambient === "1" && !prefersReducedMotion();
  };
  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    if (!active.current) return;
    const el = e.currentTarget;
    const { clientX, clientY } = e;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const r = el.getBoundingClientRect();
      const x = (clientX - r.left) / r.width;
      const y = (clientY - r.top) / r.height;
      el.style.setProperty("--orbit-mx", `${(x * 100).toFixed(1)}%`);
      el.style.setProperty("--orbit-my", `${(y * 100).toFixed(1)}%`);
      if (interactive) {
        el.style.setProperty("--orbit-tx", `${((x - 0.5) * 2 * TILT).toFixed(2)}deg`);
        el.style.setProperty("--orbit-ty", `${((0.5 - y) * 2 * TILT).toFixed(2)}deg`);
      }
    });
  };
  const handleLeave = (e: React.PointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    cancelAnimationFrame(frame.current);
    if (!active.current) return;
    active.current = false;
    const el = e.currentTarget;
    el.style.removeProperty("--orbit-tx");
    el.style.removeProperty("--orbit-ty");
  };

  React.useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const level = flat ? 0 : elevation;

  return (
    <div
      ref={ref}
      className={cx(
        "card",
        compact && "card-compact",
        level !== undefined && elevations[level],
        side && "card-side",
        framed && "card-framed",
        interactive && "card-interactive",
        className,
      )}
      data-orbit-mode={orbitProps["data-orbit-mode"]}
      style={style}
      onPointerEnter={handleEnter}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      {...props}
    />
  );
});

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...props }, ref) {
    return <div ref={ref} className={cx("card-body", className)} {...props} />;
  },
);

export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  /** Heading element, so the title fits your page outline. Default "h3". */
  as?: "h2" | "h3" | "h4" | "h5" | "h6" | "div";
}

export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { as: Tag = "h3", className, ...props },
  ref,
) {
  return <Tag ref={ref} className={cx("card-title", className)} {...props} />;
});

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(function CardDescription({ className, ...props }, ref) {
  return <p ref={ref} className={cx("card-description", className)} {...props} />;
});

export const CardActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardActions({ className, ...props }, ref) {
    return <div ref={ref} className={cx("card-actions", className)} {...props} />;
  },
);

export const CardMedia = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  function CardMedia({ className, alt = "", ...props }, ref) {
    return <img ref={ref} alt={alt} className={cx("card-media", className)} {...props} />;
  },
);
