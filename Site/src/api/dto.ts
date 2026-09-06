import type { Category, CategoryId, Order, Product, Review, User } from "@/lib/types";

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
  product_count: number;
}

export interface UserDto {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
}

export interface OrderDto {
  id: string;
  created_at: string;
  status: Order["status"];
  total: number;
  delivery_address: string;
  lines: { product_id: number; name: string; price: number; quantity: number }[];
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
  category: dto.category_id as CategoryId,
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
  id: dto.id as CategoryId,
  name: dto.name,
  image: dto.image_url,
  productCount: dto.product_count,
});

export const toUser = (dto: UserDto): User => ({
  id: dto.id,
  name: dto.name,
  email: dto.email,
  phone: dto.phone ?? "",
  address: dto.address ?? "",
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
