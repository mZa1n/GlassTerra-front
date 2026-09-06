import { SearchX, Search as SearchIcon } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useProducts } from "@/hooks/catalog";
import { plural } from "@/lib/format";

export function SearchResultsPage() {
  const { query } = useCatalog();
  const { navigate } = useNavigation();
  const results = useProducts({ search: query });

  const total = results.data?.total ?? 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        icon={SearchIcon}
        title="Результаты поиска"
        description={
          !query
            ? "Введите запрос в строке поиска"
            : results.isLoading
              ? `Ищем «${query}»…`
              : `По запросу «${query}» — ${total} ${plural(total, {
                  one: "товар",
                  few: "товара",
                  many: "товаров",
                })}`
        }
      />

      <QueryState
        status={query ? results.status : "success"}
        error={results.error}
        onRetry={results.refetch}
        loading={<ProductGridSkeleton count={4} />}
      >
        {total === 0 ? (
          <EmptyState
            icon={SearchX}
            title={query ? "Ничего не нашлось" : "Что ищем?"}
            description={
              query
                ? "Попробуйте изменить запрос или посмотрите весь каталог."
                : "Введите название товара в строке поиска — достаточно первых букв."
            }
            action={
              <Button type="button" onClick={() => navigate("catalog")}>
                Открыть каталог
              </Button>
            }
          />
        ) : (
          <ProductGrid products={results.data?.items ?? []} highlight={query} />
        )}
      </QueryState>
    </div>
  );
}
