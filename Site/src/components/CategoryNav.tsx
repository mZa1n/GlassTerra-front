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
import { SIDEBAR_GROUPS, SIDEBAR_SHORTCUTS, sameFilter } from "@/data/navigation";
import type { CatalogFilter, CategoryId } from "@/lib/types";

interface CategoryNavProps {
  /** Fires after any selection — the mobile sheet uses it to close itself. */
  onSelect?: () => void;
}

export function CategoryNav({ onSelect }: CategoryNavProps) {
  const { filter, setFilter } = useCatalog();
  const { navigate } = useNavigation();
  const { data: categories, isLoading } = useCategories();

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
        ? "bg-primary text-primary-foreground"
        : cn("text-foreground hover:bg-accent", extra),
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

      <Accordion type="multiple" className="border-t">
        {SIDEBAR_GROUPS.map((group) => (
          <AccordionItem key={group.label} value={group.label}>
            <AccordionTrigger className="px-4 py-3 text-sm hover:no-underline">
              {group.label}
            </AccordionTrigger>
            <AccordionContent className="pb-1">
              {group.children.map((leaf) => (
                <button
                  key={leaf.label}
                  type="button"
                  onClick={() => choose(leaf.filter)}
                  className={cn(entryClass(leaf.filter), "pl-8")}
                >
                  <span>{leaf.label}</span>
                  {renderCount(leaf.filter)}
                </button>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </nav>
  );
}
