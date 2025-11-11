"use client";

import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import {
  generateManualReceiptAction,
  getReceiptsLogAction,
  ManualReceiptData,
} from "@/actions/employee/manual-receipt-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { receiptsLogTable } from "@/db/schema";

type ReceiptLog = typeof receiptsLogTable.$inferSelect;

export function EmployeeManualReceiptTab() {
  const [students, setStudents] = useState<StudentFullData[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentFullData | null>(null);
  const [amountPaid, setAmountPaid] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [referenceMonth, setReferenceMonth] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<{
    receiptNumber: string;
    studentName: string;
    studentCpf: string;
    studentEmail: string;
    amountPaid: number;
    paymentDate: string;
    paymentMethod: string;
    referenceMonth: string;
    generatedAt: string;
    notes?: string;
  } | null>(null);
  const [receiptsLog, setReceiptsLog] = useState<ReceiptLog[]>([]);

  useEffect(() => {
    loadStudents();
    loadReceiptsLog();
  }, []);

  const loadStudents = async () => {
    try {
      const result = await getAllStudentsFullDataAction();
      setStudents(result);
    } catch {
      console.error("Erro ao carregar alunos");
    }
  };

  const loadReceiptsLog = async () => {
    try {
      const result = await getReceiptsLogAction();
      if (result.success && result.data) {
        setReceiptsLog(result.data);
      }
    } catch {
      console.error("Erro ao carregar histórico");
    }
  };

  const handleGenerateReceipt = async () => {
    if (!selectedStudent) {
      alert("Selecione um aluno");
      return;
    }

    if (!amountPaid || !paymentDate || !paymentMethod || !referenceMonth) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const receiptInput: ManualReceiptData = {
        studentUserId: selectedStudent.userId,
        studentName: selectedStudent.name,
        studentCpf: selectedStudent.cpf,
        studentEmail: selectedStudent.email,
        amountPaid: Math.round(parseFloat(amountPaid) * 100), // Converter para centavos
        paymentDate,
        paymentMethod,
        referenceMonth,
        notes: notes.trim() || undefined,
      };

      const result = await generateManualReceiptAction(receiptInput);

      if (result.success && result.data) {
        setReceiptData(result.data);
        setShowReceipt(true);

        // Limpar formulário
        setSelectedStudent(null);
        setAmountPaid("");
        setPaymentDate("");
        setPaymentMethod("");
        setReferenceMonth("");
        setNotes("");

        // Recarregar histórico
        loadReceiptsLog();
      } else {
        alert(result.error || "Erro ao gerar recibo");
      }
    } catch {
      alert("Erro ao gerar recibo. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const formatCurrency = (value: number) => {
    return (value / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // Modal de recibo para impressão
  if (showReceipt && receiptData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <Card className="w-full max-w-2xl bg-white text-black print:border-0 print:shadow-none">
          <CardContent className="space-y-6 p-8 print:p-12">
            {/* Header */}
            <div className="border-b-2 border-black pb-4 text-center">
              <h1 className="mb-2 text-3xl font-bold">JM Fitness Studio</h1>
              <p className="text-sm text-gray-600">
                Recibo de Pagamento - Mensalidade
              </p>
            </div>

            {/* Número do Recibo */}
            <div className="rounded-lg bg-gray-100 p-4 text-center">
              <p className="text-sm font-semibold text-gray-600">RECIBO Nº</p>
              <p className="text-2xl font-bold text-[#C2A537]">
                {receiptData.receiptNumber}
              </p>
              <Badge
                variant="outline"
                className="mt-2 border-blue-500 bg-blue-50 text-blue-700"
              >
                RECIBO MANUAL
              </Badge>
            </div>

            {/* Dados do Aluno */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">Dados do Aluno:</h3>
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div>
                  <p className="text-xs text-gray-500">Nome:</p>
                  <p className="font-medium">{receiptData.studentName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">CPF:</p>
                  <p className="font-medium">
                    {formatCPF(receiptData.studentCpf)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">E-mail:</p>
                  <p className="font-medium">{receiptData.studentEmail}</p>
                </div>
              </div>
            </div>

            {/* Dados do Pagamento */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800">
                Dados do Pagamento:
              </h3>
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-4">
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Valor Pago:</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(receiptData.amountPaid)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Data do Pagamento:</p>
                  <p className="font-medium">
                    {new Date(receiptData.paymentDate).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Forma de Pagamento:</p>
                  <p className="font-medium capitalize">
                    {receiptData.paymentMethod.replace("_", " ")}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-gray-500">Referência:</p>
                  <p className="font-medium">{receiptData.referenceMonth}</p>
                </div>
                {receiptData.notes && (
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500">Observações:</p>
                    <p className="text-sm">{receiptData.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-gray-500">
              <p>
                Recibo gerado automaticamente em{" "}
                {new Date(receiptData.generatedAt).toLocaleString("pt-BR")}
              </p>
              <p className="mt-1">
                JM Fitness Studio - Todos os direitos reservados
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 print:hidden">
              <Button
                onClick={() => window.print()}
                className="flex-1 bg-[#C2A537] text-black hover:bg-[#D4B547]"
              >
                <Download className="mr-2 h-4 w-4" />
                Imprimir/Salvar PDF
              </Button>
              <Button
                onClick={() => setShowReceipt(false)}
                variant="outline"
                className="flex-1"
              >
                Fechar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário de Geração de Recibo */}
      <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-50">
            <FileText className="h-5 w-5 text-[#C2A537]" />
            Gerar Recibo Manual
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Crie recibos personalizados com dados informados manualmente
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Seleção de Aluno */}
          <div className="space-y-2">
            <Label className="text-zinc-200">Selecione o Aluno</Label>
            <Select
              value={selectedStudent?.userId || ""}
              onValueChange={(value) => {
                const student = students.find((s) => s.userId === value);
                setSelectedStudent(student || null);
              }}
            >
              <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-50">
                <SelectValue placeholder="Escolha um aluno..." />
              </SelectTrigger>
              <SelectContent className="border-zinc-700 bg-zinc-800">
                {students.map((student) => (
                  <SelectItem key={student.userId} value={student.userId}>
                    {student.name} - {formatCPF(student.cpf)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedStudent && (
            <>
              {/* Valor Pago */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-zinc-200">
                  Valor Pago (R$) *
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="150.00"
                  className="border-zinc-700 bg-zinc-800 text-zinc-50"
                />
              </div>

              {/* Data do Pagamento */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-zinc-200">
                  Data do Pagamento *
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="border-zinc-700 bg-zinc-800 text-zinc-50"
                />
              </div>

              {/* Forma de Pagamento */}
              <div className="space-y-2">
                <Label className="text-zinc-200">Forma de Pagamento *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="border-zinc-700 bg-zinc-800 text-zinc-50">
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="border-zinc-700 bg-zinc-800">
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="cartao_credito">
                      Cartão de Crédito
                    </SelectItem>
                    <SelectItem value="cartao_debito">
                      Cartão de Débito
                    </SelectItem>
                    <SelectItem value="transferencia">
                      Transferência Bancária
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Referência (Mês/Ano) */}
              <div className="space-y-2">
                <Label htmlFor="reference" className="text-zinc-200">
                  Referência (Mês/Ano) *
                </Label>
                <Input
                  id="reference"
                  value={referenceMonth}
                  onChange={(e) => setReferenceMonth(e.target.value)}
                  placeholder="Novembro/2025"
                  className="border-zinc-700 bg-zinc-800 text-zinc-50"
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-zinc-200">
                  Observações (opcional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Adicione observações sobre este recibo..."
                  className="border-zinc-700 bg-zinc-800 text-zinc-50"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerateReceipt}
                disabled={loading}
                className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547]"
              >
                {loading ? "Gerando..." : "Gerar Recibo Manual"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Recibos */}
      <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-black">
        <CardHeader>
          <CardTitle className="text-zinc-50">
            Histórico de Recibos ({receiptsLog.length})
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Todos os recibos gerados ficam registrados aqui
          </p>
        </CardHeader>
        <CardContent>
          {receiptsLog.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              Nenhum recibo gerado ainda
            </p>
          ) : (
            <div className="space-y-2">
              {receiptsLog.slice(0, 10).map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3"
                >
                  <div className="flex-1">
                    <p className="font-medium text-zinc-200">
                      {receipt.receiptNumber}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {receipt.studentName} -{" "}
                      {formatCurrency(receipt.amountPaid)}
                    </p>
                    <p className="text-xs text-zinc-500">
                      Gerado por: {receipt.generatedByName} em{" "}
                      {new Date(receipt.createdAt).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      receipt.isManual
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        : "border-green-500/30 bg-green-500/10 text-green-400"
                    }
                  >
                    {receipt.isManual ? "Manual" : "Automático"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
