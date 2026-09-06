import { MessageSquare } from "lucide-react";
import { QueryState } from "@/components/QueryState";
import { Rating } from "@/components/Rating";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviews } from "@/hooks/catalog";
import { plural } from "@/lib/format";
import type { Product } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" });

export function ProductReviews({ product }: { product: Product }) {
  const query = useReviews(product.id);
  const reviews = query.data ?? [];

  return (
    <section className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-base">Отзывы</h3>
        <span className="text-sm text-muted-foreground">
          {product.reviews}{" "}
          {plural(product.reviews, { one: "отзыв", few: "отзыва", many: "отзывов" })}
        </span>
      </div>

      <QueryState
        status={query.status}
        error={query.error}
        onRetry={query.refetch}
        loading={
          <div className="space-y-4">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ))}
          </div>
        }
      >
        {reviews.length === 0 ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MessageSquare className="size-4" />
            Отзывов пока нет — станьте первым.
          </p>
        ) : (
          <>
            <ul className="space-y-5">
              {reviews.map((review) => (
                <li key={review.id} className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-medium">{review.author}</span>
                    <Rating value={review.rating} />
                    <time
                      dateTime={review.createdAt}
                      className="text-xs text-muted-foreground"
                    >
                      {dateFormatter.format(new Date(review.createdAt))}
                    </time>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{review.text}</p>
                </li>
              ))}
            </ul>

            {product.reviews > reviews.length && (
              <p className="text-xs text-muted-foreground">
                Показаны {reviews.length} из {product.reviews}.
              </p>
            )}
          </>
        )}
      </QueryState>
    </section>
  );
}
