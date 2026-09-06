import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import type { CartLine } from "@/api";
import { isNumberArray, usePersistentState } from "@/hooks/usePersistentState";
import type { Product } from "@/lib/types";

export const MAX_COMPARISON = 4;

/** What a toggle actually did, so the caller can show the right feedback. */
export type ToggleResult = "added" | "removed" | "limit";

const isCartLines = (value: unknown): value is CartLine[] =>
  Array.isArray(value) &&
  value.every(
    (row) =>
      typeof row === "object" &&
      row !== null &&
      typeof (row as CartLine).productId === "number" &&
      typeof (row as CartLine).quantity === "number",
  );

/**
 * Client-side selections: cart, favourites and comparison.
 *
 * Only ids and quantities live here — product details come from the API via
 * `useProductsByIds`, so prices and stock are never stale, and the same rows
 * can be pushed to a server-side cart unchanged.
 */
interface StoreContextValue {
  cartLines: CartLine[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  /** Used when merging a guest cart into a signed-in one. */
  replaceCart: (lines: readonly CartLine[]) => void;

  favorites: number[];
  isFavorite: (productId: number) => boolean;
  toggleFavorite: (productId: number) => ToggleResult;

  comparison: number[];
  isCompared: (productId: number) => boolean;
  toggleComparison: (productId: number) => ToggleResult;
  clearComparison: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cartLines, setCartLines, clearCart] = usePersistentState<CartLine[]>(
    "glassterra:cart",
    [],
    isCartLines,
  );
  const [favorites, setFavorites] = usePersistentState<number[]>(
    "glassterra:favorites",
    [],
    isNumberArray,
  );
  const [comparison, setComparison, clearComparison] = usePersistentState<number[]>(
    "glassterra:comparison",
    [],
    isNumberArray,
  );

  const cartCount = useMemo(
    () => cartLines.reduce((sum, line) => sum + line.quantity, 0),
    [cartLines],
  );

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      setCartLines((prev) => {
        const existing = prev.find((line) => line.productId === product.id);
        if (!existing) return [...prev, { productId: product.id, quantity }];
        return prev.map((line) =>
          line.productId === product.id ? { ...line, quantity: line.quantity + quantity } : line,
        );
      });
    },
    [setCartLines],
  );

  const removeFromCart = useCallback(
    (productId: number) =>
      setCartLines((prev) => prev.filter((line) => line.productId !== productId)),
    [setCartLines],
  );

  const setQuantity = useCallback(
    (productId: number, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setCartLines((prev) =>
        prev.map((line) => (line.productId === productId ? { ...line, quantity } : line)),
      );
    },
    [removeFromCart, setCartLines],
  );

  const replaceCart = useCallback(
    (lines: readonly CartLine[]) => setCartLines([...lines]),
    [setCartLines],
  );

  const toggleFavorite = useCallback(
    (productId: number): ToggleResult => {
      const wasFavorite = favorites.includes(productId);
      setFavorites((prev) =>
        wasFavorite ? prev.filter((id) => id !== productId) : [...prev, productId],
      );
      return wasFavorite ? "removed" : "added";
    },
    [favorites, setFavorites],
  );

  const toggleComparison = useCallback(
    (productId: number): ToggleResult => {
      if (comparison.includes(productId)) {
        setComparison((prev) => prev.filter((id) => id !== productId));
        return "removed";
      }

      if (comparison.length >= MAX_COMPARISON) return "limit";

      setComparison((prev) => [...prev, productId]);
      return "added";
    },
    [comparison, setComparison],
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      cartLines,
      cartCount,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      replaceCart,

      favorites,
      isFavorite: (productId) => favorites.includes(productId),
      toggleFavorite,

      comparison,
      isCompared: (productId) => comparison.includes(productId),
      toggleComparison,
      clearComparison,
    }),
    [
      cartLines,
      cartCount,
      addToCart,
      setQuantity,
      removeFromCart,
      clearCart,
      replaceCart,
      favorites,
      toggleFavorite,
      comparison,
      toggleComparison,
      clearComparison,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within <StoreProvider>");
  return context;
}
