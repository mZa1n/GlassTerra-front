import { ApiError } from "@/api/errors";
import type { Backend, CartLine, Credentials, RegisterInput, Session } from "@/api/types";
import { CATEGORIES, PRODUCTS, toProduct } from "@/data/products";
import { STATIC_PAGES } from "@/data/content";
import { reviewsFor } from "@/data/reviews";
import { matchesFilter, searchProducts, sortProducts } from "@/lib/catalog";
import { env } from "@/lib/env";
import type {
  CheckoutInput,
  Order,
  Paginated,
  Page,
  Product,
  ProductQuery,
  User,
} from "@/lib/types";

/**
 * In-memory backend used until the real API exists.
 *
 * It goes through the same async interface as the HTTP transport — including
 * latency and abort support — so screens exercise their loading and error
 * paths from day one instead of discovering them at integration time.
 */

const ALL_PRODUCTS: Product[] = PRODUCTS.map(toProduct);

const delay = (signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, env.mockLatency);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      },
      { once: true },
    );
  });

/* ------------------------------------------------------------------ *
 * Fake persistence — mirrors the tables the backend will own.
 * ------------------------------------------------------------------ */

interface Account extends User {
  password: string;
}

const readJson = <T>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
};

/** Raw string, exactly as `api/tokens.ts` writes it — not JSON. */
const readToken = (): string | null => {
  try {
    return window.localStorage.getItem("glassterra:token");
  } catch {
    return null;
  }
};

const ACCOUNTS = "glassterra:mock:accounts";
const SESSIONS = "glassterra:mock:sessions";
const CARTS = "glassterra:mock:carts";
const ORDERS = "glassterra:mock:orders";

const accounts = () => readJson<Account[]>(ACCOUNTS, []);
const sessions = () => readJson<Record<string, string>>(SESSIONS, {});

/** Resolves the bearer token the http layer would have sent. */
function currentUser(): Account {
  const token = readToken();
  const userId = token ? sessions()[token] : undefined;
  const account = userId ? accounts().find((candidate) => candidate.id === userId) : undefined;

  if (!account) throw new ApiError("Требуется вход", 401, "unauthorized");
  return account;
}

const toSession = (account: Account): Session => {
  const token = `mock.${crypto.randomUUID()}`;
  writeJson(SESSIONS, { ...sessions(), [token]: account.id });

  const { password: _password, ...user } = account;
  return { token, user };
};

/* ------------------------------------------------------------------ */

export const mockBackend: Backend = {
  catalog: {
    async listCategories(signal) {
      await delay(signal);
      return CATEGORIES.map((category) => ({
        ...category,
        productCount: ALL_PRODUCTS.filter((product) => product.category === category.id).length,
      }));
    },

    async listProducts(query: ProductQuery, signal): Promise<Paginated<Product>> {
      await delay(signal);

      const filter = query.filter ?? { kind: "all" };
      const inScope = ALL_PRODUCTS.filter((product) => matchesFilter(product, filter));
      const term = query.search?.trim() ?? "";

      // A search request is ordered by relevance; browsing uses the chosen sort.
      const ordered = term
        ? searchProducts(inScope, term).map((hit) => hit.item)
        : sortProducts(inScope, query.sort ?? "popular");
      const page = query.page ?? 1;
      const perPage = query.perPage ?? ordered.length;
      const start = (page - 1) * perPage;

      return { items: ordered.slice(start, start + perPage), total: ordered.length, page, perPage };
    },

    async getProductBySlug(slug, signal) {
      await delay(signal);
      const product = ALL_PRODUCTS.find((candidate) => candidate.slug === slug);
      if (!product) throw new ApiError("Товар не найден", 404, "not_found");
      return product;
    },

    async getProductsByIds(ids, signal) {
      await delay(signal);
      // Preserve the caller's order — it is the order the user added them in.
      return ids.flatMap((id) => ALL_PRODUCTS.filter((product) => product.id === id));
    },

    async getReviews(productId, signal) {
      await delay(signal);
      if (!ALL_PRODUCTS.some((product) => product.id === productId)) {
        throw new ApiError("Товар не найден", 404, "not_found");
      }
      return reviewsFor(productId);
    },

    async suggest(query, limit, signal) {
      await delay(signal);
      if (!query.trim()) return [];
      return searchProducts(ALL_PRODUCTS, query)
        .slice(0, limit)
        .map((hit) => hit.item);
    },
  },

  auth: {
    async login({ email, password }: Credentials, signal) {
      await delay(signal);

      const normalized = email.trim().toLowerCase();
      const account = accounts().find(
        (candidate) => candidate.email.toLowerCase() === normalized,
      );

      if (!account || account.password !== password) {
        throw new ApiError("Неверный email или пароль", 401, "bad_credentials");
      }

      return toSession(account);
    },

    async register({ name, email, phone, password }: RegisterInput, signal) {
      await delay(signal);

      const normalized = email.trim().toLowerCase();
      const existing = accounts();

      if (existing.some((candidate) => candidate.email.toLowerCase() === normalized)) {
        throw new ApiError("Пользователь с таким email уже существует", 409, "email_taken");
      }

      const account: Account = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: "",
        password,
      };

      writeJson(ACCOUNTS, [...existing, account]);
      return toSession(account);
    },

    async me(signal) {
      await delay(signal);
      const { password: _password, ...user } = currentUser();
      return user;
    },

    async updateProfile(patch, signal) {
      await delay(signal);

      const account = currentUser();
      const updated = { ...account, ...patch };
      writeJson(
        ACCOUNTS,
        accounts().map((candidate) => (candidate.id === account.id ? updated : candidate)),
      );

      const { password: _password, ...user } = updated;
      return user;
    },

    async logout(signal) {
      await delay(signal);
      const token = readToken();
      if (!token) return;

      const remaining = { ...sessions() };
      delete remaining[token];
      writeJson(SESSIONS, remaining);
    },
  },

  cart: {
    async get(signal) {
      await delay(signal);
      const account = currentUser();
      return readJson<Record<string, CartLine[]>>(CARTS, {})[account.id] ?? [];
    },

    async replace(lines, signal) {
      await delay(signal);
      const account = currentUser();
      const next = [...lines];
      writeJson(CARTS, { ...readJson<Record<string, CartLine[]>>(CARTS, {}), [account.id]: next });
      return next;
    },
  },

  orders: {
    async create(input: CheckoutInput, signal) {
      await delay(signal);

      const account = currentUser();
      const lines = input.lines.flatMap((line) => {
        const product = ALL_PRODUCTS.find((candidate) => candidate.id === line.productId);
        if (!product) return [];
        return [
          { productId: product.id, name: product.name, price: product.price, quantity: line.quantity },
        ];
      });

      if (lines.length === 0) throw new ApiError("Корзина пуста", 422, "empty_cart");

      const order: Order = {
        id: `M-${Date.now().toString(36).toUpperCase()}`,
        createdAt: new Date().toISOString(),
        status: "new",
        lines,
        total: lines.reduce((sum, line) => sum + line.price * line.quantity, 0),
        deliveryAddress: input.address,
      };

      const all = readJson<Record<string, Order[]>>(ORDERS, {});
      writeJson(ORDERS, { ...all, [account.id]: [order, ...(all[account.id] ?? [])] });
      return order;
    },

    async list(signal) {
      await delay(signal);
      const account = currentUser();
      return readJson<Record<string, Order[]>>(ORDERS, {})[account.id] ?? [];
    },
  },

  content: {
    async getPage(slug, signal) {
      await delay(signal);
      return STATIC_PAGES[slug as Page] ?? null;
    },
  },
};
