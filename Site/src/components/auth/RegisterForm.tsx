import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthProvider";
import { EMAIL_PATTERN, FieldError } from "@/components/auth/fields";

interface RegisterValues {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm({ onDone }: { onDone: () => void }) {
  const { register: createAccount } = useAuth();
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await createAccount({
      name: values.name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    });

    if (!result.ok) {
      setError("email", { message: result.error });
      return;
    }

    toast.success("Регистрация завершена — вы вошли в аккаунт");
    onDone();
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="register-name">Имя</Label>
        <Input
          id="register-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          {...register("name", {
            required: "Укажите имя",
            minLength: { value: 2, message: "Минимум 2 символа" },
          })}
        />
        <FieldError message={errors.name?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email", {
            required: "Укажите email",
            pattern: { value: EMAIL_PATTERN, message: "Некорректный email" },
          })}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-phone">Телефон</Label>
        <Input
          id="register-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+7 (999) 123-45-67"
          aria-invalid={Boolean(errors.phone)}
          {...register("phone", {
            required: "Укажите телефон",
            minLength: { value: 10, message: "Слишком короткий номер" },
          })}
        />
        <FieldError message={errors.phone?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Пароль</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password", {
            required: "Придумайте пароль",
            minLength: { value: 6, message: "Минимум 6 символов" },
          })}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm">Повторите пароль</Label>
        <Input
          id="register-confirm"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword", {
            required: "Повторите пароль",
            validate: (value) => value === watch("password") || "Пароли не совпадают",
          })}
        />
        <FieldError message={errors.confirmPassword?.message} />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Создаём аккаунт…" : "Зарегистрироваться"}
      </Button>
    </form>
  );
}
