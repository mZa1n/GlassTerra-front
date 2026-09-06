import { useState } from "react";
import { User } from "lucide-react";
import { AuthDialog } from "@/components/AuthDialog";
import { ThemeSetting } from "@/components/ThemeSetting";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

/** Appearance stays reachable without an account, so the theme is never locked away. */
export function SignedOut() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-md space-y-4 md:space-y-6">
        <Card>
          <CardContent className="space-y-4 p-6 text-center md:p-8">
            <User className="mx-auto size-12 text-primary" />
            <h1 className="text-xl text-foreground">Личный кабинет</h1>
            <p className="text-sm text-muted-foreground">
              Войдите или зарегистрируйтесь, чтобы сохранить адрес доставки и историю заказов.
            </p>
            <Button type="button" className="w-full" onClick={() => setDialogOpen(true)}>
              Войти или зарегистрироваться
            </Button>
          </CardContent>
        </Card>

        <ThemeSetting />
      </div>

      <AuthDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
