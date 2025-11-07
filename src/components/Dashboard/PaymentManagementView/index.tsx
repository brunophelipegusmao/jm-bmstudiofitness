"use client";

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
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentManagementViewProps {
  onBack: () => void;
}

export function PaymentManagementView({ onBack }: PaymentManagementViewProps) {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

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
            <div className="text-2xl font-bold text-blue-300">7</div>
            <p className="text-xs text-blue-400">Diferentes modalidades</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-400">
              Promoções Ativas
            </CardTitle>
            <Percent className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-300">3</div>
            <p className="text-xs text-green-400">Campanhas em andamento</p>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/50 bg-[#C2A537]/10">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#C2A537]">
              Plano Mais Popular
            </CardTitle>
            <Users className="h-4 w-4 text-[#C2A537]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C2A537]">Premium</div>
            <p className="text-xs text-[#C2A537]">45% dos alunos</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/50 bg-purple-900/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-400">
              Receita Média
            </CardTitle>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-300">R$ 149</div>
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
              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">Básico</h4>
                  <p className="text-sm text-slate-400">
                    R$ 89/mês - Musculação
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-400">18 alunos</p>
                  <p className="text-xs text-slate-400">22% dos alunos</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/50 bg-[#C2A537]/10 p-4">
                <div>
                  <h4 className="font-medium text-white">Premium</h4>
                  <p className="text-sm text-slate-400">
                    R$ 149/mês - Musculação + Aulas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#C2A537]">
                    37 alunos
                  </p>
                  <p className="text-xs text-slate-400">45% dos alunos</p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-slate-600 bg-slate-700/50 p-4">
                <div>
                  <h4 className="font-medium text-white">VIP</h4>
                  <p className="text-sm text-slate-400">
                    R$ 249/mês - Completo + Personal
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-purple-400">
                    28 alunos
                  </p>
                  <p className="text-xs text-slate-400">33% dos alunos</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Percent className="h-5 w-5" />
              Promoções Ativas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border border-green-500/30 bg-green-900/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-green-400">
                    Desconto Família
                  </h4>
                  <span className="rounded bg-green-600 px-2 py-1 text-xs text-white">
                    20% OFF
                  </span>
                </div>
                <p className="text-sm text-green-300">
                  2º familiar com 20% de desconto
                </p>
                <p className="text-xs text-green-400">Válido até 31/12/2025</p>
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-900/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-blue-400">Black Friday</h4>
                  <span className="rounded bg-blue-600 px-2 py-1 text-xs text-white">
                    50% OFF
                  </span>
                </div>
                <p className="text-sm text-blue-300">
                  Primeira mensalidade pela metade
                </p>
                <p className="text-xs text-blue-400">Válido até 30/11/2025</p>
              </div>

              <div className="rounded-lg border border-purple-500/30 bg-purple-900/20 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="font-medium text-purple-400">
                    Pagamento Anual
                  </h4>
                  <span className="rounded bg-purple-600 px-2 py-1 text-xs text-white">
                    2 MESES
                  </span>
                </div>
                <p className="text-sm text-purple-300">
                  Pague 10 e leve 12 meses
                </p>
                <p className="text-xs text-purple-400">Promoção permanente</p>
              </div>
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
