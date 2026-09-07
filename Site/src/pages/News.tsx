import { useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { ArticleNote } from "@/components/news/ArticleNote";
import { PromoBanner } from "@/components/news/PromoBanner";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useProducts } from "@/hooks/catalog";
import { useArticles } from "@/hooks/content";
import { SHOP } from "@/data/shop";
import { parseCta } from "@/lib/cta";
import type { Article } from "@/lib/types";

const OUTLINE_ON_PHOTO =
  "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white";

export function NewsPage() {
  const { navigate } = useNavigation();
  const { setFilter } = useCatalog();
  const articles = useArticles();
  const newProducts = useProducts({ filter: { kind: "new" } });

  const follow = (article: Article) => {
    const cta = parseCta(article.ctaTarget);
    if (!cta) return;

    if (cta.kind === "page") {
      navigate(cta.page);
      return;
    }

    setFilter(cta.filter);
    navigate("catalog");
  };

  const { lead, tiles, notes } = useMemo(() => {
    const rows = articles.data ?? [];
    const promos = rows.filter((article) => article.kind === "promo");
    const featured = promos.find((article) => article.featured);

    return {
      lead: featured ?? promos[0],
      tiles: promos.filter((article) => article !== (featured ?? promos[0])),
      notes: rows.filter((article) => article.kind === "note"),
    };
  }, [articles.data]);

  const banner = (article: Article, size: "lead" | "tile") => (
    <PromoBanner
      key={article.id}
      size={size}
      eyebrow={article.eyebrow}
      title={article.title}
      description={article.text}
      image={article.image}
    >
      {article.ctaLabel && parseCta(article.ctaTarget) && (
        <Button
          type="button"
          variant={size === "lead" ? "default" : "outline"}
          onClick={() => follow(article)}
          className={size === "lead" ? undefined : OUTLINE_ON_PHOTO}
        >
          {article.ctaLabel}
        </Button>
      )}
    </PromoBanner>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 space-y-12 duration-500">
      <PageHeader
        title="Новости и акции"
        description={`Актуальные предложения магазина ${SHOP.name}`}
      />

      <QueryState
        status={articles.status}
        error={articles.error}
        onRetry={articles.refetch}
        loading={
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-lg" />
            <div className="grid gap-6 md:grid-cols-2">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-64 w-full rounded-lg" />
            </div>
          </div>
        }
      >
        <div className="space-y-12">
          {lead && banner(lead, "lead")}

          {tiles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {tiles.map((article) => banner(article, "tile"))}
            </div>
          )}

          {notes.length > 0 && (
            <section className="grid gap-x-8 gap-y-6 border-y py-8 sm:grid-cols-2 lg:grid-cols-3">
              {notes.map((article) => (
                <ArticleNote key={article.id} article={article} />
              ))}
            </section>
          )}
        </div>
      </QueryState>

      <section>
        <h2 className="mb-5 text-xl md:text-2xl">Из новой коллекции</h2>
        <QueryState
          status={newProducts.status}
          error={newProducts.error}
          onRetry={newProducts.refetch}
          loading={<ProductGridSkeleton count={3} />}
        >
          <ProductGrid products={newProducts.data?.items ?? []} />
        </QueryState>
      </section>
    </div>
  );
}
