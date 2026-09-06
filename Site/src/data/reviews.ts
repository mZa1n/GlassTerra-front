import type { Review } from "@/lib/types";

/**
 * Review fixture.
 *
 * Assignment is deterministic — the same product always shows the same
 * reviews — so screenshots and tests stay stable until a real reviews
 * service exists.
 */
interface ReviewTemplate {
  author: string;
  rating: number;
  daysAgo: number;
  text: string;
}

const TEMPLATES: readonly ReviewTemplate[] = [
  {
    author: "Ирина К.",
    rating: 5,
    daysAgo: 6,
    text: "Пришло целым, упаковано в несколько слоёв. Выглядит дороже, чем на фото — на кухне смотрится отлично.",
  },
  {
    author: "Дмитрий",
    rating: 4,
    daysAgo: 13,
    text: "Хорошее качество, но размер оказался чуть меньше, чем я представлял. Внимательнее читайте характеристики.",
  },
  {
    author: "Ольга М.",
    rating: 5,
    daysAgo: 21,
    text: "Второй раз заказываю здесь. В посудомойке моется без разводов, ничего не помутнело за полгода.",
  },
  {
    author: "Анна",
    rating: 5,
    daysAgo: 34,
    text: "Брала в подарок — упаковали аккуратно, дарить было не стыдно. Доставили на следующий день.",
  },
  {
    author: "Сергей П.",
    rating: 4,
    daysAgo: 48,
    text: "За свои деньги отлично. Придирка одна: на дне едва заметный шов, но в глаза не бросается.",
  },
  {
    author: "Екатерина",
    rating: 5,
    daysAgo: 67,
    text: "Идеально вписалось в сервировку. Приятно держать в руках, стекло толстое, не хлипкое.",
  },
  {
    author: "Марина В.",
    rating: 3,
    daysAgo: 82,
    text: "Вещь неплохая, но у меня была скол на кромке. Магазин заменил без вопросов, поэтому три звезды только за первый экземпляр.",
  },
];

const daysAgoIso = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

/** Three to five reviews per product, picked by id so the set never shuffles. */
export function reviewsFor(productId: number): Review[] {
  const count = 3 + (productId % 3);

  return Array.from({ length: count }, (_, index) => {
    const template = TEMPLATES[(productId * 3 + index) % TEMPLATES.length]!;

    return {
      id: `${productId}-${index}`,
      author: template.author,
      rating: template.rating,
      createdAt: daysAgoIso(template.daysAgo + index),
      text: template.text,
    };
  });
}
