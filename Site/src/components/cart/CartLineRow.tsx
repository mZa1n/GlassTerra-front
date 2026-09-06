import { Minus, Plus, Trash2 } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";
import type { CartItem } from "@/lib/types";

interface CartLineRowProps {
  item: CartItem;
  onQuantityChange: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
}

export function CartLineRow({ item, onQuantityChange, onRemove }: CartLineRowProps) {
  const { product, quantity } = item;

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center md:gap-4 md:p-4">
        <ImageWithFallback
          src={product.image}
          alt=""
          className="size-20 shrink-0 rounded-lg object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3 className="text-foreground">{product.name}</h3>
          <p className="text-sm text-primary">{formatPrice(product.price)}</p>
          {!product.inStock && (
            <p className="text-sm text-destructive">Товар закончился — удалите его из заказа</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Уменьшить количество"
            onClick={() => onQuantityChange(product.id, quantity - 1)}
          >
            <Minus className="size-4" />
          </Button>
          <span className="w-10 text-center tabular-nums">{quantity}</span>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Увеличить количество"
            onClick={() => onQuantityChange(product.id, quantity + 1)}
          >
            <Plus className="size-4" />
          </Button>
        </div>

        <p className="min-w-24 text-right tabular-nums text-foreground">
          {formatPrice(product.price * quantity)}
        </p>

        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={`Удалить ${product.name} из корзины`}
          onClick={() => onRemove(product.id)}
          className="text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </CardContent>
    </Card>
  );
}
