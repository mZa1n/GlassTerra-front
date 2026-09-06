import { Gift, Sparkles, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { PromoBanner } from "@/components/news/PromoBanner";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useProducts } from "@/hooks/catalog";
import { SHOP } from "@/data/shop";
import { formatPrice } from "@/lib/format";
import type { IconComponent } from "@/lib/icon";
import type { CatalogFilter, Page } from "@/lib/types";

interface Highlight {
  icon: IconComponent;
  accent: string;
  title: string;
  text: string;
  link: string;
  page: Page;
}

const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: Gift,
    accent: "border-l-primary",
    title: "Программа лояльности",
    text: "Накопительная скидка для постоянных покупателей — от 5% до 15%.",
    link: "Узнать подробности",
    page: "about",
  },
  {
    icon: TrendingUp,
    accent: "border-l-emerald-500",
    title: "Бесплатная доставка",
    text: `Доставим бесплатно по городу при заказе от ${formatPrice(SHOP.freeDeliveryFrom)}.`,
    link: "Условия доставки",
    page: "delivery",
  },
  {
    icon: Sparkles,
    accent: "border-l-violet-500",
    title: "Предзаказ коллекций",
    text: "Оформите предзаказ на эксклюзивные серии со скидкой 20%.",
    link: "Смотреть новинки",
    page: "new-arrivals",
  },
];

export function NewsPage() {
  const { navigate } = useNavigation();
  const { setFilter } = useCatalog();
  const newProducts = useProducts({ filter: { kind: "new" } });

  const openCatalog = (filter: CatalogFilter) => {
    setFilter(filter);
    navigate("catalog");
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Новости и акции"
        description={`Актуальные предложения магазина ${SHOP.name}`}
      />

      <PromoBanner
        gradient="from-blue-600 to-blue-800"
        badgeIcon={Sparkles}
        badgeLabel="Новинка сезона"
        title="Коллекция стеклянной посуды «Кристалл»"
        description={`Серия ручной работы от европейских мастеров — эксклюзивно в ${SHOP.name}.`}
        image="https://images.unsplash.com/photo-1763196080531-f282d0d4e6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1400"
      >
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={() => openCatalog({ kind: "new" })}>
            Посмотреть коллекцию
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("new-arrivals")}
            className="border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
          >
            Подробнее
          </Button>
        </div>
      </PromoBanner>

      <div className="grid gap-4 md:grid-cols-2 md:gap-6">
        <PromoBanner
          gradient="from-red-500 to-orange-600"
          badgeIcon={Gift}
          badgeLabel="Акция"
          title="Сезонная распродажа"
          description="Скидки до 40% на керамику и аксессуары для кухни."
        >
          <p className="text-4xl md:text-5xl">−40%</p>
          <Button type="button" variant="secondary" onClick={() => openCatalog({ kind: "sale" })}>
            Смотреть товары со скидкой
          </Button>
        </PromoBanner>

        <PromoBanner
          gradient="from-slate-700 to-slate-900"
          badgeIcon={TrendingUp}
          badgeLabel="Тренд сезона"
          title="Минимализм в интерьере"
          description="Посуда в скандинавском стиле для современной кухни."
          image="https://images.unsplash.com/photo-1758445045680-bc7d505b16d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => openCatalog({ kind: "category", id: "plates" })}
          >
            Смотреть подборку
          </Button>
        </PromoBanner>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, accent, title, text, link, page }) => (
          <Card key={title} className={`border-l-4 ${accent}`}>
            <CardContent className="space-y-2 p-6">
              <Icon className="size-5 text-primary" />
              <h3 className="text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{text}</p>
              <Button type="button" variant="link" className="px-0" onClick={() => navigate(page)}>
                {link} →
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl text-foreground">Из новой коллекции</h2>
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
