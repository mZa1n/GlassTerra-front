import { request } from "@/api/http";
import {
  fromArticleInput,
  fromCategoryInput,
  fromProductInput,
  fromUserPatch,
  toArticle,
  toCategory,
  toOrder,
  toProduct,
  toReview,
  toUser,
  type ArticleDto,
  type CategoryDto,
  type OrderDto,
  type PaginatedDto,
  type ProductDto,
  type ReviewDto,
  type UserDto,
} from "@/api/dto";
import { setToken } from "@/api/tokens";
import type { Backend, CartLine, PageSummary, Session } from "@/api/types";
import { filterKey } from "@/lib/catalog";
import type { StaticPageContent } from "@/data/content";

interface SessionDto {
  token: string;
  user: UserDto;
}

const toSession = (dto: SessionDto): Session => ({ token: dto.token, user: toUser(dto.user) });

/**
 * REST transport.
 *
 * Paths below are the proposed contract — adjust them to whatever the backend
 * ships. Nothing outside this file knows the URLs.
 */
export const httpBackend: Backend = {
  catalog: {
    async listCategories(signal) {
      const dto = await request<CategoryDto[]>("/categories", { signal, anonymous: true });
      return dto.map(toCategory);
    },

    async listProducts(query, signal) {
      const dto = await request<PaginatedDto<ProductDto>>("/products", {
        signal,
        anonymous: true,
        params: {
          filter: query.filter ? filterKey(query.filter) : undefined,
          sort: query.sort,
          q: query.search || undefined,
          page: query.page,
          per_page: query.perPage,
        },
      });

      return {
        items: dto.items.map(toProduct),
        total: dto.total,
        page: dto.page,
        perPage: dto.per_page,
      };
    },

    async getProductBySlug(slug, signal) {
      const dto = await request<ProductDto>(`/products/${encodeURIComponent(slug)}`, {
        signal,
        anonymous: true,
      });
      return toProduct(dto);
    },

    async getProductsByIds(ids, signal) {
      if (ids.length === 0) return [];

      const dto = await request<ProductDto[]>("/products/batch", {
        signal,
        anonymous: true,
        params: { ids: ids.join(",") },
      });

      // The endpoint may return rows in any order; restore the caller's.
      const byId = new Map(dto.map((row) => [row.id, toProduct(row)]));
      return ids.flatMap((id) => {
        const product = byId.get(id);
        return product ? [product] : [];
      });
    },

    async getReviews(productId, signal) {
      const dto = await request<ReviewDto[]>(`/products/${productId}/reviews`, {
        signal,
        anonymous: true,
      });
      return dto.map(toReview);
    },

    async suggest(query, limit, signal) {
      if (!query.trim()) return [];
      const dto = await request<ProductDto[]>("/products/suggest", {
        signal,
        anonymous: true,
        params: { q: query, limit },
      });
      return dto.map(toProduct);
    },
  },

  auth: {
    async login(credentials, signal) {
      const session = toSession(
        await request<SessionDto>("/auth/login", {
          method: "POST",
          body: credentials,
          anonymous: true,
          signal,
        }),
      );
      setToken(session.token);
      return session;
    },

    async register(input, signal) {
      const session = toSession(
        await request<SessionDto>("/auth/register", {
          method: "POST",
          body: input,
          anonymous: true,
          signal,
        }),
      );
      setToken(session.token);
      return session;
    },

    async me(signal) {
      return toUser(await request<UserDto>("/auth/me", { signal }));
    },

    async updateProfile(patch, signal) {
      return toUser(await request<UserDto>("/auth/me", { method: "PATCH", body: patch, signal }));
    },

    async logout(signal) {
      try {
        await request<void>("/auth/logout", { method: "POST", signal });
      } finally {
        setToken(null);
      }
    },
  },

  cart: {
    async get(signal) {
      const dto = await request<{ items: { product_id: number; quantity: number }[] }>("/cart", {
        signal,
      });
      return dto.items.map((line) => ({ productId: line.product_id, quantity: line.quantity }));
    },

    async replace(lines, signal) {
      const dto = await request<{ items: { product_id: number; quantity: number }[] }>("/cart", {
        method: "PUT",
        signal,
        body: {
          items: lines.map((line) => ({ product_id: line.productId, quantity: line.quantity })),
        },
      });
      return dto.items.map((line) => ({ productId: line.product_id, quantity: line.quantity }));
    },
  },

  orders: {
    async create(input, signal) {
      const dto = await request<OrderDto>("/orders", {
        method: "POST",
        signal,
        body: {
          name: input.name,
          phone: input.phone,
          email: input.email,
          address: input.address,
          comment: input.comment,
          items: input.lines.map((line) => ({
            product_id: line.productId,
            quantity: line.quantity,
          })),
        },
      });
      return toOrder(dto);
    },

    async list(signal) {
      const dto = await request<OrderDto[]>("/orders", { signal });
      return dto.map(toOrder);
    },
  },

  content: {
    async listArticles(signal) {
      const dto = await request<ArticleDto[]>("/articles", { signal, anonymous: true });
      return dto.map(toArticle);
    },

    async getPage(slug, signal) {
      return request<StaticPageContent | null>(`/pages/${encodeURIComponent(slug)}`, {
        signal,
        anonymous: true,
      });
    },
  },

  admin: {
    async createProduct(input, signal) {
      const dto = await request<ProductDto>("/admin/products", {
        method: "POST",
        body: fromProductInput(input),
        signal,
      });
      return toProduct(dto);
    },

    async updateProduct(id, patch, signal) {
      const dto = await request<ProductDto>(`/admin/products/${id}`, {
        method: "PATCH",
        body: fromProductInput(patch),
        signal,
      });
      return toProduct(dto);
    },

    async deleteProduct(id, signal) {
      await request<void>(`/admin/products/${id}`, { method: "DELETE", signal });
    },

    async createCategory(input, signal) {
      const dto = await request<CategoryDto>("/admin/categories", {
        method: "POST",
        body: fromCategoryInput(input),
        signal,
      });
      return toCategory(dto);
    },

    async updateCategory(id, patch, signal) {
      const dto = await request<CategoryDto>(`/admin/categories/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: fromCategoryInput(patch),
        signal,
      });
      return toCategory(dto);
    },

    async deleteCategory(id, moveTo, signal) {
      await request<void>(`/admin/categories/${encodeURIComponent(id)}`, {
        method: "DELETE",
        params: { move_to: moveTo },
        signal,
      });
    },

    async listArticles(signal) {
      const dto = await request<ArticleDto[]>("/admin/articles", { signal });
      return dto.map(toArticle);
    },

    async createArticle(input, signal) {
      const dto = await request<ArticleDto>("/admin/articles", {
        method: "POST",
        body: fromArticleInput(input),
        signal,
      });
      return toArticle(dto);
    },

    async updateArticle(id, patch, signal) {
      const dto = await request<ArticleDto>(`/admin/articles/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: fromArticleInput(patch),
        signal,
      });
      return toArticle(dto);
    },

    async deleteArticle(id, signal) {
      await request<void>(`/admin/articles/${encodeURIComponent(id)}`, {
        method: "DELETE",
        signal,
      });
    },

    async listPages(signal) {
      return request<PageSummary[]>("/admin/pages", { signal });
    },

    async updatePage(slug, content, signal) {
      return request<StaticPageContent>(`/admin/pages/${encodeURIComponent(slug)}`, {
        method: "PUT",
        body: content,
        signal,
      });
    },

    async listUsers(signal) {
      const dto = await request<UserDto[]>("/admin/users", { signal });
      return dto.map(toUser);
    },

    async updateUser(id, patch, signal) {
      const dto = await request<UserDto>(`/admin/users/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: fromUserPatch(patch),
        signal,
      });
      return toUser(dto);
    },
  },
};

export type { CartLine };
