import { useState } from "react";
import { Heart, LogOut, Mail, MapPin, Pencil, Phone, ShoppingCart, User } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { ThemeSetting } from "@/components/ThemeSetting";
import { OrdersCard } from "@/components/profile/OrdersCard";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { SignedOut } from "@/components/profile/SignedOut";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";
import { useNavigation } from "@/context/NavigationProvider";
import { useStore } from "@/context/StoreProvider";
import type { IconComponent } from "@/lib/icon";
import type { Page } from "@/lib/types";

interface Shortcut {
  icon: IconComponent;
  title: string;
  text: string;
  page: Page;
}

export function ProfilePage() {
  const { user, isRestoring, logout } = useAuth();
  const { favorites, cartCount } = useStore();
  const { navigate } = useNavigation();
  const [editing, setEditing] = useState(false);

  if (isRestoring) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) return <SignedOut />;

  const fields = [
    { icon: Mail, label: "Email", value: user.email },
    { icon: Phone, label: "Телефон", value: user.phone || "Не указан" },
    { icon: MapPin, label: "Адрес доставки", value: user.address || "Не указан", wide: true },
  ];

  const shortcuts: Shortcut[] = [
    {
      icon: Heart,
      title: "Избранное",
      text: `Сохранено товаров: ${favorites.length}`,
      page: "favorites",
    },
    {
      icon: ShoppingCart,
      title: "Корзина",
      text: `Товаров в корзине: ${cartCount}`,
      page: "cart",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title={user.name}
        description={user.email}
        icon={User}
        actions={
          <Button
            type="button"
            variant="ghost"
            className="text-destructive"
            onClick={async () => {
              await logout();
              toast.success("Вы вышли из аккаунта");
            }}
          >
            <LogOut className="size-4" />
            Выйти
          </Button>
        }
      />

      <Card>
        <CardContent className="p-4 md:p-6">
          {editing ? (
            <ProfileForm onCancel={() => setEditing(false)} />
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {fields.map(({ icon: Icon, label, value, wide }) => (
                  <div
                    key={label}
                    className={
                      wide ? "rounded-lg bg-secondary p-4 md:col-span-2" : "rounded-lg bg-secondary p-4"
                    }
                  >
                    <Icon className="mb-2 size-5 text-primary" />
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => setEditing(true)}
              >
                <Pencil className="size-4" />
                Редактировать профиль
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <OrdersCard />

      <div className="grid gap-4 sm:grid-cols-2">
        {shortcuts.map(({ icon: Icon, title, text, page }) => (
          <button
            key={page}
            type="button"
            onClick={() => navigate(page)}
            className="rounded-xl border bg-card p-6 text-left shadow-sm transition-shadow hover:shadow-lg"
          >
            <Icon className="mb-3 size-6 text-primary" />
            <h2 className="text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{text}</p>
          </button>
        ))}
      </div>

      <ThemeSetting />
    </div>
  );
}
