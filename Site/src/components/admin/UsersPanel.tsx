import { useEffect, useState } from "react";
import { Pencil, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { api, messageFor, type UserPatch } from "@/api";
import { AdminPanel, AdminSection } from "@/components/admin/AdminSection";
import { Field } from "@/components/admin/fields";
import { QueryState } from "@/components/QueryState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QueryResult } from "@/hooks/useQuery";
import type { User, UserRole } from "@/lib/types";

interface UsersPanelProps {
  users: QueryResult<User[]>;
  /** The signed-in admin: their own row is guarded against self-demotion. */
  currentUserId: string;
  onChanged: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  user: "Покупатель",
  admin: "Сотрудник",
};

export function UsersPanel({ users, currentUserId, onChanged }: UsersPanelProps) {
  const [editing, setEditing] = useState<User | null>(null);
  const rows = users.data ?? [];

  return (
    <AdminSection
      title="Пользователи"
      description="Контактные данные и права доступа. Email — логин, он не меняется."
      icon={Users}
    >
      <QueryState
        status={users.status}
        error={users.error}
        onRetry={users.refetch}
        loading={<Skeleton className="h-64 w-full rounded-xl" />}
      >
        <AdminPanel className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>Телефон</TableHead>
                <TableHead>Адрес</TableHead>
                <TableHead>Роль</TableHead>
                <TableHead className="w-16 text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <p className="text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.phone || "—"}</TableCell>
                  <TableCell className="max-w-56 truncate text-muted-foreground">
                    {user.address || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" && <ShieldCheck className="size-3" />}
                      {ROLE_LABELS[user.role]}
                    </Badge>
                    {user.id === currentUserId && (
                      <span className="ml-2 text-xs text-muted-foreground">это вы</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={`Изменить ${user.name}`}
                      onClick={() => setEditing(user)}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rows.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              Зарегистрированных пользователей пока нет.
            </p>
          )}
        </AdminPanel>
      </QueryState>

      <UserDialog
        user={editing}
        isSelf={editing?.id === currentUserId}
        onClose={() => setEditing(null)}
        onSaved={onChanged}
      />
    </AdminSection>
  );
}

function UserDialog({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: User | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [values, setValues] = useState<Required<UserPatch>>({
    name: "",
    phone: "",
    address: "",
    role: "user",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setValues({ name: user.name, phone: user.phone, address: user.address, role: user.role });
  }, [user]);

  const set = <K extends keyof Required<UserPatch>>(key: K, value: Required<UserPatch>[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!user) return;

    if (!values.name.trim()) {
      toast.error("Имя не может быть пустым");
      return;
    }

    setSaving(true);
    try {
      await api.admin.updateUser(user.id, values);
      toast.success("Данные обновлены");
      onClose();
      onSaved();
    } catch (error) {
      toast.error(messageFor(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user?.name}</DialogTitle>
          <DialogDescription>
            {user?.email} · изменения видны пользователю в его личном кабинете.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Field id="user-name" label="Имя">
            <Input
              id="user-name"
              value={values.name}
              onChange={(event) => set("name", event.target.value)}
            />
          </Field>

          <Field id="user-phone" label="Телефон">
            <Input
              id="user-phone"
              value={values.phone}
              onChange={(event) => set("phone", event.target.value)}
            />
          </Field>

          <Field id="user-address" label="Адрес доставки">
            <Input
              id="user-address"
              value={values.address}
              onChange={(event) => set("address", event.target.value)}
            />
          </Field>

          <Field
            id="user-role"
            label="Роль"
            hint={
              isSelf
                ? "Свою роль изменить нельзя — иначе можно закрыть себе доступ."
                : "Сотрудник получает доступ к панели управления."
            }
          >
            <Select
              value={values.role}
              onValueChange={(value) => set("role", value as UserRole)}
              disabled={isSelf}
            >
              <SelectTrigger id="user-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Покупатель</SelectItem>
                <SelectItem value="admin">Сотрудник</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
            {saving ? "Сохраняем…" : "Сохранить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
