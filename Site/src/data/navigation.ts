import type { CatalogFilter, Page } from "@/lib/types";

export interface NavItem {
  label: string;
  page: Page;
}

export const MAIN_NAV: readonly NavItem[] = [
  { label: "Главная", page: "home" },
  { label: "Каталог", page: "catalog" },
  { label: "Новости", page: "news" },
  { label: "Новинки", page: "new-arrivals" },
  { label: "Доставка", page: "delivery" },
  { label: "Контакты", page: "contacts" },
  { label: "О компании", page: "about" },
];

export interface SidebarLeaf {
  label: string;
  filter: CatalogFilter;
  /** Rendered with an accent so promo entries stand out from plain categories. */
  highlight?: boolean;
}

/**
 * Every entry resolves to a CatalogFilter, so a shortcut cannot point at a
 * category the catalog does not know about. Categories themselves are not
 * listed here — they come from the API, because the admin panel creates them.
 */
export const SIDEBAR_SHORTCUTS: readonly SidebarLeaf[] = [
  { label: "Новинки", filter: { kind: "new" }, highlight: true },
  { label: "Товары со скидкой", filter: { kind: "sale" }, highlight: true },
];

/** Categories with no group of their own are collected under this heading. */
export const UNGROUPED_LABEL = "Другое";

export const sameFilter = (a: CatalogFilter, b: CatalogFilter) =>
  a.kind === b.kind && (a.kind !== "category" || b.kind !== "category" || a.id === b.id);
