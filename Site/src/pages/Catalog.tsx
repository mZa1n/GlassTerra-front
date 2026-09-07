import { useEffect, useMemo } from "react";
import { PackageSearch } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";
import { useCatalog } from "@/context/CatalogProvider";
import { useCategories, useProducts } from "@/hooks/catalog";
import { SORT_LABELS } from "@/lib/catalog";
import { sameFilter } from "@/data/navigation";
import { plural } from "@/lib/format";
import type { CatalogFilter, SortOrder } from "@/lib/types";

const BASE_CHIPS: readonly { label: string; filter: CatalogFilter }[] = [
  { label: "Все товары", filter: { kind: "all" } },
  { label: "Новинки", filter: { kind: "new" } },
  { label: "Со скидкой", filter: { kind: "sale" } },
];

export function CatalogPage() {
  const { filter, setFilter, sort, setSort } = useCatalog();
  const categories = useCategories();
  const products = useProducts({ filter, sort });

  // CategoryId is a plain string now, so nothing stops a filter from naming a
  // category the admin has since deleted. Fall back rather than leave the
  // catalogue permanently empty.
  useEffect(() => {
    if (filter.kind !== "category" || !categories.data) return;
    if (!categories.data.some((category) => category.id === filter.id)) setFilter({ kind: "all" });
  }, [filter, categories.data, setFilter]);

  const chips = useMemo(
    () => [
      ...BASE_CHIPS,
      ...(categories.data ?? []).map((category) => ({
        label: category.name,
        filter: { kind: "category", id: category.id } as CatalogFilter,
      })),
    ],
    [categories.data],
  );

  const total = products.data?.total ?? 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Каталог товаров"
        description={
          products.isLoading
            ? "Загружаем товары…"
            : `${total} ${plural(total, { one: "товар", few: "товара", many: "товаров" })}`
        }
        actions={
          <Select value={sort} onValueChange={(value) => setSort(value as SortOrder)}>
            <SelectTrigger className="w-52" aria-label="Сортировка">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SORT_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {/* Below lg the category rail is hidden, so filters live here instead. */}
      <div className="lg:hidden">
        <div className="scrollbar-hide touch-pan-x overscroll-x-contain -mx-3 flex gap-2 overflow-x-auto px-3">
            {categories.isLoading
              ? Array.from({ length: 6 }, (_, index) => (
                  <Skeleton key={index} className="h-9 w-28 shrink-0 rounded-lg" />
                ))
              : chips.map((chip) => {
                  const active = sameFilter(filter, chip.filter);

                  return (
                    <button
                      key={chip.label}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(chip.filter)}
                      className={cn(
                        "shrink-0 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors md:px-4",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-accent",
                      )}
                    >
                      {chip.label}
                    </button>
                  );
                })}
        </div>
      </div>

      <QueryState
        status={products.status}
        error={products.error}
        onRetry={products.refetch}
        loading={<ProductGridSkeleton />}
      >
        {products.data && products.data.items.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="В этой категории пока пусто"
            description="Мы уже пополняем ассортимент. Загляните в другие разделы каталога."
            action={
              <Button type="button" onClick={() => setFilter({ kind: "all" })}>
                Показать все товары
              </Button>
            }
          />
        ) : (
          <ProductGrid products={products.data?.items ?? []} />
        )}
      </QueryState>
    </div>
  );
}
