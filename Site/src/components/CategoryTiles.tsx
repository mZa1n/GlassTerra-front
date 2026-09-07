import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Skeleton } from "@/components/ui/skeleton";
import { plural } from "@/lib/format";
import type { Category, CategoryId } from "@/lib/types";

const GRID = "grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 xl:grid-cols-4";

interface CategoryTilesProps {
  categories: readonly Category[];
  onSelect: (id: CategoryId) => void;
}

export function CategoryTiles({ categories, onSelect }: CategoryTilesProps) {
  return (
    <div className={GRID}>
      {categories.map((category, index) => (
        <button
          key={category.id}
          type="button"
          onClick={() => onSelect(category.id)}
          style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
          className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both group text-left duration-500"
        >
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted transition-shadow duration-300 group-hover:shadow-lg">
            <ImageWithFallback
              src={category.image}
              alt=""
              className="size-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          </div>
          <h3 className="mt-3 text-[0.9375rem] font-medium transition-colors group-hover:text-primary">
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground">
            {category.productCount}{" "}
            {plural(category.productCount, { one: "товар", few: "товара", many: "товаров" })}
          </p>
        </button>
      ))}
    </div>
  );
}

export function CategoryTilesSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-lg" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
