/** Storefront-wide constants. Referenced by the header, footer and contact page. */
export const SHOP = {
  name: "Glassterra",
  tagline: "всё для дома и уюта",
  address: "г. Гусь-Хрустальный, ул. Рудницкой, д. 10",
  phone: "+7 (999) 123-45-67",
  phoneHref: "tel:+79991234567",
  email: "info@posudatut.ru",
  hours: "Пн–Пт 9:00–18:00, Сб 10:00–16:00",
  freeDeliveryFrom: 3000,
  social: [
    { label: "ВКонтакте", url: "https://vk.com" },
    { label: "Telegram", url: "https://t.me" },
    { label: "Одноклассники", url: "https://ok.ru" },
  ],
} as const;
