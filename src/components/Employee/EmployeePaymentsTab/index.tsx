"use client";

import { Download, Eye, FileText, Search } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getStudentMonthlyPaymentsAction,
  StudentMonthlyPayment,
  updatePaymentStatusAction,
} from "@/actions/admin/student-monthly-payments-action";
import {
  generatePaymentReceiptAction,
  PaymentReceiptData,
} from "@/actions/employee/generate-receipt-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function EmployeePaymentsTab() {
  const [payments, setPayments] = useState<StudentMonthlyPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<
    StudentMonthlyPayment[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<PaymentReceiptData | null>(
    null,
  );

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStudentMonthlyPaymentsAction();
      if (result.success && result.data) {
        setPayments(result.data);
        setFilteredPayments(result.data);
      } else {
        setError(result.error || "Erro ao carregar pagamentos");
      }
    } catch {
      setError("Erro ao carregar dados de pagamentos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPayments(payments);
      return;
    }

    const filtered = payments.filter((payment) =>
      payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredPayments(filtered);
  }, [searchTerm, payments]);

  const handleUpdateStatus = async (userId: string, newStatus: boolean) => {
    setProcessingId(userId);
    try {
      const result = await updatePaymentStatusAction(userId, newStatus);
      if (result.success) {
        await loadPayments();
      } else {
        alert(result.error || "Erro ao atualizar status");
      }
    } catch {
      alert("Erro ao processar operação");
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateReceipt = async (userId: string) => {
    setProcessingId(userId);
    try {
      const result = await generatePaymentReceiptAction(userId);
      if (result.success && result.data) {
        setReceiptData(result.data);
        setShowReceipt(true);
      } else {
        alert(result.error || "Erro ao gerar recibo");
      }
    } catch {
      alert("Erro ao gerar recibo");
    } finally {
      setProcessingId(null);
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-[#C2A537]">Carregando pagamentos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  // Modal de Recibo
  if (showReceipt && receiptData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
        <Card className="w-full max-w-2xl border-[#C2A537]/30 bg-white text-black print:border-0 print:shadow-none">
          <CardHeader className="border-b border-gray-200 print:border-black">
            <div className="flex items-center justify-between print:justify-center">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-[#C2A537]" />
                Recibo de Pagamento
              </CardTitle>
              <div className="flex gap-2 print:hidden">
                <Button
                  onClick={handlePrintReceipt}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Imprimir/Salvar PDF
                </Button>
                <Button
                  onClick={() => setShowReceipt(false)}
                  variant="ghost"
                  size="sm"
                >
                  Fechar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-8">
            {/* Cabeçalho */}
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#C2A537]">
                JM Fitness Studio
              </h1>
              <p className="text-sm text-gray-600">
                Recibo de Pagamento de Mensalidade
              </p>
            </div>

            {/* Número do Recibo */}
            <div className="border-t border-b border-gray-200 py-3 text-center print:border-black">
              <p className="text-sm font-semibold text-gray-600">
                Nº {receiptData.receiptNumber}
              </p>
            </div>

            {/* Dados do Aluno */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">Dados do Aluno:</h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-medium">{receiptData.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CPF:</span>
                  <span className="font-medium">
                    {receiptData.studentCPF.replace(
                      /(\d{3})(\d{3})(\d{3})(\d{2})/,
                      "$1.$2.$3-$4",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">E-mail:</span>
                  <span className="font-medium">
                    {receiptData.studentEmail}
                  </span>
                </div>
              </div>
            </div>

            {/* Dados do Pagamento */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">
                Dados do Pagamento:
              </h3>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor Pago:</span>
                  <span className="text-lg font-bold text-[#C2A537]">
                    {receiptData.amountPaid.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data do Pagamento:</span>
                  <span className="font-medium">
                    {new Date(receiptData.paymentDate).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Forma de Pagamento:</span>
                  <span className="font-medium capitalize">
                    {receiptData.paymentMethod.replace("_", " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Referente ao mês:</span>
                  <span className="font-medium">
                    {new Date(receiptData.paymentDate).toLocaleDateString(
                      "pt-BR",
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Rodapé */}
            <div className="border-t border-gray-200 pt-6 text-center text-xs text-gray-500 print:border-black">
              <p>
                Recibo gerado automaticamente pelo sistema JM Fitness Studio
              </p>
              <p className="mt-1">
                Data de emissão: {new Date().toLocaleDateString("pt-BR")} às{" "}
                {new Date().toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#C2A537]">
          Gerenciar Mensalidades
        </h1>
        <p className="text-slate-400">
          Visualize e gerencie os pagamentos dos alunos
        </p>
      </div>

      {/* Search */}
      <Card className="border-[#C2A537]/30 bg-black/40">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Buscar aluno por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-[#C2A537]/30 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-[#C2A537]/30 bg-black/40">
        <CardHeader>
          <CardTitle className="text-[#C2A537]">
            Mensalidades dos Alunos ({filteredPayments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#C2A537]/20 hover:bg-slate-800/50">
                  <TableHead className="text-slate-300">Aluno</TableHead>
                  <TableHead className="text-slate-300">Valor</TableHead>
                  <TableHead className="text-slate-300">Vencimento</TableHead>
                  <TableHead className="text-slate-300">Status</TableHead>
                  <TableHead className="text-slate-300">
                    Último Pagamento
                  </TableHead>
                  <TableHead className="text-right text-slate-300">
                    Ações
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-slate-400"
                    >
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow
                      key={payment.userId}
                      className="border-[#C2A537]/10 hover:bg-slate-800/30"
                    >
                      <TableCell className="font-medium text-white">
                        {payment.studentName}
                      </TableCell>
                      <TableCell className="text-[#C2A537]">
                        {payment.monthlyFeeValue.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        Dia {payment.dueDate}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={payment.paid ? "default" : "destructive"}
                          className={
                            payment.paid
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-red-600 hover:bg-red-700"
                          }
                        >
                          {payment.paid ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {payment.lastPaymentDate
                          ? new Date(
                              payment.lastPaymentDate,
                            ).toLocaleDateString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payment.paid ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleGenerateReceipt(payment.userId)
                                }
                                disabled={processingId === payment.userId}
                                className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537]/10"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                Recibo
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleUpdateStatus(payment.userId, false)
                                }
                                disabled={processingId === payment.userId}
                                className="border-red-500 text-red-400 hover:bg-red-500/10"
                              >
                                Marcar Pendente
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleUpdateStatus(payment.userId, true)
                              }
                              disabled={processingId === payment.userId}
                              className="border-green-500 text-green-400 hover:bg-green-500/10"
                            >
                              Marcar Pago
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
