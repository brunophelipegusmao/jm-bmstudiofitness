"use client";

import { ArrowLeft, CalendarCheck, Clock, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getStudentCheckInsAction } from "@/actions/user/get-check-ins-action";
import CheckInCalendar from "@/components/CheckInCalendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CheckIn {
  id: string;
  checkInDate: string;
  checkInTime: string;
  checkInTimestamp: string;
  method: string;
  identifier: string;
  createdAt: string;
}

interface CheckInStats {
  totalCheckIns: number;
  thisMonth: number;
  thisWeek: number;
  lastCheckIn: string | null;
}

interface GetCheckInsResponse {
  success: boolean;
  message: string;
  checkIns?: CheckIn[];
  stats?: CheckInStats;
}

export default function StudentCheckInsPage() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        const data: GetCheckInsResponse = await getStudentCheckInsAction();
        if (data.success) {
          setCheckIns(data.checkIns || []);
          setStats(data.stats || null);
        } else {
          setError(data.message);
        }
      } catch {
        setError("Erro ao carregar histórico de check-ins");
      } finally {
        setLoading(false);
      }
    };

    loadCheckIns();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-[#C2A537]">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <Card className="w-full max-w-md border-red-600 bg-red-900/30">
            <CardContent className="p-6 text-center">
              <p className="text-red-400">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      <div className="container mx-auto p-4 lg:p-8">
        {/* Cabeçalho */}
        <Card className="mb-8 border-[#C2A537] bg-black/95">
          <CardHeader>
            <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
              <div className="text-center lg:text-left">
                <CardTitle className="flex items-center gap-2 text-2xl text-[#C2A537] lg:text-3xl">
                  <CalendarCheck className="h-8 w-8" />
                  Histórico de Check-ins
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Acompanhe sua frequência no estúdio
                </CardDescription>
              </div>

              <Link href="/user/dashboard">
                <Button
                  variant="outline"
                  className="border-[#C2A537] bg-black/95 text-[#C2A537] hover:bg-[#C2A537]/10 hover:text-[#D4B547]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar
                </Button>
              </Link>
            </div>
          </CardHeader>
        </Card>

        {/* Estatísticas */}
        {stats && (
          <div className="mb-8 grid gap-4 md:grid-cols-4">
            <Card className="border-blue-600 bg-blue-900/30">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-2xl font-bold text-blue-400">
                  {stats.totalCheckIns}
                </div>
                <p className="text-sm text-blue-300">Total de Check-ins</p>
              </CardContent>
            </Card>

            <Card className="border-green-600 bg-green-900/30">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-2xl font-bold text-green-400">
                  {stats.thisMonth}
                </div>
                <p className="text-sm text-green-300">Este Mês</p>
              </CardContent>
            </Card>

            <Card className="border-orange-600 bg-orange-900/30">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-2xl font-bold text-orange-400">
                  {stats.thisWeek}
                </div>
                <p className="text-sm text-orange-300">Esta Semana</p>
              </CardContent>
            </Card>

            <Card className="border-purple-600 bg-purple-900/30">
              <CardContent className="p-6 text-center">
                <div className="mb-2 text-sm font-bold text-purple-400">
                  {stats.lastCheckIn
                    ? new Date(stats.lastCheckIn).toLocaleDateString("pt-BR")
                    : "Nunca"}
                </div>
                <p className="text-sm text-purple-300">Último Check-in</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Calendário de Check-ins */}
        <div className="mb-8">
          <CheckInCalendar
            checkIns={checkIns.map((checkIn) => ({
              date: new Date(checkIn.checkInTimestamp),
              time: new Date(checkIn.checkInTimestamp).toLocaleTimeString(
                "pt-BR",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                },
              ),
              status: "present" as const,
            }))}
            onDateClick={(date) => {
              const checkInsOnDate = checkIns.filter((checkIn) => {
                const checkInDate = new Date(checkIn.checkInTimestamp);
                return (
                  checkInDate.getDate() === date.getDate() &&
                  checkInDate.getMonth() === date.getMonth() &&
                  checkInDate.getFullYear() === date.getFullYear()
                );
              });
              if (checkInsOnDate.length > 0) {
                console.log("Check-ins na data:", checkInsOnDate);
              }
            }}
            showLegend={true}
          />
        </div>

        {/* Lista de Check-ins */}
        <Card className="border-[#C2A537]/50 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <History className="h-5 w-5" />
              Histórico Completo
            </CardTitle>
            <CardDescription>
              Todos os seus check-ins em ordem cronológica
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="py-8 text-center">
                <CalendarCheck className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                <p className="mb-2 text-slate-400">
                  Nenhum check-in registrado ainda
                </p>
                <p className="text-sm text-slate-500">
                  Faça seu primeiro check-in para começar a acompanhar sua
                  frequência
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {checkIns.map((checkIn) => (
                  <div
                    key={checkIn.id}
                    className="rounded-lg border border-slate-700 bg-slate-800/50 p-4 transition-colors hover:bg-slate-800/70"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="rounded-full bg-[#C2A537]/20 p-2">
                          <Clock className="h-4 w-4 text-[#C2A537]" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">
                            {new Date(
                              checkIn.checkInTimestamp,
                            ).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span>
                              Horário:{" "}
                              {new Date(
                                checkIn.checkInTimestamp,
                              ).toLocaleTimeString("pt-BR")}
                            </span>
                            <span>
                              Via: {checkIn.method === "cpf" ? "CPF" : "Email"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">
                          Check-in realizado em:
                        </p>
                        <p className="text-sm font-medium text-white">
                          {new Date(
                            checkIn.checkInTimestamp,
                          ).toLocaleDateString("pt-BR")}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(
                            checkIn.checkInTimestamp,
                          ).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
