import type {
  Article,
  Category,
  CategoryId,
  CheckoutInput,
  Order,
  Paginated,
  Product,
  ProductQuery,
  Page,
  Review,
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

/** Everything an admin can set on a product. Server owns id, rating, reviews. */
export interface ProductInput {
  slug: string;
  name: string;
  price: number;
  oldPrice?: number;
  category: CategoryId;
  description: string;
  image: string;
  images?: string[];
  inStock: boolean;
  isNew?: boolean;
  specs: Record<string, string>;
}

/** `id` is the slug and is fixed at creation: links and filters are built on it. */
export interface CategoryInput {
  id: CategoryId;
  name: string;
  image: string;
  group?: string;
}

export type ArticleInput = Omit<Article, "id">;

/** Editable profile of another account. Email stays the login, id is fixed. */
export type UserPatch = Partial<Omit<User, "id" | "email">>;

/** A text page in the admin list: enough to render a row without loading it. */
export interface PageSummary {
  slug: Page;
  title: string;
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
    getReviews(productId: number, signal?: AbortSignal): Promise<Review[]>;
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
    /** Published articles for the news screen, in display order. */
    listArticles(signal?: AbortSignal): Promise<Article[]>;
  };

  /**
   * Back office. Every call requires an account with role "admin" and answers
   * 403 otherwise — the UI guard only decides what is worth drawing.
   */
  admin: {
    createProduct(input: ProductInput, signal?: AbortSignal): Promise<Product>;
    updateProduct(id: number, patch: Partial<ProductInput>, signal?: AbortSignal): Promise<Product>;
    deleteProduct(id: number, signal?: AbortSignal): Promise<void>;

    createCategory(input: CategoryInput, signal?: AbortSignal): Promise<Category>;
    updateCategory(
      id: CategoryId,
      patch: Partial<Omit<CategoryInput, "id">>,
      signal?: AbortSignal,
    ): Promise<Category>;
    /** Refuses a non-empty category unless `moveTo` says where its products go. */
    deleteCategory(id: CategoryId, moveTo?: CategoryId, signal?: AbortSignal): Promise<void>;

    /** Includes drafts, unlike the public list. */
    listArticles(signal?: AbortSignal): Promise<Article[]>;
    createArticle(input: ArticleInput, signal?: AbortSignal): Promise<Article>;
    updateArticle(id: string, patch: Partial<ArticleInput>, signal?: AbortSignal): Promise<Article>;
    deleteArticle(id: string, signal?: AbortSignal): Promise<void>;

    listPages(signal?: AbortSignal): Promise<PageSummary[]>;
    updatePage(
      slug: Page,
      content: StaticPageContent,
      signal?: AbortSignal,
    ): Promise<StaticPageContent>;

    listUsers(signal?: AbortSignal): Promise<User[]>;
    updateUser(id: string, patch: UserPatch, signal?: AbortSignal): Promise<User>;
  };
}
