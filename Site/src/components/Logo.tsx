import logo from "@/assets/logo.png";
import { SHOP } from "@/data/shop";
import { cn } from "@/components/ui/utils";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <span className={cn("flex items-center gap-2 md:gap-3", className)}>
      <span className="flex size-9 items-center justify-center overflow-hidden rounded md:size-11">
        <img src={logo} alt="" className="size-full object-contain" />
      </span>
      {withText && (
        // Colours inherit, so the same mark works on the light header and the
        // dark footer without a per-context override.
        <span className="hidden text-left sm:block">
          <span className="block leading-tight font-medium">{SHOP.name}</span>
          <span className="hidden text-sm opacity-65 md:block">{SHOP.tagline}</span>
        </span>
      )}
    </span>
  );
}
