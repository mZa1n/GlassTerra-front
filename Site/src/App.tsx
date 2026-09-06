import { Suspense, lazy, useState, type ComponentType } from "react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SidebarRail, SidebarSheet } from "@/components/Sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthProvider } from "@/context/AuthProvider";
import { CatalogProvider } from "@/context/CatalogProvider";
import { NavigationProvider, useNavigation } from "@/context/NavigationProvider";
import { StoreProvider } from "@/context/StoreProvider";
import { HomePage } from "@/pages/Home";
import type { Page } from "@/lib/types";

/**
 * Screens are code-split: only the home page ships in the entry chunk, the
 * rest arrive when the route is first opened.
 */
const CatalogPage = lazy(() => import("@/pages/Catalog").then((m) => ({ default: m.CatalogPage })));
const SearchResultsPage = lazy(() =>
  import("@/pages/SearchResults").then((m) => ({ default: m.SearchResultsPage })),
);
const FavoritesPage = lazy(() =>
  import("@/pages/Favorites").then((m) => ({ default: m.FavoritesPage })),
);
const ComparisonPage = lazy(() =>
  import("@/pages/Comparison").then((m) => ({ default: m.ComparisonPage })),
);
const CartPage = lazy(() => import("@/pages/Cart").then((m) => ({ default: m.CartPage })));
const ProfilePage = lazy(() => import("@/pages/Profile").then((m) => ({ default: m.ProfilePage })));
const NewsPage = lazy(() => import("@/pages/News").then((m) => ({ default: m.NewsPage })));
const NewArrivalsPage = lazy(() =>
  import("@/pages/NewArrivals").then((m) => ({ default: m.NewArrivalsPage })),
);
const StaticPage = lazy(() => import("@/pages/StaticPage").then((m) => ({ default: m.StaticPage })));

/** Single place that maps a route to its screen. */
const SCREENS: Partial<Record<Page, ComponentType>> = {
  home: HomePage,
  catalog: CatalogPage,
  search: SearchResultsPage,
  favorites: FavoritesPage,
  comparison: ComparisonPage,
  cart: CartPage,
  profile: ProfilePage,
  news: NewsPage,
  "new-arrivals": NewArrivalsPage,
};

/** Routes that show the category rail alongside the content. */
const WITH_SIDEBAR = new Set<Page>(["home", "catalog", "search"]);

function ScreenFallback() {
  return (
    <div className="space-y-4 md:space-y-6">
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}

function Shell() {
  const { page } = useNavigation();
  const [menuOpen, setMenuOpen] = useState(false);

  const Screen = SCREENS[page];

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900">
      <Header onOpenMenu={() => setMenuOpen(true)} />
      <SidebarSheet open={menuOpen} onOpenChange={setMenuOpen} />

      <div className="mx-auto flex w-full max-w-[1400px] flex-1 gap-4 p-3 md:gap-6 md:p-6">
        {WITH_SIDEBAR.has(page) && <SidebarRail />}
        <main id="content" className="min-w-0 flex-1">
          {/* Remount on navigation so a crashed screen recovers by leaving it. */}
          <ErrorBoundary resetKey={page}>
            <Suspense fallback={<ScreenFallback />}>
              {Screen ? <Screen /> : <StaticPage page={page} />}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <NavigationProvider>
        <AuthProvider>
          <CatalogProvider>
            <StoreProvider>
              <Toaster position="top-right" richColors closeButton />
              {/* Last resort: keeps a crash outside <main> from blanking the page. */}
              <ErrorBoundary>
                <Shell />
              </ErrorBoundary>
            </StoreProvider>
          </CatalogProvider>
        </AuthProvider>
      </NavigationProvider>
    </ThemeProvider>
  );
}
