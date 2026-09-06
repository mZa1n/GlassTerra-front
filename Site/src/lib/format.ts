const priceFormatter = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});

export const formatPrice = (value: number) => priceFormatter.format(value);

/** "12 товаров" / "1 товар" / "3 товара" */
const pluralRules = new Intl.PluralRules("ru-RU");

export function plural(count: number, forms: { one: string; few: string; many: string }) {
  const rule = pluralRules.select(count);
  if (rule === "one") return forms.one;
  if (rule === "few") return forms.few;
  return forms.many;
}

export const discountPercent = (price: number, oldPrice: number) =>
  Math.round((1 - price / oldPrice) * 100);
