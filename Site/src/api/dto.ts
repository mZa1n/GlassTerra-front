import type { ArticleInput, CategoryInput, ProductInput, UserPatch } from "@/api/types";
import type { Article, ArticleKind, Category, Order, Product, Review, User, UserRole } from "@/lib/types";

/**
 * Wire shapes and their mappers.
 *
 * Keeping these separate from the domain types means a backend rename or an
 * extra envelope field is a one-line change here instead of a refactor across
 * every component. Adjust the DTOs to match the real API contract; the
 * mappers are the only place that has to know about the difference.
 */

export interface ProductDto {
  id: number;
  slug: string;
  name: string;
  price: number;
  old_price?: number | null;
  category_id: string;
  category_name: string;
  rating: number;
  reviews_count: number;
  image_url: string;
  in_stock: boolean;
  is_new?: boolean;
  description: string;
  specs?: Record<string, string> | null;
  images?: string[] | null;
}

export interface ReviewDto {
  id: string;
  author_name: string;
  rating: number;
  created_at: string;
  text: string;
}

export interface CategoryDto {
  id: string;
  name: string;
  image_url: string;
  group?: string | null;
  product_count: number;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role?: UserRole | null;
}

export interface OrderDto {
  id: string;
  created_at: string;
  status: Order["status"];
  total: number;
  delivery_address: string;
  lines: { product_id: number; name: string; price: number; quantity: number }[];
}

export interface ArticleDto {
  id: string;
  kind: ArticleKind;
  eyebrow?: string | null;
  title: string;
  text: string;
  image_url?: string | null;
  cta_label?: string | null;
  cta_target?: string | null;
  featured?: boolean | null;
  published?: boolean | null;
  sort_order?: number | null;
}

export interface PaginatedDto<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
}

export const toProduct = (dto: ProductDto): Product => ({
  id: dto.id,
  slug: dto.slug,
  name: dto.name,
  price: dto.price,
  ...(dto.old_price ? { oldPrice: dto.old_price } : {}),
  category: dto.category_id,
  categoryName: dto.category_name,
  rating: dto.rating,
  reviews: dto.reviews_count,
  image: dto.image_url,
  images: dto.images?.length ? dto.images : [dto.image_url],
  inStock: dto.in_stock,
  ...(dto.is_new ? { isNew: true } : {}),
  description: dto.description,
  specs: dto.specs ?? {},
});

export const toReview = (dto: ReviewDto): Review => ({
  id: dto.id,
  author: dto.author_name,
  rating: dto.rating,
  createdAt: dto.created_at,
  text: dto.text,
});

export const toCategory = (dto: CategoryDto): Category => ({
  id: dto.id,
  name: dto.name,
  image: dto.image_url,
  ...(dto.group ? { group: dto.group } : {}),
  productCount: dto.product_count,
});

export const toUser = (dto: UserDto): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  phone: dto.phone ?? "",
  address: dto.address ?? "",
  // A server that omits the field grants nothing: never assume admin.
  role: dto.role ?? "user",
});

export const toArticle = (dto: ArticleDto): Article => ({
  id: dto.id,
  kind: dto.kind,
  eyebrow: dto.eyebrow ?? "",
  title: dto.title,
  text: dto.text,
  image: dto.image_url ?? "",
  ctaLabel: dto.cta_label ?? "",
  ctaTarget: dto.cta_target ?? "",
  featured: dto.featured === true,
  // A server that forgets the flag should not silently unpublish the page.
  published: dto.published !== false,
  sortOrder: dto.sort_order ?? 0,
});

export const toOrder = (dto: OrderDto): Order => ({
  id: dto.id,
  createdAt: dto.created_at,
  status: dto.status,
  total: dto.total,
  deliveryAddress: dto.delivery_address,
  lines: dto.lines.map((line) => ({
    productId: line.product_id,
    name: line.name,
    price: line.price,
    quantity: line.quantity,
  })),
});

/**
 * Admin writes travel in the same snake_case shape the reads come back in.
 * Only the keys actually present in a patch are sent, so a PATCH stays a
 * patch rather than silently clearing untouched fields.
 */
export function fromProductInput(input: Partial<ProductInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.slug !== undefined) body.slug = input.slug;
  if (input.name !== undefined) body.name = input.name;
  if (input.price !== undefined) body.price = input.price;
  if ("oldPrice" in input) body.old_price = input.oldPrice ?? null;
  if (input.category !== undefined) body.category_id = input.category;
  if (input.description !== undefined) body.description = input.description;
  if (input.image !== undefined) body.image_url = input.image;
  if (input.images !== undefined) body.images = input.images;
  if (input.inStock !== undefined) body.in_stock = input.inStock;
  if ("isNew" in input) body.is_new = input.isNew ?? false;
  if (input.specs !== undefined) body.specs = input.specs;

  return body;
}

export function fromCategoryInput(input: Partial<CategoryInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.id !== undefined) body.id = input.id;
  if (input.name !== undefined) body.name = input.name;
  if (input.image !== undefined) body.image_url = input.image;
  if ("group" in input) body.group = input.group ?? null;

  return body;
}

export function fromArticleInput(input: Partial<ArticleInput>): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (input.kind !== undefined) body.kind = input.kind;
  if (input.eyebrow !== undefined) body.eyebrow = input.eyebrow;
  if (input.title !== undefined) body.title = input.title;
  if (input.text !== undefined) body.text = input.text;
  if (input.image !== undefined) body.image_url = input.image;
  if (input.ctaLabel !== undefined) body.cta_label = input.ctaLabel;
  if (input.ctaTarget !== undefined) body.cta_target = input.ctaTarget;
  if (input.featured !== undefined) body.featured = input.featured;
  if (input.published !== undefined) body.published = input.published;
  if (input.sortOrder !== undefined) body.sort_order = input.sortOrder;

  return body;
}

export function fromUserPatch(patch: UserPatch): Record<string, unknown> {
  const body: Record<string, unknown> = {};

  if (patch.name !== undefined) body.name = patch.name;
  if (patch.phone !== undefined) body.phone = patch.phone;
  if (patch.address !== undefined) body.address = patch.address;
  if (patch.role !== undefined) body.role = patch.role;

  return body;
}
