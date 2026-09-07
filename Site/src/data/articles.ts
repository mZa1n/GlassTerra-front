import { SHOP } from "@/data/shop";
import { formatPrice } from "@/lib/format";
import type { Article } from "@/lib/types";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

/**
 * News page fixture — the seed for the articles table.
 *
 * These used to be literals inside `pages/News.tsx`, which meant a seasonal
 * promo needed a deploy. The screen now renders whatever this returns.
 */
export const ARTICLES: readonly Article[] = [
  {
    id: "crystal-collection",
    kind: "promo",
    eyebrow: "Новинка сезона",
    title: "Коллекция стеклянной посуды «Кристалл»",
    text: `Серия ручной работы от европейских мастеров — эксклюзивно в ${SHOP.name}.`,
    image: img("photo-1763196080531-f282d0d4e6c7", 1600),
    ctaLabel: "Посмотреть коллекцию",
    ctaTarget: "filter:new",
    featured: true,
    published: true,
    sortOrder: 0,
  },
  {
    id: "seasonal-sale",
    kind: "promo",
    eyebrow: "Акция · до 40%",
    title: "Сезонная распродажа",
    text: "Скидки на керамику и аксессуары для кухни.",
    image: img("photo-1762417582726-7a6ea816912e"),
    ctaLabel: "Товары со скидкой",
    ctaTarget: "filter:sale",
    featured: false,
    published: true,
    sortOrder: 1,
  },
  {
    id: "minimalism",
    kind: "promo",
    eyebrow: "Тренд сезона",
    title: "Минимализм в интерьере",
    text: "Посуда в скандинавском стиле для современной кухни.",
    image: img("photo-1758445045680-bc7d505b16d2"),
    ctaLabel: "Смотреть подборку",
    ctaTarget: "filter:category:plates",
    featured: false,
    published: true,
    sortOrder: 2,
  },
  {
    id: "loyalty",
    kind: "note",
    eyebrow: "",
    title: "Программа лояльности",
    text: "Накопительная скидка для постоянных покупателей — от 5% до 15%.",
    image: "",
    ctaLabel: "Узнать подробности",
    ctaTarget: "page:about",
    featured: false,
    published: true,
    sortOrder: 3,
  },
  {
    id: "free-delivery",
    kind: "note",
    eyebrow: "",
    title: "Бесплатная доставка",
    text: `Доставим бесплатно по городу при заказе от ${formatPrice(SHOP.freeDeliveryFrom)}.`,
    image: "",
    ctaLabel: "Условия доставки",
    ctaTarget: "page:delivery",
    featured: false,
    published: true,
    sortOrder: 4,
  },
  {
    id: "preorder",
    kind: "note",
    eyebrow: "",
    title: "Предзаказ коллекций",
    text: "Оформите предзаказ на эксклюзивные серии со скидкой 20%.",
    image: "",
    ctaLabel: "Смотреть новинки",
    ctaTarget: "page:new-arrivals",
    featured: false,
    published: true,
    sortOrder: 5,
  },
];
