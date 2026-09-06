import { ArrowLeftRight } from "lucide-react";
import { ComparisonTable } from "@/components/comparison/ComparisonTable";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigation } from "@/context/NavigationProvider";
import { MAX_COMPARISON, useStore } from "@/context/StoreProvider";
import { useProductsByIds } from "@/hooks/catalog";
import { useProductActions } from "@/hooks/useProductActions";

export function ComparisonPage() {
  const { comparison, toggleComparison } = useStore();
  const { add } = useProductActions();
  const { navigate } = useNavigation();
  const query = useProductsByIds(comparison);

  if (comparison.length === 0) {
    return (
      <EmptyState
        icon={ArrowLeftRight}
        title="Список сравнения пуст"
        description={`Добавьте до ${MAX_COMPARISON} товаров из каталога, чтобы сравнить их характеристики.`}
        action={
          <Button type="button" onClick={() => navigate("catalog")}>
            Перейти в каталог
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        icon={ArrowLeftRight}
        title="Сравнение товаров"
        description={`${comparison.length} из ${MAX_COMPARISON}`}
      />

      <QueryState
        status={query.status}
        error={query.error}
        onRetry={query.refetch}
        loading={<Skeleton className="h-96 w-full rounded-xl" />}
      >
        <ComparisonTable
          products={query.data ?? []}
          onRemove={toggleComparison}
          onAddToCart={add}
        />
      </QueryState>
    </div>
  );
}
