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

export interface SidebarGroup {
  label: string;
  children: readonly SidebarLeaf[];
}

/**
 * Every entry resolves to a CatalogFilter, so the sidebar cannot point at a
 * category the catalog does not know about.
 */
export const SIDEBAR_SHORTCUTS: readonly SidebarLeaf[] = [
  { label: "Новинки", filter: { kind: "new" }, highlight: true },
  { label: "Товары со скидкой", filter: { kind: "sale" }, highlight: true },
];

export const SIDEBAR_GROUPS: readonly SidebarGroup[] = [
  {
    label: "Посуда из стекла",
    children: [
      { label: "Стаканы и стопки", filter: { kind: "category", id: "glasses" } },
      { label: "Тарелки", filter: { kind: "category", id: "plates" } },
      { label: "Салатники", filter: { kind: "category", id: "bowls" } },
      { label: "Кувшины и графины", filter: { kind: "category", id: "pitchers" } },
    ],
  },
  {
    label: "Фарфор и керамика",
    children: [
      { label: "Чайные сервизы", filter: { kind: "category", id: "teasets" } },
      { label: "Чашки и кружки", filter: { kind: "category", id: "mugs" } },
    ],
  },
  {
    label: "Интерьер",
    children: [{ label: "Декор и вазы", filter: { kind: "category", id: "decor" } }],
  },
];

export const sameFilter = (a: CatalogFilter, b: CatalogFilter) =>
  a.kind === b.kind && (a.kind !== "category" || b.kind !== "category" || a.id === b.id);
