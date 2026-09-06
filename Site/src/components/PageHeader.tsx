import type { ReactNode } from "react";
import type { IconComponent } from "@/lib/icon";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: IconComponent;
  actions?: ReactNode;
}

/**
 * Page title block. Deliberately not a card — stacking a bordered box around
 * every heading made each screen read as a form rather than a shop.
 */
export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b pb-4">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className="size-5 text-muted-foreground" />}
          <h1 className="text-2xl md:text-3xl">{title}</h1>
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions}
    </div>
  );
}
