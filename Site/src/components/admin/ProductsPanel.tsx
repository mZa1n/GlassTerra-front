import { useMemo, useState } from "react";
import { Boxes, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor } from "@/api";
import { AdminPanel, AdminSection } from "@/components/admin/AdminSection";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { QueryState } from "@/components/QueryState";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/format";
import { searchProducts } from "@/lib/catalog";
import type { Category, Product } from "@/lib/types";
import type { QueryResult } from "@/hooks/useQuery";
import type { Paginated } from "@/lib/types";

interface ProductsPanelProps {
  products: QueryResult<Paginated<Product>>;
  categories: readonly Category[];
  /** Reloads both lists: a product move changes category counts too. */
  onChanged: () => void;
}

export function ProductsPanel({ products, categories, onChanged }: ProductsPanelProps) {
  const [term, setTerm] = useState("");
  const [editing, setEditing] = useState<Product | undefined>(undefined);
  const [formOpen, setFormOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);

  const rows = useMemo(() => {
    const items = products.data?.items ?? [];
    const query = term.trim();
    return query ? searchProducts(items, query).map((hit) => hit.item) : items;
  }, [products.data, term]);

  const openCreate = () => {
    setEditing(undefined);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    try {
      await api.admin.deleteProduct(pendingDelete.id);
      toast.success("Товар удалён");
      onChanged();
    } catch (error) {
      toast.error(messageFor(error));
    } finally {
      setPendingDelete(null);
    }
  };

  return (
    <AdminSection
      title="Товары"
      description="Цены, категории, наличие и карточка целиком"
      icon={Boxes}
      actions={
        <Button type="button" onClick={openCreate} disabled={categories.length === 0}>
          <Plus className="size-4" />
          Добавить товар
        </Button>
      }
    >
      <Input
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Поиск по названию"
        aria-label="Поиск товаров"
        className="max-w-xs"
      />

      <QueryState
        status={products.status}
        error={products.error}
        onRetry={products.refetch}
        loading={<Skeleton className="h-72 w-full rounded-xl" />}
      >
        <AdminPanel className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14" />
                <TableHead>Товар</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead className="text-right">Цена</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead className="w-24 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((product, index) => (
                <TableRow
                  key={product.id}
                  style={{ animationDelay: `${Math.min(index, 12) * 25}ms` }}
                  className="animate-in fade-in fill-mode-both duration-300"
                >
                  <TableCell>
                    <ImageWithFallback
                      src={product.image}
                      alt=""
                      className="size-10 rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell>
                    <p className="text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.slug}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.categoryName}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="text-foreground">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                      <span className="block text-xs text-muted-foreground line-through">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {product.isNew && <Badge variant="secondary">Новинка</Badge>}
                      <Badge variant={product.inStock ? "secondary" : "outline"}>
                        {product.inStock ? "В наличии" : "Нет в наличии"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Редактировать ${product.name}`}
                      onClick={() => openEdit(product)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Удалить ${product.name}`}
                      className="text-destructive"
                      onClick={() => setPendingDelete(product)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Ничего не найдено.
            </p>
          )}
        </AdminPanel>
      </QueryState>

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        {...(editing ? { product: editing } : {})}
        categories={categories}
        onSaved={onChanged}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить товар?</AlertDialogTitle>
            <AlertDialogDescription>
              «{pendingDelete?.name}» исчезнет из каталога, избранного и сравнения. Отменить
              удаление нельзя.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminSection>
  );
}
