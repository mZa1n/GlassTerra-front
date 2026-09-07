import { ProductCard } from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Product } from "@/lib/types";

const GRID = "grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3 md:gap-x-6 xl:grid-cols-4";

interface ProductGridProps {
  products: readonly Product[];
  /** Search query to highlight inside each card. */
  highlight?: string;
}

export function ProductGrid({ products, highlight }: ProductGridProps) {
  return (
    <div className={GRID}>
      {products.map((product, index) => (
        <div
          key={product.id}
          // Capped: past the first screenful the delay only makes the grid feel slow.
          style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
          className="animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500"
        >
          <ProductCard product={product} highlight={highlight} />
        </div>
      ))}
    </div>
  );
}

/** Placeholder with the same footprint as the real grid, so nothing jumps. */
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={GRID} aria-hidden>
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton className="aspect-[4/5] w-full rounded-lg" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}
