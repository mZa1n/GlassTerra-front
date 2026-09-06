import type { Category, CategoryId, Product } from "@/lib/types";

/**
 * Catalog fixture.
 *
 * This is the mock backend's data set and the seed for the real database.
 * Nothing in `components/` or `pages/` reads it directly — screens go through
 * `@/api`, which serves either this fixture or the HTTP backend.
 */

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=${w}`;

/** Product counts are derived by the catalog service, not stored here. */
export type CategorySeed = Omit<Category, "productCount">;

/** Label and gallery are composed at serve time. */
export type ProductSeed = Omit<Product, "categoryName" | "images">;

/**
 * Extra shots per category. A real catalogue stores a gallery per product;
 * until photography exists, every product borrows from its category.
 */
const GALLERY: Record<CategoryId, string[]> = {
  glasses: [
    "photo-1565256080583-df488fd02195",
    "photo-1707340726386-611f5e9398f3",
    "photo-1763196080531-f282d0d4e6c7",
  ],
  mugs: [
    "photo-1669329606558-2dc9172d9f33",
    "photo-1514228742587-6b1558fcca3d",
    "photo-1762417582726-7a6ea816912e",
  ],
  bowls: [
    "photo-1546069901-ba9599a7e63c",
    "photo-1762417582726-7a6ea816912e",
    "photo-1758445045680-bc7d505b16d2",
  ],
  pitchers: [
    "photo-1620877138710-e086a5f24b46",
    "photo-1763196080531-f282d0d4e6c7",
    "photo-1758445045680-bc7d505b16d2",
  ],
  plates: [
    "photo-1578775887804-699de7086ff9",
    "photo-1762417582726-7a6ea816912e",
    "photo-1546069901-ba9599a7e63c",
  ],
  teasets: [
    "photo-1563362014-7781f7b4f0c7",
    "photo-1669329606558-2dc9172d9f33",
    "photo-1762417582726-7a6ea816912e",
  ],
  decor: [
    "photo-1597696929736-6d13bed8e6a8",
    "photo-1758445045680-bc7d505b16d2",
    "photo-1763196080531-f282d0d4e6c7",
  ],
};

export const CATEGORIES: readonly CategorySeed[] = [
  { id: "glasses", name: "Стаканы и стопки", image: img("photo-1565256080583-df488fd02195") },
  { id: "mugs", name: "Чашки и кружки", image: img("photo-1669329606558-2dc9172d9f33") },
  { id: "bowls", name: "Салатники", image: img("photo-1546069901-ba9599a7e63c") },
  { id: "pitchers", name: "Кувшины", image: img("photo-1620877138710-e086a5f24b46") },
  { id: "plates", name: "Тарелки", image: img("photo-1578775887804-699de7086ff9") },
  { id: "teasets", name: "Чайные сервизы", image: img("photo-1563362014-7781f7b4f0c7") },
  { id: "decor", name: "Декор и вазы", image: img("photo-1597696929736-6d13bed8e6a8") },
];

export const PRODUCTS: readonly ProductSeed[] = [
  {
    id: 1,
    slug: "classic-glass",
    name: "Стакан стеклянный «Классика»",
    price: 350,
    oldPrice: 450,
    category: "glasses",
    rating: 4.5,
    reviews: 128,
    image: img("photo-1565256080583-df488fd02195"),
    inStock: true,
    description: "Прозрачный стакан для повседневной сервировки. Толстое дно, устойчивая форма.",
    specs: { Объём: "250 мл", Материал: "Стекло", "В комплекте": "1 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 2,
    slug: "shot-glass-set-6",
    name: "Набор стопок, 6 шт",
    price: 890,
    category: "glasses",
    rating: 4.8,
    reviews: 64,
    image: img("photo-1707340726386-611f5e9398f3"),
    inStock: true,
    description: "Классические стопки из прозрачного стекла. Подойдут для подачи крепких напитков.",
    specs: { Объём: "50 мл", Материал: "Стекло", "В комплекте": "6 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 3,
    slug: "cozy-ceramic-mug",
    name: "Кружка керамическая «Уют»",
    price: 550,
    category: "mugs",
    rating: 4.7,
    reviews: 210,
    image: img("photo-1669329606558-2dc9172d9f33"),
    inStock: true,
    description: "Плотная керамическая кружка с матовой глазурью. Долго держит тепло.",
    specs: { Объём: "350 мл", Материал: "Керамика", "В комплекте": "1 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 4,
    slug: "large-glass-bowl",
    name: "Салатник стеклянный большой",
    price: 780,
    oldPrice: 950,
    category: "bowls",
    rating: 4.6,
    reviews: 89,
    image: img("photo-1546069901-ba9599a7e63c"),
    inStock: true,
    description: "Вместительный салатник для подачи на большую компанию.",
    specs: { Диаметр: "25 см", Материал: "Стекло", "В комплекте": "1 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 5,
    slug: "water-pitcher-1-5l",
    name: "Кувшин для воды, 1.5 л",
    price: 1200,
    category: "pitchers",
    rating: 4.9,
    reviews: 47,
    image: img("photo-1620877138710-e086a5f24b46"),
    inStock: false,
    description: "Кувшин с широким горлом и удобной ручкой. Подходит для холодных напитков.",
    specs: { Объём: "1500 мл", Материал: "Стекло", "В комплекте": "1 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 6,
    slug: "decorative-ceramic-vase",
    name: "Ваза керамическая декоративная",
    price: 2300,
    category: "decor",
    rating: 4.4,
    reviews: 31,
    image: img("photo-1597696929736-6d13bed8e6a8"),
    inStock: true,
    description: "Высокая ваза с фактурной поверхностью. Хорошо смотрится с сухоцветами.",
    specs: { Высота: "30 см", Материал: "Керамика", "В комплекте": "1 шт", "Посудомоечная машина": "Нет" },
  },
  {
    id: 7,
    slug: "faceted-glass-250",
    name: "Стакан «Гранёный», 250 мл",
    price: 280,
    category: "glasses",
    rating: 5,
    reviews: 342,
    image: img("photo-1565256080583-df488fd02195"),
    inStock: true,
    description: "Тот самый гранёный стакан. Прочное стекло, узнаваемая форма.",
    specs: { Объём: "250 мл", Материал: "Стекло", "В комплекте": "1 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 8,
    slug: "thermo-mug-with-lid",
    name: "Кружка с крышкой, термо",
    price: 890,
    oldPrice: 1200,
    category: "mugs",
    rating: 4.8,
    reviews: 156,
    image: img("photo-1669329606558-2dc9172d9f33"),
    inStock: true,
    description: "Двустенная термокружка с герметичной крышкой. Держит температуру до 4 часов.",
    specs: {
      Объём: "400 мл",
      Материал: "Нержавеющая сталь",
      "В комплекте": "1 шт",
      "Посудомоечная машина": "Нет",
    },
  },
  {
    id: 9,
    slug: "glass-bowl-set-3",
    name: "Салатник, набор 3 шт",
    price: 1450,
    category: "bowls",
    rating: 4.7,
    reviews: 73,
    image: img("photo-1546069901-ba9599a7e63c"),
    inStock: true,
    description: "Три салатника разного диаметра, вкладываются друг в друга при хранении.",
    specs: { Диаметр: "15 / 20 / 25 см", Материал: "Стекло", "В комплекте": "3 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 10,
    slug: "deep-glass-plate",
    name: "Тарелка стеклянная глубокая",
    price: 450,
    category: "plates",
    rating: 4.3,
    reviews: 58,
    image: img("photo-1578775887804-699de7086ff9"),
    inStock: true,
    description: "Глубокая тарелка для первых блюд. Прозрачное закалённое стекло.",
    specs: { Диаметр: "22 см", Материал: "Стекло", "В комплекте": "1 шт", "Посудомоечная машина": "Да" },
  },
  {
    id: 11,
    slug: "flora-tea-set-6",
    name: "Чайный сервиз «Флора», 6 персон",
    price: 3500,
    oldPrice: 4200,
    category: "teasets",
    rating: 4.9,
    reviews: 41,
    image: img("photo-1563362014-7781f7b4f0c7"),
    inStock: true,
    description: "Фарфоровый сервиз с цветочным декором: чашки, блюдца и чайник.",
    specs: { Объём: "220 мл (чашка)", Материал: "Фарфор", "В комплекте": "13 предметов", "Посудомоечная машина": "Да" },
  },
  {
    id: 12,
    slug: "designer-thermo-mug",
    name: "Термокружка дизайнерская",
    price: 1250,
    category: "mugs",
    rating: 4.8,
    reviews: 19,
    image: img("photo-1514228742587-6b1558fcca3d"),
    inStock: true,
    isNew: true,
    description: "Лимитированная серия термокружек с матовым покрытием soft-touch.",
    specs: {
      Объём: "450 мл",
      Материал: "Нержавеющая сталь",
      "В комплекте": "1 шт",
      "Посудомоечная машина": "Нет",
    },
  },
  {
    id: 13,
    slug: "crystal-carafe",
    name: "Графин «Кристалл» с пробкой",
    price: 2650,
    category: "pitchers",
    rating: 4.9,
    reviews: 12,
    image: img("photo-1620877138710-e086a5f24b46"),
    inStock: true,
    isNew: true,
    description: "Графин ручной работы из коллекции «Кристалл». Стеклянная пробка в комплекте.",
    specs: { Объём: "1000 мл", Материал: "Стекло", "В комплекте": "1 шт", "Посудомоечная машина": "Нет" },
  },
  {
    id: 14,
    slug: "scandinavia-plate-set-4",
    name: "Набор тарелок «Скандинавия», 4 шт",
    price: 2100,
    oldPrice: 2800,
    category: "plates",
    rating: 4.6,
    reviews: 27,
    image: img("photo-1578775887804-699de7086ff9"),
    inStock: true,
    isNew: true,
    description: "Минималистичные тарелки в скандинавском стиле, матовая керамика.",
    specs: { Диаметр: "26 см", Материал: "Керамика", "В комплекте": "4 шт", "Посудомоечная машина": "Да" },
  },
];

const CATEGORY_NAMES = new Map<CategoryId, string>(
  CATEGORIES.map((category) => [category.id, category.name]),
);

export const categoryLabel = (id: CategoryId) => CATEGORY_NAMES.get(id) ?? id;

/** Adds the fields the API is responsible for filling in. */
export const toProduct = (seed: ProductSeed): Product => {
  // Compare by photo id, not by URL: the same shot is requested at different
  // widths for the grid and the gallery, so URL equality would let it through
  // twice.
  const extras = GALLERY[seed.category]
    .filter((id) => !seed.image.includes(id))
    .map((id) => img(id, 1200));

  return {
    ...seed,
    categoryName: categoryLabel(seed.category),
    images: [seed.image, ...extras],
  };
};
