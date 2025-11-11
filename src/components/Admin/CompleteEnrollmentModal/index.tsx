"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Save, X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Schema de validação
const enrollStudentSchema = z.object({
  fullName: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF deve ter 11 dígitos")
    .max(11, "CPF deve ter 11 dígitos")
    .regex(/^\d+$/, "CPF deve conter apenas números"),
  email: z.string().email("Email inválido"),
  telephone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço muito curto"),
  bornDate: z.string().min(1, "Data de nascimento obrigatória"),
  sex: z.enum(["masculino", "feminino"]),
  monthlyFeeValue: z.string().min(1, "Valor da mensalidade obrigatório"),
  paymentMethod: z.string().min(1, "Método de pagamento obrigatório"),
  dueDate: z.string().min(1, "Dia de vencimento obrigatório"),
});

type EnrollStudentFormData = z.infer<typeof enrollStudentSchema>;

interface CompleteEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  waitlistData: {
    id: string;
    fullName: string;
    email: string;
    whatsapp: string;
    goal: string;
    healthRestrictions: string | null;
  };
  onEnroll: (
    data: EnrollStudentFormData,
    waitlistId: string,
  ) => Promise<{
    success: boolean;
    userId?: string;
    password?: string;
    error?: string;
  }>;
}

export default function CompleteEnrollmentModal({
  isOpen,
  onClose,
  waitlistData,
  onEnroll,
}: CompleteEnrollmentModalProps) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [studentName, setStudentName] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EnrollStudentFormData>({
    resolver: zodResolver(enrollStudentSchema),
    defaultValues: {
      fullName: waitlistData.fullName,
      email: waitlistData.email,
      telephone: waitlistData.whatsapp,
      address: "",
      bornDate: "",
      sex: "masculino",
      monthlyFeeValue: "150.00",
      paymentMethod: "pix",
      dueDate: "10",
    },
  });

  async function onSubmit(data: EnrollStudentFormData) {
    const result = await onEnroll(data, waitlistData.id);

    if (result.success && result.password) {
      // Mostrar modal com senha
      setGeneratedPassword(result.password);
      setStudentName(data.fullName);
      setShowPasswordModal(true);
      reset();
    }
  }

  function handleClosePasswordModal() {
    setShowPasswordModal(false);
    setGeneratedPassword("");
    setStudentName("");
    onClose();
  }

  if (!isOpen && !showPasswordModal) return null;

  // Modal de senha gerada
  if (showPasswordModal) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          onClick={handleClosePasswordModal}
        />

        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="pointer-events-auto w-full max-w-md rounded-2xl border-2 border-green-500/30 bg-gradient-to-br from-black via-slate-900 to-black p-8 shadow-2xl shadow-green-500/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex justify-center">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                <Save className="h-10 w-10 text-white" />
              </div>
            </div>

            <h2 className="mb-4 text-center text-3xl font-bold text-green-400">
              Aluno Matriculado!
            </h2>

            <p className="mb-6 text-center text-lg font-medium text-white">
              {studentName}
            </p>

            <div className="mb-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="mb-2 text-sm font-semibold text-yellow-400">
                ⚠️ Senha de Acesso (anote esta senha):
              </p>
              <div className="flex items-center justify-between rounded bg-black/50 p-3">
                <code className="text-xl font-bold text-yellow-300">
                  {generatedPassword}
                </code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedPassword);
                  }}
                  className="rounded bg-yellow-500/20 px-3 py-1 text-sm text-yellow-400 hover:bg-yellow-500/30"
                >
                  Copiar
                </button>
              </div>
            </div>

            <p className="mb-6 text-center text-sm text-slate-400">
              Forneça esta senha ao aluno para que ele possa acessar o sistema.
            </p>

            <button
              onClick={handleClosePasswordModal}
              className="w-full rounded-lg bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-bold text-white transition-all hover:from-green-600 hover:to-green-700"
            >
              Concluir
            </button>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }

  // Modal de formulário de matrícula
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border-2 border-[#C2A537]/30 bg-gradient-to-br from-black via-slate-900 to-black p-8 shadow-2xl shadow-[#C2A537]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#C2A537]">
                  Completar Matrícula
                </h2>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#C2A537]/10 hover:text-[#C2A537]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Dados Pessoais
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="fullName" className="text-white">
                        Nome Completo *
                      </Label>
                      <Input
                        {...register("fullName")}
                        id="fullName"
                        className="bg-zinc-800 text-white"
                      />
                      {errors.fullName && (
                        <p className="text-sm text-red-400">
                          {errors.fullName.message}
                        </p>
                      )}
                    </div>

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
                        <p className="text-sm text-red-400">
                          {errors.cpf.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-white">
                        Email *
                      </Label>
                      <Input
                        {...register("email")}
                        id="email"
                        type="email"
                        className="bg-zinc-800 text-white"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-400">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="telephone" className="text-white">
                        Telefone *
                      </Label>
                      <Input
                        {...register("telephone")}
                        id="telephone"
                        className="bg-zinc-800 text-white"
                      />
                      {errors.telephone && (
                        <p className="text-sm text-red-400">
                          {errors.telephone.message}
                        </p>
                      )}
                    </div>

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
                        <p className="text-sm text-red-400">
                          {errors.bornDate.message}
                        </p>
                      )}
                    </div>

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
                        <p className="text-sm text-red-400">
                          {errors.sex.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
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
                      <p className="text-sm text-red-400">
                        {errors.address.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Dados Financeiros */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Dados Financeiros
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label htmlFor="monthlyFeeValue" className="text-white">
                        Mensalidade (R$) *
                      </Label>
                      <Input
                        {...register("monthlyFeeValue")}
                        id="monthlyFeeValue"
                        type="number"
                        step="0.01"
                        placeholder="150.00"
                        className="bg-zinc-800 text-white"
                      />
                      {errors.monthlyFeeValue && (
                        <p className="text-sm text-red-400">
                          {errors.monthlyFeeValue.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="paymentMethod" className="text-white">
                        Método de Pagamento *
                      </Label>
                      <select
                        {...register("paymentMethod")}
                        id="paymentMethod"
                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                      >
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="cartao_credito">
                          Cartão de Crédito
                        </option>
                        <option value="cartao_debito">Cartão de Débito</option>
                        <option value="transferencia">Transferência</option>
                      </select>
                      {errors.paymentMethod && (
                        <p className="text-sm text-red-400">
                          {errors.paymentMethod.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dueDate" className="text-white">
                        Dia de Vencimento *
                      </Label>
                      <select
                        {...register("dueDate")}
                        id="dueDate"
                        className="flex h-10 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
                      >
                        {Array.from({ length: 10 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day}>
                              Dia {day}
                            </option>
                          ),
                        )}
                      </select>
                      {errors.dueDate && (
                        <p className="text-sm text-red-400">
                          {errors.dueDate.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informações da Lista de Espera */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <h4 className="mb-2 text-sm font-semibold text-blue-400">
                    Informações da Lista de Espera:
                  </h4>
                  <div className="space-y-1 text-sm text-blue-300">
                    <p>
                      <strong>Objetivo:</strong> {waitlistData.goal}
                    </p>
                    {waitlistData.healthRestrictions && (
                      <p>
                        <strong>Restrições:</strong>{" "}
                        {waitlistData.healthRestrictions}
                      </p>
                    )}
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-[#C2A537] to-[#D4B547] text-black hover:from-[#D4B547] hover:to-[#C2A537]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Matriculando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Matricular Aluno
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
