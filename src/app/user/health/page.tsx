"use client";

import { ArrowLeft, Heart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getStudentHealthHistoryAction } from "@/actions/user/get-health-history-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface HealthEntry {
  id: string;
  heightCm: number | null;
  weightKg: string | null;
  notes: string | null;
  updatedAt: string;
  createdAt: string;
}

interface CurrentHealthData {
  heightCm: number;
  weightKg: number;
  bloodType: string;
  updatedAt: string;
}

export default function StudentHealthHistoryPage() {
  const [healthHistory, setHealthHistory] = useState<HealthEntry[]>([]);
  const [currentHealth, setCurrentHealth] = useState<CurrentHealthData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHealthData = async () => {
      try {
        const data = await getStudentHealthHistoryAction();
        if (data.success) {
          setHealthHistory(data.history || []);
          setCurrentHealth(data.currentHealth || null);
        } else {
          setError(data.message);
        }
      } catch {
        setError("Erro ao carregar historico de saude");
      } finally {
        setLoading(false);
      }
    };

    loadHealthData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen text-white">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-[#C2A537]">Carregando historico...</p>
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
        {/* Cabecalho */}
        <Card className="mb-8 border-[#C2A537] bg-black/95">
          <CardHeader>
            <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
              <div className="text-center lg:text-left">
                <CardTitle className="flex items-center gap-2 text-2xl text-[#C2A537] lg:text-3xl">
                  <Heart className="h-8 w-8" />
                  Historico de Saude
                </CardTitle>
                <CardDescription className="text-lg text-slate-300">
                  Atualizacoes de saude sao registradas pela equipe (admins, professores e funcionarios).
                </CardDescription>
              </div>

              <div className="flex gap-2">
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
            </div>
          </CardHeader>
        </Card>

        {/* Dados Atuais de Saude */}
        {currentHealth && (
          <Card className="mb-8 border-green-600 bg-green-900/30">
            <CardHeader>
              <CardTitle className="text-green-400">Seus Dados Atuais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-green-300">Altura</p>
                  <p className="text-xl font-semibold text-white">
                    {currentHealth.heightCm} cm
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-300">Peso</p>
                  <p className="text-xl font-semibold text-white">
                    {currentHealth.weightKg} kg
                  </p>
                </div>
                <div>
                  <p className="text-sm text-green-300">Tipo Sanguineo</p>
                  <p className="text-xl font-semibold text-white">
                    {currentHealth.bloodType}
                  </p>
                </div>
              </div>
              <p className="mt-4 text-xs text-green-300">
                Ultima atualizacao:{" "}
                {new Date(currentHealth.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Historico */}
        <Card className="border-[#C2A537]/50 bg-black/40">
          <CardHeader>
            <CardTitle className="text-[#C2A537]">Historico de Entradas</CardTitle>
            <CardDescription>
              Registro das atualizacoes feitas pela equipe
            </CardDescription>
          </CardHeader>
          <CardContent>
            {healthHistory.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-slate-300">
                  Nenhuma entrada de saude registrada ate o momento.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {healthHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-slate-800 bg-slate-900/60 p-4"
                  >
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm text-slate-400">Atualizado em</p>
                        <p className="text-lg font-semibold text-white">
                          {new Date(entry.updatedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <div className="grid gap-2 text-sm text-slate-200 md:grid-cols-3">
                        <span>
                          Altura: {entry.heightCm ?? "-"} cm
                        </span>
                        <span>
                          Peso: {entry.weightKg ?? "-"} kg
                        </span>
                        <span>
                          Observacoes: {entry.notes ?? "-"}
                        </span>
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

