import * as React from "react";
import { cx, type Size } from "../utils";

const sizes: Record<Size, string> = {
  xs: "avatar-xs",
  sm: "avatar-sm",
  md: "avatar-md",
  lg: "avatar-lg",
  xl: "avatar-xl",
};

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  /** Name used to build initials when there is no image or it fails to load. */
  name?: string;
  size?: Size;
  square?: boolean;
}

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { src, alt, name, size, square, className, children, ...props },
  ref,
) {
  const [failed, setFailed] = React.useState(false);
  React.useEffect(() => setFailed(false), [src]);
  const showImage = src && !failed;

  return (
    <span
      ref={ref}
      role={showImage ? undefined : "img"}
      aria-label={showImage ? undefined : alt ?? name}
      className={cx("avatar", size && sizes[size], square && "avatar-square", className)}
      {...props}
    >
      {showImage ? <img src={src} alt={alt ?? name ?? ""} onError={() => setFailed(true)} /> : children ?? initials(name)}
    </span>
  );
});

export const AvatarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function AvatarGroup({ className, ...props }, ref) {
    return <div ref={ref} className={cx("avatar-group", className)} {...props} />;
  },
);
