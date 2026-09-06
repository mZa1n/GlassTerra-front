import { Component, type ErrorInfo, type ReactNode } from "react";
import { RotateCcw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  /** Remounting key — pass the current route so a failed screen recovers on navigation. */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes so one broken screen does not blank the whole
 * storefront. Network failures are handled by the query hooks, not here.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Replace with the real reporter once one is wired up.
    console.error("Unhandled render error", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <TriangleAlert className="size-12 text-destructive" />
          <h2 className="text-lg text-foreground">Что-то пошло не так</h2>
          <p className="max-w-md text-sm text-muted-foreground">
            Страница не смогла отобразиться. Попробуйте обновить — остальной сайт работает.
          </p>
          <Button
            type="button"
            variant="secondary"
            onClick={() => this.setState({ error: null })}
            className="mt-2"
          >
            <RotateCcw className="size-4" />
            Повторить
          </Button>
        </CardContent>
      </Card>
    );
  }
}
