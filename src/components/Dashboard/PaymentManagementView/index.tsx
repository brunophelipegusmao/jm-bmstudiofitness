"use client";

import { format } from "date-fns";
import {
  Bell,
  CheckCircle,
  CreditCard,
  DollarSign,
  Mail,
  MessageSquare,
  Percent,
  QrCode,
  Receipt,
  Settings,
  Tag,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { createFinancialRecordAction } from "@/actions/admin/create-financial-action";
import { getStudentsPaymentsAction } from "@/actions/admin/get-students-payments-action";
import { sendFinancialReminderAction } from "@/actions/admin/send-financial-reminder-action";
import { markFinancialPaidAction } from "@/actions/admin/mark-financial-paid-action";
import { updateFinancialRecordAction } from "@/actions/admin/update-financial-record-action";
import {
  getPlansAdminAction,
  type Plan,
} from "@/actions/admin/plans-actions";
import { searchStudentsAction } from "@/actions/admin/search-students-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/payment-utils";
import type { StudentPaymentData } from "@/types/payments";

interface PaymentManagementViewProps {
  onBack: () => void;
}

export function PaymentManagementView({ onBack }: PaymentManagementViewProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [payments, setPayments] = useState<StudentPaymentData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending">(
    "all",
  );
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [startDateFilter, setStartDateFilter] = useState<string>("");
  const [endDateFilter, setEndDateFilter] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    userId: "",
    amount: "",
    dueDate: "",
    paymentMethod: "PIX",
    paid: false,
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [studentOptions, setStudentOptions] = useState<
    Array<{ id: string; name: string; email?: string }>
  >([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const exportableFields = [
    { key: "name", label: "Aluno" },
    { key: "email", label: "Email" },
    { key: "monthlyFeeValueInCents", label: "Valor (R$)" },
    { key: "dueDate", label: "Vencimento" },
    { key: "paymentMethod", label: "Método" },
    { key: "paid", label: "Status" },
    { key: "lastPaymentDate", label: "Último pagamento" },
  ] as const;
  const [selectedFields, setSelectedFields] = useState<string[]>(
    exportableFields.map((f) => f.key),
  );
  const [editingPayment, setEditingPayment] = useState<StudentPaymentData | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    amount: "",
    dueDate: "",
    paymentMethod: "",
    paid: false,
  });
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const data = await getStudentsPaymentsAction({ includePaid: true });
      setPayments(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro ao carregar pagamentos";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadPayments();
  }, []);

  const loadPlans = async () => {
    setLoadingPlans(true);
    const result = await getPlansAdminAction();
    if (result.success && result.data) {
      setPlans(result.data);
    }
    setLoadingPlans(false);
  };

  useEffect(() => {
    void loadPlans();
  }, []);

  // Buscar alunos para autocomplete de cobrança
  useEffect(() => {
    const term = studentSearch.trim();
    if (!term || term.length < 2) {
      setStudentOptions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        setLoadingStudents(true);
        const result = await searchStudentsAction({ query: term });
        const opts =
          result?.students?.map((s) => ({
            id: s.id,
            name: s.name,
            email: s.email,
          })) ?? [];
        setStudentOptions(opts);
      } catch (error) {
        console.error(error);
      } finally {
        setLoadingStudents(false);
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [studentSearch]);

  const paymentSections = [
    {
      id: "gateway",
      title: "Gateway de Pagamento",
      description: "Integração com PIX, cartão e boleto",
      icon: CreditCard,
      color: "from-blue-600 to-cyan-500",
      features: [
        "Pagamento via PIX instantâneo",
        "Cartão de crédito e débito",
        "Boleto bancário",
        "Link de pagamento",
      ],
    },
    {
      id: "automation",
      title: "Cobrança Automática",
      description: "Lembretes por email e WhatsApp",
      icon: Bell,
      color: "from-orange-600 to-amber-500",
      features: [
        "Notificações automáticas",
        "Lembretes personalizados",
        "Escalonamento de cobrança",
        "Relatório de inadimplência",
      ],
    },
    {
      id: "plans",
      title: "Planos e Promoções",
      description: "Gestão de diferentes modalidades",
      icon: Tag,
      color: "from-purple-600 to-violet-500",
      features: [
        "Planos personalizados",
        "Promoções sazonais",
        "Descontos automáticos",
        "Gestão de modalidades",
      ],
    },
  ];

  const pendingPayments = payments.filter((p) => !p.paid);
  const paidPayments = payments.filter((p) => p.paid);
  const sumAmount = (items: StudentPaymentData[]) =>
    items.reduce(
      (total, item) =>
        total + (item.monthlyFeeValueInCents ?? item.planValue ?? 0),
      0,
    );

  const exportCsv = (dataset: StudentPaymentData[]) => {
    const rows = [
      exportableFields
        .filter((f) => selectedFields.includes(f.key))
        .map((f) => f.label),
      ...dataset.map((p) =>
        exportableFields
          .filter((f) => selectedFields.includes(f.key))
          .map((f) => {
            switch (f.key) {
              case "monthlyFeeValueInCents":
                return (p.monthlyFeeValueInCents ?? p.planValue ?? 0) / 100;
              case "dueDate":
                return typeof p.dueDate === "number"
                  ? `Dia ${p.dueDate}`
                  : p.dueDate instanceof Date
                    ? format(p.dueDate, "dd/MM/yyyy")
                    : "";
              case "paid":
                return p.paid ? "Pago" : "Pendente";
              case "paymentMethod":
                return (p as StudentPaymentData & { paymentMethod?: string })
                  .paymentMethod ?? "";
              case "lastPaymentDate":
                return p.lastPaymentDate
                  ? format(p.lastPaymentDate, "dd/MM/yyyy")
                  : "";
              default:
                return (p as Record<string, unknown>)[f.key] ?? "";
            }
          }),
      ),
    ];
    const csv = rows.map((r) => r.join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cobrancas.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPdf = (dataset: StudentPaymentData[]) => {
    const doc = new jsPDF();
    const head = [
      exportableFields
        .filter((f) => selectedFields.includes(f.key))
        .map((f) => f.label),
    ];
    const body = dataset.map((p) =>
      exportableFields
        .filter((f) => selectedFields.includes(f.key))
        .map((f) => {
          switch (f.key) {
            case "monthlyFeeValueInCents":
              return formatCurrency(p.monthlyFeeValueInCents ?? p.planValue);
            case "dueDate":
              return typeof p.dueDate === "number"
                ? `Dia ${p.dueDate}`
                : p.dueDate instanceof Date
                  ? format(p.dueDate, "dd/MM/yyyy")
                  : "";
            case "paid":
              return p.paid ? "Pago" : "Pendente";
            case "paymentMethod":
              return (p as StudentPaymentData & { paymentMethod?: string })
                .paymentMethod ?? "";
            case "lastPaymentDate":
              return p.lastPaymentDate
                ? format(p.lastPaymentDate, "dd/MM/yyyy")
                : "";
            default:
              return (p as Record<string, unknown>)[f.key] ?? "";
          }
        }),
    );
    autoTable(doc, {
      head,
      body,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [194, 165, 55] },
    });
    doc.save("cobrancas.pdf");
  };

  const formatDueDate = (due: StudentPaymentData["dueDate"]) => {
    if (due instanceof Date) return format(due, "dd/MM");
    if (typeof due === "number") return `Dia ${due.toString().padStart(2, "0")}`;
    return String(due ?? "");
  };

  const matchesDateRange = (payment: StudentPaymentData) => {
    if (!startDateFilter && !endDateFilter) return true;
    const referenceDate =
      payment.lastPaymentDate instanceof Date
        ? payment.lastPaymentDate
        : payment.paymentDate instanceof Date
          ? payment.paymentDate
          : null;
    if (!referenceDate) return false;
    const iso = referenceDate.toISOString().split("T")[0];
    if (startDateFilter && iso < startDateFilter) return false;
    if (endDateFilter && iso > endDateFilter) return false;
    return true;
  };

  const filteredPayments = payments.filter((p) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm =
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.email ?? "").toLowerCase().includes(term);
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "paid"
          ? p.paid
          : !p.paid;
    const paymentMethod =
      (p as StudentPaymentData & { paymentMethod?: string }).paymentMethod;
    const matchesMethod =
      methodFilter === "all"
        ? true
        : paymentMethod
          ? paymentMethod === methodFilter
          : true;
    return matchesTerm && matchesStatus && matchesMethod && matchesDateRange(p);
  });

  const handleMarkPaid = async (id: string) => {
    setMarkingId(id);
    try {
      const result = await markFinancialPaidAction(id);
      if (!result.success) {
        throw new Error(result.error);
      }
      setPayments((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                paid: true,
                isUpToDate: true,
                paymentDate: new Date(),
                lastPaymentDate: new Date(),
              }
            : p,
        ),
      );
      toast.success("Pagamento marcado como pago");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao marcar pagamento";
      toast.error(message);
    } finally {
      setMarkingId(null);
    }
  };

  const handleCreateCharge = async () => {
    if (!createForm.userId || !createForm.amount || !createForm.dueDate) {
      toast.error("Preencha usuário, valor e vencimento");
      return;
    }
    const amountCents = Math.round(parseFloat(createForm.amount) * 100);
    if (Number.isNaN(amountCents)) {
      toast.error("Valor inválido");
      return;
    }
    const due = Number(createForm.dueDate);
    if (!due || due < 1 || due > 31) {
      toast.error("Vencimento deve ser de 1 a 31");
      return;
    }
    const res = await createFinancialRecordAction({
      userId: createForm.userId,
      monthlyFeeValue: amountCents,
      dueDate: due,
      paymentMethod: createForm.paymentMethod,
      paid: createForm.paid,
      lastPaymentDate: createForm.paid
        ? new Date().toISOString().split("T")[0]
        : undefined,
    });
    if (!res.success) {
      toast.error(res.error ?? "Erro ao criar cobrança");
      return;
    }
    toast.success("Cobrança criada");
    setCreateForm({
      userId: "",
      amount: "",
      dueDate: "",
      paymentMethod: "PIX",
      paid: false,
    });
    setShowCreateForm(false);
    void loadPayments();
  };

  const handleSaveEdit = async () => {
    if (!editingPayment) return;
    const payload: Record<string, unknown> = {};
    if (editForm.amount) {
      const cents = Math.round(parseFloat(editForm.amount) * 100);
      if (Number.isNaN(cents)) {
        toast.error("Valor inválido");
        return;
      }
      payload.monthlyFeeValue = cents;
    }
    if (editForm.dueDate) {
      const due = Number(editForm.dueDate);
      if (!due || due < 1 || due > 31) {
        toast.error("Vencimento deve ser de 1 a 31");
        return;
      }
      payload.dueDate = due;
    }
    if (editForm.paymentMethod) payload.paymentMethod = editForm.paymentMethod;
    payload.paid = editForm.paid;
    payload.lastPaymentDate = editForm.paid
      ? new Date().toISOString().split("T")[0]
      : null;

    const res = await updateFinancialRecordAction(editingPayment.id, payload);
    if (!res.success) {
      toast.error(res.error ?? "Erro ao salvar cobrança");
      return;
    }
    toast.success("Cobrança atualizada");
    setEditingPayment(null);
    void loadPayments();
  };

  const renderGatewaySection = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Pagamentos PIX
            </CardTitle>
            <QrCode className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">67%</div>
            <p className="text-xs text-green-400">
              Principal método de pagamento
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Cartão de Crédito
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">28%</div>
            <p className="text-xs text-blue-400">Parcelamento disponível</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">
              Boleto Bancário
            </CardTitle>
            <Receipt className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">5%</div>
            <p className="text-xs text-orange-400">Vencimento flexível</p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Taxa de Aprovação
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">98.5%</div>
            <p className="text-xs text-[#C2A537]">Excelente performance</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Wallet className="h-5 w-5" />
              Métodos de Pagamento Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-900/20 p-4">
                <div className="flex items-center gap-3">
                  <QrCode className="h-5 w-5 text-green-400" />
                  <div>
                    <h4 className="font-medium text-white">PIX Instantâneo</h4>
                    <p className="text-sm text-green-400">Taxa: 0.99%</p>
                  </div>
                </div>
                <div className="rounded bg-green-600 px-3 py-1 text-xs text-white">
                  Ativo
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-400" />
                  <div>
                    <h4 className="font-medium text-white">
                      Cartão de Crédito
                    </h4>
                    <p className="text-sm text-blue-400">Taxa: 3.49%</p>
                  </div>
                </div>
                <div className="rounded bg-blue-600 px-3 py-1 text-xs text-white">
                  Ativo
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-900/20 p-4">
                <div className="flex items-center gap-3">
                  <Receipt className="h-5 w-5 text-orange-400" />
                  <div>
                    <h4 className="font-medium text-white">Boleto Bancário</h4>
                    <p className="text-sm text-orange-400">Taxa: R$ 2,99</p>
                  </div>
                </div>
                <div className="rounded bg-orange-600 px-3 py-1 text-xs text-white">
                  Ativo
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <DollarSign className="h-5 w-5" />
              Configurações de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Vencimento padrão
                </span>
                <span className="text-sm font-medium text-white">
                  Todo dia 10
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Juros de mora</span>
                <span className="text-sm font-medium text-white">
                  2% ao mês
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Multa por atraso</span>
                <span className="text-sm font-medium text-white">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">
                  Desconto pontualidade
                </span>
                <span className="text-sm font-medium text-[#C2A537]">5%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderAutomationSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Emails Enviados
            </CardTitle>
            <Mail className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">127</div>
            <p className="text-xs text-blue-400">Este mês</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              WhatsApp Enviados
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">89</div>
            <p className="text-xs text-green-400">Este mês</p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Taxa de Resposta
            </CardTitle>
            <Zap className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">73%</div>
            <p className="text-xs text-[#C2A537]">Média geral</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">
              Recuperação
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">67%</div>
            <p className="text-xs text-orange-400">Pagamentos recuperados</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Bell className="h-5 w-5" />
              Configurações de Cobrança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-400" />
                  <h4 className="font-medium text-blue-400">
                    Lembretes por Email
                  </h4>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• 3 dias antes do vencimento</p>
                  <p>• No dia do vencimento</p>
                  <p>• 7 dias após vencimento</p>
                  <p>• 15 dias após vencimento</p>
                </div>
              </div>

              <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-4">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-green-400" />
                  <h4 className="font-medium text-green-400">
                    Notificações WhatsApp
                  </h4>
                </div>
                <div className="space-y-2 text-sm text-slate-300">
                  <p>• 1 dia antes do vencimento</p>
                  <p>• 3 dias após vencimento</p>
                  <p>• 10 dias após vencimento</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Settings className="h-5 w-5" />
              Templates de Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                <h5 className="text-sm font-medium text-white">
                  Lembrete Amigável
                </h5>
                <p className="text-xs text-slate-400">
                  &quot;Olá! Sua mensalidade vence amanhã. Conte conosco!&quot;
                </p>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                <h5 className="text-sm font-medium text-white">
                  Vencimento Hoje
                </h5>
                <p className="text-xs text-slate-400">
                  &quot;Sua mensalidade vence hoje. Pague pelo PIX e ganhe 5% de
                  desconto!&quot;
                </p>
              </div>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                <h5 className="text-sm font-medium text-white">Em Atraso</h5>
                <p className="text-xs text-slate-400">
                  &quot;Sua mensalidade está em atraso. Regularize para manter
                  seus treinos.&quot;
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPlansSection = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Planos Ativos
            </CardTitle>
            <Tag className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">
              {loadingPlans ? "..." : plans.filter((p) => p.active).length}
            </div>
            <p className="text-xs text-blue-400">Diferentes modalidades</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Populares
            </CardTitle>
            <Percent className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">
              {loadingPlans
                ? "..."
                : plans.filter((p) => p.popular && p.active).length}
            </div>
            <p className="text-xs text-green-400">Destacados no app</p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Plano em destaque
            </CardTitle>
            <Users className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">
              {loadingPlans
                ? "..."
                : plans.find((p) => p.popular && p.active)?.title ||
                  plans.find((p) => p.active)?.title ||
                  "—"}
            </div>
            <p className="text-xs text-[#C2A537]">Melhor rankeado</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/50 bg-purple-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">
              Ticket médio
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-300">
              {loadingPlans
                ? "..."
                : (() => {
                    const active = plans.filter((p) => p.active);
                    const avg =
                      active.reduce((acc, p) => acc + p.priceValue, 0) /
                      (active.length || 1);
                    return formatCurrency(avg || 0);
                  })()}
            </div>
            <p className="text-xs text-purple-400">Por aluno/mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Tag className="h-5 w-5" />
              Planos Disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingPlans ? (
                <p className="text-slate-400">Carregando planos...</p>
              ) : plans.length === 0 ? (
                <p className="text-slate-400">Nenhum plano cadastrado.</p>
              ) : (
                plans
                  .filter((p) => p.active)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4"
                    >
                      <div>
                        <h4 className="font-medium text-white">{plan.title}</h4>
                        <p className="text-sm text-slate-400">
                          {plan.description || "Plano ativo"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-[#C2A537]">
                          {formatCurrency(plan.priceValue)}
                        </p>
                        <p className="text-xs text-slate-400">
                          {plan.durationLabel || `${plan.durationDays} dias`}
                        </p>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Percent className="h-5 w-5" />
              Promoções
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-slate-300">
              <p>
                Utilize os campos de destaque/popularidade dos planos para
                sinalizar ofertas no app e comunicações.
              </p>
              <p className="text-slate-400">
                Ativos em destaque:{" "}
                {plans.filter((p) => p.popular && p.active).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (selectedSection) {
      case "gateway":
        return renderGatewaySection();
      case "automation":
        return renderAutomationSection();
      case "plans":
        return renderPlansSection();
      default:
        return null;
    }
  };

  if (selectedSection) {
    const section = paymentSections.find((s) => s.id === selectedSection);
    return (
      <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#C2A537]">
              {section?.title}
            </h2>
            <p className="text-slate-400">{section?.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedSection(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              ← Voltar à Gestão
            </Button>
            <Button
              variant="outline"
              onClick={onBack}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              ← Dashboard Principal
            </Button>
          </div>
        </div>

        {renderSectionContent()}
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Gestão de Pagamentos
          </h2>
          <p className="text-slate-400">
            Sistema completo de gestão financeira e cobrança
          </p>
        </div>
        <Button
          variant="outline"
          onClick={onBack}
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          ← Voltar
        </Button>
      </div>

      <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <CardTitle className="text-[#C2A537]">Cobranças em tempo real</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadPayments()}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Atualizar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
            <Card className="border-red-500/50 bg-red-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-400">
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-300">
                  {loading
                    ? "..."
                    : formatCurrency(sumAmount(pendingPayments) || 0)}
                </div>
                <p className="text-xs text-red-400">
                  {pendingPayments.length} pagamentos
                </p>
              </CardContent>
            </Card>
            <Card className="border-green-500/50 bg-green-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400">
                  Recebidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-300">
                  {loading
                    ? "..."
                    : formatCurrency(sumAmount(paidPayments) || 0)}
                </div>
                <p className="text-xs text-green-400">
                  {paidPayments.length} pagamentos
                </p>
              </CardContent>
            </Card>
            <Card className="border-blue-500/50 bg-blue-900/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-400">
                  Total listado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-300">
                  {loading
                    ? "..."
                    : formatCurrency(sumAmount(payments) || 0)}
                </div>
                <p className="text-xs text-blue-400">
                  {payments.length} registros
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <input
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              placeholder="Buscar por nome ou email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | "paid" | "pending")
              }
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="paid">Pagos</option>
            </select>
            <select
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
            >
              <option value="all">Todos métodos</option>
              <option value="PIX">PIX</option>
              <option value="CARTAO_CREDITO">Cartão crédito</option>
              <option value="CARTAO_DEBITO">Cartão débito</option>
              <option value="DINHEIRO">Dinheiro</option>
              <option value="BOLETO">Boleto</option>
            </select>
            <input
              type="date"
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={startDateFilter}
              onChange={(e) => setStartDateFilter(e.target.value)}
            />
            <input
              type="date"
              className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              value={endDateFilter}
              onChange={(e) => setEndDateFilter(e.target.value)}
            />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExportModal((v) => !v)}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              {showExportModal ? "Fechar exportação" : "Exportar PDF/Excel"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv(filteredPayments)}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Exportar CSV (Excel)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportPdf(filteredPayments)}
              className="border-slate-600 text-slate-200 hover:bg-slate-800"
            >
              Exportar PDF
            </Button>
          </div>

          {showExportModal && (
            <div className="mt-3 rounded-lg border border-slate-700 bg-slate-800/50 p-4 text-sm text-slate-200">
              <p className="mb-2 text-[#C2A537]">Campos do relatório</p>
              <div className="grid gap-2 md:grid-cols-3">
                {exportableFields.map((field) => (
                  <label key={field.key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.key)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectedFields((prev) =>
                          checked
                            ? [...prev, field.key]
                            : prev.filter((f) => f !== field.key),
                        );
                      }}
                    />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Será usado o filtro atual e todos os alunos carregados (pagos e pendentes).
              </p>
            </div>
          )}

          <div className="mt-4 space-y-3 rounded-lg border border-slate-700 bg-slate-800/40 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-300">
                Nova cobrança manual ou editar existente
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateForm((v) => !v)}
                  className="border-slate-600 text-slate-200 hover:bg-slate-800"
                >
                  {showCreateForm ? "Fechar" : "Nova cobrança"}
                </Button>
                {editingPayment && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingPayment(null)}
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                  >
                    Cancelar edição
                  </Button>
                )}
              </div>
            </div>

            {showCreateForm && (
              <div className="grid gap-3 md:grid-cols-5">
                <input
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  placeholder="ID do aluno"
                  value={createForm.userId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, userId: e.target.value })
                  }
                />
                <input
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  placeholder="Valor (R$)"
                  type="number"
                  step="0.01"
                  value={createForm.amount}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, amount: e.target.value })
                  }
                />
                <input
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  placeholder="Vencimento (dia)"
                  type="number"
                  value={createForm.dueDate}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, dueDate: e.target.value })
                  }
                />
                <select
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  value={createForm.paymentMethod}
                  onChange={(e) =>
                    setCreateForm({
                      ...createForm,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="BOLETO">Boleto</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={createForm.paid}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, paid: e.target.checked })
                    }
                  />
                  <span>Pago</span>
                </div>
                <input
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white md:col-span-2"
                  placeholder="Buscar aluno por nome/email"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
                <select
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white md:col-span-3"
                  value={createForm.userId}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, userId: e.target.value })
                  }
                >
                  <option value="">
                    {loadingStudents ? "Carregando..." : "Selecione um aluno"}
                  </option>
                  {studentOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name} {opt.email ? `(${opt.email})` : ""}
                    </option>
                  ))}
                </select>
                <div className="md:col-span-5 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => void handleCreateCharge()}
                    className="bg-[#C2A537]/20 text-[#C2A537] hover:bg-[#C2A537]/30"
                  >
                    Salvar cobrança
                  </Button>
                </div>
              </div>
            )}

            {editingPayment && (
              <div className="grid gap-3 md:grid-cols-5">
                <input
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  placeholder="Valor (R$)"
                  type="number"
                  step="0.01"
                  value={editForm.amount}
                  onChange={(e) =>
                    setEditForm({ ...editForm, amount: e.target.value })
                  }
                />
                <input
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  placeholder="Vencimento (dia)"
                  type="number"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm({ ...editForm, dueDate: e.target.value })
                  }
                />
                <select
                  className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
                  value={editForm.paymentMethod}
                  onChange={(e) =>
                    setEditForm({ ...editForm, paymentMethod: e.target.value })
                  }
                >
                  <option value="">Manter método</option>
                  <option value="PIX">PIX</option>
                  <option value="CARTAO_CREDITO">Cartão de crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de débito</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="BOLETO">Boleto</option>
                </select>
                <div className="flex items-center gap-2 text-sm text-slate-200">
                  <input
                    type="checkbox"
                    checked={editForm.paid}
                    onChange={(e) =>
                      setEditForm({ ...editForm, paid: e.target.checked })
                    }
                  />
                  <span>Pago</span>
                </div>
                <div className="md:col-span-5 flex justify-end gap-2">
                  <Button
                    size="sm"
                    onClick={() => void handleSaveEdit()}
                    className="bg-[#C2A537]/20 text-[#C2A537] hover:bg-[#C2A537]/30"
                  >
                    Salvar edição
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingPayment(null)}
                    className="border-slate-600 text-slate-200 hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 overflow-x-auto rounded-lg border border-slate-700">
            <table className="min-w-full divide-y divide-slate-700 text-sm text-slate-200">
              <thead className="bg-slate-800/60 text-xs uppercase text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Aluno</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Valor</th>
                  <th className="px-4 py-3 text-left">Vencimento</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      Carregando pagamentos...
                    </td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                      Nenhum pagamento encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-white">
                        {payment.name || "Aluno"}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {payment.email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(
                          payment.monthlyFeeValueInCents ?? payment.planValue,
                        )}
                      </td>
                      <td className="px-4 py-3">{formatDueDate(payment.dueDate)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            payment.paid
                              ? "bg-green-900/40 text-green-400"
                              : "bg-orange-900/40 text-orange-300"
                          }`}
                        >
                          {payment.paid ? "Pago" : "Pendente"}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-y-2">
                        <div className="flex flex-wrap gap-2">
                          {!payment.paid ? (
                            <Button
                              size="sm"
                              disabled={markingId === payment.id}
                              onClick={() => void handleMarkPaid(payment.id)}
                              className="bg-[#C2A537]/20 text-[#C2A537] hover:bg-[#C2A537]/30"
                            >
                              {markingId === payment.id ? "Marcando..." : "Marcar pago"}
                            </Button>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Pago em{" "}
                              {payment.lastPaymentDate
                                ? format(payment.lastPaymentDate, "dd/MM/yyyy")
                                : "—"}
                            </span>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingPayment(payment);
                              setEditForm({
                                amount: payment.monthlyFeeValueInCents
                                  ? (payment.monthlyFeeValueInCents / 100).toString()
                                  : "",
                                dueDate:
                                  typeof payment.dueDate === "number"
                                    ? payment.dueDate.toString()
                                    : "",
                                paymentMethod: "",
                                paid: payment.paid,
                              });
                            }}
                            className="border-slate-600 text-slate-200 hover:bg-slate-800"
                          >
                            Editar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportCsv([payment])}
                            className="border-slate-600 text-slate-200 hover:bg-slate-800"
                          >
                            Exportar CSV
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void sendFinancialReminderAction(payment.id, "email").then(
                                (res) =>
                                  res.success
                                    ? toast.success("Lembrete por email enviado")
                                    : toast.error(res.error ?? "Erro ao enviar lembrete"),
                              )
                            }
                            className="border-slate-600 text-slate-200 hover:bg-slate-800"
                          >
                            Email
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              void sendFinancialReminderAction(payment.id, "whatsapp").then(
                                (res) =>
                                  res.success
                                    ? toast.success("Lembrete WhatsApp enviado")
                                    : toast.error(res.error ?? "Erro ao enviar lembrete"),
                              )
                            }
                            className="border-slate-600 text-slate-200 hover:bg-slate-800"
                          >
                            WhatsApp
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {paymentSections.map((section) => {
          const IconComponent = section.icon;
          return (
            <Card
              key={section.id}
              className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
              onClick={() => setSelectedSection(section.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#C2A537]">
                  <div
                    className={`rounded-lg bg-linear-to-br ${section.color} p-2`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <p className="text-sm text-slate-400">
                      {section.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {section.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-[#C2A537]" />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Clique para ver
                  </span>
                  <div className="rounded-full bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                    Disponível
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Preview dos dados principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Métodos Ativos
            </CardTitle>
            <CreditCard className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">3</div>
            <p className="text-xs text-blue-400">PIX, Cartão e Boleto</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Automação
            </CardTitle>
            <Bell className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">73%</div>
            <p className="text-xs text-green-400">Taxa de resposta</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/50 bg-purple-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">
              Planos Ativos
            </CardTitle>
            <Tag className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-300">7</div>
            <p className="text-xs text-purple-400">Diferentes modalidades</p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Eficiência
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">98.5%</div>
            <p className="text-xs text-[#C2A537]">Taxa de aprovação</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
