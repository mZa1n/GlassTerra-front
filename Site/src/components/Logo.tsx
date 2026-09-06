import logo from "@/assets/logo.png";
import { SHOP } from "@/data/shop";
import { cn } from "@/components/ui/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 md:gap-3", className)}>
      <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg md:size-14">
        <img src={logo} alt="" className="size-full object-contain" />
      </span>
      {withText && (
        <span className="hidden text-left sm:block">
          <span className="block leading-tight text-foreground">{SHOP.name}</span>
          <span className="hidden text-sm text-muted-foreground md:block">{SHOP.tagline}</span>
        </span>
      )}
    </span>
  );
}
