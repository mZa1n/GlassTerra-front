import { CategoryNav } from "@/components/CategoryNav";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

/** Desktop rail. Hidden below lg, where the sheet below takes over. */
export function SidebarRail() {
  return (
    <aside className="hidden w-64 shrink-0 lg:block xl:w-72">
      <div className="sticky top-24 overflow-hidden rounded-xl border bg-card shadow-sm">
        <CategoryNav />
      </div>
    </aside>
  );
}

interface SidebarSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Mobile drawer. Radix handles focus trapping, Escape and scroll locking. */
export function SidebarSheet({ open, onOpenChange }: SidebarSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-80 gap-0 p-0 sm:max-w-sm">
        <SheetHeader className="border-b">
          <SheetTitle>Категории</SheetTitle>
          <SheetDescription className="sr-only">Навигация по каталогу товаров</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <CategoryNav onSelect={() => onOpenChange(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
