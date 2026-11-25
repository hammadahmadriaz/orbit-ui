import * as React from "react";
import { cx } from "../utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Smaller padding. */
  compact?: boolean;
  /** Remove the shadow. */
  flat?: boolean;
  /** Put media on the side instead of the top. */
  side?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { compact, flat, side, className, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx("card", compact && "card-compact", flat && "card-flat", side && "card-side", className)}
      {...props}
    />
  );
});

export const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function CardBody({ className, ...props }, ref) {
    return <div ref={ref} className={cx("card-body", className)} {...props} />;
  },
);

export const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return <h3 ref={ref} className={cx("card-title", className)} {...props} />;
  },
);

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
