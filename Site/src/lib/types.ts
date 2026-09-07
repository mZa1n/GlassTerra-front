/** Every routable screen in the app. Single source of truth for navigation. */
export const PAGES = [
  "home",
  "catalog",
  "news",
  "new-arrivals",
  "delivery",
  "returns",
  "contacts",
  "about",
  "vacancies",
  "partners",
  "privacy",
  "terms",
  "cart",
  "profile",
  "favorites",
  "comparison",
  "search",
  "admin",
] as const;

export type Page = (typeof PAGES)[number];

export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  image: string;
  /** Sidebar grouping, e.g. "Посуда из стекла". Ungrouped ones fall to the end. */
  group?: string;
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

/** Authorisation is a property of the account, never of the identity provider. */
export type UserRole = "user" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: UserRole;
}

/**
 * A promo banner or a short note on the news page. Editable in the admin
 * panel, which is why the news screen renders from this rather than from
 * literals in the component.
 */
export type ArticleKind = "promo" | "note";

export interface Article {
  id: string;
  kind: ArticleKind;
  /** Small caps line above the title, e.g. "Акция · до 40%". */
  eyebrow: string;
  title: string;
  text: string;
  /** Promo banners only; a note is text. */
  image: string;
  ctaLabel: string;
  /** "page:<page>" or "filter:<filterKey>" — empty means no button. */
  ctaTarget: string;
  /** The one promo shown as the lead banner. */
  featured: boolean;
  published: boolean;
  sortOrder: number;
}

/**
 * What the catalog is narrowed down to. A tagged union rather than a bare
 * string, so "new" and "sale" can never be confused with a category slug.
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
