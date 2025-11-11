"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  CreditCard,
  DollarSign,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getMyPaymentStatusAction,
  payMonthlyFeeAction,
} from "@/actions/user/pay-monthly-fee-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PaymentStatus {
  paid: boolean;
  monthlyFeeValue: number;
  dueDate: number;
  lastPaymentDate: string | null;
  paymentMethod: string;
}

export default function PaymentPage() {
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<
    | "pix"
    | "cartao_credito"
    | "cartao_debito"
    | "dinheiro"
    | "transferencia"
    | ""
  >("");
  const [transactionId, setTransactionId] = useState<string>("");
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [nextDueDate, setNextDueDate] = useState<string | null>(null);

  const loadPaymentStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMyPaymentStatusAction();
      if (result.success && result.data) {
        setPaymentStatus(result.data);
      } else {
        setError(result.error || "Erro ao carregar status de pagamento");
      }
    } catch {
      setError("Erro ao carregar dados de pagamento");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPaymentStatus();
  }, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentMethod) {
      setError("Selecione um método de pagamento");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const result = await payMonthlyFeeAction({
        paymentMethod,
        transactionId: transactionId || undefined,
      });

      if (result.success && result.paymentData) {
        setSuccess(true);
        setNextDueDate(result.paymentData.nextDueDate);
        // Recarregar status após 2 segundos
        setTimeout(() => {
          loadPaymentStatus();
        }, 2000);
      } else {
        setError(result.error || "Erro ao processar pagamento");
      }
    } catch {
      setError("Erro ao processar pagamento");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto p-4 lg:p-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <p className="text-lg text-[#C2A537]">
              Carregando dados de pagamento...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !paymentStatus) {
    return (
      <div className="min-h-screen bg-linear-to-b from-gray-900 to-black text-white">
        <div className="container mx-auto p-4 lg:p-8">
          <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="w-full max-w-md border-red-600 bg-red-900/30">
              <CardContent className="p-6 text-center">
                <XCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
                <p className="text-red-400">{error}</p>
                <Button asChild className="mt-4" variant="outline">
                  <Link href="/user/dashboard">Voltar ao Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link href="/user/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#C2A537]">Pagamentos</h1>
              <p className="text-gray-400">Gerencie sua mensalidade</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Status de Pagamento */}
          <Card className="border-gray-700 bg-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-[#C2A537]" />
                Status da Mensalidade
              </CardTitle>
              <CardDescription>Situação atual do seu pagamento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Atual */}
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <div className="flex items-center gap-2">
                    {paymentStatus?.paid ? (
                      <>
                        <CheckCircle2 className="h-5 w-5 text-green-400" />
                        <span className="font-semibold text-green-400">
                          Pago
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-5 w-5 text-red-400" />
                        <span className="font-semibold text-red-400">
                          Pendente
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Valor da Mensalidade */}
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Valor:</span>
                  <span className="text-2xl font-bold text-[#C2A537]">
                    {paymentStatus?.monthlyFeeValue.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              {/* Data de Vencimento */}
              <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Vencimento:</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-semibold text-white">
                      Dia {paymentStatus?.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Último Pagamento */}
              {paymentStatus?.lastPaymentDate && (
                <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Último Pagamento:</span>
                    <span className="text-white">
                      {new Date(
                        paymentStatus.lastPaymentDate,
                      ).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {paymentStatus.paymentMethod && (
                    <div className="mt-2 flex items-center justify-between border-t border-gray-700 pt-2">
                      <span className="text-sm text-gray-400">Método:</span>
                      <span className="text-sm text-white capitalize">
                        {paymentStatus.paymentMethod.replace("_", " ")}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Formulário de Pagamento */}
          <Card className="border-gray-700 bg-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <CreditCard className="h-5 w-5 text-[#C2A537]" />
                Realizar Pagamento
              </CardTitle>
              <CardDescription>
                {paymentStatus?.paid
                  ? "Você já está em dia este mês"
                  : "Escolha o método e confirme o pagamento"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="rounded-lg border border-green-600 bg-green-900/30 p-6 text-center">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-400" />
                  <h3 className="mb-2 text-xl font-bold text-green-400">
                    Pagamento Confirmado!
                  </h3>
                  <p className="mb-4 text-gray-300">
                    Sua mensalidade foi registrada com sucesso.
                  </p>
                  {nextDueDate && (
                    <div className="rounded-lg bg-gray-900/50 p-4">
                      <p className="mb-1 text-sm text-gray-400">
                        Próximo vencimento:
                      </p>
                      <p className="text-lg font-semibold text-[#C2A537]">
                        {new Date(nextDueDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}
                  <Button
                    onClick={() => {
                      setSuccess(false);
                      setPaymentMethod("");
                      setTransactionId("");
                    }}
                    className="mt-6"
                    variant="outline"
                  >
                    Fechar
                  </Button>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="space-y-6">
                  {/* Método de Pagamento */}
                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                    <Select
                      value={paymentMethod}
                      onValueChange={(value) =>
                        setPaymentMethod(
                          value as
                            | "pix"
                            | "cartao_credito"
                            | "cartao_debito"
                            | "dinheiro"
                            | "transferencia",
                        )
                      }
                      disabled={paymentStatus?.paid || processing}
                    >
                      <SelectTrigger
                        id="paymentMethod"
                        className="border-gray-600 bg-gray-900/50 text-white"
                      >
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent className="border-gray-600 bg-gray-800 text-white">
                        <SelectItem value="pix">PIX</SelectItem>
                        <SelectItem value="cartao_credito">
                          Cartão de Crédito
                        </SelectItem>
                        <SelectItem value="cartao_debito">
                          Cartão de Débito
                        </SelectItem>
                        <SelectItem value="dinheiro">Dinheiro</SelectItem>
                        <SelectItem value="transferencia">
                          Transferência Bancária
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ID da Transação (Opcional) */}
                  <div className="space-y-2">
                    <Label htmlFor="transactionId">
                      ID da Transação{" "}
                      <span className="text-gray-500">(Opcional)</span>
                    </Label>
                    <input
                      id="transactionId"
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Ex: PIX123456789"
                      disabled={paymentStatus?.paid || processing}
                      className="w-full rounded-md border border-gray-600 bg-gray-900/50 px-3 py-2 text-white placeholder:text-gray-500 focus:border-[#C2A537] focus:outline-none disabled:opacity-50"
                    />
                    <p className="text-xs text-gray-500">
                      Código da transação, comprovante ou referência
                    </p>
                  </div>

                  {/* Mensagem de Erro */}
                  {error && (
                    <div className="rounded-lg border border-red-600 bg-red-900/30 p-3">
                      <p className="text-sm text-red-400">{error}</p>
                    </div>
                  )}

                  {/* Botão de Confirmar */}
                  <Button
                    type="submit"
                    disabled={
                      paymentStatus?.paid || processing || !paymentMethod
                    }
                    className="w-full bg-[#C2A537] font-semibold text-black hover:bg-[#D4B644] disabled:opacity-50"
                  >
                    {processing
                      ? "Processando..."
                      : paymentStatus?.paid
                        ? "✅ Mensalidade Paga"
                        : "Confirmar Pagamento"}
                  </Button>

                  {paymentStatus?.paid && (
                    <p className="text-center text-sm text-green-400">
                      Você já está em dia este mês! 🎉
                    </p>
                  )}
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Informações Importantes */}
        <Card className="mt-6 border-blue-600 bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-blue-400">
              ℹ️ Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-300">
            <p>
              • O pagamento será confirmado imediatamente após o registro no
              sistema.
            </p>
            <p>
              • Em caso de PIX ou transferência, guarde o comprovante para
              eventuais verificações.
            </p>
            <p>• O próximo vencimento será calculado automaticamente.</p>
            <p>
              • Para alterar o método de pagamento padrão, entre em contato com
              a recepção.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
