"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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

const formSchema = z.object({
  email: z.string().email("Email invalido"),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      // Usa endpoint do backend Nest (proxied pelo Nginx)
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (data.success) {
        setShowSuccessModal(true);
      } else {
        toast.error(
          data.message || "Ocorreu um erro ao processar sua solicitacao",
        );
      }
    } catch (err) {
      console.error("Erro ao solicitar redefinicao de senha:", err);
      toast.error("Erro ao solicitar redefinicao de senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSuccessModal) {
      const timeout = setTimeout(() => {
        router.push("/user/login");
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [showSuccessModal, router]);

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-linear-to-br from-black via-slate-900 to-black p-4">
      <Card className="w-full max-w-md border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            Esqueceu sua senha?
          </CardTitle>
          <CardDescription className="text-slate-400">
            Digite seu email para receber instrucoes de redefinicao de senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="Digite seu email cadastrado"
                        className="border-slate-600 bg-slate-700 text-white placeholder:text-slate-400"
                      />
                    </FormControl>
                    <FormMessage className="text-red-400" />
                  </FormItem>
                )}
              />

              <div className="flex flex-col space-y-4">
                <Button
                  type="submit"
                  className="w-full bg-[#C2A537] text-black hover:bg-[#C2A537]/90 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading && (
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  )}
                  {loading ? "Enviando..." : "Enviar instrucoes"}
                </Button>

                <Button
                  type="button"
                  variant="link"
                  className="text-slate-400 hover:text-slate-300"
                  asChild
                >
                  <Link href="/user/login">Voltar ao login</Link>
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {showSuccessModal && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-[#C2A537]/40 bg-slate-900/90 p-6 text-center shadow-lg shadow-[#C2A537]/20">
            <h3 className="text-xl font-semibold text-[#C2A537]">
              Verifique seu e-mail
            </h3>
            <p className="mt-3 text-slate-200">
              Se o e-mail estiver cadastrado, enviamos um link para redefinicao
              de senha.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Voce sera redirecionado para a pagina de login em instantes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
