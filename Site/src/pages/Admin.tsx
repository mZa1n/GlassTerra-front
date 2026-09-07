import { useState } from "react";
import {
  Boxes,
  FileText,
  LayoutGrid,
  Megaphone,
  ShieldAlert,
  ShieldCheck,
  Tags,
  Users,
} from "lucide-react";
import { AdminNav, type AdminNavItem } from "@/components/admin/AdminNav";
import { ArticlesPanel } from "@/components/admin/ArticlesPanel";
import { CategoriesPanel } from "@/components/admin/CategoriesPanel";
import { OverviewPanel, type AdminSectionId } from "@/components/admin/OverviewPanel";
import { PagesPanel } from "@/components/admin/PagesPanel";
import { ProductsPanel } from "@/components/admin/ProductsPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { AuthDialog } from "@/components/AuthDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthProvider";
import { useCategories, useProducts } from "@/hooks/catalog";
import { useAdminArticles, useAdminPages, useAdminUsers } from "@/hooks/content";

/**
 * Back office: catalogue, news blocks, page copy and accounts.
 *
 * The role check here only decides what is worth drawing — every admin call
 * is authorised again on the server.
 */
export function AdminPage() {
  const { user, isRestoring } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [section, setSection] = useState<AdminSectionId>("overview");

  const isAdmin = user?.role === "admin";

  const categories = useCategories();
  const products = useProducts({ filter: { kind: "all" }, sort: "popular" });
  // Admin-only lists stay unfetched for everyone else — they would 403 anyway.
  const articles = useAdminArticles(isAdmin);
  const pages = useAdminPages(isAdmin);
  const users = useAdminUsers(isAdmin);

  if (isRestoring) {
    return (
      <div className="space-y-4 md:space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Card className="animate-in fade-in zoom-in-95 mx-auto max-w-md duration-300">
          <CardContent className="space-y-4 p-6 text-center md:p-8">
            <ShieldAlert className="mx-auto size-12 text-primary" />
            <h1 className="text-xl text-foreground">Панель управления</h1>
            <p className="text-sm text-muted-foreground">
              Раздел доступен сотрудникам магазина. Войдите в служебный аккаунт.
            </p>
            <Button type="button" className="w-full" onClick={() => setAuthOpen(true)}>
              Войти
            </Button>
          </CardContent>
        </Card>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="animate-in fade-in zoom-in-95 mx-auto max-w-md duration-300">
        <CardContent className="space-y-3 p-6 text-center md:p-8">
          <ShieldAlert className="mx-auto size-12 text-destructive" />
          <h1 className="text-xl text-foreground">Недостаточно прав</h1>
          <p className="text-sm text-muted-foreground">
            Аккаунт {user.email} не входит в число сотрудников магазина.
          </p>
        </CardContent>
      </Card>
    );
  }

  const reloadCatalog = () => {
    products.refetch();
    categories.refetch();
  };

  const items: readonly AdminNavItem<AdminSectionId>[] = [
    { id: "overview", label: "Обзор", icon: LayoutGrid },
    { id: "products", label: "Товары", icon: Boxes, badge: products.data?.total },
    { id: "categories", label: "Категории", icon: Tags, badge: categories.data?.length },
    { id: "articles", label: "Новости", icon: Megaphone, badge: articles.data?.length },
    { id: "pages", label: "Страницы", icon: FileText, badge: pages.data?.length },
    { id: "users", label: "Пользователи", icon: Users, badge: users.data?.length },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-in fade-in slide-in-from-bottom-2 flex flex-wrap items-end justify-between gap-4 border-b pb-4 duration-500">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl md:text-3xl">Панель управления</h1>
            <p className="text-sm text-muted-foreground">
              {user.name} · {user.email}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row md:gap-8">
        <AdminNav items={items} active={section} onSelect={setSection} />

        <div className="min-w-0 flex-1">
          {section === "overview" && (
            <OverviewPanel
              products={products.data?.items ?? []}
              categories={categories.data ?? []}
              articles={articles.data ?? []}
              users={users.data ?? []}
              onGo={setSection}
            />
          )}

          {section === "products" && (
            <ProductsPanel
              products={products}
              categories={categories.data ?? []}
              onChanged={reloadCatalog}
            />
          )}

          {section === "categories" && (
            <CategoriesPanel categories={categories} onChanged={reloadCatalog} />
          )}

          {section === "articles" && (
            <ArticlesPanel
              articles={articles}
              categories={categories.data ?? []}
              onChanged={articles.refetch}
            />
          )}

          {section === "pages" && <PagesPanel pages={pages} onChanged={pages.refetch} />}

          {section === "users" && (
            <UsersPanel users={users} currentUserId={user.id} onChanged={users.refetch} />
          )}
        </div>
      </div>
    </div>
  );
}
