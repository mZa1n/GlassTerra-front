import { memo } from "react";
import { ArrowLeftRight, Heart, ShoppingCart } from "lucide-react";
import { Highlight } from "@/components/Highlight";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Rating } from "@/components/Rating";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useStore } from "@/context/StoreProvider";
import { useProductActions } from "@/hooks/useProductActions";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  /** When set, the matching fragments of the name and category are highlighted. */
  highlight?: string;
}

/**
 * The one product card used by every grid.
 *
 * Reading order is name → price → rating: the title is what a shopper scans
 * for, so nothing secondary sits above it. The add button stays neutral until
 * hover, which keeps a grid of cards from turning into a wall of accent colour.
 */
export const ProductCard = memo(function ProductCard({ product, highlight }: ProductCardProps) {
  const { isFavorite, isCompared } = useStore();
  const { add, favorite, compare } = useProductActions();

  const favorited = isFavorite(product.id);
  const compared = isCompared(product.id);

  return (
    <article className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
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

        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-pressed={favorited}
          aria-label={favorited ? "Удалить из избранного" : "Добавить в избранное"}
          onClick={() => favorite(product)}
          className={cn(
            "absolute top-2 right-2 size-9 rounded-full bg-card/80 backdrop-blur-sm hover:bg-card",
            "transition-opacity focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
            favorited && "opacity-100",
          )}
        >
          <Heart className={cn("size-4", favorited && "fill-destructive text-destructive")} />
        </Button>

        {!product.inStock && (
          <div className="absolute inset-x-0 bottom-0 bg-background/90 py-2 text-center text-xs">
            Нет в наличии
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 pt-3">
        <h3 className="line-clamp-2 text-[0.9375rem] leading-snug font-medium">
          <Highlight text={product.name} query={highlight} />
        </h3>

        <p className="text-xs text-muted-foreground">
          <Highlight text={product.categoryName} query={highlight} />
        </p>

        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-semibold">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <Rating value={product.rating} reviews={product.reviews} className="pt-0.5" />

        <div className="mt-auto flex gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1 hover:border-primary hover:bg-primary hover:text-primary-foreground"
            disabled={!product.inStock}
            onClick={() => add(product)}
          >
            <ShoppingCart className="size-4" />
            {product.inStock ? "В корзину" : "Недоступно"}
          </Button>
          <Button
            type="button"
            size="icon"
            variant={compared ? "default" : "ghost"}
            aria-pressed={compared}
            aria-label={compared ? "Убрать из сравнения" : "Добавить к сравнению"}
            onClick={() => compare(product)}
            className={cn(!compared && "text-muted-foreground hover:text-foreground")}
          >
            <ArrowLeftRight className="size-4" />
          </Button>
        </div>
      </div>
    </article>
  );
});
