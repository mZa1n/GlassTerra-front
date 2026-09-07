import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";
import type { IconComponent } from "@/lib/icon";

interface AdminSectionProps {
  title: string;
  description?: string;
  icon?: IconComponent;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** One screen of the back office: heading row, then content. */
export function AdminSection({
  title,
  description,
  icon: Icon,
  actions,
  className,
  children,
}: AdminSectionProps) {
  return (
    <section
      className={cn(
        "animate-in fade-in slide-in-from-bottom-2 space-y-5 duration-300",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" />
            </span>
          )}
          <div className="space-y-1">
            <h2 className="text-lg text-foreground md:text-xl">{title}</h2>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>

      {children}
    </section>
  );
}

/** Bordered container used for the tables, so every list looks the same. */
export function AdminPanel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-xl border bg-card", className)}>{children}</div>
  );
}
