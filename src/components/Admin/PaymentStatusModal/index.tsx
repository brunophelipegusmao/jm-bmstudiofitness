"use client";

/* eslint-disable simple-import-sort/imports */

import { Download } from "lucide-react";
import { useState } from "react";
import { StudentPaymentData } from "@/actions/admin/get-students-payments-action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/payment-utils";

interface PaymentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  students: StudentPaymentData[];
  type: "paid" | "pending";
  onUpdatePayment?: (userId: string, paid: boolean) => Promise<void>;
}

export function PaymentStatusModal({
  isOpen,
  onClose,
  title,
  students,
  type,
  onUpdatePayment,
}: PaymentStatusModalProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const generatePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      const reportModule = await import("@/lib/generate-payment-report-v2");
      await reportModule.generatePaymentReport(students, type);
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      // eslint-disable-next-line no-alert
      alert("Erro ao gerar relatório. Por favor, tente novamente.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const [loadingIds, setLoadingIds] = useState<Record<string, boolean>>({});

  const handleUpdate = async (userId: string, paid: boolean) => {
    try {
      setLoadingIds((s) => ({ ...s, [userId]: true }));
      if (onUpdatePayment) {
        await onUpdatePayment(userId, paid);
      } else {
        const action = await import("@/actions/admin/update-payment-action");
        await action.updatePaymentAction(userId, paid);
      }
    } catch (error) {
      console.error("Erro ao atualizar pagamento (modal):", error);
      // eslint-disable-next-line no-alert
      alert("Erro ao atualizar pagamento. Tente novamente.");
    } finally {
      setLoadingIds((s) => ({ ...s, [userId]: false }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] overflow-y-auto bg-slate-900 text-white focus:outline-none sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="flex justify-between">
            <p className="text-sm text-slate-400">
              Total de alunos: {students.length}
            </p>
            <Button
              onClick={generatePDF}
              variant="outline"
              size="sm"
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-white disabled:opacity-50"
            >
              {isGeneratingPDF ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C2A537] border-t-transparent" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>

          <div className="divide-y divide-slate-700">
            {students.map((student) => (
              <div key={student.userId} className="py-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-white">{student.name}</p>
                    <p className="text-sm text-slate-400">{student.email}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={
                        type === "paid"
                          ? "font-medium text-green-400"
                          : "font-medium text-red-400"
                      }
                    >
                      {formatCurrency(student.monthlyFeeValueInCents)}
                    </p>
                    <p className="text-sm text-slate-400">
                      Vencimento: Dia {student.dueDate}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-sm">
                  <p className="text-slate-400">
                    Último pagamento:{" "}
                    {student.lastPaymentDate
                      ? new Date(student.lastPaymentDate).toLocaleDateString(
                          "pt-BR",
                        )
                      : "Nunca"}
                  </p>

                  <div className="mt-3 flex items-center justify-end gap-2">
                    {type === "paid" ? (
                      <button
                        onClick={() => handleUpdate(student.userId, false)}
                        disabled={!!loadingIds[student.userId]}
                        className="inline-flex items-center gap-2 rounded-md border border-red-600 bg-transparent px-3 py-1 text-sm font-medium text-red-400 hover:bg-red-600 hover:text-white disabled:opacity-50"
                      >
                        {loadingIds[student.userId] ? "..." : "Marcar Pendente"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUpdate(student.userId, true)}
                        disabled={!!loadingIds[student.userId]}
                        className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {loadingIds[student.userId]
                          ? "..."
                          : "Confirmar Pagamento"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
