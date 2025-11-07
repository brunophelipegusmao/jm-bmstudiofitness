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
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialDashboardViewProps {
  onBack: () => void;
}

interface RegularData {
  vencimentos: number;
  valor: number;
  pagamentos: number;
  valorRecebido: number;
  pendentes: number;
  valorPendente: number;
}

interface OverdueData {
  vencimentos: number;
  valor: number;
  diasAtraso: number;
  maiorAtraso: number;
  recuperaveis: number;
  valorRecuperavel: number;
}

// Type guard para verificar se é dados regulares
const isRegularData = (
  data: RegularData | OverdueData,
): data is RegularData => {
  return "pagamentos" in data;
};

// Type guard para verificar se é dados de atraso
const isOverdueData = (
  data: RegularData | OverdueData,
): data is OverdueData => {
  return "diasAtraso" in data;
};

export function FinancialDashboardView({
  onBack,
}: FinancialDashboardViewProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("today");

  const timeframes = [
    { id: "today", label: "Hoje", icon: Clock },
    { id: "week", label: "7 Dias", icon: Calendar },
    { id: "month", label: "30 Dias", icon: BarChart3 },
    { id: "overdue", label: "Em Atraso", icon: AlertTriangle },
  ];

  const todayData: RegularData = {
    vencimentos: 7,
    valor: 1039.0,
    pagamentos: 4,
    valorRecebido: 596.0,
    pendentes: 3,
    valorPendente: 443.0,
  };

  const weekData: RegularData = {
    vencimentos: 23,
    valor: 3427.0,
    pagamentos: 15,
    valorRecebido: 2235.0,
    pendentes: 8,
    valorPendente: 1192.0,
  };

  const monthData: RegularData = {
    vencimentos: 89,
    valor: 13245.0,
    pagamentos: 67,
    valorRecebido: 9971.0,
    pendentes: 22,
    valorPendente: 3274.0,
  };

  const overdueData: OverdueData = {
    vencimentos: 14,
    valor: 2100.0,
    diasAtraso: 45,
    maiorAtraso: 127,
    recuperaveis: 10,
    valorRecuperavel: 1580.0,
  };

  const getCurrentData = (): RegularData | OverdueData => {
    switch (selectedTimeframe) {
      case "today":
        return todayData;
      case "week":
        return weekData;
      case "month":
        return monthData;
      case "overdue":
        return overdueData;
      default:
        return todayData;
    }
  };

  const renderTodayView = () => {
    const data = getCurrentData();

    // Se for dados de atraso, mostrar view específica
    if (isOverdueData(data)) {
      return renderOverdueView(data);
    }

    // Dados regulares
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-500/50 bg-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">
                Vencimentos Hoje
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">
                {data.vencimentos}
              </div>
              <p className="text-xs text-blue-400">
                Valor: R$ {data.valor.toLocaleString("pt-BR")}
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
                {data.pagamentos}
              </div>
              <p className="text-xs text-green-400">
                Valor: R$ {data.valorRecebido.toLocaleString("pt-BR")}
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
                {data.pendentes}
              </div>
              <p className="text-xs text-orange-400">
                Valor: R$ {data.valorPendente.toLocaleString("pt-BR")}
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
                {Math.round((data.pagamentos / data.vencimentos) * 100)}%
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
                Alunos com Vencimento Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                  <div>
                    <h4 className="font-medium text-white">Ana Costa</h4>
                    <p className="text-sm text-slate-400">Plano Premium</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-blue-400">
                      R$ 149,00
                    </p>
                    <div className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
                      Pago
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                  <div>
                    <h4 className="font-medium text-white">Bruno Lima</h4>
                    <p className="text-sm text-slate-400">Plano Básico</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-400">
                      R$ 89,00
                    </p>
                    <div className="rounded bg-orange-600 px-2 py-1 text-xs text-white">
                      Pendente
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-3">
                  <div>
                    <h4 className="font-medium text-white">Carla Mendes</h4>
                    <p className="text-sm text-slate-400">Plano VIP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-400">
                      R$ 249,00
                    </p>
                    <div className="rounded bg-green-600 px-2 py-1 text-xs text-white">
                      Pago
                    </div>
                  </div>
                </div>
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
                <Button className="w-full justify-start bg-blue-600 text-white hover:bg-blue-700">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Enviar Lembrete de Cobrança
                </Button>
                <Button className="w-full justify-start bg-green-600 text-white hover:bg-green-700">
                  <FileText className="mr-2 h-4 w-4" />
                  Gerar Relatório do Dia
                </Button>
                <Button className="w-full justify-start bg-purple-600 text-white hover:bg-purple-700">
                  <Users className="mr-2 h-4 w-4" />
                  Verificar Inadimplentes
                </Button>
                <Button className="w-full justify-start bg-[#C2A537] text-black hover:bg-[#D4B547]">
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

  const renderOverdueView = (data: OverdueData) => {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-red-500/50 bg-red-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">
                Total em Atraso
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-300">
                {data.vencimentos}
              </div>
              <p className="text-xs text-red-400">
                Valor: R$ {data.valor.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-orange-500/50 bg-orange-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-400">
                Média de Atraso
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-300">
                {data.diasAtraso} dias
              </div>
              <p className="text-xs text-orange-400">
                Maior: {data.maiorAtraso} dias
              </p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/50 bg-yellow-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">
                Recuperáveis
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-300">
                {data.recuperaveis}
              </div>
              <p className="text-xs text-yellow-400">
                R$ {data.valorRecuperavel.toLocaleString("pt-BR")}
              </p>
            </CardContent>
          </Card>

          <Card className="border-purple-500/50 bg-purple-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">
                Taxa de Inadimplência
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-300">16.9%</div>
              <p className="text-xs text-purple-400">-2.1% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <AlertTriangle className="h-5 w-5" />
                Alunos em Atraso Crítico (+ 30 dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                  <div>
                    <h4 className="font-medium text-red-400">
                      Daniel Oliveira
                    </h4>
                    <p className="text-sm text-red-300">67 dias em atraso</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-400">
                      R$ 298,00
                    </p>
                    <p className="text-xs text-red-300">2 mensalidades</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                  <div>
                    <h4 className="font-medium text-red-400">Pedro Santos</h4>
                    <p className="text-sm text-red-300">45 dias em atraso</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-400">
                      R$ 149,00
                    </p>
                    <p className="text-xs text-red-300">1 mensalidade</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-orange-500/30 bg-orange-900/20 p-3">
                  <div>
                    <h4 className="font-medium text-orange-400">
                      Julia Ferreira
                    </h4>
                    <p className="text-sm text-orange-300">32 dias em atraso</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange-400">
                      R$ 89,00
                    </p>
                    <p className="text-xs text-orange-300">1 mensalidade</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Zap className="h-5 w-5" />
                Ações de Recuperação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-4">
                  <h4 className="mb-2 font-medium text-red-400">
                    Ação Imediata (5 alunos)
                  </h4>
                  <p className="mb-3 text-sm text-red-300">
                    Contato telefônico para negociação
                  </p>
                  <Button className="w-full bg-red-600 text-white hover:bg-red-700">
                    Iniciar Contato
                  </Button>
                </div>

                <div className="rounded-lg border border-orange-500/30 bg-orange-900/20 p-4">
                  <h4 className="mb-2 font-medium text-orange-400">
                    Cobrança Automática (6 alunos)
                  </h4>
                  <p className="mb-3 text-sm text-orange-300">
                    Enviar lembrete por WhatsApp
                  </p>
                  <Button className="w-full bg-orange-600 text-white hover:bg-orange-700">
                    Enviar Lembretes
                  </Button>
                </div>

                <div className="rounded-lg border border-yellow-500/30 bg-yellow-900/20 p-4">
                  <h4 className="mb-2 font-medium text-yellow-400">
                    Renegociação (3 alunos)
                  </h4>
                  <p className="mb-3 text-sm text-yellow-300">
                    Oferecer desconto para quitação
                  </p>
                  <Button className="w-full bg-yellow-600 text-white hover:bg-yellow-700">
                    Criar Proposta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderGenericView = () => {
    const data = getCurrentData();

    // Só renderizar se for dados regulares
    if (!isRegularData(data)) {
      return <div>Erro: dados incompatíveis</div>;
    }

    const isWeek = selectedTimeframe === "week";
    const isMonth = selectedTimeframe === "month";

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-blue-500/50 bg-blue-900/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">
                Total de Vencimentos
              </CardTitle>
              <Calendar className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-300">
                {data.vencimentos}
              </div>
              <p className="text-xs text-blue-400">
                R$ {data.valor.toLocaleString("pt-BR")}
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
                {data.pagamentos}
              </div>
              <p className="text-xs text-green-400">
                R$ {data.valorRecebido.toLocaleString("pt-BR")}
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
                {data.pendentes}
              </div>
              <p className="text-xs text-orange-400">
                R$ {data.valorPendente.toLocaleString("pt-BR")}
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
                {Math.round((data.pagamentos / data.vencimentos) * 100)}%
              </div>
              <p className="text-xs text-[#C2A537]">
                {isWeek
                  ? "Última semana"
                  : isMonth
                    ? "Último mês"
                    : "Performance"}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <BarChart3 className="h-5 w-5" />
                Análise de Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Taxa de Sucesso
                  </span>
                  <span className="text-sm font-medium text-green-400">
                    {Math.round((data.pagamentos / data.vencimentos) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Valor Médio por Pagamento
                  </span>
                  <span className="text-sm font-medium text-white">
                    R${" "}
                    {Math.round(
                      data.valorRecebido / data.pagamentos,
                    ).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Eficiência de Cobrança
                  </span>
                  <span className="text-sm font-medium text-[#C2A537]">
                    {Math.round((data.valorRecebido / data.valor) * 100)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700/50 bg-slate-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <TrendingUp className="h-5 w-5" />
                Comparativo com Período Anterior
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Vencimentos</span>
                  <span className="text-sm font-medium text-green-400">
                    +12%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Pagamentos Recebidos
                  </span>
                  <span className="text-sm font-medium text-green-400">
                    +8%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    Taxa de Conversão
                  </span>
                  <span className="text-sm font-medium text-red-400">-3%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    const data = getCurrentData();

    if (selectedTimeframe === "overdue") {
      if (isOverdueData(data)) {
        return renderOverdueView(data);
      }
    } else if (
      selectedTimeframe === "today" ||
      selectedTimeframe === "week" ||
      selectedTimeframe === "month"
    ) {
      if (isRegularData(data)) {
        return renderTodayView();
      }
    }

    // Fallback
    return renderGenericView();
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

      {renderContent()}

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
