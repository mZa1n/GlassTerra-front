import { useCallback } from "react";
import { toast } from "sonner";
import { MAX_COMPARISON, useStore } from "@/context/StoreProvider";
import { useNavigation } from "@/context/NavigationProvider";
import type { Product } from "@/lib/types";

/**
 * The three actions every product card offers, with their user feedback.
 * Kept in one place so the catalog, search results and comparison table
 * behave identically.
 */
export function useProductActions() {
  const { addToCart, toggleFavorite, toggleComparison } = useStore();
  const { navigate } = useNavigation();

  const add = useCallback(
    (product: Product, quantity = 1) => {
      if (!product.inStock) {
        toast.error("Товара нет в наличии");
        return;
      }

      addToCart(product, quantity);
      toast.success(`${product.name} — в корзине`, {
        action: { label: "Перейти", onClick: () => navigate("cart") },
      });
    },
    [addToCart, navigate],
  );

  const favorite = useCallback(
    (product: Product) => {
      const result = toggleFavorite(product.id);
      toast.success(result === "added" ? "Добавлено в избранное" : "Удалено из избранного");
    },
    [toggleFavorite],
  );

  const compare = useCallback(
    (product: Product) => {
      const result = toggleComparison(product.id);

      if (result === "limit") {
        toast.error(`Можно сравнить не больше ${MAX_COMPARISON} товаров`);
        return;
      }

      toast.success(result === "added" ? "Добавлено к сравнению" : "Удалено из сравнения", {
        action:
          result === "added"
            ? { label: "Сравнить", onClick: () => navigate("comparison") }
            : undefined,
      });
    },
    [toggleComparison, navigate],
  );

  return { add, favorite, compare };
}
