import { useCallback } from "react";
import { api } from "@/api";
import { QueryState } from "@/components/QueryState";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@/hooks/useQuery";
import type { Page } from "@/lib/types";

/** Text-only pages. Copy comes from the content service, not from components. */
export function StaticPage({ page }: { page: Page }) {
  const query = useQuery(
    `page:${page}`,
    useCallback((signal: AbortSignal) => api.content.getPage(page, signal), [page]),
  );

  return (
    <QueryState
      status={query.status}
      error={query.error}
      onRetry={query.refetch}
      loading={
        <div className="space-y-4 md:space-y-6">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      }
    >
      {!query.data ? (
        <Card>
          <CardContent className="p-6 md:p-8">
            <h1 className="mb-2 text-xl text-foreground">Страница не найдена</h1>
            <p className="text-muted-foreground">Похоже, такого раздела ещё нет.</p>
          </CardContent>
        </Card>
      ) : (
        <article className="space-y-4 md:space-y-6">
          <Card>
            <CardContent className="space-y-3 p-4 md:p-8">
              <h1 className="text-2xl text-foreground">{query.data.title}</h1>
              <p className="leading-relaxed text-muted-foreground">{query.data.intro}</p>
            </CardContent>
          </Card>

          {query.data.sections && (
            <div className="grid gap-4 md:grid-cols-2">
              {query.data.sections.map((section) => (
                <Card key={section.heading}>
                  <CardContent className="space-y-2 p-4 md:p-6">
                    <h2 className="text-foreground">{section.heading}</h2>
                    <p className="text-sm leading-relaxed text-muted-foreground">{section.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </article>
      )}
    </QueryState>
  );
}
