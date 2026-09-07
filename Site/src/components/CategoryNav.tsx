import { useMemo } from "react";
import { LayoutGrid } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/components/ui/utils";
import { useCatalog } from "@/context/CatalogProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useCategories } from "@/hooks/catalog";
import { SIDEBAR_SHORTCUTS, UNGROUPED_LABEL, sameFilter } from "@/data/navigation";
import type { CatalogFilter, Category, CategoryId } from "@/lib/types";

interface CategoryNavProps {
  /** Fires after any selection — the mobile sheet uses it to close itself. */
  onSelect?: () => void;
}

export function CategoryNav({ onSelect }: CategoryNavProps) {
  const { filter, setFilter } = useCatalog();
  const { navigate } = useNavigation();
  const { data: categories, isLoading } = useCategories();

  // Groups come from the data, not from a hardcoded tree: a category created
  // in the admin panel has to appear here without a code change.
  const groups = useMemo(() => {
    const byLabel = new Map<string, Category[]>();

    for (const category of categories ?? []) {
      const label = category.group?.trim() || UNGROUPED_LABEL;
      const bucket = byLabel.get(label);
      if (bucket) bucket.push(category);
      else byLabel.set(label, [category]);
    }

    // "Другое" last; everything else keeps the server's order.
    return [...byLabel.entries()].sort(([a], [b]) =>
      a === UNGROUPED_LABEL ? 1 : b === UNGROUPED_LABEL ? -1 : 0,
    );
  }, [categories]);

  const counts = new Map<CategoryId, number>(
    (categories ?? []).map((category) => [category.id, category.productCount]),
  );
  const totalCount = (categories ?? []).reduce(
    (sum, category) => sum + category.productCount,
    0,
  );

  const countFor = (target: CatalogFilter) =>
    target.kind === "category" ? counts.get(target.id) : target.kind === "all" ? totalCount : undefined;

  const choose = (next: CatalogFilter) => {
    setFilter(next);
    navigate("catalog");
    onSelect?.();
  };

  const entryClass = (target: CatalogFilter, extra?: string) =>
    cn(
      "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-left text-sm transition-colors",
      sameFilter(filter, target)
        ? "bg-accent font-medium text-accent-foreground"
        : cn("text-muted-foreground hover:bg-accent/60 hover:text-foreground", extra),
    );

  const renderCount = (target: CatalogFilter) => {
    if (isLoading) return <Skeleton className="h-3 w-5" />;

    const value = countFor(target);
    return value === undefined ? null : <span className="text-xs opacity-70">{value}</span>;
  };

  return (
    <nav aria-label="Категории каталога">
      <button
        type="button"
        onClick={() => choose({ kind: "all" })}
        className={entryClass({ kind: "all" })}
      >
        <span className="flex items-center gap-2">
          <LayoutGrid className="size-4" />
          Все товары
        </span>
        {renderCount({ kind: "all" })}
      </button>

      {SIDEBAR_SHORTCUTS.map((shortcut) => (
        <button
          key={shortcut.label}
          type="button"
          onClick={() => choose(shortcut.filter)}
          className={entryClass(shortcut.filter, shortcut.highlight ? "text-primary" : undefined)}
        >
          <span>{shortcut.label}</span>
        </button>
      ))}

      {isLoading ? (
        <div className="space-y-3 border-t p-4">
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-32" />
          ))}
        </div>
      ) : (
        <Accordion type="multiple" className="border-t">
          {groups.map(([label, children]) => (
            <AccordionItem key={label} value={label}>
              <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
                {label}
              </AccordionTrigger>
              <AccordionContent className="pb-1">
                {children.map((category) => {
                  const target: CatalogFilter = { kind: "category", id: category.id };

                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => choose(target)}
                      className={cn(entryClass(target), "pl-8")}
                    >
                      <span>{category.name}</span>
                      {renderCount(target)}
                    </button>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </nav>
  );
}
