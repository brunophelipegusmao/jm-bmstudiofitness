"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";

import { loginAction } from "@/actions/auth/login-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  const initialState = { email: "", error: "" };
  const [state, action, isPending] = useActionState(loginAction, initialState);

  return (
    <div className="text-[#C0A231]">
      <div className="mx-auto max-w-5xl px-8">
        <div className="flex min-h-[calc(100vh-240px)] items-center justify-center py-2">
          <Card className="w-[350px] max-w-md border-[#C2A537] bg-black/95 backdrop-blur-sm md:max-w-lg lg:max-w-xl">
            <CardHeader>
              <CardTitle className="text-center text-lg text-[#C2A537] md:text-xl">
                Login Administrativo
              </CardTitle>
              <CardDescription className="text-center text-xs text-slate-300 md:text-sm">
                Digite suas credenciais para acessar o painel administrativo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={action} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#C2A537]">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@bmstudio.com"
                    required
                    disabled={isPending}
                    defaultValue={state.email}
                    className="border-gray-600 bg-gray-900/50 text-white placeholder:text-gray-400 focus:border-[#C2A537]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password" className="text-[#C2A537]">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Digite sua senha"
                    required
                    disabled={isPending}
                    className="border-gray-600 bg-gray-900/50 text-white placeholder:text-gray-400 focus:border-[#C2A537]"
                  />
                </div>
                {state.error && (
                  <div className="rounded border border-red-800 bg-red-900/20 p-3 text-sm text-red-400">
                    {state.error}
                  </div>
                )}
                <Button
                  type="submit"
                  className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
              <div className="mt-6 text-center text-xs text-slate-400">
                <p>Apenas administradores e professores têm acesso</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
