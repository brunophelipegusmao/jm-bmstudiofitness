import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Layers,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getExpensesAction } from "@/actions/admin/expenses-actions";
import { getExpensesOverviewAction } from "@/actions/admin/get-expenses-overview-action";
import { getFinancialReportsAction } from "@/actions/admin/get-financial-reports-action";
import { getPaymentDueDatesAction } from "@/actions/admin/get-payment-due-dates-action";
import {
  getStudentsPaymentsAction,
  type StudentPaymentData,
} from "@/actions/admin/get-students-payments-action";
import { sendFinancialReminderAction } from "@/actions/admin/send-financial-reminder-action";
import { ExpenseForm, ExpenseTable } from "@/components/Admin/ExpenseManager";
import type { Expense } from "@/components/Admin/ExpenseManager/types";
import { ReportsView } from "@/components/Dashboard/ReportsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/payment-utils";

type FinancialTabs = "alunos" | "estudio" | "geral" | "relatorios";

export function FinancialTab() {
  const [activeTab, setActiveTab] = useState<FinancialTabs>("alunos");
  const [overview, setOverview] = useState({
    totalRevenue: "R$ 0,00",
    activeStudents: 0,
    totalPending: "R$ 0,00",
    paymentRate: 0,
  });
  const [dueDates, setDueDates] = useState({
    dueToday: 0,
    dueNext7Days: 0,
    overdue: 0,
  });
  const [expensesOverview, setExpensesOverview] = useState({
    pending: {
      count: 0,
      totalInCents: 0,
      totalFormatted: "R$ 0,00",
    },
    paid: {
      count: 0,
      totalInCents: 0,
      totalFormatted: "R$ 0,00",
    },
  });
  const [expenseVersion, setExpenseVersion] = useState(0);
  const [studentPayments, setStudentPayments] = useState<StudentPaymentData[]>(
    [],
  );
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [studentStatusFilter, setStudentStatusFilter] = useState<
    "all" | "paid" | "pending"
  >("all");
  const [showReports, setShowReports] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [reportScope, setReportScope] = useState<
    "alunos" | "estudio" | "geral"
  >("alunos");
  const [reportFormat, setReportFormat] = useState<"pdf" | "excel">("pdf");
  const studentFields = [
    "name",
    "email",
    "monthlyFeeValueInCents",
    "dueDate",
    "paymentMethod",
    "paid",
    "lastPaymentDate",
    "planName",
  ] as const;
  const expenseFields = [
    "description",
    "category",
    "amountInCents",
    "dueDate",
    "paid",
    "paymentDate",
    "paymentMethod",
  ] as const;
  const [selectedStudentFields, setSelectedStudentFields] = useState<string[]>([
    ...studentFields,
  ]);
  const [selectedExpenseFields, setSelectedExpenseFields] = useState<string[]>([
    ...expenseFields,
  ]);
  const [reminderChoice, setReminderChoice] = useState<Record<string, string>>(
    {},
  );
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadOverviewData();
    loadDueDatesData();
    loadExpensesOverview();
  }, []);

  useEffect(() => {
    if (activeTab !== "alunos" && activeTab !== "relatorios") return;
    const fetchPayments = async () => {
      setLoadingPayments(true);
      const data = await getStudentsPaymentsAction({ includePaid: true });
      setStudentPayments(data);
      setLoadingPayments(false);
    };
    void fetchPayments();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== "estudio" && activeTab !== "relatorios") return;
    const fetchExpenses = async () => {
      const result = await getExpensesAction();
      setExpenses(result.expenses ?? []);
    };
    void fetchExpenses();
  }, [activeTab, expenseVersion]);

  const loadOverviewData = async () => {
    try {
      const result = await getFinancialReportsAction();

      if (result.success && result.data) {
        const o = result.data.overview ?? {
          totalRevenue: "R$ 0,00",
          activeStudents: 0,
          pendingPayments: "R$ 0,00",
          paymentRate: 0,
        };
        setOverview({
          totalRevenue: o.totalRevenue ?? "R$ 0,00",
          activeStudents: o.activeStudents ?? 0,
          totalPending: o.pendingPayments ?? "R$ 0,00",
          paymentRate: o.paymentRate ?? 0,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar dados financeiros:", error);
    }
  };

  const loadDueDatesData = async () => {
    try {
      const result = await getPaymentDueDatesAction();

      if (result.success && result.data) {
        setDueDates(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar vencimentos:", error);
    }
  };

  const loadExpensesOverview = async () => {
    try {
      const result = await getExpensesOverviewAction();

      if (result.success && result.data) {
        setExpensesOverview(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar visão geral de despesas:", error);
    }
  };

  const renderAlunos = () => {
    const paid = studentPayments.filter((s) => s.paid);
    const pending = studentPayments.filter((s) => !s.paid);
    const filteredStudents =
      studentStatusFilter === "all"
        ? studentPayments
        : studentStatusFilter === "paid"
          ? paid
          : pending;
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-green-500/50 bg-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">
                Receita Mensal
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300">
                {overview.totalRevenue}
              </div>
              <p className="text-xs text-green-400">Total de mensalidades</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/50 bg-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">
                Alunos Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">
                {overview.activeStudents}
              </div>
              <p className="text-xs text-blue-400">Com pagamento em dia</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/50 bg-red-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">
                Inadimplência
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-300">
                {overview.totalPending}
              </div>
              <p className="text-xs text-red-400">Pagamentos pendentes</p>
            </CardContent>
          </Card>

          <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#C2A537]">
                Taxa de Conversão
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-[#C2A537]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#C2A537]">
                {overview.paymentRate}%
              </div>
              <p className="text-xs text-[#C2A537]">Pagamentos no prazo</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-lg text-[#C2A537]">
              Alunosem dia x em atraso
            </CardTitle>
            <div className="flex gap-2 text-sm text-slate-300">
              <span>
                Em dia:{" "}
                <strong className="text-green-400">{paid.length}</strong>
              </span>
              <span>
                Pendentes:{" "}
                <strong className="text-orange-400">{pending.length}</strong>
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-2">
              {[
                { id: "all", label: "Todos" },
                { id: "paid", label: "Em dia" },
                { id: "pending", label: "Em atraso" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    setStudentStatusFilter(opt.id as "all" | "paid" | "pending")
                  }
                  className={`rounded-md px-3 py-1 text-xs font-medium ${
                    studentStatusFilter === opt.id
                      ? "bg-[#C2A537] text-black"
                      : "border border-slate-700 text-slate-200 hover:bg-slate-800"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-700 text-sm text-slate-200">
                <thead className="bg-slate-900/60 text-xs text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">Aluno</th>
                    <th className="px-4 py-3 text-left">Email / Cobrança</th>
                    <th className="px-4 py-3 text-left">Valor</th>
                    <th className="px-4 py-3 text-left">Vencimento</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {loadingPayments ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-slate-400"
                      >
                        Carregando alunos...
                      </td>
                    </tr>
                  ) : studentPayments.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-slate-400"
                      >
                        Nenhuma cobrança encontrada.
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-slate-400"
                      >
                        Nenhum aluno para este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3">{p.name || "Aluno"}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            <span>{p.email || "—"}</span>
                            <div className="flex flex-wrap items-center gap-2">
                              <select
                                className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-white"
                                value={reminderChoice[p.id] ?? "upcoming"}
                                onChange={(e) =>
                                  setReminderChoice((prev) => ({
                                    ...prev,
                                    [p.id]: e.target.value,
                                  }))
                                }
                              >
                                <option value="upcoming">
                                  Mensalidade próxima do vencimento
                                </option>
                                <option value="today">
                                  Mensalidade vence hoje
                                </option>
                                <option value="blocked">
                                  Em atraso (check-in bloqueado)
                                </option>
                              </select>
                              <button
                                onClick={() => {
                                  setSendingReminder(p.id);
                                  const template = (reminderChoice[p.id] ??
                                    "upcoming") as
                                    | "upcoming"
                                    | "today"
                                    | "blocked";
                                  void sendFinancialReminderAction(
                                    p.id,
                                    "email",
                                    template,
                                  ).then((res) => {
                                    if (res.success) {
                                      alert("Cobrança enviada (simulada).");
                                    } else {
                                      alert(
                                        res.error ?? "Erro ao enviar cobrança.",
                                      );
                                    }
                                    setSendingReminder(null);
                                  });
                                }}
                                disabled={sendingReminder === p.id}
                                className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-100 hover:bg-slate-800"
                              >
                                {sendingReminder === p.id
                                  ? "Enviando..."
                                  : "Enviar cobrança"}
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {p.formattedValue ??
                            `R$ ${(
                              (p.monthlyFeeValueInCents ?? p.planValue ?? 0) /
                              100
                            )
                              .toFixed(2)
                              .replace(".", ",")}`}
                        </td>
                        <td className="px-4 py-3">
                          {typeof p.dueDate === "number"
                            ? `Dia ${p.dueDate}`
                            : p.dueDate instanceof Date
                              ? p.dueDate.toLocaleDateString("pt-BR")
                              : ""}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2 py-1 text-xs ${
                              p.paid
                                ? "bg-green-900/40 text-green-400"
                                : "bg-orange-900/40 text-orange-300"
                            }`}
                          >
                            {p.paid ? "Em dia" : "Em atraso"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEstudio = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Despesas do Estúdio</h2>
        <div className="text-sm text-slate-300">
          Pendentes:{" "}
          <span className="text-orange-400">
            {expensesOverview.pending.count} (
            {expensesOverview.pending.totalFormatted})
          </span>{" "}
          · Pagas:{" "}
          <span className="text-green-400">
            {expensesOverview.paid.count} (
            {expensesOverview.paid.totalFormatted})
          </span>
        </div>
      </div>
      <ExpenseForm onCreated={() => setExpenseVersion((v) => v + 1)} />
      <ExpenseTable key={expenseVersion} />
    </div>
  );

  const renderGeral = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Receita (30 dias)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">
              {overview.totalRevenue}
            </div>
            <p className="text-xs text-green-400">Mensalidades recebidas</p>
          </CardContent>
        </Card>
        <Card className="border-red-500/50 bg-red-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">
              Inadimplência
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">
              {overview.totalPending}
            </div>
            <p className="text-xs text-red-400">Pagamentos pendentes</p>
          </CardContent>
        </Card>
        <Card className="border-orange-500/50 bg-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">
              Despesas Pendentes
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">
              {expensesOverview.pending.totalFormatted}
            </div>
            <p className="text-xs text-orange-400">
              {expensesOverview.pending.count} itens
            </p>
          </CardContent>
        </Card>
        <Card className="border-emerald-500/50 bg-emerald-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-400">
              Despesas Pagas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-300">
              {expensesOverview.paid.totalFormatted}
            </div>
            <p className="text-xs text-emerald-400">
              {expensesOverview.paid.count} itens
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-700/60 bg-slate-800/40">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#C2A537]">
            Vencimentos e Acompanhamento
          </CardTitle>
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <span>Hoje: {dueDates.dueToday}</span>
            <span>Próx. 7 dias: {dueDates.dueNext7Days}</span>
            <span>Em atraso: {dueDates.overdue}</span>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-slate-200">
          <p className="text-slate-400">
            Use os filtros para priorizar cobranças e despesas. O cartão acima
            resume a saúde financeira do período.
          </p>
        </CardContent>
      </Card>
    </div>
  );

  const renderRelatorios = () => {
    if (showReports) {
      return <ReportsView onBack={() => setShowReports(false)} />;
    }

    const toggleField = (field: string, type: "student" | "expense") => {
      if (type === "student") {
        setSelectedStudentFields((prev) =>
          prev.includes(field)
            ? prev.filter((f) => f !== field)
            : [...prev, field],
        );
      } else {
        setSelectedExpenseFields((prev) =>
          prev.includes(field)
            ? prev.filter((f) => f !== field)
            : [...prev, field],
        );
      }
    };

    const buildStudentRows = () =>
      studentPayments.map((p) =>
        selectedStudentFields.map((field) => {
          switch (field) {
            case "monthlyFeeValueInCents":
              return formatCurrency(p.monthlyFeeValueInCents ?? p.planValue);
            case "dueDate":
              return typeof p.dueDate === "number"
                ? `Dia ${p.dueDate}`
                : p.dueDate instanceof Date
                  ? p.dueDate.toLocaleDateString("pt-BR")
                  : "";
            case "paymentMethod":
              return (
                (p as StudentPaymentData & { paymentMethod?: string })
                  .paymentMethod ?? ""
              );
            case "paid":
              return p.paid ? "Pago" : "Pendente";
            case "lastPaymentDate":
              return p.lastPaymentDate
                ? p.lastPaymentDate.toLocaleDateString("pt-BR")
                : "";
            default: {
              // fallback for optional/rare fields
              const fallback = (p as unknown as Record<string, unknown>)[field];
              return fallback ?? "";
            }
          }
        }),
      );

    const buildExpenseRows = () =>
      expenses.map((e) =>
        selectedExpenseFields.map((field) => {
          switch (field) {
            case "amountInCents":
              return formatCurrency(e.amountInCents ?? 0);
            case "dueDate":
              return e.dueDate
                ? new Date(e.dueDate).toLocaleDateString("pt-BR")
                : "";
            case "paymentDate":
              return e.paymentDate
                ? new Date(e.paymentDate).toLocaleDateString("pt-BR")
                : "";
            case "paid":
              return e.paid ? "Pago" : "Pendente";
            default: {
              const fallback = (e as unknown as Record<string, unknown>)[field];
              return fallback ?? "";
            }
          }
        }),
      );

    const handleGenerate = () => {
      const hasStudents = reportScope === "alunos" || reportScope === "geral";
      const hasExpenses = reportScope === "estudio" || reportScope === "geral";
      if (
        (hasStudents && studentPayments.length === 0) ||
        (hasExpenses && expenses.length === 0)
      ) {
        alert("Sem dados carregados para gerar este relatório.");
        return;
      }

      const studentHead = selectedStudentFields;
      const expenseHead = selectedExpenseFields;

      if (reportFormat === "excel") {
        const rows: string[] = [];
        if (hasStudents) {
          rows.push(studentHead.join(";"));
          rows.push(
            ...buildStudentRows().map((r) =>
              r.map((c) => String(c ?? "")).join(";"),
            ),
          );
          rows.push("");
        }
        if (hasExpenses) {
          rows.push(expenseHead.join(";"));
          rows.push(
            ...buildExpenseRows().map((r) =>
              r.map((c) => String(c ?? "")).join(";"),
            ),
          );
        }
        const csv = rows.join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "relatorio-financeiro.csv";
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const doc = new jsPDF();
        let y = 10;
        if (hasStudents) {
          doc.text("Alunos", 14, y);
          y += 4;
          autoTable(doc, {
            head: [studentHead],
            body: buildStudentRows(),
            startY: y,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [194, 165, 55] },
          });
          const lastAutoY = (
            doc as unknown as {
              lastAutoTable?: { finalY?: number };
            }
          ).lastAutoTable?.finalY;
          y = (lastAutoY ?? y) + 10;
        }
        if (hasExpenses) {
          doc.text("Estúdio (despesas)", 14, y);
          y += 4;
          autoTable(doc, {
            head: [expenseHead],
            body: buildExpenseRows(),
            startY: y,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [194, 165, 55] },
          });
        }
        doc.save("relatorio-financeiro.pdf");
      }
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Relatórios</h2>
            <p className="text-slate-400">
              Gere visões consolidadas de receitas e despesas
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowReports(true)}
              className="flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <FileText className="h-4 w-4" />
              Abrir relatórios
            </button>
            <button
              onClick={() => setActiveTab("geral")}
              className="flex items-center gap-2 rounded-md border border-slate-600 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
            >
              <Layers className="h-4 w-4" />
              Voltar
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-slate-700/60 bg-slate-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Download className="h-4 w-4" />
                Exportar
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              <p>Exporte dados financeiros consolidados em PDF ou Excel.</p>
              <p className="text-slate-400">
                Use a aba “Alunos” para exportar cobranças ou “Estúdio” para
                despesas. Relatórios completos estão no botão acima.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-700/60 bg-slate-800/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Calendar className="h-4 w-4" />
                Períodos e filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-slate-200">
              <p>
                Ajuste períodos e selecione colunas dentro dos próprios
                relatórios ou nas telas de Alunos/Estúdio.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-[#C2A537]">
                Configurar relatório
              </CardTitle>
              <p className="text-sm text-slate-400">
                Escolha o escopo, campos e formato (PDF ou Excel)
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={reportScope}
                onChange={(e) =>
                  setReportScope(
                    e.target.value as "alunos" | "estudio" | "geral",
                  )
                }
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                <option value="alunos">Alunos</option>
                <option value="estudio">Estúdio</option>
                <option value="geral">Geral (alunos + estúdio)</option>
              </select>
              <select
                value={reportFormat}
                onChange={(e) =>
                  setReportFormat(e.target.value as "pdf" | "excel")
                }
                className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel (CSV)</option>
              </select>
              <button
                onClick={handleGenerate}
                className="rounded-md bg-[#C2A537] px-3 py-2 text-sm font-semibold text-black hover:bg-[#d4b547]"
              >
                Gerar
              </button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {(reportScope === "alunos" || reportScope === "geral") && (
              <div>
                <p className="text-sm font-medium text-white">
                  Campos (Alunos)
                </p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {studentFields.map((field) => (
                    <label
                      key={field}
                      className="flex items-center gap-2 text-sm text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudentFields.includes(field)}
                        onChange={() => toggleField(field, "student")}
                      />
                      <span>
                        {{
                          name: "Aluno",
                          email: "Email",
                          monthlyFeeValueInCents: "Valor",
                          dueDate: "Vencimento",
                          paymentMethod: "Método",
                          paid: "Status",
                          lastPaymentDate: "Último pagamento",
                          planName: "Plano",
                        }[field] ?? field}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {(reportScope === "estudio" || reportScope === "geral") && (
              <div>
                <p className="text-sm font-medium text-white">
                  Campos (Estúdio - Despesas)
                </p>
                <div className="mt-2 grid gap-2 md:grid-cols-3">
                  {expenseFields.map((field) => (
                    <label
                      key={field}
                      className="flex items-center gap-2 text-sm text-slate-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedExpenseFields.includes(field)}
                        onChange={() => toggleField(field, "expense")}
                      />
                      <span>
                        {{
                          description: "Descrição",
                          category: "Categoria",
                          amountInCents: "Valor",
                          dueDate: "Vencimento",
                          paid: "Status",
                          paymentDate: "Data pagamento",
                          paymentMethod: "Método",
                        }[field] ?? field}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {reportScope === "geral" && (
              <p className="text-xs text-slate-400">
                O relatório geral inclui as seções selecionadas de alunos e
                estúdio.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "alunos", label: "Alunos", icon: Users },
          { id: "estudio", label: "Estúdio", icon: AlertCircle },
          { id: "geral", label: "Geral", icon: BarChart3 },
          { id: "relatorios", label: "Relatórios", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setShowReports(false);
                setActiveTab(tab.id as FinancialTabs);
              }}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#C2A537] text-black shadow-lg shadow-[#C2A537]/30"
                  : "border border-slate-700 text-slate-200 hover:bg-slate-800"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "alunos" && renderAlunos()}
      {activeTab === "estudio" && renderEstudio()}
      {activeTab === "geral" && renderGeral()}
      {activeTab === "relatorios" && renderRelatorios()}
    </div>
  );
}
