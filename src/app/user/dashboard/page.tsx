"use client";

import { Activity, Calendar, Heart, User } from "lucide-react";
import { useEffect, useState } from "react";

import { getStudentDataAction } from "@/actions/user/get-student-data-action";
import {
  UserDashboardHeader,
  UserInfoCard,
  UserNavigationCard,
} from "@/components/Dashboard";
import { Card, CardContent } from "@/components/ui/card";

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
        const data = await getStudentDataAction();
        if (data.success && data.data) {
          setStudentData(data.data);
        } else {
          setError(data.message || "Erro ao carregar dados");
        }
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
          <p className="text-lg text-[#C2A537]">Carregando seus dados...</p>
        </div>
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md border-red-600 bg-red-900/30">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">{error || "Dados não encontrados"}</p>
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
            href="/user/health"
            colorClass="border-green-600 bg-green-900/30"
          />

          <UserNavigationCard
            icon={Activity}
            title="Check-ins"
            description="Histórico de presenças"
            href="/user/check-ins"
            colorClass="border-orange-600 bg-orange-900/30"
          />

          <UserNavigationCard
            icon={Calendar}
            title="Pagamentos"
            description="Status financeiro"
            href="/user/payment"
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
      </div>
    </div>
  );
}


