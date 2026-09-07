import { memo } from "react";
import { Heart } from "lucide-react";
import { Highlight } from "@/components/Highlight";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useProductDialog } from "@/context/ProductDialogProvider";
import { useStore } from "@/context/StoreProvider";
import { useProductActions } from "@/hooks/useProductActions";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** When set, the matching fragments of the name are highlighted. */
  highlight?: string;
}

/**
 * Deliberately minimal: photo, name, price. Everything else — gallery,
 * description, specs, reviews, quantity — lives in the dialog the card opens,
 * so a grid stays scannable.
 */
export const ProductCard = memo(function ProductCard({ product, highlight }: ProductCardProps) {
  const { isFavorite } = useStore();
  const { favorite } = useProductActions();
  const { openProduct } = useProductDialog();

  const favorited = isFavorite(product.id);

  return (
    <article className="group relative transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-lg">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />

        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          {product.oldPrice && (
            <span className="rounded bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
              −{discountPercent(product.price, product.oldPrice)}%
            </span>
          )}
          {product.isNew && (
            <span className="rounded bg-foreground/85 px-2 py-0.5 text-xs text-background">
              Новинка
            </span>
          )}
        </div>

        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-background/90 py-2 text-center text-xs">
            Нет в наличии
          </div>
        )}
      </div>

      <h3 className="mt-3 line-clamp-2 text-[0.9375rem] leading-snug font-medium transition-colors group-hover:text-primary">
        {/* Stretched link: the whole card is the target, the heart sits above it. */}
        <button type="button" onClick={() => openProduct(product)} className="text-left after:absolute after:inset-0 after:content-['']">
          <Highlight text={product.name} query={highlight} />
          <span className="sr-only">— открыть карточку товара</span>
        </button>
      </h3>

      <p className="mt-1 flex items-baseline gap-2">
        <span className="font-semibold">{formatPrice(product.price)}</span>
        {product.oldPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatPrice(product.oldPrice)}
          </span>
        )}
      </p>

      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-pressed={favorited}
        aria-label={favorited ? "Удалить из избранного" : "Добавить в избранное"}
        onClick={() => favorite(product)}
        className={cn(
          "absolute top-2 right-2 z-10 size-9 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card",
          "transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
          favorited && "opacity-100",
        )}
      >
        <Heart className={cn("size-4", favorited && "fill-destructive text-destructive")} />
      </Button>
    </article>
  );
});
