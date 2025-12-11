"use client";

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState, useEffect } from "react";

import {
  getDashboardDetailedAction,
  type DashboardDetailedData,
  type StudentWithDueDate,
} from "@/actions/admin/get-dashboard-detailed-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialDashboardViewProps {
  onBack: () => void;
}

export function FinancialDashboardView({
  onBack,
}: FinancialDashboardViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("today");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardDetailedData>({
    vencimentos: 0,
    valor: 0,
    valorFormatted: "R$ 0,00",
    pagamentos: 0,
    valorRecebido: 0,
    valorRecebidoFormatted: "R$ 0,00",
    pendentes: 0,
    valorPendente: 0,
    valorPendenteFormatted: "R$ 0,00",
    taxaConversao: 0,
    students: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, [selectedTimeframe]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const timeframe = selectedTimeframe as
        | "today"
        | "week"
        | "month"
        | "overdue";
      const result = await getDashboardDetailedAction(timeframe);

      if (result.success && result.data) {
        setDashboardData(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const timeframes = [
    { id: "today", label: "Hoje", icon: Clock },
    { id: "week", label: "7 Dias", icon: Calendar },
    { id: "month", label: "30 Dias", icon: BarChart3 },
    { id: "overdue", label: "Em Atraso", icon: AlertTriangle },
  ];

  const renderTodayView = () => {
    const data = dashboardData;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-500/50 bg-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">
                Vencimentos {selectedTimeframe === "today" ? "Hoje" : ""}
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">
                {loading ? "..." : data.vencimentos}
              </div>
              <p className="text-xs text-blue-400">
                Valor: {loading ? "..." : data.valorFormatted}
              </p>
            </CardContent>
          </Card>

          <Card className="border-green-500/50 bg-green-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">
                Pagamentos Recebidos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-300">
                {loading ? "..." : data.pagamentos}
              </div>
              <p className="text-xs text-green-400">
                Valor: {loading ? "..." : data.valorRecebidoFormatted}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-orange-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">
                Pendentes
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-300">
                {loading ? "..." : data.pendentes}
              </div>
              <p className="text-xs text-orange-400">
                Valor: {loading ? "..." : data.valorPendenteFormatted}
              </p>
            </CardContent>
          </Card>

          <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#C2A537]">
                Taxa de Conversão
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-[#C2A537]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#C2A537]">
                {loading ? "..." : `${data.taxaConversao}%`}
              </div>
              <p className="text-xs text-[#C2A537]">Pagamentos no prazo</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Users className="h-5 w-5" />
                Alunos com Vencimento{" "}
                {selectedTimeframe === "today" ? "Hoje" : "no Período"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {loading ? (
                  <p className="text-center text-slate-400">Carregando...</p>
                ) : data.students.length === 0 ? (
                  <p className="text-center text-slate-400">
                    Nenhum aluno com vencimento neste período
                  </p>
                ) : (
                  data.students.slice(0, 5).map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-3"
                    >
                      <div>
                        <h4 className="font-medium text-white">
                          {student.name}
                        </h4>
                        <p className="text-sm text-slate-400">
                          Mensalidade
                          {student.daysOverdue && student.daysOverdue > 0 && (
                            <span className="ml-2 text-red-400">
                              ({student.daysOverdue}{" "}
                              {student.daysOverdue === 1 ? "dia" : "dias"} em
                              atraso)
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-medium ${
                            student.isPaid
                              ? "text-green-400"
                              : "text-orange-400"
                          }`}
                        >
                          {student.monthlyFeeFormatted}
                        </p>
                        <div
                          className={`rounded px-2 py-1 text-xs text-white ${
                            student.isPaid ? "bg-green-600" : "bg-orange-600"
                          }`}
                        >
                          {student.isPaid ? "Pago" : "Pendente"}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                {!loading && data.students.length > 5 && (
                  <p className="text-center text-sm text-slate-400">
                    + {data.students.length - 5} alunos
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Zap className="h-5 w-5" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Enviar Lembrete de Cobrança
                </Button>
                <Button
                  className="w-full justify-start bg-green-600 text-white hover:bg-green-700"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório do Dia
                </Button>
                <Button
                  className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700"
                  onClick={() => setSelectedTimeframe("overdue")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Verificar Inadimplentes
                </Button>
                <Button
                  className="w-full justify-start bg-[#C2A537] text-black hover:bg-[#D4B547]"
                  onClick={() => alert("Funcionalidade em desenvolvimento")}
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Exportar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Dashboard de Acompanhamento
          </h2>
          <p className="text-slate-400">
            Monitoramento em tempo real de vencimentos e pagamentos
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

      {/* Filtros de Período */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {timeframes.map((timeframe) => {
          const IconComponent = timeframe.icon;
          return (
            <Button
              key={timeframe.id}
              variant={
                selectedTimeframe === timeframe.id ? "default" : "outline"
              }
              onClick={() => setSelectedTimeframe(timeframe.id)}
              className={`flex items-center gap-2 whitespace-nowrap ${
                selectedTimeframe === timeframe.id
                  ? "bg-[#C2A537] text-black hover:bg-[#D4B547]"
                  : "border-slate-600 text-slate-300 hover:bg-slate-800"
              }`}
            >
              <IconComponent className="h-4 w-4" />
              {timeframe.label}
            </Button>
          );
        })}
      </div>

      {renderTodayView()}

      {/* Sistema Financeiro Completo */}
      <Card className="border-slate-700/50 bg-slate-800/30">
        <CardContent className="p-6 text-center">
          <DollarSign className="mx-auto mb-4 h-12 w-12 text-slate-500" />
          <h3 className="mb-2 text-lg font-medium text-slate-300">
            Analytics Avançados
          </h3>
          <p className="mb-4 text-sm text-slate-400">
            Funcionalidades avançadas de análise financeira e business
            intelligence
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
              Controle de Fluxo de Caixa
            </span>
            <span className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
              Integração Bancária
            </span>
            <span className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
              Relatórios Fiscais
            </span>
            <span className="rounded bg-[#C2A537]/20 px-3 py-1 text-xs text-[#C2A537]">
              Machine Learning
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
