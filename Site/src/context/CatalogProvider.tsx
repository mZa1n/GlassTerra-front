import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { CatalogFilter, SortOrder } from "@/lib/types";

interface CatalogContextValue {
  filter: CatalogFilter;
  setFilter: (filter: CatalogFilter) => void;
  resetFilter: () => void;

  sort: SortOrder;
  setSort: (sort: SortOrder) => void;

  query: string;
  setQuery: (query: string) => void;
}

const ALL: CatalogFilter = { kind: "all" };

const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [filter, setFilter] = useState<CatalogFilter>(ALL);
  const [sort, setSort] = useState<SortOrder>("popular");
  const [query, setQuery] = useState("");

  const resetFilter = useCallback(() => setFilter(ALL), []);

  const value = useMemo<CatalogContextValue>(
    () => ({ filter, setFilter, resetFilter, sort, setSort, query, setQuery }),
    [filter, resetFilter, sort, query],
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const context = useContext(CatalogContext);
  if (!context) throw new Error("useCatalog must be used within <CatalogProvider>");
  return context;
}
