import { search, type SearchHit } from "@/lib/search";
import type { CatalogFilter, Product, SortOrder } from "@/lib/types";

/**
 * Pure catalog predicates. Shared by the mock backend (which filters the
 * fixture in memory) and by the UI (which uses them for local state such as
 * the active filter chip), so both sides can never disagree on the rules.
 */

export function matchesFilter(product: Product, filter: CatalogFilter): boolean {
  switch (filter.kind) {
    case "all":
      return true;
    case "category":
      return product.category === filter.id;
    case "new":
      return product.isNew === true;
    case "sale":
      return product.oldPrice !== undefined;
  }
}

export function sortProducts(products: readonly Product[], order: SortOrder): Product[] {
  const sorted = [...products];
  switch (order) {
    case "price-asc":
      return sorted.sort((a, b) => a.price - b.price);
    case "price-desc":
      return sorted.sort((a, b) => b.price - a.price);
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "popular":
      return sorted.sort((a, b) => b.reviews - a.reviews);
  }
}

export const SORT_LABELS: Record<SortOrder, string> = {
  popular: "По популярности",
  "price-asc": "Сначала дешевле",
  "price-desc": "Сначала дороже",
  rating: "По рейтингу",
};

export const POPULAR_SEARCHES = ["Стакан", "Кружка", "Салатник", "Ваза", "Сервиз"] as const;

/** Stable cache key for a query — also the shape the HTTP layer serialises. */
export const filterKey = (filter: CatalogFilter) =>
  filter.kind === "category" ? `category:${filter.id}` : filter.kind;

/** Ranks products by relevance to `query`, best match first. */
export const searchProducts = (
  products: readonly Product[],
  query: string,
): SearchHit<Product>[] =>
  search(products, query, (product) => ({
    name: product.name,
    category: product.categoryName,
    description: product.description,
  }));
