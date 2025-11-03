"use client";

import { Activity, Calendar, Heart, User } from "lucide-react";
import { useEffect, useState } from "react";

import {
  LoadingSpinner,
  UserDashboardHeader,
  UserInfoCard,
  UserNavigationCard,
} from "@/components/Dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { mockApiDelay, mockUserDashboardData } from "@/lib/mock-data";

interface StudentData {
  user: {
    id: string;
    name: string;
  };
  personalData: {
    email: string;
    cpf: string;
    bornDate: string;
    address: string;
    telephone: string;
  };
  healthMetrics: {
    heightCm: number;
    weightKg: number;
    bloodType: string;
    updatedAt: string;
  };
  financial: {
    paid: boolean;
    monthlyFeeValueInCents: number;
    dueDate: number;
    lastPaymentDate: string | null;
  };
}

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        // Simula delay de API
        await mockApiDelay(600);
        setStudentData(mockUserDashboardData);
      } catch {
        setError("Erro ao carregar dados do aluno");
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner
            message="Carregando seus dados..."
            variant="gym"
            size="lg"
          />
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md border-red-500/50 bg-red-900/20">
            <CardContent className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-red-400">
                Erro ao Carregar
              </h2>
              <p className="text-red-300">
                {error || "Não foi possível carregar os dados do aluno"}
              </p>
              <p className="mt-4 text-sm text-red-400/80">
                Modo demo - dados simulados
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const age =
    new Date().getFullYear() -
    new Date(studentData.personalData.bornDate).getFullYear();
  const monthlyFee = (
    studentData.financial.monthlyFeeValueInCents / 100
  ).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Cabeçalho */}
        <UserDashboardHeader userName={studentData.user.name} />

        {/* Banner de Demo */}
        <div className="mb-8">
          <Card className="border-[#C2A537]/30 bg-[#C2A537]/10">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-[#C2A537]">
                🎯 <strong>Modo Demonstração</strong> - Explore as
                funcionalidades do sistema com dados fictícios
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Cards de Navegação */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <UserNavigationCard
            icon={User}
            title="Meus Dados"
            description="Informações pessoais"
            colorClass="border-blue-600 bg-blue-900/30"
          />

          <UserNavigationCard
            icon={Heart}
            title="Histórico de Saúde"
            description="Métricas e evolução"
            href="/user/health-demo"
            colorClass="border-green-600 bg-green-900/30"
          />

          <UserNavigationCard
            icon={Activity}
            title="Check-ins"
            description="Histórico de presenças"
            href="/user/checkins-demo"
            colorClass="border-orange-600 bg-orange-900/30"
          />

          <UserNavigationCard
            icon={Calendar}
            title="Pagamentos"
            description="Status financeiro"
            colorClass="border-purple-600 bg-purple-900/30"
          />
        </div>

        {/* Resumo Rápido */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Dados Pessoais */}
          <UserInfoCard
            title="Informações Pessoais"
            data={[
              { label: "E-mail", value: studentData.personalData.email },
              { label: "Idade", value: `${age} anos` },
              { label: "Telefone", value: studentData.personalData.telephone },
            ]}
          />

          {/* Dados de Saúde */}
          <UserInfoCard
            title="Dados de Saúde"
            data={[
              {
                label: "Altura",
                value: `${studentData.healthMetrics.heightCm} cm`,
              },
              {
                label: "Peso",
                value: `${studentData.healthMetrics.weightKg} kg`,
              },
              {
                label: "Tipo Sanguíneo",
                value: studentData.healthMetrics.bloodType,
              },
            ]}
          />

          {/* Status Financeiro */}
          <UserInfoCard
            title="Status Financeiro"
            data={[
              { label: "Mensalidade", value: monthlyFee },
              {
                label: "Vencimento",
                value: `Dia ${studentData.financial.dueDate}`,
              },
              {
                label: "Status",
                value: studentData.financial.paid ? "✅ Em dia" : "❌ Pendente",
                className: `font-semibold ${
                  studentData.financial.paid ? "text-green-400" : "text-red-400"
                }`,
              },
            ]}
          />
        </div>

        {/* Estatísticas de Uso - Demo */}
        <div className="mt-8">
          <Card className="border-[#C2A537]/50 bg-black/40">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-[#C2A537]">
                📊 Estatísticas do Mês (Demo)
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">12</p>
                  <p className="text-sm text-slate-400">Check-ins este mês</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">3.5</p>
                  <p className="text-sm text-slate-400">Média por semana</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#C2A537]">85%</p>
                  <p className="text-sm text-slate-400">Taxa de frequência</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="mt-12 text-center">
          <p className="text-sm text-slate-500">
            JM Fitness Studio - Versão Demo © 2025
          </p>
        </footer>
      </div>
    </div>
  );
}
