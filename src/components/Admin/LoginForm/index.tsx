"use client";

import clsx from "clsx";
import { LogInIcon } from "lucide-react";
import { useActionState } from "react";

import { loginAction } from "@/actions/auth/login-action";
import { Button } from "@/components/Button";
import { InputText } from "@/components/InputText";

export function LoginForm() {
  const initialState = {
    email: "",
    error: "",
  };
  const [state, action, isPending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="flex flex-1 flex-col gap-6">
      <InputText
        type="email"
        name="email"
        labelText="Email"
        placeholder="Digite seu email"
        disabled={isPending}
        defaultValue={state.email}
      />
      <InputText
        type="password"
        name="password"
        labelText="Senha"
        placeholder="Digite sua senha"
        disabled={isPending}
      />
      <Button disabled={isPending} type="submit" className="mt-4">
        <LogInIcon />
        Entrar
      </Button>
      {!!state.error && (
        <p className={clsx("text-sm text-red-600")}>{state.error}</p>
      )}
    </form>
  );
}
