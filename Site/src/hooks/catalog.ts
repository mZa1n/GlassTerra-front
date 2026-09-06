import { useCallback } from "react";
import { api } from "@/api";
import { useQuery } from "@/hooks/useQuery";
import { filterKey } from "@/lib/catalog";
import type { CatalogFilter, ProductQuery, SortOrder } from "@/lib/types";

/**
 * Typed catalog queries. Screens use these instead of touching `api` directly,
 * so cache keys stay consistent in one place.
 */

export const useCategories = () =>
  useQuery("categories", useCallback((signal) => api.catalog.listCategories(signal), []));

export function useProducts(query: ProductQuery) {
  const {
    filter = { kind: "all" } as CatalogFilter,
    sort = "popular" as SortOrder,
    search = "",
    page = 1,
    perPage,
  } = query;

  // Every argument that changes the response must be in the key.
  const key = `products:${filterKey(filter)}:${sort}:${search}:${page}:${perPage ?? "all"}`;

  return useQuery(
    key,
    useCallback(
      (signal) => api.catalog.listProducts({ filter, sort, search, page, perPage }, signal),
      // The key already encodes every argument that identifies the request.
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [key],
    ),
  );
}

/** Hydrates the id lists kept in the cart, favourites and comparison. */
export function useProductsByIds(ids: readonly number[]) {
  const key = `products:ids:${ids.join(",")}`;

  return useQuery(
    key,
    useCallback(
      (signal) => api.catalog.getProductsByIds(ids, signal),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [key],
    ),
    { enabled: ids.length > 0 },
  );
}

export function useSuggestions(query: string, limit = 5) {
  const trimmed = query.trim();

  return useQuery(
    `suggest:${trimmed}:${limit}`,
    useCallback(
      (signal) => api.catalog.suggest(trimmed, limit, signal),
      [trimmed, limit],
    ),
    // Showing the previous query's products next to the current query's
    // categories would be actively misleading, so drop them while loading.
    { enabled: trimmed.length > 0, keepPreviousData: false },
  );
}

export function useReviews(productId: number | null) {
  return useQuery(
    `reviews:${productId ?? "none"}`,
    useCallback(
      (signal) => api.catalog.getReviews(productId as number, signal),
      [productId],
    ),
    { enabled: productId !== null },
  );
}
