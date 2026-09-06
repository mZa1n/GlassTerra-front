import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { ProductDialog } from "@/components/product/ProductDialog";
import type { Product } from "@/lib/types";

interface ProductDialogContextValue {
  openProduct: (product: Product) => void;
}

const ProductDialogContext = createContext<ProductDialogContextValue | null>(null);

/**
 * Hosts the single product dialog. Any card in any grid can open it, and the
 * dialog itself is mounted once rather than per card.
 */
export function ProductDialogProvider({ children }: { children: ReactNode }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const openProduct = useCallback((next: Product) => {
    setProduct(next);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openProduct }), [openProduct]);

  return (
    <ProductDialogContext.Provider value={value}>
      {children}
      <ProductDialog product={product} open={open} onOpenChange={setOpen} />
    </ProductDialogContext.Provider>
  );
}

export function useProductDialog() {
  const context = useContext(ProductDialogContext);
  if (!context) throw new Error("useProductDialog must be used within <ProductDialogProvider>");
  return context;
}
