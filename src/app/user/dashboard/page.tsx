"use client";

import { Activity, Calendar, Dumbbell, Heart, MapPin, User, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { getStudentCheckinsAction, type StudentCheckInAdmin } from "@/actions/admin/get-student-checkins-action";
import { getStudentHealthHistoryAction, type HealthEntry } from "@/actions/user/get-health-history-action";
import { getPersonalEventsAction } from "@/actions/user/get-personal-events-action";
import { getStudentDataAction } from "@/actions/user/get-student-data-action";
import { UserDashboardHeader, UserNavigationCard } from "@/components/Dashboard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const [healthHistory, setHealthHistory] = useState<HealthEntry[]>([]);
  const [checkIns, setCheckIns] = useState<StudentCheckInAdmin[]>([]);
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

    void loadStudentData();
  }, []);

  useEffect(() => {
    const loadExtraData = async () => {
      if (!studentData?.user.id) return;
      try {
        const [healthResp, checkInsResp] = await Promise.all([
          getStudentHealthHistoryAction(),
          getStudentCheckinsAction(studentData.user.id),
        ]);

        if (healthResp.success && healthResp.history) {
          setHealthHistory(healthResp.history);
        }
        if (checkInsResp.success && checkInsResp.data) {
          setCheckIns(checkInsResp.data);
        }
      } catch {
        /* ignore auxiliary load errors */
      }
    };

    void loadExtraData();
  }, [studentData?.user.id]);

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

    void loadPendingEvents();
  }, []);

  const age = useMemo(() => {
    if (!studentData) return null;
    return (
      new Date().getFullYear() -
      new Date(studentData.personalData.bornDate).getFullYear()
    );
  }, [studentData]);

  const monthlyFee = useMemo(() => {
    if (!studentData) return null;
    return (
      studentData.financial.monthlyFeeValueInCents / 100
    ).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, [studentData]);

  const weightSeries = useMemo(() => {
    const parsed = healthHistory
      .map((entry) => {
        const weight = entry.weightKg ? parseFloat(entry.weightKg) : null;
        if (!weight || Number.isNaN(weight)) return null;
        return {
          date: new Date(entry.updatedAt),
          weight,
        };
      })
      .filter(Boolean) as { date: Date; weight: number }[];

    return parsed.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [healthHistory]);

  const recentCheckIns = useMemo(() => {
    return [...checkIns]
      .sort((a, b) => {
        const dateA = new Date(`${a.checkInDate}T${a.checkInTime}`);
        const dateB = new Date(`${b.checkInDate}T${b.checkInTime}`);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6);
  }, [checkIns]);

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

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto p-4 lg:p-8">
        <UserDashboardHeader userName={studentData.user.name} />

        {/* Notificacoes de eventos pendentes */}
        <Card className="mb-6 border-yellow-600/40 bg-yellow-900/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-lg text-yellow-300">
                Eventos aguardando aprovacao
              </CardTitle>
              <p className="text-sm text-white/70">
                Solicitacoes que voce enviou para se tornar publicas.
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
                      <Badge className="bg-yellow-600 text-black">Pendencia</Badge>
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

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Informacoes pessoais */}
          <Card className="border border-[#C2A537]/30 bg-black/70 shadow-[0_12px_30px_-10px_rgba(194,165,55,0.35)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-[#C2A537]">
                  Informacoes Pessoais
                </CardTitle>
                <p className="text-xs text-white/60">
                  Seus dados de contato e idade
                </p>
              </div>
              <User className="h-5 w-5 text-[#C2A537]" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-white/70">E-mail</span>
                <span className="font-semibold text-white">
                  {studentData.personalData.email}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-white/70">Idade</span>
                <span className="font-semibold text-white">{age} anos</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-white/70">Telefone</span>
                <span className="font-semibold text-white">
                  {studentData.personalData.telephone}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Dados de saude + grafico */}
          <Card className="border border-green-500/30 bg-gradient-to-br from-green-900/30 via-black/60 to-black/80 shadow-[0_12px_30px_-10px_rgba(16,185,129,0.4)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-green-300">
                  Dados de Saude
                </CardTitle>
                <p className="text-xs text-white/70">
                  Metrica atual e evolucao do peso
                </p>
              </div>
              <Heart className="h-5 w-5 text-green-300" />
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-center">
                  <p className="text-xs text-white/60">Altura</p>
                  <p className="text-lg font-semibold text-white">
                    {studentData.healthMetrics.heightCm} cm
                  </p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-center">
                  <p className="text-xs text-white/60">Peso</p>
                  <p className="text-lg font-semibold text-white">
                    {studentData.healthMetrics.weightKg} kg
                  </p>
                </div>
                <div className="rounded-lg border border-white/5 bg-white/5 px-3 py-2 text-center">
                  <p className="text-xs text-white/60">Tipo sanguineo</p>
                  <p className="text-lg font-semibold text-white">
                    {studentData.healthMetrics.bloodType || "-"}
                  </p>
                </div>
              </div>
              <Separator className="bg-white/10" />
              <div>
                <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                  <span>Evolucao do peso</span>
                  <span className="inline-flex items-center gap-1 text-green-300">
                    <Dumbbell className="h-3 w-3" />
                    {weightSeries.length > 0
                      ? `${weightSeries[weightSeries.length - 1].weight} kg`
                      : "Sem dados"}
                  </span>
                </div>
                {weightSeries.length === 0 ? (
                  <p className="text-xs text-white/60">
                    Adicione medicoes para visualizar o grafico.
                  </p>
                ) : (
                  <WeightSparkline data={weightSeries} />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status Financeiro */}
          <Card className="border border-[#C2A537]/40 bg-gradient-to-br from-[#C2A537]/10 via-black/70 to-black/85 shadow-[0_12px_30px_-10px_rgba(194,165,55,0.45)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-[#C2A537]">
                  Status Financeiro
                </CardTitle>
                <p className="text-xs text-white/70">
                  Mensalidade e vencimento
                </p>
              </div>
              <Wallet className="h-5 w-5 text-[#C2A537]" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-white/70">Mensalidade</span>
                <span className="font-semibold text-[#C2A537]">
                  {monthlyFee}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-white/70">Vencimento</span>
                <span className="font-semibold text-white">
                  Dia {studentData.financial.dueDate}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2">
                <span className="text-white/70">Status</span>
                <span
                  className={`font-semibold ${
                    studentData.financial.paid ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {studentData.financial.paid ? "Em dia" : "Pendente"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historico de check-ins */}
        <div className="mt-8">
          <Card className="border border-blue-500/30 bg-gradient-to-br from-blue-900/20 via-black/70 to-black/85 shadow-[0_12px_30px_-10px_rgba(59,130,246,0.4)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-blue-200">
                  Historico de Check-ins
                </CardTitle>
                <p className="text-xs text-white/70">
                  Ultimos registros de presenca
                </p>
              </div>
              <Activity className="h-5 w-5 text-blue-200" />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {recentCheckIns.length === 0 ? (
                <p className="text-white/60">Nenhum check-in registrado.</p>
              ) : (
                recentCheckIns.map((ci) => {
                  const dt = new Date(`${ci.checkInDate}T${ci.checkInTime}`);
                  return (
                    <div
                      key={ci.id}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-3 py-2"
                    >
                      <div className="flex flex-col">
                        <span className="font-semibold text-white">
                          {dt.toLocaleDateString("pt-BR")} as {ci.checkInTime.slice(0, 5)}
                        </span>
                        <span className="text-xs text-white/60">
                          Metodo: {ci.method || "manual"}
                        </span>
                      </div>
                      <Badge className="bg-blue-600 text-white">Presenca</Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function WeightSparkline({
  data,
}: {
  data: { date: Date; weight: number }[];
}) {
  const width = 320;
  const height = 140;
  const padding = 20;

  const weights = data.map((d) => d.weight);
  const minWeight = Math.min(...weights);
  const maxWeight = Math.max(...weights);
  const range = maxWeight - minWeight || 1;

  const points = data.map((d, idx) => {
    const x =
      data.length === 1
        ? width / 2
        : padding +
          (idx / Math.max(data.length - 1, 1)) * (width - padding * 2);
    const y =
      padding +
      (1 - (d.weight - minWeight) / range) * (height - padding * 2);
    return { x, y, weight: d.weight, date: d.date };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <div className="rounded-xl border border-white/5 bg-black/40 p-3">
      <svg width={width} height={height} role="img">
        <defs>
          <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={`${pathD} L ${points[points.length - 1].x} ${
            height - padding
          } L ${points[0].x} ${height - padding} Z`}
          fill="url(#weightFill)"
          stroke="none"
        />
        <path
          d={pathD}
          fill="none"
          stroke="#22c55e"
          strokeWidth={2}
          strokeLinecap="round"
        />
        {points.map((p) => (
          <g key={`${p.x}-${p.y}`}>
            <circle cx={p.x} cy={p.y} r={4} fill="#22c55e" />
          </g>
        ))}
      </svg>
      <div className="mt-2 flex items-center justify-between text-xs text-white/60">
        <span>
          {data[0].date.toLocaleDateString("pt-BR")} —{" "}
          {data[data.length - 1].date.toLocaleDateString("pt-BR")}
        </span>
        <span className="text-green-300">
          {minWeight}kg → {maxWeight}kg
        </span>
      </div>
    </div>
  );
}
