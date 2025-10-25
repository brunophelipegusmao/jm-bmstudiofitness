"use client";

import { loginAction } from "@/actions/login/login-action";
import { Button } from "@/components/Button";
import { InputText } from "@/components/InputText";
import clsx from "clsx";
import { LogInIcon } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "react-toastify";

export function LoginForm() {
  const initialState = {
    username: "",
    error: "",
  };
  const [state, action, isPending] = useActionState(loginAction, initialState);

  useEffect(() => {
    if (state.error) {
      toast.dismiss();
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={action} className="flex flex-1 flex-col gap-6">
      <InputText
        type="text"
        name="username"
        labelText="Usuário"
        placeholder="Digite seu usuário"
        disabled={isPending}
        defaultValue={state.username}
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
