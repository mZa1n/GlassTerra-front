import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, Megaphone, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor, type ArticleInput } from "@/api";
import { AdminPanel, AdminSection } from "@/components/admin/AdminSection";
import { Field, Toggle } from "@/components/admin/fields";
import { QueryState } from "@/components/QueryState";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@/hooks/useMutation";
import type { QueryResult } from "@/hooks/useQuery";
import { parseCta } from "@/lib/cta";
import type { Article, ArticleKind, Category } from "@/lib/types";

interface ArticlesPanelProps {
  articles: QueryResult<Article[]>;
  categories: readonly Category[];
  onChanged: () => void;
}

const KIND_LABELS: Record<ArticleKind, string> = {
  promo: "Баннер",
  note: "Заметка",
};

export function ArticlesPanel({ articles, categories, onChanged }: ArticlesPanelProps) {
  const [editing, setEditing] = useState<Article | undefined>(undefined);
  const [open, setOpen] = useState(false);

  const rows = articles.data ?? [];

  const remove = async (article: Article) => {
    try {
      await api.admin.deleteArticle(article.id);
      toast.success("Материал удалён");
      onChanged();
    } catch (error) {
      toast.error(messageFor(error));
    }
  };

  const togglePublished = async (article: Article) => {
    try {
      await api.admin.updateArticle(article.id, { published: !article.published });
      toast.success(article.published ? "Снято с публикации" : "Опубликовано");
      onChanged();
    } catch (error) {
      toast.error(messageFor(error));
    }
  };

  return (
    <AdminSection
      title="Новости и акции"
      description="Баннеры и заметки на странице «Новости». Ровно один баннер может быть главным."
      icon={Megaphone}
      actions={
        <Button
          type="button"
          onClick={() => {
            setEditing(undefined);
            setOpen(true);
          }}
        >
          <Plus className="size-4" />
          Добавить материал
        </Button>
      }
    >
      <QueryState
        status={articles.status}
        error={articles.error}
        onRetry={articles.refetch}
        loading={<Skeleton className="h-64 w-full rounded-xl" />}
      >
        <div className="grid gap-3 md:grid-cols-2">
          {rows.map((article, index) => (
            <article
              key={article.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both flex gap-4 rounded-xl border bg-card p-3 duration-300"
            >
              {article.kind === "promo" && (
                <ImageWithFallback
                  src={article.image}
                  alt=""
                  className="size-20 shrink-0 rounded-lg object-cover"
                />
              )}

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge variant="secondary">{KIND_LABELS[article.kind]}</Badge>
                  {article.featured && (
                    <Badge>
                      <Star className="size-3" />
                      Главный
                    </Badge>
                  )}
                  {!article.published && <Badge variant="outline">Черновик</Badge>}
                </div>

                <p className="truncate text-foreground">{article.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{article.text}</p>

                <div className="flex flex-wrap gap-1 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing(article);
                      setOpen(true);
                    }}
                  >
                    <Pencil className="size-4" />
                    Изменить
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => togglePublished(article)}
                  >
                    {article.published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    {article.published ? "Скрыть" : "Опубликовать"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => remove(article)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {rows.length === 0 && (
          <AdminPanel>
            <p className="p-6 text-center text-sm text-muted-foreground">
              Материалов пока нет — страница «Новости» покажет только подборку новинок.
            </p>
          </AdminPanel>
        )}
      </QueryState>

      <ArticleDialog
        open={open}
        onOpenChange={setOpen}
        {...(editing ? { article: editing } : {})}
        categories={categories}
        nextOrder={rows.length}
        onSaved={onChanged}
      />
    </AdminSection>
  );
}

interface ArticleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  article?: Article;
  categories: readonly Category[];
  nextOrder: number;
  onSaved: () => void;
}

const blankArticle = (sortOrder: number): ArticleInput => ({
  kind: "promo",
  eyebrow: "",
  title: "",
  text: "",
  image: "",
  ctaLabel: "",
  ctaTarget: "",
  featured: false,
  published: false,
  sortOrder,
});

function ArticleDialog({
  open,
  onOpenChange,
  article,
  categories,
  nextOrder,
  onSaved,
}: ArticleDialogProps) {
  const [values, setValues] = useState<ArticleInput>(() => blankArticle(nextOrder));

  useEffect(() => {
    if (!open) return;
    const { id: _id, ...rest } = article ?? { id: "", ...blankArticle(nextOrder) };
    setValues(rest);
  }, [open, article, nextOrder]);

  const save = useMutation(
    useCallback(
      (input: ArticleInput, signal: AbortSignal) =>
        article
          ? api.admin.updateArticle(article.id, input, signal)
          : api.admin.createArticle(input, signal),
      [article],
    ),
  );

  const set = <K extends keyof ArticleInput>(key: K, value: ArticleInput[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!values.title.trim()) {
      toast.error("Укажите заголовок");
      return;
    }
    if (values.kind === "promo" && !values.image.trim()) {
      toast.error("Баннеру нужна фотография");
      return;
    }

    try {
      await save.mutate(values);
      toast.success(article ? "Материал обновлён" : "Материал добавлен");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(messageFor(error));
    }
  };

  // Radix rejects an empty option value, so "none" stands in for "no link".
  const ctaOptions = [
    { value: "none", label: "Без кнопки" },
    { value: "filter:new", label: "Каталог · новинки" },
    { value: "filter:sale", label: "Каталог · со скидкой" },
    { value: "filter:all", label: "Каталог · все товары" },
    ...categories.map((category) => ({
      value: `filter:category:${category.id}`,
      label: `Категория · ${category.name}`,
    })),
    { value: "page:new-arrivals", label: "Страница · Новинки" },
    { value: "page:delivery", label: "Страница · Доставка" },
    { value: "page:about", label: "Страница · О компании" },
    { value: "page:contacts", label: "Страница · Контакты" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{article ? "Редактирование материала" : "Новый материал"}</DialogTitle>
          <DialogDescription>
            Баннер — фотография с текстом поверх. Заметка — короткий блок со ссылкой внизу страницы.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="article-kind" label="Тип">
              <Select
                value={values.kind}
                onValueChange={(value) => set("kind", value as ArticleKind)}
              >
                <SelectTrigger id="article-kind" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="promo">Баннер</SelectItem>
                  <SelectItem value="note">Заметка</SelectItem>
                </SelectContent>
              </Select>
            </Field>

            <Field id="article-eyebrow" label="Надзаголовок" hint="Например: «Акция · до 40%»">
              <Input
                id="article-eyebrow"
                value={values.eyebrow}
                onChange={(event) => set("eyebrow", event.target.value)}
              />
            </Field>

            <Field id="article-title" label="Заголовок" className="sm:col-span-2">
              <Input
                id="article-title"
                value={values.title}
                onChange={(event) => set("title", event.target.value)}
              />
            </Field>

            <Field id="article-text" label="Текст" className="sm:col-span-2">
              <Textarea
                id="article-text"
                rows={3}
                value={values.text}
                onChange={(event) => set("text", event.target.value)}
              />
            </Field>

            {values.kind === "promo" && (
              <Field
                id="article-image"
                label="Фотография (URL)"
                className="sm:col-span-2"
                hint="Баннер строится вокруг снимка: без него блок пустой."
              >
                <Input
                  id="article-image"
                  value={values.image}
                  onChange={(event) => set("image", event.target.value)}
                />
              </Field>
            )}

            <Field id="article-cta-label" label="Текст кнопки">
              <Input
                id="article-cta-label"
                value={values.ctaLabel}
                onChange={(event) => set("ctaLabel", event.target.value)}
              />
            </Field>

            <Field
              id="article-cta-target"
              label="Куда ведёт"
              error={
                values.ctaLabel && !parseCta(values.ctaTarget)
                  ? "Кнопка без адреса не отображается"
                  : ""
              }
            >
              <Select
                value={values.ctaTarget || "none"}
                onValueChange={(value) => set("ctaTarget", value === "none" ? "" : value)}
              >
                <SelectTrigger id="article-cta-target" className="w-full">
                  <SelectValue placeholder="Без кнопки" />
                </SelectTrigger>
                <SelectContent>
                  {ctaOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="article-order" label="Порядок" hint="Меньше — выше на странице.">
              <Input
                id="article-order"
                inputMode="numeric"
                value={String(values.sortOrder)}
                onChange={(event) => set("sortOrder", Number(event.target.value) || 0)}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3">
            <Toggle
              label="Опубликовано"
              pressed={values.published}
              onChange={(pressed) => set("published", pressed)}
            />
            {values.kind === "promo" && (
              <Toggle
                label="Главный баннер"
                pressed={values.featured}
                onChange={(pressed) => set("featured", pressed)}
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
