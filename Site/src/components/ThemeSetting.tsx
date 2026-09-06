import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";

const OPTIONS = [
  { value: "light", label: "Светлая", icon: Sun },
  { value: "dark", label: "Тёмная", icon: Moon },
  { value: "system", label: "Как в системе", icon: Monitor },
] as const;

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();

  // next-themes resolves the stored value only after mount, so render the
  // selection once it is actually known instead of guessing on first paint.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <Card>
      <CardContent className="space-y-4 p-4 md:p-6">
        <div className="space-y-1">
          <h2 className="text-foreground">Оформление</h2>
          <p className="text-sm text-muted-foreground">
            Тема сохраняется в этом браузере и применяется сразу.
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Тема оформления"
          className="grid gap-2 sm:grid-cols-3"
        >
          {OPTIONS.map(({ value, label, icon: Icon }) => {
            const selected = mounted && theme === value;

            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-3 text-left text-sm transition-colors",
                  "focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                  selected
                    ? "border-primary bg-primary/10 text-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className={cn("size-5 shrink-0", selected && "text-primary")} />
                {label}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
