"use client";

import { Clock, Search, User } from "lucide-react";
import { useEffect, useState } from "react";

import { employeeCheckInAction } from "@/actions/employee/employee-checkin-action";
import {
  getTodayCheckInsAction,
  type TodayCheckIn,
} from "@/actions/employee/get-today-checkins-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function EmployeeCheckInTab() {
  const [identifier, setIdentifier] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    studentName?: string;
    daysOverdue?: number;
  } | null>(null);

  const [todayCheckIns, setTodayCheckIns] = useState<TodayCheckIn[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Buscar check-ins de hoje
  const fetchTodayCheckIns = async () => {
    setLoadingHistory(true);
    try {
      const response = await getTodayCheckInsAction();
      if (response.success && response.data) {
        setTodayCheckIns(response.data);
      }
    } catch (error) {
      console.error("Erro ao buscar check-ins:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Carregar histórico ao montar o componente
  useEffect(() => {
    fetchTodayCheckIns();
  }, []);

  const handleCheckIn = async () => {
    if (!identifier.trim()) {
      setResult({
        success: false,
        message: "Por favor, insira CPF ou e-mail do aluno",
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Determinar método baseado no formato
      const isCPF = /^\d{11}$/.test(identifier.trim());
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim());

      if (!isCPF && !isEmail) {
        setResult({
          success: false,
          message: "Digite um CPF (11 dígitos) ou e-mail válido",
        });
        setLoading(false);
        return;
      }

      const method = isCPF ? "cpf" : "email";
      const response = await employeeCheckInAction(
        identifier.trim(),
        method,
        notes.trim() || undefined,
      );

      setResult(response);

      // Limpar formulário em caso de sucesso
      if (response.success) {
        setIdentifier("");
        setNotes("");
        // Recarregar histórico
        fetchTodayCheckIns();
      }
    } catch {
      setResult({
        success: false,
        message: "Erro ao processar check-in. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-50">
            <Search className="h-5 w-5 text-[#C2A537]" />
            Check-in de Aluno
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Realize check-in para alunos. Permite atraso de até 10 dias no
            pagamento.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-zinc-200">
              CPF ou E-mail do Aluno
            </Label>
            <Input
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Digite o CPF (11 dígitos) ou e-mail"
              className="border-zinc-700 bg-zinc-800 text-zinc-50"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleCheckIn();
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-zinc-200">
              Observações (opcional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações sobre este check-in..."
              className="border-zinc-700 bg-zinc-800 text-zinc-50"
              rows={3}
            />
          </div>

          <Button
            onClick={handleCheckIn}
            disabled={loading}
            className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547]"
          >
            {loading ? "Processando..." : "Realizar Check-in"}
          </Button>

          {result && (
            <div
              className={`rounded-lg p-4 ${
                result.success
                  ? "border border-green-500/30 bg-green-500/10"
                  : "border border-red-500/30 bg-red-500/10"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p
                    className={`font-medium ${
                      result.success ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {result.message}
                  </p>
                  {result.studentName && (
                    <p className="mt-1 text-sm text-zinc-400">
                      Aluno: {result.studentName}
                    </p>
                  )}
                  {result.daysOverdue && result.daysOverdue > 0 && (
                    <div className="mt-2">
                      <Badge
                        variant="outline"
                        className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                      >
                        {result.daysOverdue} dias de atraso no pagamento
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
            <h4 className="mb-2 font-semibold text-blue-400">ℹ️ Informações</h4>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>• Check-ins permitidos apenas de segunda a sexta-feira</li>
              <li>• Tolerância de até 10 dias de atraso no pagamento</li>
              <li>• Cada check-in fica registrado com seu nome</li>
              <li>• Aluno só pode fazer 1 check-in por dia</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card className="border-zinc-800 bg-gradient-to-br from-zinc-900 to-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-50">
            <Clock className="h-5 w-5 text-[#C2A537]" />
            Histórico de Hoje
          </CardTitle>
          <p className="text-sm text-zinc-400">
            Check-ins realizados hoje ({todayCheckIns.length})
          </p>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <p className="text-center text-sm text-zinc-500">
              Carregando check-ins...
            </p>
          ) : todayCheckIns.length === 0 ? (
            <p className="text-center text-sm text-zinc-500">
              Nenhum check-in realizado hoje ainda
            </p>
          ) : (
            <div className="space-y-3">
              {todayCheckIns.map((checkIn) => (
                <div
                  key={checkIn.id}
                  className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-[#C2A537]" />
                        <span className="font-semibold text-zinc-200">
                          {checkIn.studentName}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-zinc-400">
                        <Clock className="h-3 w-3" />
                        <span>{checkIn.checkInTime}</span>
                      </div>
                      {checkIn.notes && (
                        <p className="mt-2 text-sm text-zinc-400">
                          💬 {checkIn.notes}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-zinc-500">
                        Realizado por: {checkIn.performedByName}
                      </p>
                    </div>
                    {checkIn.paymentDaysOverdue !== null &&
                      checkIn.paymentDaysOverdue > 0 && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                        >
                          {checkIn.paymentDaysOverdue} dias atraso
                        </Badge>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
