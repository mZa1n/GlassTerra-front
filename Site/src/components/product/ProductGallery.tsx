import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

interface ProductGalleryProps {
  images: readonly string[];
  alt: string;
}

const SWIPE_THRESHOLD_PX = 40;

/** Photo viewer with thumbnails, arrows, keyboard and touch swipe. */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const count = images.length;
  const go = (delta: number) => setIndex((current) => (current + delta + count) % count);

  // Reset when the dialog is reused for another product.
  useEffect(() => setIndex(0), [images]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (count < 2) return;
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  return (
    <div className="space-y-3">
      <div
        role="group"
        aria-roledescription="карусель"
        aria-label={`Фотографии: ${alt}`}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onTouchStart={(event) => {
          touchStartX.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStartX.current;
          const end = event.changedTouches[0]?.clientX;
          touchStartX.current = null;
          if (start === null || end === undefined || count < 2) return;

          const distance = start - end;
          if (Math.abs(distance) > SWIPE_THRESHOLD_PX) go(distance > 0 ? 1 : -1);
        }}
        className="group relative aspect-square overflow-hidden rounded-lg bg-muted outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <ImageWithFallback
          key={images[index]}
          src={images[index]}
          alt={`${alt} — фото ${index + 1} из ${count}`}
          className="size-full object-cover"
        />

        {count > 1 && (
          <>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Предыдущее фото"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-2 size-9 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              aria-label="Следующее фото"
              onClick={() => go(1)}
              className="absolute top-1/2 right-2 size-9 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card"
            >
              <ChevronRight className="size-4" />
            </Button>

            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-foreground/70 px-2.5 py-0.5 text-xs text-background">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="scrollbar-hide touch-pan-x flex gap-2 overflow-x-auto">
          {images.map((src, thumbIndex) => (
            <button
              key={src}
              type="button"
              aria-label={`Фото ${thumbIndex + 1}`}
              aria-current={thumbIndex === index}
              onClick={() => setIndex(thumbIndex)}
              className={cn(
                "size-16 shrink-0 overflow-hidden rounded border-2 transition-colors",
                thumbIndex === index ? "border-primary" : "border-transparent hover:border-border",
              )}
            >
              <ImageWithFallback src={src} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
