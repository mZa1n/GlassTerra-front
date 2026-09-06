import { useEffect, useState, type ImgHTMLAttributes } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/components/ui/utils";

/**
 * <img> that degrades to a placeholder instead of a broken-image icon.
 * The error state resets when `src` changes, so a retry or a new product
 * in the same slot gets a fresh attempt.
 */
export function ImageWithFallback({
  src,
  alt,
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [src]);

  if (failed || !src) {
    return (
      <div
        // A decorative image stays decorative when it fails to load.
        {...(alt ? { role: "img", "aria-label": alt } : { "aria-hidden": true })}
        className={cn("flex items-center justify-center bg-muted", className)}
      >
        <ImageOff className="size-8 text-muted-foreground/40" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
      onError={() => setFailed(true)}
      {...props}
    />
  );
}
