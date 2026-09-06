import { useCallback } from "react";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor } from "@/api";
import { CartLineRow } from "@/components/cart/CartLineRow";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useStore } from "@/context/StoreProvider";
import { useCart } from "@/hooks/useCart";
import { useMutation } from "@/hooks/useMutation";
import { plural } from "@/lib/format";
import type { CheckoutInput } from "@/lib/types";

export function CartPage() {
  const { setQuantity, removeFromCart, clearCart, cartLines } = useStore();
  const { navigate } = useNavigation();
  const { user } = useAuth();
  const cart = useCart();

  const checkout = useMutation(
    useCallback(
      (input: CheckoutInput, signal: AbortSignal) => api.orders.create(input, signal),
      [],
    ),
  );

  const handleCheckout = async () => {
    if (!user) {
      toast.info("Войдите в аккаунт, чтобы оформить заказ");
      navigate("profile");
      return;
    }

    try {
      const order = await checkout.mutate({
        name: user.name,
        phone: user.phone,
        email: user.email,
        address: user.address,
        lines: cartLines,
      });

      clearCart();
      toast.success(`Заказ ${order.id} принят`);
      navigate("profile");
    } catch (error) {
      toast.error(messageFor(error));
    }
  };

  if (cart.isEmpty) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Корзина пуста"
        description="Добавьте товары из каталога — они сохранятся до следующего визита."
        action={
          <Button type="button" onClick={() => navigate("catalog")}>
            Перейти в каталог
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        icon={ShoppingCart}
        title="Корзина"
        description={`${cart.count} ${plural(cart.count, {
          one: "товар",
          few: "товара",
          many: "товаров",
        })}`}
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="ghost" className="text-destructive">
                Очистить
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Очистить корзину?</AlertDialogTitle>
                <AlertDialogDescription>
                  Из корзины будет удалено {cart.count}{" "}
                  {plural(cart.count, { one: "товар", few: "товара", many: "товаров" })}. Отменить
                  это действие нельзя.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Отмена</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearCart();
                    toast.success("Корзина очищена");
                  }}
                >
                  Очистить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <QueryState
        status={cart.status}
        error={cart.error}
        onRetry={cart.refetch}
        loading={
          <div className="space-y-3">
            {cartLines.map((line) => (
              <Skeleton key={line.productId} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        }
      >
        <div className="grid gap-4 md:gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
          <ul className="space-y-3">
            {cart.items.map((item) => (
              <li key={item.product.id}>
                <CartLineRow
                  item={item}
                  onQuantityChange={setQuantity}
                  onRemove={(productId) => {
                    removeFromCart(productId);
                    toast.success("Товар удалён из корзины");
                  }}
                />
              </li>
            ))}
          </ul>

          <CartSummary
            count={cart.count}
            total={cart.total}
            isSubmitting={checkout.isPending}
            canSubmit={cart.items.every((item) => item.product.inStock)}
            onCheckout={handleCheckout}
          />
        </div>
      </QueryState>
    </div>
  );
}
