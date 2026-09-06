import { useEffect, useState } from "react";
import { ArrowLeftRight, Heart, Minus, Plus, ShoppingCart, Truck } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductReviews } from "@/components/product/ProductReviews";
import { Rating } from "@/components/Rating";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/components/ui/utils";
import { useStore } from "@/context/StoreProvider";
import { useProductActions } from "@/hooks/useProductActions";
import { SHOP } from "@/data/shop";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ProductDialogProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDialog({ product, open, onOpenChange }: ProductDialogProps) {
  const { isFavorite, isCompared } = useStore();
  const { add, favorite, compare } = useProductActions();
  const [quantity, setQuantity] = useState(1);

  // A reopened dialog starts from one item again.
  useEffect(() => setQuantity(1), [product?.id]);

  if (!product) return null;

  const favorited = isFavorite(product.id);
  const compared = isCompared(product.id);
  const specs = Object.entries(product.specs);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(64rem,calc(100vw-2rem))] gap-0 p-0 sm:max-w-[min(64rem,calc(100vw-2rem))]">
        <div className="grid gap-8 p-5 md:grid-cols-2 md:p-8">
          <div className="md:sticky md:top-8 md:self-start">
            <ProductGallery images={product.images} alt={product.name} />
          </div>

          <div className="space-y-5">
            <DialogHeader className="space-y-2 text-left">
              <p className="text-xs tracking-wide text-muted-foreground uppercase">
                {product.categoryName}
              </p>
              <DialogTitle className="text-2xl leading-tight">{product.name}</DialogTitle>
              <DialogDescription className="sr-only">
                Карточка товара: фотографии, характеристики и отзывы
              </DialogDescription>
              <Rating value={product.rating} reviews={product.reviews} />
            </DialogHeader>

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="text-3xl font-semibold">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <span className="rounded bg-destructive px-2 py-0.5 text-xs text-destructive-foreground">
                    −{discountPercent(product.price, product.oldPrice)}%
                  </span>
                </>
              )}
            </div>

            <p
              className={cn(
                "text-sm",
                product.inStock ? "text-success" : "text-destructive",
              )}
            >
              {product.inStock ? "В наличии" : "Нет в наличии"}
            </p>

            <p className="leading-relaxed text-muted-foreground">{product.description}</p>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 rounded-md border p-1">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Уменьшить количество"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                >
                  <Minus className="size-4" />
                </Button>
                <span className="w-8 text-center tabular-nums" aria-live="polite">
                  {quantity}
                </span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  aria-label="Увеличить количество"
                  onClick={() => setQuantity((value) => Math.min(99, value + 1))}
                >
                  <Plus className="size-4" />
                </Button>
              </div>

              <Button
                type="button"
                size="lg"
                className="flex-1"
                disabled={!product.inStock}
                onClick={() => add(product, quantity)}
              >
                <ShoppingCart className="size-4" />
                {product.inStock ? "В корзину" : "Недоступно"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                aria-pressed={favorited}
                onClick={() => favorite(product)}
              >
                <Heart className={cn("size-4", favorited && "fill-destructive text-destructive")} />
                {favorited ? "В избранном" : "В избранное"}
              </Button>
              <Button
                type="button"
                variant="outline"
                aria-pressed={compared}
                onClick={() => compare(product)}
              >
                <ArrowLeftRight className={cn("size-4", compared && "text-primary")} />
                {compared ? "В сравнении" : "К сравнению"}
              </Button>
            </div>

            <p className="flex items-start gap-2 rounded-md bg-secondary p-3 text-sm text-muted-foreground">
              <Truck className="mt-0.5 size-4 shrink-0" />
              Бесплатная доставка по городу при заказе от {formatPrice(SHOP.freeDeliveryFrom)}.
              Возврат в течение 14 дней.
            </p>

            {specs.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-base">Характеристики</h3>
                <dl className="divide-y rounded-md border">
                  {specs.map(([key, value]) => (
                    <div key={key} className="flex justify-between gap-4 px-3 py-2 text-sm">
                      <dt className="text-muted-foreground">{key}</dt>
                      <dd className="text-right">{value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <Separator />

            <ProductReviews product={product} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
