"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
        "A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número",
      ),
    confirmPassword: z.string().min(8, "Confirme sua nova senha"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    // Validar token ao carregar a página
    const validateToken = async () => {
      if (!token) {
        toast.error("Token de redefinição inválido ou expirado");
        return;
      }

      try {
        const response = await fetch("/api/user/validate-reset-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        if (data.valid) {
          setTokenValidated(true);
        } else {
          toast.error(data.message || "Token inválido ou expirado");
        }
      } catch (error) {
        toast.error("Erro ao validar token. Tente novamente.");
      }
    };

    validateToken();
  }, [token]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!token) {
      toast.error("Token de redefinição inválido");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Senha redefinida com sucesso!");
        window.location.href = "/user/login";
      } else {
        toast.error(data.message || "Erro ao redefinir senha");
      }
    } catch (error) {
      toast.error("Erro ao redefinir senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValidated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-slate-900 to-black p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#C2A537] border-t-transparent" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-slate-900 to-black p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-slate-400">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="border-slate-600 bg-slate-700 text-white"
                      />
                    </FormControl>
                    <p className="mt-1.5 text-xs text-slate-400">
                      A senha deve ter no mínimo 8 caracteres, uma letra
                      maiúscula, uma minúscula e um número
                    </p>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">
                      Confirmar Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        className="border-slate-600 bg-slate-700 text-white"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-[#C2A537] text-black hover:bg-[#C2A537]/90 disabled:opacity-50"
                disabled={loading}
              >
                {loading && (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                )}
                {loading ? "Redefinindo..." : "Redefinir Senha"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
