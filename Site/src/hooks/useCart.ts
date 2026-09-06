import { useMemo } from "react";
import { useStore } from "@/context/StoreProvider";
import { useProductsByIds } from "@/hooks/catalog";
import type { CartItem } from "@/lib/types";

/**
 * Joins the persisted cart rows with live product data.
 *
 * Prices, names and stock always come from the server, so a price change
 * between sessions is reflected the next time the cart is opened.
 */
export function useCart() {
  const { cartLines, cartCount } = useStore();

  const ids = useMemo(() => cartLines.map((line) => line.productId), [cartLines]);
  const { data: products, status, error, refetch } = useProductsByIds(ids);

  const items = useMemo<CartItem[]>(() => {
    if (!products) return [];

    const byId = new Map(products.map((product) => [product.id, product]));
    return cartLines.flatMap((line) => {
      const product = byId.get(line.productId);
      return product ? [{ product, quantity: line.quantity }] : [];
    });
  }, [cartLines, products]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items],
  );

  return {
    items,
    total,
    count: cartCount,
    isEmpty: cartLines.length === 0,
    status: cartLines.length === 0 ? ("success" as const) : status,
    error,
    refetch,
  };
}
