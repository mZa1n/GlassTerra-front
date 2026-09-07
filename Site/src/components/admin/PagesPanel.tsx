import { useCallback, useEffect, useState } from "react";
import { FileText, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor } from "@/api";
import { AdminSection } from "@/components/admin/AdminSection";
import { Field } from "@/components/admin/fields";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/components/ui/utils";
import { useQuery, type QueryResult } from "@/hooks/useQuery";
import type { PageSummary } from "@/api";
import type { Page } from "@/lib/types";

interface Section {
  heading: string;
  body: string;
}

interface PagesPanelProps {
  pages: QueryResult<PageSummary[]>;
  onChanged: () => void;
}

/**
 * Text pages — delivery, contacts, about and the rest — edited in place.
 * The storefront reads the same content through `content.getPage`, so a save
 * is visible on the next visit without a deploy.
 */
export function PagesPanel({ pages, onChanged }: PagesPanelProps) {
  const rows = pages.data ?? [];
  const [slug, setSlug] = useState<Page | null>(null);

  const active = slug ?? rows[0]?.slug ?? null;

  return (
    <AdminSection
      title="Тексты страниц"
      description="Доставка, контакты, о компании и остальные разделы без товаров"
      icon={FileText}
    >
      <QueryState
        status={pages.status}
        error={pages.error}
        onRetry={pages.refetch}
        loading={<Skeleton className="h-72 w-full rounded-xl" />}
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="scrollbar-hide -mx-1 flex gap-1 overflow-x-auto px-1 lg:mx-0 lg:w-52 lg:shrink-0 lg:flex-col lg:px-0">
            {rows.map((page) => (
              <button
                key={page.slug}
                type="button"
                onClick={() => setSlug(page.slug)}
                aria-current={page.slug === active ? "true" : undefined}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-2 text-left text-sm whitespace-nowrap transition-colors lg:w-full",
                  page.slug === active
                    ? "bg-primary/10 font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {page.title}
              </button>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            {active ? <PageEditor slug={active} onSaved={onChanged} /> : null}
          </div>
        </div>
      </QueryState>
    </AdminSection>
  );
}

function PageEditor({ slug, onSaved }: { slug: Page; onSaved: () => void }) {
  const content = useQuery(
    `admin:page:${slug}`,
    useCallback((signal: AbortSignal) => api.content.getPage(slug, signal), [slug]),
  );

  const [title, setTitle] = useState("");
  const [intro, setIntro] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [saving, setSaving] = useState(false);

  // Loading another page must replace the form, not merge into it.
  useEffect(() => {
    setTitle(content.data?.title ?? "");
    setIntro(content.data?.intro ?? "");
    setSections((content.data?.sections ?? []).map((section) => ({ ...section })));
  }, [content.data, slug]);

  const save = async () => {
    setSaving(true);
    try {
      await api.admin.updatePage(slug, { title, intro, sections });
      toast.success("Страница сохранена");
      content.refetch();
      onSaved();
    } catch (error) {
      toast.error(messageFor(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <QueryState
      status={content.status}
      error={content.error}
      onRetry={content.refetch}
      loading={<Skeleton className="h-72 w-full rounded-xl" />}
    >
      <div className="animate-in fade-in space-y-4 rounded-xl border bg-card p-4 duration-300 md:p-6">
        <Field id="page-title" label="Заголовок">
          <Input id="page-title" value={title} onChange={(event) => setTitle(event.target.value)} />
        </Field>

        <Field id="page-intro" label="Вступление" hint="Первый абзац под заголовком.">
          <Textarea
            id="page-intro"
            rows={3}
            value={intro}
            onChange={(event) => setIntro(event.target.value)}
          />
        </Field>

        <div className="space-y-3">
          <p className="text-sm text-foreground">Блоки</p>

          {sections.map((section, index) => (
            <div key={index} className="space-y-2 rounded-lg border p-3">
              <div className="flex gap-2">
                <Input
                  aria-label={`Заголовок блока ${index + 1}`}
                  placeholder="Заголовок блока"
                  value={section.heading}
                  onChange={(event) =>
                    setSections((rows) =>
                      rows.map((row, position) =>
                        position === index ? { ...row, heading: event.target.value } : row,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Удалить блок ${index + 1}`}
                  onClick={() =>
                    setSections((rows) => rows.filter((_, position) => position !== index))
                  }
                >
                  <X className="size-4" />
                </Button>
              </div>
              <Textarea
                aria-label={`Текст блока ${index + 1}`}
                rows={3}
                placeholder="Текст блока"
                value={section.body}
                onChange={(event) =>
                  setSections((rows) =>
                    rows.map((row, position) =>
                      position === index ? { ...row, body: event.target.value } : row,
                    ),
                  )
                }
              />
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setSections((rows) => [...rows, { heading: "", body: "" }])}
          >
            <Plus className="size-4" />
            Добавить блок
          </Button>
        </div>

        <Button type="button" onClick={save} disabled={saving}>
          <Save className="size-4" />
          {saving ? "Сохраняем…" : "Сохранить страницу"}
        </Button>
      </div>
    </QueryState>
  );
}
