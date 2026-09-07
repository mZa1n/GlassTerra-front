import { parseFilterKey } from "@/lib/catalog";
import { PAGES, type CatalogFilter, type Page } from "@/lib/types";

/**
 * Where a call-to-action button goes. Stored as one string ("page:about",
 * "filter:category:plates") so an article carries its link without the
 * content model growing a second table.
 */
export type CtaTarget =
  | { kind: "page"; page: Page }
  | { kind: "filter"; filter: CatalogFilter };

export function parseCta(value: string): CtaTarget | null {
  if (value.startsWith("page:")) {
    const page = value.slice("page:".length);
    // An unknown page would render as "страница не найдена"; drop the button.
    return PAGES.includes(page as Page) ? { kind: "page", page: page as Page } : null;
  }

  if (value.startsWith("filter:")) {
    const filter = parseFilterKey(value.slice("filter:".length));
    return filter ? { kind: "filter", filter } : null;
  }

  return null;
}
