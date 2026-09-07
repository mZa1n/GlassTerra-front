import { AlertTriangle, ArrowRight, Boxes, FileText, LayoutGrid, Newspaper, Tags, Users } from "lucide-react";
import { AdminSection } from "@/components/admin/AdminSection";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { formatPrice } from "@/lib/format";
import type { IconComponent } from "@/lib/icon";
import type { Article, Category, Product, User } from "@/lib/types";

export type AdminSectionId =
  | "overview"
  | "products"
  | "categories"
  | "articles"
  | "pages"
  | "users";

interface OverviewPanelProps {
  products: readonly Product[];
  categories: readonly Category[];
  articles: readonly Article[];
  users: readonly User[];
  onGo: (section: AdminSectionId) => void;
}

interface Stat {
  label: string;
  value: string;
  hint: string;
  icon: IconComponent;
  section: AdminSectionId;
}

export function OverviewPanel({
  products,
  categories,
  articles,
  users,
  onGo,
}: OverviewPanelProps) {
  const outOfStock = products.filter((product) => !product.inStock);
  const discounted = products.filter((product) => product.oldPrice !== undefined);
  const drafts = articles.filter((article) => !article.published);
  const emptyCategories = categories.filter((category) => category.productCount === 0);
  const thin = products.filter((product) => product.description.trim().length < 40);

  const averagePrice = products.length
    ? Math.round(products.reduce((sum, product) => sum + product.price, 0) / products.length)
    : 0;

  const stats: Stat[] = [
    {
      label: "Товары",
      value: String(products.length),
      hint: `Средняя цена ${formatPrice(averagePrice)}`,
      icon: Boxes,
      section: "products",
    },
    {
      label: "Категории",
      value: String(categories.length),
      hint: emptyCategories.length ? `Пустых: ${emptyCategories.length}` : "Все заполнены",
      icon: Tags,
      section: "categories",
    },
    {
      label: "Материалы",
      value: String(articles.length),
      hint: drafts.length ? `Черновиков: ${drafts.length}` : "Все опубликованы",
      icon: Newspaper,
      section: "articles",
    },
    {
      label: "Пользователи",
      value: String(users.length),
      hint: `Сотрудников: ${users.filter((user) => user.role === "admin").length}`,
      icon: Users,
      section: "users",
    },
  ];

  const attention = [
    {
      label: "Нет в наличии",
      items: outOfStock.map((product) => product.name),
      section: "products" as const,
    },
    {
      label: "Короткое описание",
      items: thin.map((product) => product.name),
      section: "products" as const,
    },
    {
      label: "Пустые категории",
      items: emptyCategories.map((category) => category.name),
      section: "categories" as const,
    },
    {
      label: "Черновики материалов",
      items: drafts.map((article) => article.title),
      section: "articles" as const,
    },
  ].filter((row) => row.items.length > 0);

  return (
    <AdminSection
      title="Обзор"
      description="Что сейчас в каталоге и что просит внимания"
      icon={LayoutGrid}
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <button
            key={stat.label}
            type="button"
            onClick={() => onGo(stat.section)}
            style={{ animationDelay: `${index * 60}ms` }}
            className={cn(
              "animate-in fade-in slide-in-from-bottom-2 fill-mode-both group rounded-xl border bg-card p-4 text-left duration-500",
              "transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md",
            )}
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <stat.icon className="size-4" />
            </span>
            <p className="mt-3 text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl tabular-nums text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.hint}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <AlertTriangle className="size-4 text-primary" />
            <h3 className="text-base">Требует внимания</h3>
          </div>

          {attention.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Всё в порядке: остатки на месте, описания заполнены, черновиков нет.
            </p>
          ) : (
            <ul className="space-y-3">
              {attention.map((row) => (
                <li key={row.label} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm text-foreground">
                      {row.label} · {row.items.length}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {row.items.slice(0, 3).join(", ")}
                      {row.items.length > 3 && " …"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => onGo(row.section)}
                  >
                    Открыть
                    <ArrowRight className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4 md:p-6">
          <div className="mb-4 flex items-center gap-2.5">
            <FileText className="size-4 text-primary" />
            <h3 className="text-base">Быстрые действия</h3>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                { label: "Добавить товар", section: "products" },
                { label: "Создать категорию", section: "categories" },
                { label: "Новая акция", section: "articles" },
                { label: "Правка текстов", section: "pages" },
              ] as const
            ).map((action) => (
              <Button
                key={action.label}
                type="button"
                variant="secondary"
                className="justify-start"
                onClick={() => onGo(action.section)}
              >
                {action.label}
              </Button>
            ))}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Со скидкой сейчас {discounted.length} из {products.length} товаров.
          </p>
        </div>
      </div>
    </AdminSection>
  );
}
