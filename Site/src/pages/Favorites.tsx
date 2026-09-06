import { Heart } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { useNavigation } from "@/context/NavigationProvider";
import { useStore } from "@/context/StoreProvider";
import { useProductsByIds } from "@/hooks/catalog";
import { plural } from "@/lib/format";

export function FavoritesPage() {
  const { favorites } = useStore();
  const { navigate } = useNavigation();
  const query = useProductsByIds(favorites);

  if (favorites.length === 0) {
    return (
      <EmptyState
        icon={Heart}
        title="В избранном пока пусто"
        description="Нажмите на сердечко у товара, чтобы вернуться к нему позже."
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
        icon={Heart}
        title="Избранное"
        description={`${favorites.length} ${plural(favorites.length, {
          one: "товар",
          few: "товара",
          many: "товаров",
        })}`}
      />

      <QueryState
        status={query.status}
        error={query.error}
        onRetry={query.refetch}
        loading={<ProductGridSkeleton count={favorites.length} />}
      >
        <ProductGrid products={query.data ?? []} />
      </QueryState>
    </div>
  );
}
