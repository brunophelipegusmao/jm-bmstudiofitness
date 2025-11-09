"use client";

import {
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  PieChart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialReportsViewProps {
  onBack: () => void;
}

export function FinancialReportsView({ onBack }: FinancialReportsViewProps) {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);

  const reports = [
    {
      id: "monthly",
      title: "Relatório Mensal",
      description: "Receitas, despesas e margem de lucro",
      icon: BarChart3,
      color: "from-green-600 to-emerald-500",
      data: {
        receita: 12450.0,
        despesas: 8200.0,
        lucro: 4250.0,
        margem: 34.1,
      },
    },
    {
      id: "defaulters",
      title: "Análise de Inadimplência",
      description: "Tracking e previsão de pagamentos",
      icon: TrendingDown,
      color: "from-red-600 to-rose-500",
      data: {
        inadimplentes: 14,
        valorTotal: 2100.0,
        taxaInadimplencia: 16.9,
        previsaoRecuperacao: 1580.0,
      },
    },
    {
      id: "projection",
      title: "Projeção de Receita",
      description: "Estimativas baseadas em histórico, valores e políticas",
      icon: TrendingUp,
      color: "from-blue-600 to-cyan-500",
      data: {
        proximoMes: 13200.0,
        crescimento: 6.0,
        novosCancelamentos: 3,
        novosAlunos: 8,
      },
    },
  ];

  const renderMonthlyReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">
              R$ 12.450,00
            </div>
            <p className="text-xs text-green-400">
              +8% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 bg-red-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">
              Despesas
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">R$ 8.200,00</div>
            <p className="text-xs text-red-400">
              Aluguel, energia, equipamentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Lucro Líquido
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">R$ 4.250,00</div>
            <p className="text-xs text-[#C2A537]">Margem de 34.1%</p>
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
            <div className="text-2xl font-bold text-blue-300">83</div>
            <p className="text-xs text-blue-400">+5 novos este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <PieChart className="h-5 w-5" />
              Distribuição de Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Mensalidades</span>
                <span className="text-sm font-medium text-white">85%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Personal Trainer</span>
                <span className="text-sm font-medium text-white">12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Produtos</span>
                <span className="text-sm font-medium text-white">3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <BarChart3 className="h-5 w-5" />
              Comparativo Mensal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Janeiro</span>
                <span className="text-sm font-medium text-white">
                  R$ 11.200
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Fevereiro</span>
                <span className="text-sm font-medium text-white">
                  R$ 11.520
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Março</span>
                <span className="text-sm font-medium text-[#C2A537]">
                  R$ 12.450
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDefaultersReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-red-500/50 bg-red-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-400">
              Alunos Inadimplentes
            </CardTitle>
            <Users className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-300">14</div>
            <p className="text-xs text-red-400">16.9% dos alunos ativos</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">
              Valor em Atraso
            </CardTitle>
            <DollarSign className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">
              R$ 2.100,00
            </div>
            <p className="text-xs text-orange-400">
              Média de 45 dias de atraso
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/50 bg-yellow-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-400">
              Previsão Recuperação
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-300">
              R$ 1.580,00
            </div>
            <p className="text-xs text-yellow-400">
              75% de recuperação estimada
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Taxa de Inadimplência
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">16.9%</div>
            <p className="text-xs text-blue-400">-2.1% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Calendar className="h-5 w-5" />
              Vencimentos por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Hoje</span>
                <span className="text-sm font-medium text-red-400">
                  3 alunos
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Próximos 7 dias</span>
                <span className="text-sm font-medium text-orange-400">
                  8 alunos
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Próximos 15 dias</span>
                <span className="text-sm font-medium text-yellow-400">
                  23 alunos
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <TrendingDown className="h-5 w-5" />
              Ações Recomendadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="rounded-lg border border-red-500/30 bg-red-900/20 p-3">
                <p className="text-sm font-medium text-red-400">
                  Enviar cobrança para 3 alunos
                </p>
                <p className="text-xs text-red-300">Vencimento hoje</p>
              </div>
              <div className="rounded-lg border border-orange-500/30 bg-orange-900/20 p-3">
                <p className="text-sm font-medium text-orange-400">
                  Negociar com 5 alunos
                </p>
                <p className="text-xs text-orange-300">
                  Mais de 30 dias em atraso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderProjectionReport = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Projeção Próximo Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">
              R$ 13.200,00
            </div>
            <p className="text-xs text-green-400">
              +6% de crescimento estimado
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Novos Alunos
            </CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">8</div>
            <p className="text-xs text-blue-400">Estimativa baseada em leads</p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/50 bg-orange-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">
              Cancelamentos
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-300">3</div>
            <p className="text-xs text-orange-400">
              Baseado no histórico mensal
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Taxa de Crescimento
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">+6.0%</div>
            <p className="text-xs text-[#C2A537]">Acima da meta de 5%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Calendar className="h-5 w-5" />
              Projeção Trimestral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Abril</span>
                <span className="text-sm font-medium text-white">
                  R$ 13.200
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Maio</span>
                <span className="text-sm font-medium text-white">
                  R$ 13.900
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Junho</span>
                <span className="text-sm font-medium text-[#C2A537]">
                  R$ 14.650
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <DollarSign className="h-5 w-5" />
              Fatores de Influência
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Sazonalidade</span>
                <span className="text-sm font-medium text-green-400">+3%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Campanhas</span>
                <span className="text-sm font-medium text-green-400">+2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Concorrência</span>
                <span className="text-sm font-medium text-orange-400">-1%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case "monthly":
        return renderMonthlyReport();
      case "defaulters":
        return renderDefaultersReport();
      case "projection":
        return renderProjectionReport();
      default:
        return null;
    }
  };

  if (selectedReport) {
    const report = reports.find((r) => r.id === selectedReport);
    return (
      <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#C2A537]">
              {report?.title}
            </h2>
            <p className="text-slate-400">{report?.description}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedReport(null)}
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              ← Voltar aos Relatórios
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

        {renderReportContent()}
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Relatórios Financeiros
          </h2>
          <p className="text-slate-400">
            Análises detalhadas da situação financeira do estúdio
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

      <div className="grid gap-6 lg:grid-cols-3">
        {reports.map((report) => {
          const IconComponent = report.icon;
          return (
            <Card
              key={report.id}
              className="cursor-pointer border-slate-700/50 bg-slate-800/30 transition-all duration-200 hover:border-[#C2A537]/50 hover:bg-slate-800/50"
              onClick={() => setSelectedReport(report.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-[#C2A537]">
                  <div
                    className={`rounded-lg bg-gradient-to-br ${report.color} p-2`}
                  >
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{report.title}</h3>
                    <p className="text-sm text-slate-400">
                      {report.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
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
        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">
              R$ 12.450,00
            </div>
            <p className="text-xs text-green-400">Mês atual</p>
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
            <div className="text-2xl font-bold text-red-300">R$ 2.100,00</div>
            <p className="text-xs text-red-400">14 alunos em atraso</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">
              Projeção Abril
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-300">R$ 13.200,00</div>
            <p className="text-xs text-blue-400">+6% crescimento</p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Margem de Lucro
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">34.1%</div>
            <p className="text-xs text-[#C2A537]">Acima da meta</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
