import { CategoryNav } from "@/components/CategoryNav";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/components/ui/utils";
import { useNavigation } from "@/context/NavigationProvider";
import { MAIN_NAV } from "@/data/navigation";

/** Desktop rail. Hidden below lg, where the sheet below takes over. */
export function SidebarRail() {
  return (
    <aside className="hidden w-60 shrink-0 lg:block xl:w-64">
      <div className="sticky top-28 overflow-hidden rounded-lg border bg-card">
        <CategoryNav />
      </div>
    </aside>
  );
}

interface SidebarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Mobile drawer. Carries both the section navigation — which the header only
 * shows from md up — and the category tree.
 */
export function SidebarSheet({ open, onOpenChange }: SidebarSheetProps) {
  const { page, navigate } = useNavigation();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>Меню</SheetTitle>
          <SheetDescription className="sr-only">
            Разделы сайта и категории каталога
          </SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <nav aria-label="Разделы" className="border-b py-1">
            {MAIN_NAV.map((item) => (
              <button
                key={item.page}
                type="button"
                onClick={() => {
                  navigate(item.page);
                  onOpenChange(false);
                }}
                aria-current={page === item.page ? "page" : undefined}
                className={cn(
                  "w-full px-4 py-2.5 text-left text-sm transition-colors",
                  page === item.page
                    ? "text-primary"
                    : "text-foreground hover:bg-accent",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <p className="px-4 pt-4 pb-2 text-xs tracking-wide text-muted-foreground uppercase">
            Каталог
          </p>
          <CategoryNav onSelect={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
