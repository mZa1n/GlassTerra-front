import { useMemo } from "react";
import { ShoppingCart, X } from "lucide-react";
import { Rating } from "@/components/Rating";
import { ImageWithFallback } from "@/components/figma/ImageWithFallback";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/components/ui/utils";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

interface ComparisonTableProps {
  products: readonly Product[];
  onRemove: (productId: number) => void;
  onAddToCart: (product: Product) => void;
}

const STICKY_CELL = "sticky left-0 z-10 w-44 min-w-44 border-r bg-card";

export function ComparisonTable({ products, onRemove, onAddToCart }: ComparisonTableProps) {
  /** Union of every spec key present, so products with different specs align. */
  const specRows = useMemo(
    () => [...new Set(products.flatMap((product) => Object.keys(product.specs)))],
    [products],
  );

  return (
    <Card className="py-0">
      <Table className="w-auto" containerClassName="touch-pan-x overscroll-x-contain rounded-xl">
        <TableHeader>
          <TableRow>
            <TableHead className={cn(STICKY_CELL, "align-bottom")}>Характеристика</TableHead>
            {products.map((product) => (
              <TableHead key={product.id} className="w-56 p-4 align-top">
                <div className="relative space-y-2">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label={`Убрать ${product.name} из сравнения`}
                    onClick={() => onRemove(product.id)}
                    className="absolute top-0 right-0 rounded-full"
                  >
                    <X className="size-4" />
                  </Button>
                  <div className="aspect-square w-full max-w-40 overflow-hidden rounded-lg bg-muted">
                    <ImageWithFallback
                      src={product.image}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                  <p className="line-clamp-2 text-sm font-normal whitespace-normal text-foreground">
                    {product.name}
                  </p>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          <TableRow>
            <TableCell className={STICKY_CELL}>Цена</TableCell>
            {products.map((product) => (
              <TableCell key={product.id} className="text-center">
                <span className="block text-foreground">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                )}
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell className={STICKY_CELL}>Рейтинг</TableCell>
            {products.map((product) => (
              <TableCell key={product.id}>
                <Rating
                  value={product.rating}
                  reviews={product.reviews}
                  className="justify-center"
                />
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell className={STICKY_CELL}>Категория</TableCell>
            {products.map((product) => (
              <TableCell key={product.id} className="text-center">
                {product.categoryName}
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell className={STICKY_CELL}>Наличие</TableCell>
            {products.map((product) => (
              <TableCell
                key={product.id}
                className={cn(
                  "text-center",
                  product.inStock ? "text-success" : "text-destructive",
                )}
              >
                {product.inStock ? "В наличии" : "Нет в наличии"}
              </TableCell>
            ))}
          </TableRow>

          {specRows.map((key) => (
            <TableRow key={key}>
              <TableCell className={STICKY_CELL}>{key}</TableCell>
              {products.map((product) => (
                <TableCell key={product.id} className="text-center">
                  {product.specs[key] ?? "—"}
                </TableCell>
              ))}
            </TableRow>
          ))}

          <TableRow>
            <TableCell className={STICKY_CELL}>Описание</TableCell>
            {products.map((product) => (
              <TableCell key={product.id} className="text-sm whitespace-normal">
                {product.description}
              </TableCell>
            ))}
          </TableRow>

          <TableRow>
            <TableCell className={STICKY_CELL} />
            {products.map((product) => (
              <TableCell key={product.id}>
                <Button
                  type="button"
                  className="w-full"
                  disabled={!product.inStock}
                  onClick={() => onAddToCart(product)}
                >
                  <ShoppingCart className="size-4" />
                  {product.inStock ? "В корзину" : "Недоступно"}
                </Button>
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </Card>
  );
}
