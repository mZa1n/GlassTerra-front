import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/components/ui/utils";

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + message, so every admin form row lines up the same way. */
export function Field({ id, label, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

interface ToggleProps {
  label: string;
  pressed: boolean;
  onChange: (pressed: boolean) => void;
}

/**
 * Two-state switch built from a button: `components/ui/` deliberately keeps
 * only the primitives in use, and a checkbox is not among them.
 */
export function Toggle({ label, pressed, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onChange(!pressed)}
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors",
        pressed
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "text-muted-foreground hover:bg-accent",
      )}
    >
      <span
        className={cn(
          "relative h-5 w-9 shrink-0 rounded-full transition-colors",
          pressed ? "bg-primary" : "bg-border",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-4 rounded-full bg-background transition-all",
            pressed ? "left-4.5" : "left-0.5",
          )}
        />
      </span>
      {label}
    </button>
  );
}
