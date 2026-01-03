"use client";

import { Activity, Calendar, Heart, MapPin, User } from "lucide-react";
import { useEffect, useState } from "react";

import { getPersonalEventsAction } from "@/actions/user/get-personal-events-action";
import { getStudentDataAction } from "@/actions/user/get-student-data-action";
import {
  UserDashboardHeader,
  UserInfoCard,
  UserNavigationCard,
} from "@/components/Dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  const [pendingEvents, setPendingEvents] = useState<
    { id: string; title: string; date: Date; description: string }[]
  >([]);

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

  useEffect(() => {
    const loadPendingEvents = async () => {
      try {
        const events = await getPersonalEventsAction();
        const relevant = events
          .filter((e) => !e.isPublic && e.approvalStatus !== "approved")
          .map((e) => ({
            id: e.id,
            title: e.title,
            date: e.date,
            description: e.description,
          }));
        setPendingEvents(relevant);
      } catch {
        /* ignore errors on notifications */
      }
    };

    loadPendingEvents();
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
              <p className="text-red-400">{error || "Dados nao encontrados"}</p>
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
        {/* Cabecalho */}
        <UserDashboardHeader userName={studentData.user.name} />

        {/* Notificacoes de eventos pendentes */}
        <Card className="mb-6 border-yellow-600/40 bg-yellow-900/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg text-yellow-300">
                Eventos aguardando aprovacao
              </CardTitle>
              <p className="text-sm text-white/70">
                Solicitações que voce enviou para se tornar publicas.
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {pendingEvents.length === 0 ? (
              <p className="text-sm text-white/70">
                Nenhuma solicitacao pendente no momento.
              </p>
            ) : (
              <div className="space-y-3">
                {pendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex flex-col rounded-lg border border-yellow-700/50 bg-yellow-900/10 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {event.title}
                      </p>
                      <p className="text-xs text-white/70 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 md:mt-0">
                      <Badge variant="outline" className="border-yellow-500 text-yellow-300">
                        {event.date.toLocaleDateString("pt-BR")}
                      </Badge>
                      <Badge className="bg-yellow-600 text-black">
                        Pendencia
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navegacao rapida */}
        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-5">
          <UserNavigationCard
            icon={User}
            title="Meus Dados"
            description="Informacoes pessoais"
            colorClass="border-blue-600 bg-blue-900/30"
          />

          <UserNavigationCard
            icon={Heart}
            title="Historico de Saude"
            description="Metricas e evolucao"
            href="/user/health"
            colorClass="border-green-600 bg-green-900/30"
          />

          <UserNavigationCard
            icon={Activity}
            title="Check-ins"
            description="Historico de presencas"
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

          <UserNavigationCard
            icon={MapPin}
            title="Eventos"
            description="Agenda publica e pessoal"
            href="/user/events"
            colorClass="border-yellow-500 bg-yellow-900/30"
          />
        </div>

        {/* Resumo rapido */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <UserInfoCard
            title="Informacoes Pessoais"
            data={[
              { label: "E-mail", value: studentData.personalData.email },
              { label: "Idade", value: `${age} anos` },
              { label: "Telefone", value: studentData.personalData.telephone },
            ]}
          />

          <UserInfoCard
            title="Dados de Saude"
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
                label: "Tipo Sanguineo",
                value: studentData.healthMetrics.bloodType,
              },
            ]}
          />

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
                value: studentData.financial.paid ? "Em dia" : "Pendente",
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

