import { useCallback } from "react";
import { Sparkles } from "lucide-react";
import { api } from "@/api";
import { EmptyState } from "@/components/EmptyState";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { QueryState } from "@/components/QueryState";
import { useProducts } from "@/hooks/catalog";
import { useQuery } from "@/hooks/useQuery";

export function NewArrivalsPage() {
  const content = useQuery(
    "page:new-arrivals",
    useCallback((signal: AbortSignal) => api.content.getPage("new-arrivals", signal), []),
  );
  const query = useProducts({ filter: { kind: "new" } });
  const products = query.data?.items ?? [];

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        icon={Sparkles}
        title={content.data?.title ?? "Новинки"}
        description={content.data?.intro}
      />

      <QueryState
        status={query.status}
        error={query.error}
        onRetry={query.refetch}
        loading={<ProductGridSkeleton count={4} />}
      >
        {products.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Новинок пока нет"
            description="Следите за разделом «Новости и акции» — мы анонсируем коллекции заранее."
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </QueryState>
    </div>
  );
}
