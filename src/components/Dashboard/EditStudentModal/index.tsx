"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy, Key, Loader2, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { generateUserPasswordAction } from "@/actions/admin/generate-user-password-action";
import { sendPasswordResetLinkAction } from "@/actions/admin/send-password-reset-link-action";
import {
  updateStudentAction,
  UpdateStudentData,
} from "@/actions/admin/update-student-action";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const editStudentSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .regex(/^\d{11}$/, "CPF deve conter apenas números"),
  email: z.string().email("E-mail inválido"),
  telephone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço muito curto"),
  bornDate: z.string().min(1, "Data de nascimento obrigatória"),
  monthlyFeeValue: z.string().min(1, "Valor da mensalidade obrigatório"),
  paymentMethod: z.string().min(1, "Método de pagamento obrigatório"),
  dueDate: z.string().min(1, "Dia de vencimento obrigatório"),
});

type EditStudentFormData = z.infer<typeof editStudentSchema>;

interface EditStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: {
    userId: string;
    name: string;
    cpf: string;
    email: string;
    telephone: string;
    address: string;
    bornDate: string;
    monthlyFeeValueInCents: number;
    paymentMethod: string;
    dueDate: number;
  };
  onSuccess?: () => void;
}

export function EditStudentModal({
  isOpen,
  onClose,
  student,
  onSuccess,
}: EditStudentModalProps) {
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);
  const [isSendingResetLink, setIsSendingResetLink] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditStudentFormData>({
    resolver: zodResolver(editStudentSchema),
  });

  // Resetar formulário quando o modal abrir com novos dados
  useEffect(() => {
    if (isOpen && student) {
      reset({
        name: student.name,
        cpf: student.cpf,
        email: student.email,
        telephone: student.telephone,
        address: student.address,
        bornDate: student.bornDate,
        monthlyFeeValue: (student.monthlyFeeValueInCents / 100).toFixed(2),
        paymentMethod: student.paymentMethod,
        dueDate: student.dueDate.toString(),
      });
      // Limpar senha gerada quando o modal abrir
      setGeneratedPassword(null);
    }
  }, [isOpen, student, reset]);

  const handleGeneratePassword = async () => {
    try {
      setIsGeneratingPassword(true);
      const result = await generateUserPasswordAction(student.userId);

      if (result.success && result.password) {
        setGeneratedPassword(result.password);
        showSuccessToast("Senha gerada com sucesso!");
      } else {
        showErrorToast(result.message || "Erro ao gerar senha");
      }
    } catch (error) {
      console.error("Erro ao gerar senha:", error);
      showErrorToast("Erro ao gerar nova senha");
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleCopyPassword = async () => {
    if (generatedPassword) {
      try {
        await navigator.clipboard.writeText(generatedPassword);
        showSuccessToast("Senha copiada para área de transferência!");
      } catch (error) {
        console.error("Erro ao copiar senha:", error);
        showErrorToast("Erro ao copiar senha");
      }
    }
  };

  const handleSendResetLink = async () => {
    try {
      setIsSendingResetLink(true);
      const result = await sendPasswordResetLinkAction(student.userId);

      if (result.success) {
        showSuccessToast(
          result.message || "Link de redefinição enviado com sucesso!",
        );
      } else {
        showErrorToast(result.message || "Erro ao enviar link de redefinição");
      }
    } catch (error) {
      console.error("Erro ao enviar link:", error);
      showErrorToast("Erro ao enviar link de redefinição");
    } finally {
      setIsSendingResetLink(false);
    }
  };

  const onSubmit = async (data: EditStudentFormData) => {
    try {
      const updateData: UpdateStudentData = {
        id: student.userId,
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        telephone: data.telephone,
        address: data.address,
        bornDate: data.bornDate,
        monthlyFeeValueInCents: Math.round(
          parseFloat(data.monthlyFeeValue) * 100,
        ),
        paymentMethod: data.paymentMethod,
        dueDate: parseInt(data.dueDate, 10),
      };

      const result = await updateStudentAction(updateData);

      if (result.success) {
        showSuccessToast("Dados do aluno atualizados com sucesso!");
        onSuccess?.();
        onClose();
      } else {
        showErrorToast(result.error || "Erro ao atualizar aluno");
      }
    } catch (error) {
      console.error("Erro ao atualizar aluno:", error);
      showErrorToast("Erro ao atualizar dados do aluno");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#C2A537]/30 bg-slate-900 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            Editar Dados do Aluno
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Atualize as informações do aluno {student.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Dados Pessoais</h3>

            <div>
              <Label htmlFor="name" className="text-white">
                Nome Completo
              </Label>
              <Input
                id="name"
                {...register("name")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cpf" className="text-white">
                  CPF
                </Label>
                <Input
                  id="cpf"
                  {...register("cpf")}
                  placeholder="Apenas números"
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.cpf && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.cpf.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="bornDate" className="text-white">
                  Data de Nascimento
                </Label>
                <Input
                  id="bornDate"
                  type="date"
                  {...register("bornDate")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.bornDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.bornDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-white">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="telephone" className="text-white">
                Telefone
              </Label>
              <Input
                id="telephone"
                {...register("telephone")}
                placeholder="Apenas números"
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.telephone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.telephone.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address" className="text-white">
                Endereço
              </Label>
              <Input
                id="address"
                {...register("address")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-500">
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="monthlyFeeValue" className="text-white">
                  Valor da Mensalidade (R$)
                </Label>
                <Input
                  id="monthlyFeeValue"
                  type="number"
                  step="0.01"
                  {...register("monthlyFeeValue")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.monthlyFeeValue && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.monthlyFeeValue.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="dueDate" className="text-white">
                  Dia do Vencimento
                </Label>
                <Input
                  id="dueDate"
                  type="number"
                  min="1"
                  max="31"
                  {...register("dueDate")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="paymentMethod" className="text-white">
                Método de Pagamento
              </Label>
              <Input
                id="paymentMethod"
                {...register("paymentMethod")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.paymentMethod && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.paymentMethod.message}
                </p>
              )}
            </div>
          </div>

          {/* Gerenciamento de Senha */}
          <div className="space-y-4 border-t border-slate-700/50 pt-6">
            <h3 className="text-lg font-semibold text-white">
              Gerenciamento de Senha
            </h3>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={handleGeneratePassword}
                disabled={isGeneratingPassword || isSubmitting}
                className="flex-1 border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
              >
                {isGeneratingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Gerar Nova Senha
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSendResetLink}
                disabled={isSendingResetLink || isSubmitting}
                className="flex-1 border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
              >
                {isSendingResetLink ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Link de Redefinição
                  </>
                )}
              </Button>
            </div>

            {generatedPassword && (
              <div className="rounded-lg border border-[#C2A537]/30 bg-[#C2A537]/5 p-4">
                <p className="mb-2 text-sm text-slate-300">
                  Senha gerada com sucesso:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-slate-800 px-3 py-2 font-mono text-sm text-white">
                    {generatedPassword}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopyPassword}
                    className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Esta senha foi salva no sistema. Copie e envie para o aluno.
                </p>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex gap-3 border-t border-slate-700/50 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 border-slate-700 text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-linear-to-r from-[#C2A537] to-[#D4B547] font-semibold text-black hover:from-[#D4B547] hover:to-[#E6C658]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
