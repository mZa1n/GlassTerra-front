import { PageHeader } from "@/components/PageHeader";
import { ProductGrid, ProductGridSkeleton } from "@/components/ProductGrid";
import { PromoBanner } from "@/components/news/PromoBanner";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useProducts } from "@/hooks/catalog";
import { SHOP } from "@/data/shop";
import { formatPrice } from "@/lib/format";
import type { CatalogFilter, Page } from "@/lib/types";

interface Highlight {
  title: string;
  text: string;
  link: string;
  page: Page;
}

const HIGHLIGHTS: readonly Highlight[] = [
  {
    title: "Программа лояльности",
    text: "Накопительная скидка для постоянных покупателей — от 5% до 15%.",
    link: "Узнать подробности",
    page: "about",
  },
  {
    title: "Бесплатная доставка",
    text: `Доставим бесплатно по городу при заказе от ${formatPrice(SHOP.freeDeliveryFrom)}.`,
    link: "Условия доставки",
    page: "delivery",
  },
  {
    title: "Предзаказ коллекций",
    text: "Оформите предзаказ на эксклюзивные серии со скидкой 20%.",
    link: "Смотреть новинки",
    page: "new-arrivals",
  },
];

const OUTLINE_ON_PHOTO =
  "border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white";

export function NewsPage() {
  const { navigate } = useNavigation();
  const { setFilter } = useCatalog();
  const newProducts = useProducts({ filter: { kind: "new" } });

  const openCatalog = (filter: CatalogFilter) => {
    setFilter(filter);
    navigate("catalog");
  };

  return (
    <div className="space-y-12">
      <PageHeader
        title="Новости и акции"
        description={`Актуальные предложения магазина ${SHOP.name}`}
      />

      <PromoBanner
        size="lead"
        eyebrow="Новинка сезона"
        title="Коллекция стеклянной посуды «Кристалл»"
        description={`Серия ручной работы от европейских мастеров — эксклюзивно в ${SHOP.name}.`}
        image="https://images.unsplash.com/photo-1763196080531-f282d0d4e6c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1600"
      >
        <Button type="button" onClick={() => openCatalog({ kind: "new" })}>
          Посмотреть коллекцию
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("new-arrivals")}
          className={OUTLINE_ON_PHOTO}
        >
          Подробнее
        </Button>
      </PromoBanner>

      <div className="grid gap-6 md:grid-cols-2">
        <PromoBanner
          eyebrow="Акция · до 40%"
          title="Сезонная распродажа"
          description="Скидки на керамику и аксессуары для кухни."
          image="https://images.unsplash.com/photo-1762417582726-7a6ea816912e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => openCatalog({ kind: "sale" })}
            className={OUTLINE_ON_PHOTO}
          >
            Товары со скидкой
          </Button>
        </PromoBanner>

        <PromoBanner
          eyebrow="Тренд сезона"
          title="Минимализм в интерьере"
          description="Посуда в скандинавском стиле для современной кухни."
          image="https://images.unsplash.com/photo-1758445045680-bc7d505b16d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200"
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => openCatalog({ kind: "category", id: "plates" })}
            className={OUTLINE_ON_PHOTO}
          >
            Смотреть подборку
          </Button>
        </PromoBanner>
      </div>

      <section className="grid gap-x-8 gap-y-6 border-y py-8 sm:grid-cols-2 lg:grid-cols-3">
        {HIGHLIGHTS.map(({ title, text, link, page }) => (
          <div key={title} className="space-y-1.5">
            <h3 className="text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
            <Button type="button" variant="link" className="h-auto px-0 py-0" onClick={() => navigate(page)}>
              {link} →
            </Button>
          </div>
        ))}
      </section>

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
