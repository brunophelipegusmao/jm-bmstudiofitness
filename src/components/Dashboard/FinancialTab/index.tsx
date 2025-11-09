import {
  BarChart3,
  Calendar,
  CreditCard,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect,useState } from "react";

import { getFinancialReportsAction } from "@/actions/admin/get-financial-reports-action";
import { getPaymentDueDatesAction } from "@/actions/admin/get-payment-due-dates-action";
import { FinancialDashboardView } from "@/components/Dashboard/FinancialDashboardView";
import { PaymentManagementView } from "@/components/Dashboard/PaymentManagementView";
import { ReportsView } from "@/components/Dashboard/ReportsView";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FinancialTab() {
  const [showFinancialReports, setShowFinancialReports] = useState(false);
  const [showPaymentManagement, setShowPaymentManagement] = useState(false);
  const [showFinancialDashboard, setShowFinancialDashboard] = useState(false);
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

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadOverviewData();
    loadDueDatesData();
  }, []);

  const loadOverviewData = async () => {
    try {
      const result = await getFinancialReportsAction();

      if (result.success && result.data) {
        setOverview({
          totalRevenue: result.data.overview.totalRevenue,
          activeStudents: result.data.overview.activeStudents,
          totalPending: result.data.overview.pendingPayments,
          paymentRate: result.data.overview.paymentRate,
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

  if (showFinancialReports) {
    return <ReportsView onBack={() => setShowFinancialReports(false)} />;
  }

  if (showPaymentManagement) {
    return (
      <PaymentManagementView onBack={() => setShowPaymentManagement(false)} />
    );
  }

  if (showFinancialDashboard) {
    return (
      <FinancialDashboardView onBack={() => setShowFinancialDashboard(false)} />
    );
  }
  return (
    <div className="space-y-6">
      {/* Visão Geral */}
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

      {/* Seções de Funcionalidades Futuras */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Relatórios */}
        <Card
          className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
          onClick={() => setShowFinancialReports(true)}
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
          onClick={() => setShowPaymentManagement(true)}
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

      {/* Dashboard de Acompanhamento */}
      <Card
        className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
        onClick={() => setShowFinancialDashboard(true)}
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
