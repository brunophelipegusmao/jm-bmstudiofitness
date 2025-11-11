"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { ArrowLeft, Check, Loader2, Shield, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  createAdminAction,
  type CreateAdminFormData,
} from "@/actions/admin/create-admin-action";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema de validação
const createAdminSchema = z
  .object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    cpf: z
      .string()
      .min(11, "CPF deve ter 11 dígitos")
      .max(11, "CPF deve ter 11 dígitos")
      .regex(/^\d+$/, "CPF deve conter apenas números"),
    email: z.string().email("Email inválido"),
    sex: z.enum(["masculino", "feminino"]),
    bornDate: z.string().min(1, "Data de nascimento obrigatória"),
    address: z.string().min(10, "Endereço deve ter pelo menos 10 caracteres"),
    telephone: z.string().min(10, "Telefone deve ter pelo menos 10 caracteres"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    confirmPassword: z.string().min(6, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof createAdminSchema>;

export default function CreateAdminPage() {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      sex: "masculino",
    },
  });

  async function onSubmit(data: FormData) {
    setServerError(null);

    // Remover confirmPassword antes de enviar
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { confirmPassword, ...adminData } = data;

    const result = await createAdminAction(adminData as CreateAdminFormData);

    if (result.success) {
      setSuccess(true);
      reset();

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } else {
      setServerError(result.message);

      // Se houver erros de validação específicos, exibir
      if (result.errors) {
        console.error("Erros de validação:", result.errors);
      }
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-black via-zinc-900 to-black p-8 text-center shadow-2xl shadow-green-500/20"
        >
          <div className="mb-6 flex justify-center">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
              <Check className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="mb-4 text-3xl font-bold text-green-400">
            Administrador Criado!
          </h2>

          <p className="mb-6 text-slate-400">
            O novo administrador foi criado com sucesso e já pode acessar o
            sistema.
          </p>

          <div className="text-sm text-slate-500">
            Redirecionando para o dashboard...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#C2A537] to-[#D4B547] shadow-lg shadow-[#C2A537]/30">
              <Shield className="h-8 w-8 text-black" />
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold text-white">
            Criar Administrador
          </h1>
          <p className="text-slate-400">
            Preencha os dados para criar um novo usuário administrador
          </p>
        </div>

        {/* Formulário */}
        <div className="rounded-2xl border-2 border-zinc-800 bg-gradient-to-br from-zinc-900/90 via-black to-zinc-900/90 p-8 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Erro do servidor */}
            {serverError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
                {serverError}
              </div>
            )}

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <UserPlus className="h-5 w-5 text-[#C2A537]" />
                Dados Pessoais
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Nome Completo */}
                <div className="md:col-span-2">
                  <Label htmlFor="name" className="text-white">
                    Nome Completo *
                  </Label>
                  <Input
                    {...register("name")}
                    id="name"
                    placeholder="João da Silva"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* CPF */}
                <div>
                  <Label htmlFor="cpf" className="text-white">
                    CPF (apenas números) *
                  </Label>
                  <Input
                    {...register("cpf")}
                    id="cpf"
                    placeholder="00000000000"
                    maxLength={11}
                    className="bg-zinc-800 text-white"
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email" className="text-white">
                    Email *
                  </Label>
                  <Input
                    {...register("email")}
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Telefone */}
                <div>
                  <Label htmlFor="telephone" className="text-white">
                    Telefone *
                  </Label>
                  <Input
                    {...register("telephone")}
                    id="telephone"
                    placeholder="(00) 00000-0000"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>

                {/* Data de Nascimento */}
                <div>
                  <Label htmlFor="bornDate" className="text-white">
                    Data de Nascimento *
                  </Label>
                  <Input
                    {...register("bornDate")}
                    id="bornDate"
                    type="date"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.bornDate && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.bornDate.message}
                    </p>
                  )}
                </div>

                {/* Sexo */}
                <div>
                  <Label htmlFor="sex" className="text-white">
                    Sexo *
                  </Label>
                  <select
                    {...register("sex")}
                    id="sex"
                    className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                  >
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                  {errors.sex && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.sex.message}
                    </p>
                  )}
                </div>

                {/* Endereço */}
                <div className="md:col-span-2">
                  <Label htmlFor="address" className="text-white">
                    Endereço Completo *
                  </Label>
                  <Input
                    {...register("address")}
                    id="address"
                    placeholder="Rua, número, bairro, cidade, estado"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.address.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dados de Acesso */}
            <div className="space-y-4 border-t border-zinc-700 pt-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                <Shield className="h-5 w-5 text-[#C2A537]" />
                Dados de Acesso
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Senha */}
                <div>
                  <Label htmlFor="password" className="text-white">
                    Senha *
                  </Label>
                  <Input
                    {...register("password")}
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirmar Senha */}
                <div>
                  <Label htmlFor="confirmPassword" className="text-white">
                    Confirmar Senha *
                  </Label>
                  <Input
                    {...register("confirmPassword")}
                    id="confirmPassword"
                    type="password"
                    placeholder="Digite a senha novamente"
                    className="bg-zinc-800 text-white"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
                <p className="text-sm text-yellow-400">
                  ⚠️ O administrador terá acesso total ao sistema, incluindo
                  gerenciamento de usuários, financeiro e configurações.
                </p>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 pt-4">
              <Link href="/admin/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-[#C2A537] to-[#D4B547] text-black hover:from-[#D4B547] hover:to-[#C2A537]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Criar Administrador
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Link para voltar */}
        <div className="mt-6 text-center">
          <Link
            href="/admin/dashboard"
            className="text-sm text-slate-400 transition-colors hover:text-[#C2A537]"
          >
            Voltar ao Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
