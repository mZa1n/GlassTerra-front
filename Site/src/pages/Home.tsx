import { ArrowRight, RefreshCw, Sparkles, Truck } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { CategoryTiles, CategoryTilesSkeleton } from "@/components/CategoryTiles";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
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
  { icon: RefreshCw, title: "Возврат 14 дней", text: "Без объяснения причин" },
  { icon: Sparkles, title: "Новые коллекции", text: "Пополняем ассортимент каждый месяц" },
] as const;

function SectionHeading({
  title,
  action,
}: {
  title: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="text-xl md:text-2xl">{title}</h2>
      {action && (
        <Button type="button" variant="link" className="px-0" onClick={action.onClick}>
          {action.label}
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

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
    <div className="space-y-12 md:space-y-16">
      {/* Editorial hero: the photograph carries it, the scrim only makes text legible. */}
      <section className="relative overflow-hidden rounded-lg">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1763196080531-f282d0d4e6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
          alt=""
          className="h-[19rem] w-full object-cover md:h-[24rem]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/45 to-transparent" />

        <div className="absolute inset-0 flex flex-col justify-center gap-4 p-6 md:max-w-lg md:p-12">
          <p className="text-xs tracking-[0.18em] text-white/70 uppercase">
            Коллекция «Кристалл»
          </p>
          <h1 className="text-3xl text-white md:text-4xl">
            Посуда, которая держит форму и стиль
          </h1>
          <p className="text-sm text-white/80 md:text-base">
            Стекло, фарфор и керамика для дома — от повседневных стаканов до праздничных
            сервизов.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <Button type="button" onClick={() => openCatalog({ kind: "all" })}>
              В каталог
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => openCatalog({ kind: "new" })}
              className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            >
              Новинки
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-6 border-y py-6 sm:grid-cols-3">
        {PERKS.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="text-sm font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{text}</p>
            </div>
          </div>
        ))}
      </section>

      <section>
        <SectionHeading title="Категории" />
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
      </section>

      <section>
        <SectionHeading
          title="Часто покупают"
          action={{ label: "Весь каталог", onClick: () => openCatalog({ kind: "all" }) }}
        />
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
