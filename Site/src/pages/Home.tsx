import { ShieldCheck, Sparkles, Truck, ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { CategoryTiles, CategoryTilesSkeleton } from "@/components/CategoryTiles";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useCategories, useProducts } from "@/hooks/catalog";
import { SHOP } from "@/data/shop";
import { formatPrice } from "@/lib/format";
import type { CatalogFilter } from "@/lib/types";

const PERKS = [
  {
    icon: Truck,
    title: "Бесплатная доставка",
    text: `При заказе от ${formatPrice(SHOP.freeDeliveryFrom)}`,
  },
  { icon: ShieldCheck, title: "Гарантия качества", text: "Обмен и возврат в течение 14 дней" },
  { icon: Sparkles, title: "Новинки каждый месяц", text: "Свежие коллекции от производителей" },
] as const;

export function HomePage() {
  const { navigate } = useNavigation();
  const { setFilter } = useCatalog();

  const categories = useCategories();
  const bestsellers = useProducts({ sort: "popular", perPage: 4 });

  const openCatalog = (filter: CatalogFilter) => {
    setFilter(filter);
    navigate("catalog");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <section className="relative overflow-hidden rounded-xl bg-linear-to-r from-blue-600 to-blue-800 text-white shadow-xl">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763196080531-f282d0d4e6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
          alt=""
          className="absolute inset-0 size-full object-cover opacity-20"
        />
        <div className="relative space-y-4 p-6 md:max-w-2xl md:p-12">
          <p className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm backdrop-blur-sm">
            <Sparkles className="size-4" />
            Коллекция «Кристалл» уже в продаже
          </p>
          <h1 className="text-3xl text-white md:text-5xl">Посуда, которая держит форму и стиль</h1>
          <p className="text-base text-blue-100 md:text-lg">
            Стекло, фарфор и керамика для дома — от повседневных стаканов до праздничных сервизов.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => openCatalog({ kind: "all" })}>
              Перейти в каталог
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => openCatalog({ kind: "new" })}
              className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
            >
              Смотреть новинки
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <Card key={title}>
            <CardContent className="flex items-start gap-3 p-4">
              <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
              <div>
                <p className="text-foreground">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <Card>
          <CardContent className="p-4 md:p-6">
            <h2 className="mb-4 text-xl text-foreground md:mb-6">Категории</h2>
            <QueryState
              status={categories.status}
              error={categories.error}
              onRetry={categories.refetch}
              loading={<CategoryTilesSkeleton />}
            >
              <CategoryTiles
                categories={categories.data ?? []}
                onSelect={(id) => openCatalog({ kind: "category", id })}
              />
            </QueryState>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl text-foreground">Часто покупают</h2>
          <Button type="button" variant="ghost" onClick={() => openCatalog({ kind: "all" })}>
            Весь каталог
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <QueryState
          status={bestsellers.status}
          error={bestsellers.error}
          onRetry={bestsellers.refetch}
          loading={<ProductGridSkeleton count={4} />}
        >
          <ProductGrid products={bestsellers.data?.items ?? []} />
        </QueryState>
      </section>
    </div>
  );
}
