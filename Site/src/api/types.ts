import type {
  Category,
  CheckoutInput,
  Order,
  Paginated,
  Product,
  ProductQuery,
  User,
} from "@/lib/types";
import type { StaticPageContent } from "@/data/content";

export interface Session {
  token: string;
  user: User;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface RegisterInput extends Credentials {
  name: string;
  phone: string;
}

/** One cart row as it travels over the wire. */
export interface CartLine {
  productId: number;
  quantity: number;
}

/**
 * Everything the storefront needs from a server.
 *
 * Two implementations satisfy it: `transport/mock.ts` (in-memory fixture,
 * used until the backend exists) and `transport/http.ts` (REST). Screens only
 * ever see this interface, so swapping transports changes no UI code.
 */
export interface Backend {
  catalog: {
    listCategories(signal?: AbortSignal): Promise<Category[]>;
    listProducts(query: ProductQuery, signal?: AbortSignal): Promise<Paginated<Product>>;
    getProductBySlug(slug: string, signal?: AbortSignal): Promise<Product>;
    /** Hydrates cart / favourites / comparison, which persist only ids. */
    getProductsByIds(ids: readonly number[], signal?: AbortSignal): Promise<Product[]>;
    suggest(query: string, limit: number, signal?: AbortSignal): Promise<Product[]>;
  };

  auth: {
    login(credentials: Credentials, signal?: AbortSignal): Promise<Session>;
    register(input: RegisterInput, signal?: AbortSignal): Promise<Session>;
    me(signal?: AbortSignal): Promise<User>;
    updateProfile(patch: Partial<Omit<User, "id" | "email">>, signal?: AbortSignal): Promise<User>;
    logout(signal?: AbortSignal): Promise<void>;
  };

  cart: {
    /** Server-side cart for signed-in users; the guest cart stays local. */
    get(signal?: AbortSignal): Promise<CartLine[]>;
    replace(lines: readonly CartLine[], signal?: AbortSignal): Promise<CartLine[]>;
  };

  orders: {
    create(input: CheckoutInput, signal?: AbortSignal): Promise<Order>;
    list(signal?: AbortSignal): Promise<Order[]>;
  };

  content: {
    getPage(slug: string, signal?: AbortSignal): Promise<StaticPageContent | null>;
  };
}
