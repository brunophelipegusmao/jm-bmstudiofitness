import {
  BarChart3,
  Calendar,
  CreditCard,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FinancialTab() {
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
              R$ 12.450,00
            </div>
            <p className="text-xs text-green-400">
              +8% em relação ao mês anterior
            </p>
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

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Taxa de Conversão
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">94%</div>
            <p className="text-xs text-[#C2A537]">Pagamentos no prazo</p>
          </CardContent>
        </Card>
      </div>

      {/* Seções de Funcionalidades Futuras */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Relatórios */}
        <Card className="border-slate-700/50 bg-slate-800/30">
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
                <div className="rounded bg-slate-600 px-3 py-1 text-xs text-slate-300">
                  Em breve
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
                <div className="rounded bg-slate-600 px-3 py-1 text-xs text-slate-300">
                  Em breve
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
                <div className="rounded bg-slate-600 px-3 py-1 text-xs text-slate-300">
                  Em breve
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestão de Pagamentos */}
        <Card className="border-slate-700/50 bg-slate-800/30">
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
                <div className="rounded bg-slate-600 px-3 py-1 text-xs text-slate-300">
                  Em breve
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
                <div className="rounded bg-slate-600 px-3 py-1 text-xs text-slate-300">
                  Em breve
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">Planos e Promoções</h4>
                  <p className="text-sm text-slate-400">
                    Gestão de diferentes modalidades
                  </p>
                </div>
                <div className="rounded bg-slate-600 px-3 py-1 text-xs text-slate-300">
                  Em breve
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard de Acompanhamento */}
      <Card className="border-slate-700/50 bg-slate-800/30">
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
                <p className="text-2xl font-bold text-orange-400">7</p>
                <p className="text-sm text-slate-400">mensalidades</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Próximos 7 dias</h4>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <p className="text-2xl font-bold text-yellow-400">23</p>
                <p className="text-sm text-slate-400">vencimentos</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-white">Em Atraso</h4>
              <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <p className="text-2xl font-bold text-red-400">14</p>
                <p className="text-sm text-slate-400">mensalidades</p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-600 bg-slate-700/50 p-6 text-center">
            <DollarSign className="mx-auto mb-4 h-12 w-12 text-slate-500" />
            <h3 className="mb-2 text-lg font-medium text-slate-300">
              Sistema Financeiro Completo
            </h3>
            <p className="mb-4 text-sm text-slate-400">
              Funcionalidades avançadas de gestão financeira serão implementadas
              nas próximas versões
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
                Analytics Avançados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
