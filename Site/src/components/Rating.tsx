import { Star } from "lucide-react";
import { cn } from "@/components/ui/utils";

interface RatingProps {
  value: number;
  reviews?: number;
  className?: string;
}

export function Rating({ value, reviews, className }: RatingProps) {
  const filled = Math.floor(value);

  return (
    <div className={cn("flex items-center gap-1", className)} aria-label={`Рейтинг ${value} из 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "size-4",
            index < filled ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600",
          )}
        />
      ))}
      <span className="ml-1 text-sm text-muted-foreground">
        {value.toFixed(1)}
        {reviews !== undefined && ` · ${reviews}`}
      </span>
    </div>
  );
}
