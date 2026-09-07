import { useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usingRealBackend } from "@/lib/env";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  const [tab, setTab] = useState("login");
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Личный кабинет</DialogTitle>
          <DialogDescription>
            {usingRealBackend
              ? "Введите данные аккаунта Glassterra."
              : "Демо-режим: аккаунты хранятся только в этом браузере."}
          </DialogDescription>
        </DialogHeader>

        {!usingRealBackend && (
          <p className="rounded-lg bg-secondary p-3 text-xs text-muted-foreground">
            Демо-аккаунты: <span className="text-foreground">user@glassterra.ru</span> / user12345
            — покупатель, <span className="text-foreground">admin@glassterra.ru</span> / admin12345
            — сотрудник с доступом к панели управления.
          </p>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full">
            <TabsTrigger value="login" className="flex-1">
              Вход
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Регистрация
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="pt-4">
            <LoginForm onDone={close} />
          </TabsContent>
          <TabsContent value="register" className="pt-4">
            <RegisterForm onDone={close} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
