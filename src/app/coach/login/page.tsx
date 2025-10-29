"use client";

import { GraduationCap, Loader2, Users } from "lucide-react";
import { useActionState } from "react";

import { coachLoginAction } from "@/actions/auth/coach-login-action";
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

const CoachLogin = () => {
  const initialState = { email: "", error: "" };
  const [state, action, isPending] = useActionState(
    coachLoginAction,
    initialState,
  );

  return (
    <div className="bg-[#1b1b1a] text-[#C0A231]">
      {/* Main Content */}
      <div className="mx-auto max-w-5xl px-8">
        <div className="flex min-h-[calc(100vh-240px)] items-center justify-center py-2">
          <Card className="w-[400px] max-w-md border-[#C2A537] bg-black/95 backdrop-blur-sm md:max-w-lg lg:max-w-xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C2A537]/10">
                <GraduationCap className="h-8 w-8 text-[#C2A537]" />
              </div>
              <CardTitle className="text-xl text-[#C2A537] md:text-2xl">
                Login do Coach
              </CardTitle>
              <CardDescription className="text-slate-400">
                Acesse sua área exclusiva para acompanhar seus alunos
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form action={action} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu.email@bmstudio.com"
                    defaultValue={state.email}
                    required
                    className="border-[#C2A537]/30 bg-slate-900/50 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Digite sua senha"
                    required
                    className="border-[#C2A537]/30 bg-slate-900/50 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]"
                  />
                </div>

                {state.error && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="text-sm text-red-400">{state.error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    <>
                      <GraduationCap size={16} className="mr-2" />
                      Entrar como Professor
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 space-y-4">
                <div className="text-center text-xs text-slate-400">
                  <p>Acesso exclusivo para professores credenciados</p>
                  <p className="mt-1">
                    Apenas dados de saúde dos alunos serão exibidos
                  </p>
                </div>

                <div className="rounded-lg border border-[#C2A537]/30 bg-[#C2A537]/5 p-3">
                  <h4 className="mb-2 text-sm font-medium text-[#C2A537]">
                    O que você pode fazer:
                  </h4>
                  <ul className="space-y-1 text-xs text-slate-400">
                    <li>• Pesquisar alunos por nome, CPF ou email</li>
                    <li>• Visualizar dados de saúde e histórico médico</li>
                    <li>• Adicionar observações gerais e particulares</li>
                    <li>• Acompanhar histórico de observações</li>
                  </ul>
                </div>

                <div className="text-center">
                  <a
                    href="/admin/login"
                    className="text-xs text-slate-400 transition-colors hover:text-[#C2A537]"
                  >
                    Não é professor? Acesse o login administrativo
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CoachLogin;
