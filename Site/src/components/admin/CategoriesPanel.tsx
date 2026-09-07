import { useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Tags, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor } from "@/api";
import { AdminPanel, AdminSection } from "@/components/admin/AdminSection";
import { Field } from "@/components/admin/fields";
import { QueryState } from "@/components/QueryState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UNGROUPED_LABEL } from "@/data/navigation";
import { slugify } from "@/lib/slug";
import type { Category } from "@/lib/types";
import type { QueryResult } from "@/hooks/useQuery";

interface CategoriesPanelProps {
  categories: QueryResult<Category[]>;
  onChanged: () => void;
}

interface DraftCategory {
  name: string;
  id: string;
  group: string;
  image: string;
}

const EMPTY_DRAFT: DraftCategory = { name: "", id: "", group: "", image: "" };

export function CategoriesPanel({ categories, onChanged }: CategoriesPanelProps) {
  const rows = useMemo(() => categories.data ?? [], [categories.data]);

  const [draft, setDraft] = useState<DraftCategory>(EMPTY_DRAFT);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [removing, setRemoving] = useState<Category | null>(null);

  const set = <K extends keyof DraftCategory>(key: K, value: DraftCategory[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const create = async () => {
    const id = draft.id.trim() || slugify(draft.name);

    if (!draft.name.trim() || !id) {
      toast.error("Укажите название категории");
      return;
    }

    setCreating(true);
    try {
      await api.admin.createCategory({
        id,
        name: draft.name.trim(),
        image: draft.image.trim(),
        group: draft.group.trim(),
      });
      toast.success("Категория создана");
      setDraft(EMPTY_DRAFT);
      onChanged();
    } catch (error) {
      toast.error(messageFor(error));
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminSection
      title="Категории"
      description="Разделы каталога и их группировка в боковом меню"
      icon={Tags}
    >
      <Card>
        <CardContent className="space-y-4 p-4 md:p-6">
          <h2 className="text-foreground">Новая категория</h2>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field id="category-name" label="Название">
              <Input
                id="category-name"
                value={draft.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="Бокалы для вина"
              />
            </Field>

            <Field
              id="category-id"
              label="Слаг"
              hint={`Пусто — «${slugify(draft.name) || "…"}». Потом не меняется.`}
            >
              <Input
                id="category-id"
                value={draft.id}
                onChange={(event) => set("id", event.target.value)}
                placeholder={slugify(draft.name)}
              />
            </Field>

            <Field id="category-group" label="Группа в меню" hint={`Пусто — «${UNGROUPED_LABEL}».`}>
              <Input
                id="category-group"
                list="category-groups"
                value={draft.group}
                onChange={(event) => set("group", event.target.value)}
                placeholder="Посуда из стекла"
              />
              <datalist id="category-groups">
                {[...new Set(rows.map((row) => row.group).filter(Boolean))].map((group) => (
                  <option key={group} value={group} />
                ))}
              </datalist>
            </Field>

            <Field id="category-image" label="Обложка (URL)">
              <Input
                id="category-image"
                value={draft.image}
                onChange={(event) => set("image", event.target.value)}
              />
            </Field>
          </div>

          <Button type="button" onClick={create} disabled={creating}>
            <Plus className="size-4" />
            {creating ? "Создаём…" : "Создать категорию"}
          </Button>
        </CardContent>
      </Card>

      <QueryState
        status={categories.status}
        error={categories.error}
        onRetry={categories.refetch}
        loading={<Skeleton className="h-64 w-full rounded-xl" />}
      >
        <AdminPanel className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Категория</TableHead>
                <TableHead>Группа</TableHead>
                <TableHead className="text-right">Товаров</TableHead>
                <TableHead className="w-24 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <p className="text-foreground">{category.name}</p>
                    <p className="text-xs text-muted-foreground">{category.id}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {category.group || UNGROUPED_LABEL}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{category.productCount}</TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Изменить ${category.name}`}
                      onClick={() => setEditing(category)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Удалить ${category.name}`}
                      className="text-destructive"
                      onClick={() => setRemoving(category)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AdminPanel>
      </QueryState>

      <EditCategoryDialog
        category={editing}
        onClose={() => setEditing(null)}
        onSaved={onChanged}
      />

      <DeleteCategoryDialog
        category={removing}
        categories={rows}
        onClose={() => setRemoving(null)}
        onDeleted={onChanged}
      />
    </AdminSection>
  );
}

function EditCategoryDialog({
  category,
  onClose,
  onSaved,
}: {
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState("");
  const [group, setGroup] = useState("");
  const [image, setImage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!category) return;
    setName(category.name);
    setGroup(category.group ?? "");
    setImage(category.image);
  }, [category]);

  const save = async () => {
    if (!category) return;

    setSaving(true);
    try {
      await api.admin.updateCategory(category.id, { name, group, image });
      toast.success("Категория обновлена");
      onClose();
      onSaved();
    } catch (error) {
      toast.error(messageFor(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Категория «{category?.name}»</DialogTitle>
          <DialogDescription>
            Слаг «{category?.id}» не меняется — на нём построены ссылки и фильтры каталога.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field id="edit-category-name" label="Название">
            <Input
              id="edit-category-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </Field>
          <Field id="edit-category-group" label="Группа в меню" hint={`Пусто — «${UNGROUPED_LABEL}».`}>
            <Input
              id="edit-category-group"
              value={group}
              onChange={(event) => setGroup(event.target.value)}
            />
          </Field>
          <Field id="edit-category-image" label="Обложка (URL)">
            <Input
              id="edit-category-image"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            <X className="size-4" />
            Отмена
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            <Check className="size-4" />
            {saving ? "Сохраняем…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteCategoryDialog({
  category,
  categories,
  onClose,
  onDeleted,
}: {
  category: Category | null;
  categories: readonly Category[];
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [moveTo, setMoveTo] = useState("");
  const [deleting, setDeleting] = useState(false);

  const targets = categories.filter((candidate) => candidate.id !== category?.id);
  const needsMove = (category?.productCount ?? 0) > 0;

  useEffect(() => setMoveTo(""), [category]);

  const remove = async () => {
    if (!category) return;

    if (needsMove && !moveTo) {
      toast.error("Выберите категорию для переноса товаров");
      return;
    }

    setDeleting(true);
    try {
      await api.admin.deleteCategory(category.id, moveTo || undefined);
      toast.success("Категория удалена");
      onClose();
      onDeleted();
    } catch (error) {
      toast.error(messageFor(error));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={category !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Удалить «{category?.name}»?</DialogTitle>
          <DialogDescription>
            {needsMove
              ? `В категории ${category?.productCount} товаров. Они не удаляются — выберите, куда их перенести.`
              : "Категория пуста, удаление ничего не затронет."}
          </DialogDescription>
        </DialogHeader>

        {needsMove && (
          <Field id="move-to" label="Перенести товары в">
            <Select value={moveTo} onValueChange={setMoveTo}>
              <SelectTrigger id="move-to" className="w-full">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                {targets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" variant="destructive" onClick={remove} disabled={deleting}>
            {deleting ? "Удаляем…" : "Удалить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
