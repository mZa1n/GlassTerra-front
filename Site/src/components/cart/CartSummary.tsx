import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SHOP } from "@/data/shop";
import { formatPrice } from "@/lib/format";

interface CartSummaryProps {
  count: number;
  total: number;
  isSubmitting: boolean;
  canSubmit: boolean;
  onCheckout: () => void;
}

export function CartSummary({
  count,
  total,
  isSubmitting,
  canSubmit,
  onCheckout,
}: CartSummaryProps) {
  const deliveryIsFree = total >= SHOP.freeDeliveryFrom;

  return (
    <Card className="lg:sticky lg:top-24">
      <CardContent className="space-y-4 p-4 md:p-6">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Товары ({count})</span>
            <span className="tabular-nums">{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Доставка</span>
            <span className={deliveryIsFree ? "text-success" : undefined}>
              {deliveryIsFree ? "Бесплатно" : "По тарифу"}
            </span>
          </div>
          {!deliveryIsFree && (
            <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
              Добавьте товаров ещё на {formatPrice(SHOP.freeDeliveryFrom - total)} — доставка станет
              бесплатной.
            </p>
          )}
        </div>

        <Separator />

        <div className="flex justify-between">
          <span className="text-foreground">Итого</span>
          <span className="text-lg tabular-nums text-foreground">{formatPrice(total)}</span>
        </div>

        <Button
          type="button"
          className="w-full"
          disabled={!canSubmit || isSubmitting}
          onClick={onCheckout}
        >
          {isSubmitting ? "Оформляем…" : "Оформить заказ"}
        </Button>
      </CardContent>
    </Card>
  );
}
