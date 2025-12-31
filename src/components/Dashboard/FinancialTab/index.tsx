import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import { getExpensesOverviewAction } from "@/actions/admin/get-expenses-overview-action";
import { getFinancialReportsAction } from "@/actions/admin/get-financial-reports-action";
import { getPaymentDueDatesAction } from "@/actions/admin/get-payment-due-dates-action";
import { ExpenseForm, ExpenseTable } from "@/components/Admin/ExpenseManager";
import { FinancialDashboardView } from "@/components/Dashboard/FinancialDashboardView";
import { PaymentManagementView } from "@/components/Dashboard/PaymentManagementView";
import { ReportsView } from "@/components/Dashboard/ReportsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FinancialTab() {
  const [activeView, setActiveView] = useState<
    "main" | "reports" | "payments" | "dashboard" | "expenses"
  >("main");
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

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadOverviewData();
    loadDueDatesData();
    loadExpensesOverview();
  }, []);

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

  if (activeView === "reports") {
    return <ReportsView onBack={() => setActiveView("main")} />;
  }

  if (activeView === "payments") {
    return <PaymentManagementView onBack={() => setActiveView("main")} />;
  }

  if (activeView === "dashboard") {
    return <FinancialDashboardView onBack={() => setActiveView("main")} />;
  }

  if (activeView === "expenses") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Gerenciamento de Despesas
          </h2>
          <button
            onClick={() => setActiveView("main")}
            className="text-slate-400 hover:text-white"
          >
            Voltar
          </button>
        </div>
        <ExpenseForm />
        <ExpenseTable expenses={[]} />{" "}
        {/* TODO: Implementar carregamento das despesas */}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Visão Geral */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

        <Card className="border-orange-500/50 bg-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">
              Despesas Pendentes
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">
              {expensesOverview.pending.totalFormatted}
            </div>
            <p className="text-xs text-orange-400">
              {expensesOverview.pending.count}{" "}
              {expensesOverview.pending.count === 1 ? "despesa" : "despesas"}
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
              {expensesOverview.paid.count}{" "}
              {expensesOverview.paid.count === 1 ? "despesa" : "despesas"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seções de Funcionalidades Futuras */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Relatórios */}
        <Card
          className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
          onClick={() => setActiveView("reports")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <BarChart3 className="h-5 w-5" />
              Relatórios Financeiros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">Relatório Mensal</h4>
                  <p className="text-sm text-slate-400">
                    Receitas, despesas e margem de lucro
                  </p>
                </div>
                <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                  Disponível
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">
                    Análise de Inadimplência
                  </h4>
                  <p className="text-sm text-slate-400">
                    Tracking e previsão de pagamentos
                  </p>
                </div>
                <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                  Disponível
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">
                    Projeção de Receita
                  </h4>
                  <p className="text-sm text-slate-400">
                    Estimativas baseadas em histórico
                  </p>
                </div>
                <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                  Disponível
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Pagamentos */}
        <Card
          className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
          onClick={() => setActiveView("payments")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <CreditCard className="h-5 w-5" />
              Gestão de Pagamentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">
                    Gateway de Pagamento
                  </h4>
                  <p className="text-sm text-slate-400">
                    Integração com PIX, cartão e boleto
                  </p>
                </div>
                <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                  Disponível
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">
                    Cobrança Automática
                  </h4>
                  <p className="text-sm text-slate-400">
                    Lembretes por email e WhatsApp
                  </p>
                </div>
                <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                  Disponível
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">Planos e Promoções</h4>
                  <p className="text-sm text-slate-400">
                    Gestão de diferentes modalidades
                  </p>
                </div>
                <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                  Disponível
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerenciamento de Despesas */}
      <Card
        className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
        onClick={() => setActiveView("expenses")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <TrendingDown className="h-5 w-5" />
            Gestão de Despesas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <h4 className="font-medium text-white">Despesas Fixas</h4>
                <p className="text-sm text-slate-400">
                  Aluguel, energia, água, etc.
                </p>
              </div>
              <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                Disponível
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <h4 className="font-medium text-white">Despesas Variáveis</h4>
                <p className="text-sm text-slate-400">
                  Manutenção, materiais, etc.
                </p>
              </div>
              <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                Disponível
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <div>
                <h4 className="font-medium text-white">Relatórios</h4>
                <p className="text-sm text-slate-400">Análise de custos</p>
              </div>
              <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
                Disponível
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard de Acompanhamento */}
      <Card
        className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
        onClick={() => setActiveView("dashboard")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Calendar className="h-5 w-5" />
            Dashboard de Acompanhamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-medium text-white">Vencimentos Hoje</h4>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <p className="text-2xl font-bold text-orange-400">
                  {dueDates.dueToday}
                </p>
                <p className="text-sm text-slate-400">mensalidades</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Próximos 7 dias</h4>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <p className="text-2xl font-bold text-yellow-400">
                  {dueDates.dueNext7Days}
                </p>
                <p className="text-sm text-slate-400">vencimentos</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Em Atraso</h4>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <p className="text-2xl font-bold text-red-400">
                  {dueDates.overdue}
                </p>
                <p className="text-sm text-slate-400">mensalidades</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-6">
            <div>
              <h3 className="text-lg font-medium text-white">
                Sistema de Acompanhamento Completo
              </h3>
              <p className="text-sm text-slate-400">
                Dashboard completo com análise de vencimentos, pagamentos e
                inadimplência
              </p>
            </div>
            <div className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
              Disponível
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
