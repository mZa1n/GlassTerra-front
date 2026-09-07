import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor, type ProductInput } from "@/api";
import { Field, Toggle } from "@/components/admin/fields";
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
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@/hooks/useMutation";
import { slugify } from "@/lib/slug";
import type { Category, Product } from "@/lib/types";

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Absent means "create". */
  product?: Product;
  categories: readonly Category[];
  onSaved: () => void;
}

interface FormValues {
  name: string;
  slug: string;
  category: string;
  price: string;
  oldPrice: string;
  description: string;
  image: string;
  inStock: boolean;
  isNew: boolean;
}

type SpecRow = { key: string; value: string };

const blank = (categoryId: string): FormValues => ({
  name: "",
  slug: "",
  category: categoryId,
  price: "",
  oldPrice: "",
  description: "",
  image: "",
  inStock: true,
  isNew: true,
});

const fromProduct = (product: Product): FormValues => ({
  name: product.name,
  slug: product.slug,
  category: product.category,
  price: String(product.price),
  oldPrice: product.oldPrice ? String(product.oldPrice) : "",
  description: product.description,
  image: product.image,
  inStock: product.inStock,
  isNew: product.isNew === true,
});

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  categories,
  onSaved,
}: ProductFormDialogProps) {
  const firstCategory = categories[0]?.id ?? "";
  const [values, setValues] = useState<FormValues>(() =>
    product ? fromProduct(product) : blank(firstCategory),
  );
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  // Reopening the dialog for a different row must not show the previous one.
  useEffect(() => {
    if (!open) return;

    setValues(product ? fromProduct(product) : blank(firstCategory));
    setSpecs(Object.entries(product?.specs ?? {}).map(([key, value]) => ({ key, value })));
    setErrors({});
  }, [open, product, firstCategory]);

  const save = useMutation(
    useCallback(
      (input: ProductInput, signal: AbortSignal) =>
        product
          ? api.admin.updateProduct(product.id, input, signal)
          : api.admin.createProduct(input, signal),
      [product],
    ),
  );

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const suggestedSlug = useMemo(() => slugify(values.name), [values.name]);

  const validate = (): boolean => {
    const next: Partial<Record<keyof FormValues, string>> = {};
    const price = Number(values.price);
    const oldPrice = values.oldPrice ? Number(values.oldPrice) : 0;

    if (!values.name.trim()) next.name = "Укажите название";
    if (!values.slug.trim() && !suggestedSlug) next.slug = "Укажите слаг";
    if (!values.category) next.category = "Выберите категорию";
    if (!Number.isFinite(price) || price <= 0) next.price = "Цена — положительное число";
    if (values.oldPrice && (!Number.isFinite(oldPrice) || oldPrice <= price)) {
      next.oldPrice = "Старая цена должна быть больше текущей";
    }
    if (!values.image.trim()) next.image = "Нужна ссылка на фотографию";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const input: ProductInput = {
      slug: values.slug.trim() || suggestedSlug,
      name: values.name.trim(),
      price: Number(values.price),
      // The key is always present so clearing the field removes the discount.
      oldPrice: values.oldPrice ? Number(values.oldPrice) : undefined,
      category: values.category,
      description: values.description.trim(),
      image: values.image.trim(),
      inStock: values.inStock,
      isNew: values.isNew,
      specs: Object.fromEntries(
        specs
          .filter((row) => row.key.trim() && row.value.trim())
          .map((row) => [row.key.trim(), row.value.trim()]),
      ),
    };

    try {
      await save.mutate(input);
      toast.success(product ? "Товар обновлён" : "Товар добавлен");
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast.error(messageFor(error));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Редактирование товара" : "Новый товар"}</DialogTitle>
          <DialogDescription>
            {product
              ? `ID ${product.id} · рейтинг и отзывы считает каталог, здесь их не меняют.`
              : "Заполните карточку — товар появится в каталоге сразу после сохранения."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="admin-name" label="Название" error={errors.name} className="sm:col-span-2">
              <Input
                id="admin-name"
                value={values.name}
                onChange={(event) => set("name", event.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
            </Field>

            <Field
              id="admin-slug"
              label="Слаг"
              hint={
                product
                  ? "Меняйте осторожно: по нему строятся ссылки."
                  : `Оставьте пустым — будет «${suggestedSlug || "…"}».`
              }
              error={errors.slug}
            >
              <Input
                id="admin-slug"
                value={values.slug}
                onChange={(event) => set("slug", event.target.value)}
                placeholder={suggestedSlug}
                aria-invalid={Boolean(errors.slug)}
              />
            </Field>

            <Field id="admin-category" label="Категория" error={errors.category}>
              <Select value={values.category} onValueChange={(value) => set("category", value)}>
                <SelectTrigger id="admin-category" className="w-full">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field id="admin-price" label="Цена, ₽" error={errors.price}>
              <Input
                id="admin-price"
                inputMode="numeric"
                value={values.price}
                onChange={(event) => set("price", event.target.value)}
                aria-invalid={Boolean(errors.price)}
              />
            </Field>

            <Field
              id="admin-old-price"
              label="Старая цена, ₽"
              hint="Пусто — товар без скидки."
              error={errors.oldPrice}
            >
              <Input
                id="admin-old-price"
                inputMode="numeric"
                value={values.oldPrice}
                onChange={(event) => set("oldPrice", event.target.value)}
                aria-invalid={Boolean(errors.oldPrice)}
              />
            </Field>

            <Field
              id="admin-image"
              label="Фотография (URL)"
              hint="Загрузка файлов появится вместе с хранилищем изображений."
              error={errors.image}
              className="sm:col-span-2"
            >
              <Input
                id="admin-image"
                value={values.image}
                onChange={(event) => set("image", event.target.value)}
                aria-invalid={Boolean(errors.image)}
              />
            </Field>

            <Field id="admin-description" label="Описание" className="sm:col-span-2">
              <Textarea
                id="admin-description"
                rows={3}
                value={values.description}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-3">
            <Toggle
              label="В наличии"
              pressed={values.inStock}
              onChange={(pressed) => set("inStock", pressed)}
            />
            <Toggle
              label="Новинка"
              pressed={values.isNew}
              onChange={(pressed) => set("isNew", pressed)}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-foreground">Характеристики</p>
            {specs.map((row, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  aria-label={`Характеристика ${index + 1}`}
                  placeholder="Объём"
                  value={row.key}
                  onChange={(event) =>
                    setSpecs((rows) =>
                      rows.map((item, position) =>
                        position === index ? { ...item, key: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Input
                  aria-label={`Значение ${index + 1}`}
                  placeholder="250 мл"
                  value={row.value}
                  onChange={(event) =>
                    setSpecs((rows) =>
                      rows.map((item, position) =>
                        position === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Удалить характеристику"
                  onClick={() => setSpecs((rows) => rows.filter((_, position) => position !== index))}
                >
                  <X className="size-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setSpecs((rows) => [...rows, { key: "", value: "" }])}
            >
              <Plus className="size-4" />
              Добавить строку
            </Button>
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
