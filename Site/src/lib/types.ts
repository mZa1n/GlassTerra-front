/** Every routable screen in the app. Single source of truth for navigation. */
export type Page =
  | "home"
  | "catalog"
  | "news"
  | "new-arrivals"
  | "delivery"
  | "returns"
  | "contacts"
  | "about"
  | "vacancies"
  | "partners"
  | "privacy"
  | "terms"
  | "cart"
  | "profile"
  | "favorites"
  | "comparison"
  | "search";

export const CATEGORY_IDS = [
  "glasses",
  "mugs",
  "bowls",
  "pitchers",
  "plates",
  "teasets",
  "decor",
] as const;

export type CategoryId = (typeof CATEGORY_IDS)[number];

export interface Category {
  id: CategoryId;
  name: string;
  image: string;
  /** Filled by the catalog service; the client never counts products itself. */
  productCount: number;
}

export interface Product {
  id: number;
  /** Stable, human-readable identifier — will become the product URL segment. */
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: CategoryId;
  /** Denormalised label so a product card needs no second request. */
  categoryName: string;
  rating: number;
  reviews: number;
  image: string;
  /** Gallery for the product dialog; `image` is always the first entry. */
  images: string[];
  inStock: boolean;
  isNew?: boolean;
  description: string;
  /** Rendered as rows in the comparison table; keys are reused across products. */
  specs: Record<string, string>;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  /** ISO date. */
  createdAt: string;
  text: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

/**
 * What the catalog is narrowed down to. A tagged union rather than a bare
 * string, so a filter can never point at a category that does not exist.
 */
export type CatalogFilter =
  | { kind: "all" }
  | { kind: "category"; id: CategoryId }
  | { kind: "new" }
  | { kind: "sale" };

export type SortOrder = "popular" | "price-asc" | "price-desc" | "rating";

/** Everything the catalog list endpoint accepts. */
export interface ProductQuery {
  filter?: CatalogFilter;
  sort?: SortOrder;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface OrderLine {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  status: "new" | "processing" | "shipped" | "delivered" | "cancelled";
  lines: OrderLine[];
  total: number;
  deliveryAddress: string;
}

export interface CheckoutInput {
  name: string;
  phone: string;
  email: string;
  address: string;
  comment?: string;
  lines: { productId: number; quantity: number }[];
}
