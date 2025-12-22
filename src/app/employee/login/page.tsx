"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

export default function EmployeeLoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/employee/dashboard");
      } else {
        setError(result.error || "Erro ao fazer login");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-gray-900 via-black to-gray-900 px-4">
      <Card className="w-full max-w-md border-[#C2A537]/30 bg-black/40 shadow-2xl backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C2A537]/20">
            <LogIn className="h-8 w-8 text-[#C2A537]" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#C2A537]">
            Área do Funcionário
          </CardTitle>
          <p className="text-sm text-slate-400">
            Faça login para acessar o sistema
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu.email@jmfitness.com"
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
                placeholder="••••••••"
                required
                className="border-[#C2A537]/30 bg-slate-900/50 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]"
              />
            </div>

            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
            >
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-slate-400">Outros acessos:</p>
            <div className="flex justify-center gap-4">
              <Link
                href="/admin/login"
                className="text-[#C2A537] hover:underline"
              >
                Administrador
              </Link>
              <Link
                href="/coach/login"
                className="text-[#C2A537] hover:underline"
              >
                Professor
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
