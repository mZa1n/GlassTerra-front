import type { ReactNode } from "react";
import type { IconComponent } from "@/lib/icon";

interface EmptyStateProps {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-20 text-center">
      <Icon className="size-10 text-muted-foreground/40" />
      <h2 className="text-lg">{title}</h2>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
