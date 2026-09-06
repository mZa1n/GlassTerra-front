import type { ReactNode } from "react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { cn } from "@/components/ui/utils";
import type { IconComponent } from "@/lib/icon";

interface PromoBannerProps {
  /** Tailwind gradient classes, e.g. "from-blue-600 to-blue-800". */
  gradient: string;
  badgeIcon: IconComponent;
  badgeLabel: string;
  title: string;
  description: string;
  image?: string;
  className?: string;
  children?: ReactNode;
}

/** Shared shell for the three promo blocks on the news page. */
export function PromoBanner({
  gradient,
  badgeIcon: BadgeIcon,
  badgeLabel,
  title,
  description,
  image,
  className,
  children,
}: PromoBannerProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl bg-linear-to-br text-white shadow-lg",
        gradient,
        className,
      )}
    >
      {image && (
        <ImageWithFallback
          src={image}
          alt=""
          className="absolute inset-0 size-full object-cover opacity-20"
        />
      )}

      <div className="relative space-y-4 p-6 md:p-8">
        <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm backdrop-blur-sm">
          <BadgeIcon className="size-4" />
          {badgeLabel}
        </p>
        <h2 className="text-2xl text-white md:text-3xl">{title}</h2>
        <p className="text-sm text-white/85 md:text-base">{description}</p>
        {children}
      </div>
    </section>
  );
}
