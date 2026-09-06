import type { ReactNode } from "react";
import { RotateCcw, WifiOff } from "lucide-react";
import { messageFor } from "@/api";
import { Button } from "@/components/ui/button";
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
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-20 text-center">
        <WifiOff className="size-10 text-muted-foreground/40" />
        <h2 className="text-lg">Не удалось загрузить данные</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{messageFor(error)}</p>
        <Button type="button" variant="secondary" className="mt-2" onClick={onRetry}>
          <RotateCcw className="size-4" />
          Повторить
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
