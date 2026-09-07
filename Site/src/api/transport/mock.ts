import { ApiError } from "@/api/errors";
import type {
  ArticleInput,
  Backend,
  CartLine,
  CategoryInput,
  Credentials,
  PageSummary,
  ProductInput,
  RegisterInput,
  Session,
  UserPatch,
} from "@/api/types";
import { CATEGORIES, PRODUCTS, toProduct, type CategorySeed } from "@/data/products";
import { ARTICLES } from "@/data/articles";
import { STATIC_PAGES, type StaticPageContent } from "@/data/content";
import { reviewsFor } from "@/data/reviews";
import { matchesFilter, searchProducts, sortProducts } from "@/lib/catalog";
import { env } from "@/lib/env";
import type {
  Article,
  CategoryId,
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

const CATALOG = "glassterra:mock:catalog";
const ARTICLE_TABLE = "glassterra:mock:articles";
const PAGE_TABLE = "glassterra:mock:pages";
const ACCOUNTS = "glassterra:mock:accounts";
const SESSIONS = "glassterra:mock:sessions";
const CARTS = "glassterra:mock:carts";
const ORDERS = "glassterra:mock:orders";

/**
 * The catalog the admin panel writes to. Kept in localStorage so an edit
 * survives a reload, exactly as a real database would; clearing site data
 * resets it to the fixture.
 */
interface CatalogTables {
  categories: CategorySeed[];
  products: Product[];
}

const seedCatalog = (): CatalogTables => ({
  categories: CATEGORIES.map((category) => ({ ...category })),
  products: PRODUCTS.map(toProduct),
});

const catalog: CatalogTables = readJson<CatalogTables | null>(CATALOG, null) ?? seedCatalog();

const saveCatalog = () => writeJson(CATALOG, catalog);

const nextProductId = () =>
  catalog.products.reduce((max, product) => Math.max(max, product.id), 0) + 1;

const categoryOrThrow = (id: CategoryId) => {
  const category = catalog.categories.find((candidate) => candidate.id === id);
  if (!category) throw new ApiError("Категория не найдена", 422, "validation");
  return category;
};

const productOrThrow = (id: number) => {
  const product = catalog.products.find((candidate) => candidate.id === id);
  if (!product) throw new ApiError("Товар не найден", 404, "not_found");
  return product;
};

/** News-page blocks. Same story as the catalog: seeded once, then editable. */
let articles: Article[] = readJson<Article[] | null>(ARTICLE_TABLE, null) ?? ARTICLES.map((a) => ({ ...a }));

const saveArticles = () => writeJson(ARTICLE_TABLE, articles);

const byOrder = (a: Article, b: Article) => a.sortOrder - b.sortOrder;

const articleOrThrow = (id: string) => {
  const article = articles.find((candidate) => candidate.id === id);
  if (!article) throw new ApiError("Материал не найден", 404, "not_found");
  return article;
};

/** Edited copies of the text pages; anything untouched falls back to the fixture. */
const pageOverrides = () => readJson<Partial<Record<Page, StaticPageContent>>>(PAGE_TABLE, {});

const pageContent = (slug: Page): StaticPageContent | null =>
  pageOverrides()[slug] ?? STATIC_PAGES[slug] ?? null;

/**
 * Text pages an admin may edit. Only screens that render content and nothing
 * else: "news" has its own layout and is edited through articles instead.
 */
const EDITABLE_PAGES: readonly Page[] = [
  "new-arrivals",
  "delivery",
  "returns",
  "contacts",
  "about",
  "vacancies",
  "partners",
  "privacy",
  "terms",
];

/** Demo logins. Seeded once; accounts registered in the browser are kept. */
const SEED_ACCOUNTS: readonly Account[] = [
  {
    id: "seed-user",
    name: "Анна Смирнова",
    email: "user@glassterra.ru",
    phone: "+7 900 100-20-30",
    address: "Гусь-Хрустальный, ул. Калинина, 12, кв. 45",
    role: "user",
    password: "user12345",
  },
  {
    id: "seed-admin",
    name: "Ольга Панина",
    email: "admin@glassterra.ru",
    phone: "+7 900 100-20-31",
    address: "Гусь-Хрустальный, ул. Свердлова, 1",
    role: "admin",
    password: "admin12345",
  },
];

const accounts = (): Account[] => {
  // Accounts registered before roles existed default to the weakest one.
  const stored = readJson<Account[]>(ACCOUNTS, []).map((account) => ({
    ...account,
    role: account.role ?? "user",
  }));
  const missing = SEED_ACCOUNTS.filter(
    (seed) => !stored.some((account) => account.id === seed.id),
  );

  if (missing.length === 0) return stored;

  const merged = [...stored, ...missing.map((seed) => ({ ...seed }))];
  writeJson(ACCOUNTS, merged);
  return merged;
};

const sessions = () => readJson<Record<string, string>>(SESSIONS, {});

/** Resolves the bearer token the http layer would have sent. */
function currentUser(): Account {
  const token = readToken();
  const userId = token ? sessions()[token] : undefined;
  const account = userId ? accounts().find((candidate) => candidate.id === userId) : undefined;

  if (!account) throw new ApiError("Требуется вход", 401, "unauthorized");
  return account;
}

function requireAdmin(): Account {
  const account = currentUser();
  if (account.role !== "admin") throw new ApiError("Недостаточно прав", 403, "forbidden");
  return account;
}

const toSession = (account: Account): Session => {
  const token = `mock.${crypto.randomUUID()}`;
  writeJson(SESSIONS, { ...sessions(), [token]: account.id });

  const { password: _password, ...user } = account;
  return { token, user };
};

/** Product fields an admin owns, in the serve shape. */
const toProductFields = (input: ProductInput, categoryName: string) => ({
  slug: input.slug.trim(),
  name: input.name.trim(),
  price: input.price,
  ...(input.oldPrice ? { oldPrice: input.oldPrice } : {}),
  category: input.category,
  categoryName,
  image: input.image.trim(),
  images: input.images?.length ? input.images : [input.image.trim()],
  inStock: input.inStock,
  ...(input.isNew ? { isNew: true } : {}),
  description: input.description.trim(),
  specs: input.specs,
});

/** Exactly one promo is the lead banner; promoting one demotes the rest. */
const demoteOtherLeads = (rows: Article[], winner: Article): Article[] =>
  winner.featured
    ? rows.map((row) => (row.id === winner.id ? row : { ...row, featured: false }))
    : rows;

/** The inverse, so a PATCH can be merged over the current row. */
const toProductInput = (product: Product): ProductInput => ({
  slug: product.slug,
  name: product.name,
  price: product.price,
  ...(product.oldPrice ? { oldPrice: product.oldPrice } : {}),
  category: product.category,
  description: product.description,
  image: product.image,
  images: product.images,
  inStock: product.inStock,
  ...(product.isNew ? { isNew: true } : {}),
  specs: product.specs,
});

/* ------------------------------------------------------------------ */

export const mockBackend: Backend = {
  catalog: {
    async listCategories(signal) {
      await delay(signal);
      return catalog.categories.map((category) => ({
        ...category,
        productCount: catalog.products.filter((product) => product.category === category.id).length,
      }));
    },

    async listProducts(query: ProductQuery, signal): Promise<Paginated<Product>> {
      await delay(signal);

      const filter = query.filter ?? { kind: "all" };
      const inScope = catalog.products.filter((product) => matchesFilter(product, filter));
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
      const product = catalog.products.find((candidate) => candidate.slug === slug);
      if (!product) throw new ApiError("Товар не найден", 404, "not_found");
      return product;
    },

    async getProductsByIds(ids, signal) {
      await delay(signal);
      // Preserve the caller's order — it is the order the user added them in.
      return ids.flatMap((id) => catalog.products.filter((product) => product.id === id));
    },

    async getReviews(productId, signal) {
      await delay(signal);
      if (!catalog.products.some((product) => product.id === productId)) {
        throw new ApiError("Товар не найден", 404, "not_found");
      }
      return reviewsFor(productId);
    },

    async suggest(query, limit, signal) {
      await delay(signal);
      if (!query.trim()) return [];
      return searchProducts(catalog.products, query)
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
        // Roles are never taken from the request body.
        role: "user",
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
        const product = catalog.products.find((candidate) => candidate.id === line.productId);
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
      return pageContent(slug as Page);
    },

    async listArticles(signal) {
      await delay(signal);
      return articles.filter((article) => article.published).sort(byOrder);
    },
  },

  admin: {
    async createProduct(input: ProductInput, signal) {
      await delay(signal);
      requireAdmin();

      const slug = input.slug.trim();
      if (!slug) throw new ApiError("Укажите слаг товара", 422, "validation");
      if (catalog.products.some((product) => product.slug === slug)) {
        throw new ApiError("Товар с таким слагом уже существует", 422, "validation");
      }

      const category = categoryOrThrow(input.category);
      const product: Product = {
        ...toProductFields(input, category.name),
        id: nextProductId(),
        slug,
        rating: 0,
        reviews: 0,
      };

      catalog.products = [product, ...catalog.products];
      saveCatalog();
      return product;
    },

    async updateProduct(id, patch: Partial<ProductInput>, signal) {
      await delay(signal);
      requireAdmin();

      const current = productOrThrow(id);
      const category = patch.category ? categoryOrThrow(patch.category) : undefined;

      if (patch.slug && catalog.products.some((p) => p.slug === patch.slug && p.id !== id)) {
        throw new ApiError("Товар с таким слагом уже существует", 422, "validation");
      }

      // Built from scratch rather than spread over `current`, so clearing a
      // field (dropping the old price, unsetting "new") actually removes it.
      const merged: Product = {
        id: current.id,
        rating: current.rating,
        reviews: current.reviews,
        ...toProductFields(
          { ...toProductInput(current), ...patch },
          category?.name ?? current.categoryName,
        ),
      };

      catalog.products = catalog.products.map((product) => (product.id === id ? merged : product));
      saveCatalog();
      return merged;
    },

    async deleteProduct(id, signal) {
      await delay(signal);
      requireAdmin();
      productOrThrow(id);

      catalog.products = catalog.products.filter((product) => product.id !== id);
      saveCatalog();
    },

    async createCategory(input: CategoryInput, signal) {
      await delay(signal);
      requireAdmin();

      const id = input.id.trim().toLowerCase();
      if (!/^[a-z0-9-]+$/.test(id)) {
        throw new ApiError("Слаг: латиница, цифры и дефис", 422, "validation");
      }
      if (catalog.categories.some((category) => category.id === id)) {
        throw new ApiError("Категория с таким слагом уже существует", 422, "validation");
      }

      const category: CategorySeed = {
        id,
        name: input.name.trim(),
        image: input.image.trim(),
        ...(input.group?.trim() ? { group: input.group.trim() } : {}),
      };

      catalog.categories = [...catalog.categories, category];
      saveCatalog();
      return { ...category, productCount: 0 };
    },

    async updateCategory(id, patch, signal) {
      await delay(signal);
      requireAdmin();

      const current = categoryOrThrow(id);
      const group = patch.group?.trim();
      const updated: CategorySeed = {
        ...current,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.image !== undefined ? { image: patch.image.trim() } : {}),
        ...(patch.group !== undefined ? (group ? { group } : { group: undefined }) : {}),
      };

      catalog.categories = catalog.categories.map((category) =>
        category.id === id ? updated : category,
      );
      // categoryName is denormalised onto the product, so a rename has to reach it.
      catalog.products = catalog.products.map((product) =>
        product.category === id ? { ...product, categoryName: updated.name } : product,
      );
      saveCatalog();

      const productCount = catalog.products.filter((product) => product.category === id).length;
      return { ...updated, productCount };
    },

    async deleteCategory(id, moveTo, signal) {
      await delay(signal);
      requireAdmin();
      categoryOrThrow(id);

      const affected = catalog.products.filter((product) => product.category === id);

      if (affected.length > 0) {
        if (!moveTo) {
          throw new ApiError("В категории есть товары — выберите, куда их перенести", 422, "validation");
        }

        const target = categoryOrThrow(moveTo);
        catalog.products = catalog.products.map((product) =>
          product.category === id
            ? { ...product, category: target.id, categoryName: target.name }
            : product,
        );
      }

      catalog.categories = catalog.categories.filter((category) => category.id !== id);
      saveCatalog();
    },

    async listArticles(signal) {
      await delay(signal);
      requireAdmin();
      return [...articles].sort(byOrder);
    },

    async createArticle(input: ArticleInput, signal) {
      await delay(signal);
      requireAdmin();

      const article: Article = { ...input, id: `a-${crypto.randomUUID().slice(0, 8)}` };
      articles = demoteOtherLeads([...articles, article], article);
      saveArticles();
      return article;
    },

    async updateArticle(id, patch, signal) {
      await delay(signal);
      requireAdmin();

      const current = articleOrThrow(id);
      const updated: Article = { ...current, ...patch };

      articles = demoteOtherLeads(
        articles.map((article) => (article.id === id ? updated : article)),
        updated,
      );
      saveArticles();
      return updated;
    },

    async deleteArticle(id, signal) {
      await delay(signal);
      requireAdmin();
      articleOrThrow(id);

      articles = articles.filter((article) => article.id !== id);
      saveArticles();
    },

    async listPages(signal) {
      await delay(signal);
      requireAdmin();

      return EDITABLE_PAGES.flatMap<PageSummary>((slug) => {
        const content = pageContent(slug);
        return content ? [{ slug, title: content.title }] : [];
      });
    },

    async updatePage(slug, content, signal) {
      await delay(signal);
      requireAdmin();

      if (!EDITABLE_PAGES.includes(slug)) {
        throw new ApiError("Эту страницу нельзя редактировать", 422, "validation");
      }
      if (!content.title.trim()) throw new ApiError("Заголовок обязателен", 422, "validation");

      const stored: StaticPageContent = {
        title: content.title.trim(),
        intro: content.intro.trim(),
        ...(content.sections?.length
          ? {
              sections: content.sections
                .filter((section) => section.heading.trim() || section.body.trim())
                .map((section) => ({
                  heading: section.heading.trim(),
                  body: section.body.trim(),
                })),
            }
          : {}),
      };

      writeJson(PAGE_TABLE, { ...pageOverrides(), [slug]: stored });
      return stored;
    },

    async listUsers(signal) {
      await delay(signal);
      requireAdmin();
      return accounts().map(({ password: _password, ...user }) => user);
    },

    async updateUser(id, patch: UserPatch, signal) {
      await delay(signal);
      const actor = requireAdmin();

      const stored = accounts();
      const account = stored.find((candidate) => candidate.id === id);
      if (!account) throw new ApiError("Пользователь не найден", 404, "not_found");

      // Losing your own admin rights locks the panel behind an account that no
      // longer exists in the mock — and in production, behind support.
      if (account.id === actor.id && patch.role && patch.role !== "admin") {
        throw new ApiError("Нельзя снять права с самого себя", 422, "validation");
      }

      const updated = { ...account, ...patch };
      writeJson(
        ACCOUNTS,
        stored.map((candidate) => (candidate.id === id ? updated : candidate)),
      );

      const { password: _password, ...user } = updated;
      return user;
    },
  },
};
