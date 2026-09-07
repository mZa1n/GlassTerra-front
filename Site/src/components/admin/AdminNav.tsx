import { cn } from "@/components/ui/utils";
import type { IconComponent } from "@/lib/icon";

export interface AdminNavItem<T extends string> {
  id: T;
  label: string;
  icon: IconComponent;
  /** Rendered as a count pill; omitted while the underlying query loads. */
  badge?: number;
}

interface AdminNavProps<T extends string> {
  items: readonly AdminNavItem<T>[];
  active: T;
  onSelect: (id: T) => void;
}

/**
 * Section rail. A vertical list from md up, a horizontal scroller below —
 * tabs across the top ran out of room at six sections on a phone.
 */
export function AdminNav<T extends string>({ items, active, onSelect }: AdminNavProps<T>) {
  return (
    <nav
      aria-label="Разделы панели управления"
      className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 md:mx-0 md:w-56 md:shrink-0 md:flex-col md:overflow-visible md:px-0"
    >
      {items.map((item) => {
        const isActive = item.id === active;

        return (
          <button
            key={item.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm whitespace-nowrap transition-colors md:w-full",
              isActive
                ? "bg-primary/10 font-medium text-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <item.icon className={cn("size-4", isActive && "text-primary")} />
            {item.label}
            {item.badge !== undefined && (
              <span
                className={cn(
                  "ml-auto hidden rounded-full px-1.5 py-0.5 text-xs tabular-nums md:inline",
                  isActive ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground",
                )}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}
