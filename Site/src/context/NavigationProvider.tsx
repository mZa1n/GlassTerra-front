import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Page } from "@/lib/types";

interface NavigationContextValue {
  page: Page;
  /** Navigates and returns to the top of the document, the way a real page load would. */
  navigate: (page: Page) => void;
}

const NavigationContext = createContext<NavigationContextValue | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("home");

  const navigate = useCallback((next: Page) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const value = useMemo(() => ({ page, navigate }), [page, navigate]);

  return <NavigationContext.Provider value={value}>{children}</NavigationContext.Provider>;
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error("useNavigation must be used within <NavigationProvider>");
  return context;
}
