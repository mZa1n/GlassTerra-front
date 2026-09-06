import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Search as SearchIcon, TrendingUp, X } from "lucide-react";
import { Highlight } from "@/components/Highlight";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useCategories, useSuggestions } from "@/hooks/catalog";
import { useDebounced } from "@/hooks/useDebounced";
import { POPULAR_SEARCHES } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { search, type MatchRange } from "@/lib/search";
import type { CategoryId, Product } from "@/lib/types";

const MAX_PRODUCTS = 6;
const MAX_CATEGORIES = 2;

type Suggestion =
  | { kind: "category"; id: CategoryId; label: string; ranges: MatchRange[]; count: number }
  | { kind: "product"; product: Product };

/**
 * Search box with ranked suggestions.
 *
 * Matching is by word prefix, so two letters are enough to surface a product,
 * and the letters the user typed are highlighted in every result. Arrow keys
 * move through the list, Enter opens the highlighted row, Escape closes it.
 */
export function SearchAutocomplete({ compact = false }: { compact?: boolean }) {
  const listId = useId();
  const { query, setQuery, setFilter } = useCatalog();
  const { navigate } = useNavigation();

  const [draft, setDraft] = useState(query);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const debounced = useDebounced(draft);
  const { data: products = [], isLoading } = useSuggestions(debounced, MAX_PRODUCTS);
  const { data: categories = [] } = useCategories();

  // While the debounce is still trailing the input, results belong to the
  // previous query — treat that as loading rather than "nothing found".
  const isSettling = isLoading || draft.trim() !== debounced.trim();

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!debounced.trim()) return [];

    const categoryHits = search(categories, debounced, (category) => ({
      name: category.name,
      category: category.name,
      description: "",
    }))
      .slice(0, MAX_CATEGORIES)
      .map<Suggestion>((hit) => ({
        kind: "category",
        id: hit.item.id,
        label: hit.item.name,
        ranges: hit.nameRanges,
        count: hit.item.productCount,
      }));

    return [...categoryHits, ...products.map<Suggestion>((product) => ({ kind: "product", product }))];
  }, [categories, products, debounced]);

  const showPopular = draft.trim().length === 0;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the field in sync when the query is changed elsewhere.
  useEffect(() => setDraft(query), [query]);

  // A new result set invalidates the previous highlight position.
  useEffect(() => setActiveIndex(-1), [debounced]);

  const runSearch = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    setQuery(trimmed);
    setOpen(false);
    setActiveIndex(-1);
    navigate("search");
  };

  const choose = (suggestion: Suggestion) => {
    if (suggestion.kind === "category") {
      setDraft("");
      setQuery("");
      setOpen(false);
      setFilter({ kind: "category", id: suggestion.id });
      navigate("catalog");
      return;
    }

    runSearch(suggestion.product.name);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (suggestions.length === 0) return;
      event.preventDefault();
      setOpen(true);
      setActiveIndex((current) => {
        const delta = event.key === "ArrowDown" ? 1 : -1;
        return (current + delta + suggestions.length) % suggestions.length;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const active = suggestions[activeIndex];
      if (active) choose(active);
      else runSearch(draft);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          runSearch(draft);
        }}
      >
        <SearchIcon
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            compact ? "left-3 size-4" : "left-4 size-5",
          )}
        />
        <input
          type="text"
          inputMode="search"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label="Поиск по каталогу"
          value={draft}
          placeholder={compact ? "Поиск товаров…" : "Поиск по каталогу Glassterra"}
          onChange={(event) => {
            setDraft(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full rounded-lg border bg-secondary outline-none transition-colors",
            "focus:border-ring focus:bg-background focus:ring-[3px] focus:ring-ring/40",
            compact ? "py-2 pr-9 pl-10 text-sm" : "py-3 pr-10 pl-12",
          )}
        />
        {draft && (
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label="Очистить поиск"
            onClick={() => {
              setDraft("");
              setQuery("");
              setActiveIndex(-1);
            }}
            className="absolute top-1/2 right-1 size-8 -translate-y-1/2 rounded-full"
          >
            <X className="size-4" />
          </Button>
        )}
      </form>

      {open && (
        <div
          id={listId}
          role="listbox"
          className="absolute inset-x-0 top-full z-50 mt-2 max-h-[60vh] overflow-y-auto overscroll-contain rounded-lg border bg-popover shadow-xl"
        >
          {showPopular ? (
            <div className="py-2">
              <p className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground">
                <TrendingUp className="size-4" />
                Популярные запросы
              </p>
              {POPULAR_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent"
                  onClick={() => runSearch(term)}
                >
                  {term}
                </button>
              ))}
            </div>
          ) : suggestions.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              {isSettling ? "Ищем…" : "Ничего не найдено"}
            </p>
          ) : (
            <div className="py-2">
              {suggestions.map((suggestion, index) => {
                const active = index === activeIndex;
                const rowClass = cn(
                  "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                  active ? "bg-accent" : "hover:bg-accent/60",
                );

                if (suggestion.kind === "category") {
                  return (
                    <button
                      key={`category-${suggestion.id}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => choose(suggestion)}
                      className={rowClass}
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary">
                        <SearchIcon className="size-4 text-muted-foreground" />
                      </span>
                      <span className="min-w-0 flex-1 text-sm text-foreground">
                        <Highlight text={suggestion.label} ranges={suggestion.ranges} />
                        <span className="ml-2 text-xs text-muted-foreground">
                          категория · {suggestion.count}
                        </span>
                      </span>
                    </button>
                  );
                }

                const { product } = suggestion;

                return (
                  <button
                    key={product.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(suggestion)}
                    className={rowClass}
                  >
                    <span className="size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <ImageWithFallback
                        src={product.image}
                        alt=""
                        className="size-full object-cover"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">
                        <Highlight text={product.name} query={debounced} />
                      </span>
                      <span className="mt-0.5 flex items-center gap-2 text-xs">
                        <span className="text-primary">{formatPrice(product.price)}</span>
                        <span className="truncate text-muted-foreground">
                          <Highlight text={product.categoryName} query={debounced} />
                        </span>
                      </span>
                    </span>
                    {!product.inStock && (
                      <span className="shrink-0 text-xs text-destructive">Нет в наличии</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
