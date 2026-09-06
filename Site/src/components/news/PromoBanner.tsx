import type { ReactNode } from "react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { cn } from "@/components/ui/utils";

interface PromoBannerProps {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
  /** Taller treatment for the lead banner. */
  size?: "lead" | "tile";
  className?: string;
  children?: ReactNode;
}

/**
 * Photo-led promo block. Every banner is the same shape — a photograph with a
 * legibility scrim — instead of the assorted coloured gradients it replaces,
 * which introduced four accent hues the palette does not have.
 */
export function PromoBanner({
  eyebrow,
  title,
  description,
  image,
  size = "tile",
  className,
  children,
}: PromoBannerProps) {
  const isLead = size === "lead";

  return (
    <section className={cn("relative overflow-hidden rounded-lg", className)}>
      <ImageWithFallback
        src={image}
        alt=""
        className={cn("w-full object-cover", isLead ? "h-[20rem] md:h-[24rem]" : "h-[17rem]")}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/20" />

      <div
        className={cn(
          "absolute inset-0 flex flex-col justify-end gap-3 p-6",
          isLead && "justify-center md:max-w-lg md:p-10",
        )}
      >
        <p className="text-xs tracking-[0.18em] text-white/70 uppercase">{eyebrow}</p>
        <h2 className={cn("text-white", isLead ? "text-3xl md:text-4xl" : "text-xl md:text-2xl")}>
          {title}
        </h2>
        <p className="text-sm text-white/80">{description}</p>
        {children && <div className="flex flex-wrap gap-3 pt-1">{children}</div>}
      </div>
    </section>
  );
}
