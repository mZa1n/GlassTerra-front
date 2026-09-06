import { ArrowLeftRight, Heart, Menu, ShoppingCart, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useAuth } from "@/context/AuthProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useStore } from "@/context/StoreProvider";
import { MAIN_NAV } from "@/data/navigation";
import { SHOP } from "@/data/shop";
import type { IconComponent } from "@/lib/icon";
import type { Page } from "@/lib/types";

function TopNav() {
  const { page, navigate } = useNavigation();

  return (
    <div className="border-b bg-secondary">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-2 px-4 py-2 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <nav aria-label="Основная навигация" className="scrollbar-hide touch-pan-x overscroll-x-contain -mb-2 flex gap-4 overflow-x-auto pb-2 sm:mb-0 sm:pb-0 md:gap-6">
          {MAIN_NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => navigate(item.page)}
              aria-current={page === item.page ? "page" : undefined}
              className={cn(
                "shrink-0 text-xs whitespace-nowrap transition-colors md:text-sm",
                page === item.page
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <p className="hidden text-xs text-muted-foreground sm:block md:text-sm">{SHOP.address}</p>
      </div>
    </div>
  );
}

interface CounterButtonProps {
  label: string;
  count: number;
  page: Page;
  icon: IconComponent;
  className?: string;
}

function CounterButton({ label, count, page, icon: Icon, className }: CounterButtonProps) {
  const { navigate } = useNavigation();

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => navigate(page)}
      aria-label={count > 0 ? `${label}: ${count}` : label}
      className={cn("h-auto flex-col gap-1 px-2 py-1.5", className)}
    >
      <span className="relative">
        <Icon className="size-5 md:size-6" />
        {count > 0 && (
          <span className="absolute -top-2 -right-2 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {count > 99 ? "99+" : count}
          </span>
        )}
      </span>
      <span className="hidden text-xs md:block">{label}</span>
    </Button>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { navigate } = useNavigation();
  // Only one search box is mounted at a time — two would run duplicate queries.
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { cartCount, comparison, favorites } = useStore();
  const { user } = useAuth();

  return (
    <>
      <TopNav />
      <header className="sticky top-0 z-30 border-b bg-background/85 shadow-sm backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 py-3 md:px-6 md:py-4">
          <div className="flex items-center justify-between gap-3 md:gap-8">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Открыть каталог категорий"
              onClick={onOpenMenu}
              className="lg:hidden"
            >
              <Menu className="size-6" />
            </Button>

            <button
              type="button"
              onClick={() => navigate("home")}
              className="rounded-lg transition-opacity hover:opacity-80"
            >
              <Logo />
              <span className="sr-only">На главную</span>
            </button>

            {isDesktop && (
              <div className="max-w-2xl flex-1">
                <SearchAutocomplete />
              </div>
            )}

            <div className="flex items-center gap-1 md:gap-2">
              <CounterButton
                label="Избранное"
                count={favorites.length}
                page="favorites"
                icon={Heart}
                className="hidden sm:inline-flex"
              />
              <CounterButton
                label="Сравнение"
                count={comparison.length}
                page="comparison"
                icon={ArrowLeftRight}
                className="hidden lg:inline-flex"
              />
              <CounterButton label="Корзина" count={cartCount} page="cart" icon={ShoppingCart} />

              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("profile")}
                className="gap-2"
              >
                <User className="size-5" />
                <span className="hidden lg:inline">{user ? user.name.split(" ")[0] : "Вход"}</span>
              </Button>
            </div>
          </div>

          {!isDesktop && (
            <div className="mt-3">
              <SearchAutocomplete compact />
            </div>
          )}
        </div>
      </header>
    </>
  );
}
