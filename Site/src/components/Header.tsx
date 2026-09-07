import { ArrowLeftRight, Heart, Menu, ShieldCheck, ShoppingCart, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";
import { useAuth } from "@/context/AuthProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useStore } from "@/context/StoreProvider";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MAIN_NAV } from "@/data/navigation";
import type { IconComponent } from "@/lib/icon";
import type { Page } from "@/lib/types";

interface ActionProps {
  label: string;
  page: Page;
  icon: IconComponent;
  count?: number;
  className?: string;
}

function Action({ label, page, icon: Icon, count = 0, className }: ActionProps) {
  const { navigate } = useNavigation();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => navigate(page)}
      aria-label={count > 0 ? `${label}: ${count}` : label}
      className={cn("relative size-10", className)}
    >
      <Icon className="size-5" />
      {count > 0 && (
        <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Button>
  );
}

export function Header({ onOpenMenu }: { onOpenMenu: () => void }) {
  const { page, navigate } = useNavigation();
  const { cartCount, comparison, favorites } = useStore();
  const { user } = useAuth();

  // Only one search box is mounted at a time — two would run duplicate queries.
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto max-w-[1400px] px-4 md:px-6">
        <div className="flex h-16 items-center gap-3 md:h-20 md:gap-8">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Меню и категории"
            onClick={onOpenMenu}
            className="-ml-2 size-10 lg:hidden"
          >
            <Menu className="size-5" />
          </Button>

          <button
            type="button"
            onClick={() => navigate("home")}
            className="rounded-lg transition-opacity hover:opacity-70"
          >
            <Logo />
            <span className="sr-only">На главную</span>
          </button>

          {isDesktop && (
            <div className="max-w-xl flex-1">
              <SearchAutocomplete />
            </div>
          )}

          <div className="ml-auto flex items-center gap-0.5">
            <Action label="Избранное" page="favorites" icon={Heart} count={favorites.length} />
            {comparison.length > 0 && (
              <Action
                label="Сравнение"
                page="comparison"
                icon={ArrowLeftRight}
                count={comparison.length}
                className="hidden sm:inline-flex"
              />
            )}
            <Action label="Корзина" page="cart" icon={ShoppingCart} count={cartCount} />
            {user?.role === "admin" && (
              <Action label="Панель управления" page="admin" icon={ShieldCheck} />
            )}

            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("profile")}
              className="ml-1 gap-2 px-2 md:px-3"
            >
              <User className="size-5" />
              <span className="hidden max-w-24 truncate lg:inline">
                {user ? user.name.split(" ")[0] : "Войти"}
              </span>
            </Button>
          </div>
        </div>

        {!isDesktop && (
          <div className="pb-3">
            <SearchAutocomplete compact />
          </div>
        )}
      </div>

      {/* Section navigation. Hidden on small screens, where it lives in the menu. */}
      <nav
        aria-label="Разделы"
        className="hidden border-t bg-card/40 md:block"
      >
        <div className="scrollbar-hide touch-pan-x mx-auto flex max-w-[1400px] gap-6 overflow-x-auto px-6">
          {MAIN_NAV.map((item) => (
            <button
              key={item.page}
              type="button"
              onClick={() => navigate(item.page)}
              aria-current={page === item.page ? "page" : undefined}
              className={cn(
                "-mb-px shrink-0 border-b-2 py-3 text-sm whitespace-nowrap transition-colors",
                page === item.page
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
