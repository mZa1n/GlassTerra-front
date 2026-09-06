import { memo } from "react";
import { ArrowLeftRight, Heart, ShoppingCart } from "lucide-react";
import { Highlight } from "@/components/Highlight";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Rating } from "@/components/Rating";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

/** The one product card used by every grid in the app. */
export const ProductCard = memo(function ProductCard({ product, highlight }: ProductCardProps) {
  const { isFavorite, isCompared } = useStore();
  const { add, favorite, compare } = useProductActions();

  const favorited = isFavorite(product.id);
  const compared = isCompared(product.id);

  return (
    <Card className="group gap-0 overflow-hidden py-0 transition-shadow duration-300 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <ImageWithFallback
          src={product.image}
          alt={product.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute top-3 left-3 flex flex-col items-start gap-2">
          {product.oldPrice && (
            <Badge variant="destructive">−{discountPercent(product.price, product.oldPrice)}%</Badge>
          )}
          {product.isNew && <Badge className="bg-emerald-600 text-white">Новинка</Badge>}
        </div>

        <Button
          type="button"
          size="icon"
          variant="secondary"
          aria-pressed={favorited}
          aria-label={favorited ? "Удалить из избранного" : "Добавить в избранное"}
          onClick={() => favorite(product)}
          className={cn(
            "absolute top-3 right-3 rounded-full shadow-sm transition-opacity",
            "focus-visible:opacity-100 md:opacity-0 md:group-hover:opacity-100",
            favorited && "opacity-100",
          )}
        >
          <Heart className={cn("size-4", favorited && "fill-red-500 text-red-500")} />
        </Button>

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55">
            <Badge variant="destructive" className="px-3 py-1 text-sm">
              Нет в наличии
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <Rating value={product.rating} reviews={product.reviews} />

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            <Highlight text={product.categoryName} query={highlight} />
          </p>
          <h3 className="line-clamp-2 min-h-[2.75rem] text-foreground">
            <Highlight text={product.name} query={highlight} />
          </h3>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          <span className="text-lg text-foreground">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(product.oldPrice)}
            </span>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="button"
            className="flex-1"
            disabled={!product.inStock}
            onClick={() => add(product)}
          >
            <ShoppingCart className="size-4" />
            {product.inStock ? "В корзину" : "Недоступно"}
          </Button>
          <Button
            type="button"
            size="icon"
            variant={compared ? "default" : "secondary"}
            aria-pressed={compared}
            aria-label={compared ? "Убрать из сравнения" : "Добавить к сравнению"}
            onClick={() => compare(product)}
          >
            <ArrowLeftRight className="size-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});
