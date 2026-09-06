import { ArrowRight } from "lucide-react";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { plural } from "@/lib/format";
import type { Category, CategoryId } from "@/lib/types";

const GRID = "grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-3";

interface CategoryTilesProps {
  categories: readonly Category[];
  onSelect: (id: CategoryId) => void;
}

export function CategoryTiles({ categories, onSelect }: CategoryTilesProps) {
  return (
    <div className={GRID}>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          className="group overflow-hidden rounded-lg border bg-secondary text-left transition-all duration-300 hover:border-primary/40 hover:shadow-lg"
        >
          <div className="relative aspect-4/3 overflow-hidden bg-background">
            <ImageWithFallback
              src={category.image}
              alt=""
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="p-3 md:p-4">
            <h3 className="text-foreground transition-colors group-hover:text-primary">
              {category.name}
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              {category.productCount}{" "}
              {plural(category.productCount, { one: "товар", few: "товара", many: "товаров" })}
            </p>
            <span className="flex items-center gap-2 text-sm text-primary transition-all group-hover:gap-3">
              Смотреть товары
              <ArrowRight className="size-4" />
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function CategoryTilesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-lg border">
          <Skeleton className="aspect-4/3 w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}
