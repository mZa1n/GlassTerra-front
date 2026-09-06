import type { ReactNode } from "react";
import type { IconComponent } from "@/lib/icon";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  icon: IconComponent;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <Icon className="size-14 text-muted-foreground/40" />
        <h3 className="text-lg text-foreground">{title}</h3>
        {description && <p className="max-w-md text-sm text-muted-foreground">{description}</p>}
        {action && <div className="pt-2">{action}</div>}
      </CardContent>
    </Card>
  );
}
