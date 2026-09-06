import type { ReactNode } from "react";
import type { IconComponent } from "@/lib/icon";
import { Card, CardContent } from "@/components/ui/card";

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: IconComponent;
  actions?: ReactNode;
}

export function PageHeader({ title, description, icon: Icon, actions }: PageHeaderProps) {
  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 px-4 py-5 md:px-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="size-6 text-primary" />}
            <h1 className="text-xl text-foreground md:text-2xl">{title}</h1>
          </div>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {actions}
      </CardContent>
    </Card>
  );
}
