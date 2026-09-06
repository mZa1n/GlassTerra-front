import { useCallback } from "react";
import { Package } from "lucide-react";
import { api } from "@/api";
import { QueryState } from "@/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@/hooks/useQuery";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";

const STATUS_LABELS: Record<Order["status"], string> = {
  new: "Принят",
  processing: "Собирается",
  shipped: "В пути",
  delivered: "Доставлен",
  cancelled: "Отменён",
};

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "long" });

export function OrdersCard() {
  const orders = useQuery(
    "orders",
    useCallback((signal: AbortSignal) => api.orders.list(signal), []),
  );

  return (
    <Card>
      <CardContent className="space-y-4 p-4 md:p-6">
        <div className="flex items-center gap-3">
          <Package className="size-5 text-primary" />
          <h2 className="text-foreground">Мои заказы</h2>
        </div>

        <QueryState
          status={orders.status}
          error={orders.error}
          onRetry={orders.refetch}
          loading={<Skeleton className="h-20 w-full rounded-lg" />}
        >
          {(orders.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Заказов пока нет.</p>
          ) : (
            <ul className="space-y-3">
              {orders.data?.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary p-3"
                >
                  <div>
                    <p className="text-sm text-foreground">Заказ {order.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {dateFormatter.format(new Date(order.createdAt))} ·{" "}
                      {order.lines.length} поз.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{STATUS_LABELS[order.status]}</Badge>
                    <span className="tabular-nums text-foreground">{formatPrice(order.total)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </QueryState>
      </CardContent>
    </Card>
  );
}
