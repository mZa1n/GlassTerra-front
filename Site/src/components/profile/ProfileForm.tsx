import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FieldError } from "@/components/auth/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";

interface ProfileValues {
  name: string;
  phone: string;
  address: string;
}

export function ProfileForm({ onCancel }: { onCancel: () => void }) {
  const { user, updateUser } = useAuth();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    defaultValues: {
      name: user?.name ?? "",
      phone: user?.phone ?? "",
      address: user?.address ?? "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await updateUser(values);

    if (!result.ok) {
      setError("name", { message: result.error });
      return;
    }

    toast.success("Профиль обновлён");
    onCancel();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="profile-name">Имя</Label>
        <Input
          id="profile-name"
          aria-invalid={Boolean(errors.name)}
          {...register("name", { required: "Укажите имя" })}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-phone">Телефон</Label>
        <Input id="profile-phone" type="tel" {...register("phone")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="profile-address">Адрес доставки</Label>
        <Textarea id="profile-address" rows={3} {...register("address")} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? "Сохраняем…" : "Сохранить"}
        </Button>
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Отмена
        </Button>
      </div>
    </form>
  );
}
