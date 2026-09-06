import type { ReactNode } from "react";
import { RotateCcw, WifiOff } from "lucide-react";
import { messageFor } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { QueryStatus } from "@/hooks/useQuery";

interface QueryStateProps {
  status: QueryStatus;
  error: unknown;
  onRetry: () => void;
  loading: ReactNode;
  children: ReactNode;
}

/**
 * Renders the three outcomes of a query in one place, so every screen shows
 * the same skeleton and the same retry affordance.
 */
export function QueryState({ status, error, onRetry, loading, children }: QueryStateProps) {
  if (status === "loading") return <>{loading}</>;

  if (status === "error") {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <WifiOff className="size-12 text-muted-foreground/40" />
          <h2 className="text-lg text-foreground">Не удалось загрузить данные</h2>
          <p className="max-w-md text-sm text-muted-foreground">{messageFor(error)}</p>
          <Button type="button" variant="secondary" className="mt-2" onClick={onRetry}>
            <RotateCcw className="size-4" />
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}
