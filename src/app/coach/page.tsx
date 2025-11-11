"use client";

import {
  Activity,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Heart,
  LogOut,
  Search,
  UserCheck,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { logoutFormAction } from "@/actions/auth/logout-action";
import {
  getStudentsHealthDataAction,
  StudentHealthData,
} from "@/actions/coach/get-students-health-data-action";
import {
  getProfessorCheckInsAction,
  professorCheckInAction,
} from "@/actions/coach/professor-checkin-action";
import { updateCoachObservationsAction } from "@/actions/coach/update-coach-observations-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCPF } from "@/lib/utils";

const CoachPage = () => {
  const [students, setStudents] = useState<StudentHealthData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentHealthData[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentHealthData | null>(null);
  const [showAddObservations, setShowAddObservations] = useState(false);
  const [showGeneralHistory, setShowGeneralHistory] = useState(false);
  const [showPrivateHistory, setShowPrivateHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSuccessState, setLastSuccessState] = useState(false);

  // Estados de check-in
  const [todayCheckIn, setTodayCheckIn] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [recentCheckIns, setRecentCheckIns] = useState<
    Array<{ date: string; checkInTime: string; notes: string | null }>
  >([]);

  const initialState = { success: false, error: "", message: "" };
  const [state, action, isPending] = useActionState(
    updateCoachObservationsAction,
    initialState,
  );

  // Carregar alunos ao montar o componente
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);
        const data = await getStudentsHealthDataAction();
        setStudents(data);
        setFilteredStudents(data);
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, []);

  // Carregar check-ins do professor
  useEffect(() => {
    const loadCheckIns = async () => {
      try {
        // Buscar últimos 7 dias
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const result = await getProfessorCheckInsAction(
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        );

        if (result.success && result.data) {
          setRecentCheckIns(result.data);

          // Verificar se há check-in hoje
          const today = new Date().toISOString().split("T")[0];
          const todayCheck = result.data.find((c) => c.date === today);
          if (todayCheck) {
            setTodayCheckIn({
              date: todayCheck.date,
              time: todayCheck.checkInTime,
            });
          }
        }
      } catch (error) {
        console.error("Erro ao carregar check-ins:", error);
      }
    };

    loadCheckIns();
  }, []);

  // Função de check-in
  const handleCheckIn = async () => {
    setCheckInLoading(true);
    setCheckInMessage(null);

    try {
      const result = await professorCheckInAction();

      if (result.success && result.checkInData) {
        setTodayCheckIn({
          date: result.checkInData.date,
          time: result.checkInData.time,
        });
        setCheckInMessage({
          type: "success",
          text: result.message || "Check-in realizado com sucesso!",
        });

        // Recarregar check-ins
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const checkInsResult = await getProfessorCheckInsAction(
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0],
        );

        if (checkInsResult.success && checkInsResult.data) {
          setRecentCheckIns(checkInsResult.data);
        }
      } else {
        setCheckInMessage({
          type: "error",
          text: result.error || "Erro ao realizar check-in",
        });
      }
    } catch (error) {
      console.error("Erro ao fazer check-in:", error);
      setCheckInMessage({
        type: "error",
        text: "Erro ao realizar check-in",
      });
    } finally {
      setCheckInLoading(false);
    }
  };

  // Filtrar alunos quando o termo de busca muda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.cpf.includes(searchTerm.replace(/\D/g, "")) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Resetar formulário após sucesso
  useEffect(() => {
    if (state.success && !lastSuccessState) {
      setShowAddObservations(false);
      setLastSuccessState(true);

      // Recarregar dados do aluno selecionado
      if (selectedStudent) {
        const selectedStudentId = selectedStudent.userId;
        const loadUpdatedStudent = async () => {
          try {
            const data = await getStudentsHealthDataAction();
            const updatedStudent = data.find(
              (s) => s.userId === selectedStudentId,
            );
            if (updatedStudent) {
              setSelectedStudent(updatedStudent);
              setStudents(data);
              setFilteredStudents(data);
            }
          } catch (error) {
            console.error("Erro ao recarregar dados:", error);
          }
        };
        loadUpdatedStudent();
      }
    } else if (!state.success && lastSuccessState) {
      setLastSuccessState(false);
    }
  }, [state.success, lastSuccessState, selectedStudent]);

  const handleStudentSelect = (student: StudentHealthData) => {
    setSelectedStudent(student);
    setShowAddObservations(false);
    setShowGeneralHistory(false);
    setShowPrivateHistory(false);
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  const formatObservationsHistory = (observations: string | null) => {
    if (!observations) return "Nenhuma observação registrada.";

    return observations
      .split("\n\n")
      .filter((obs) => obs.trim())
      .map((obs, index) => (
        <div
          key={index}
          className="mb-3 rounded-lg border-l-4 border-[#C2A537] bg-slate-800/50 p-3"
        >
          <p className="text-sm whitespace-pre-wrap text-slate-300">
            {obs.trim()}
          </p>
        </div>
      ));
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-spin text-[#C2A537]" />
          <p className="mt-4 text-lg text-slate-300">Carregando alunos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="space-y-6">
        {/* Title */}
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div>
            <h1 className="text-2xl font-bold text-[#C2A537] lg:text-3xl">
              Área do Coach
            </h1>
            <p className="text-sm text-slate-400 lg:text-base">
              Pesquise alunos e gerencie observações de saúde e treinamento
            </p>
          </div>

          {/* Botão de Logout */}
          <form action={logoutFormAction}>
            <Button
              type="submit"
              variant="outline"
              className="border-[#C2A537] bg-black/95 text-[#C2A537] hover:bg-[#C2A537]/10 hover:text-[#D4B547]"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </form>
        </div>

        {/* Card de Check-in do Professor */}
        <Card className="border-[#C2A537]/30 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Calendar className="h-5 w-5" />
              Check-in de Presença
            </CardTitle>
            <CardDescription>
              Registre sua presença hoje - Apenas marcação de horário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Status e Botão de Check-in */}
              <div className="space-y-4">
                {todayCheckIn ? (
                  <div className="rounded-lg border border-green-600 bg-green-900/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <h4 className="font-semibold text-green-400">
                        Check-in Realizado!
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Clock className="h-4 w-4" />
                      <span>Hoje às {todayCheckIn.time}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      onClick={handleCheckIn}
                      disabled={checkInLoading}
                      className="w-full bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
                    >
                      {checkInLoading ? (
                        <>
                          <Activity className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Fazer Check-in Agora
                        </>
                      )}
                    </Button>
                    <p className="text-center text-xs text-slate-400">
                      Marque sua presença com um clique
                    </p>
                  </div>
                )}

                {checkInMessage && (
                  <div
                    className={`rounded-lg border p-3 ${
                      checkInMessage.type === "success"
                        ? "border-green-600 bg-green-900/20 text-green-400"
                        : "border-red-600 bg-red-900/20 text-red-400"
                    }`}
                  >
                    <p className="text-sm">{checkInMessage.text}</p>
                  </div>
                )}
              </div>

              {/* Histórico Recente */}
              <div>
                <h4 className="mb-3 font-medium text-slate-300">
                  Últimos 7 dias
                </h4>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                  {recentCheckIns.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-500">
                      Nenhum check-in registrado
                    </p>
                  ) : (
                    recentCheckIns.map((checkIn, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between border-b border-slate-700 pb-2 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#C2A537]" />
                          <span className="text-sm text-slate-300">
                            {new Date(checkIn.date).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span className="text-sm text-slate-400">
                            {checkIn.checkInTime}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Busca */}
        <Card className="border-[#C2A537]/30 bg-black/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <Search className="h-5 w-5" />
              Buscar Aluno
            </CardTitle>
            <CardDescription>Pesquise por nome, CPF ou email</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                placeholder="Digite o nome, CPF ou email do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-[#C2A537]/30 bg-slate-900/50 pl-10 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Lista de Alunos */}
          <div className="lg:col-span-4">
            <Card className="border-[#C2A537]/30 bg-black/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                  <UserCheck className="h-5 w-5" />
                  Alunos ({filteredStudents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto p-0">
                {filteredStudents.length === 0 ? (
                  <div className="p-6 text-center text-slate-400">
                    {searchTerm
                      ? "Nenhum aluno encontrado"
                      : "Nenhum aluno cadastrado"}
                  </div>
                ) : (
                  <div className="space-y-2 p-4">
                    {filteredStudents.map((student) => (
                      <button
                        key={student.userId}
                        onClick={() => handleStudentSelect(student)}
                        className={`w-full rounded-lg border p-3 text-left transition-colors ${
                          selectedStudent?.userId === student.userId
                            ? "border-[#C2A537] bg-[#C2A537]/10"
                            : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:bg-slate-800"
                        }`}
                      >
                        <div className="font-medium text-slate-200">
                          {student.name}
                        </div>
                        <div className="text-sm text-slate-400">
                          {formatCPF(student.cpf)}
                        </div>
                        <div className="text-xs text-slate-500">
                          {student.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detalhes do Aluno */}
          <div className="lg:col-span-8">
            {selectedStudent ? (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <Card className="border-[#C2A537]/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                      <UserCheck className="h-5 w-5" />
                      {selectedStudent.name}
                    </CardTitle>
                    <CardDescription>
                      {calculateAge(selectedStudent.bornDate)} anos • CPF:{" "}
                      {formatCPF(selectedStudent.cpf)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label className="text-slate-400">Email</Label>
                      <p className="text-slate-200">{selectedStudent.email}</p>
                    </div>
                    <div>
                      <Label className="text-slate-400">
                        Data de Nascimento
                      </Label>
                      <p className="text-slate-200">
                        {new Date(selectedStudent.bornDate).toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Dados de Saúde */}
                <Card className="border-[#C2A537]/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                      <Heart className="h-5 w-5" />
                      Dados de Saúde
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <Label className="text-slate-400">Altura</Label>
                        <p className="text-slate-200">
                          {selectedStudent.heightCm} cm
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Peso</Label>
                        <p className="text-slate-200">
                          {selectedStudent.weightKg} kg
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-400">Tipo Sanguíneo</Label>
                        <p className="text-slate-200">
                          {selectedStudent.bloodType}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-slate-400">
                          Praticou Esportes
                        </Label>
                        <p className="text-slate-200">
                          {selectedStudent.hasPracticedSports ? "Sim" : "Não"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-slate-400">
                          Último Exercício
                        </Label>
                        <p className="text-slate-200">
                          {selectedStudent.lastExercise}
                        </p>
                      </div>
                    </div>

                    {selectedStudent.historyDiseases && (
                      <div>
                        <Label className="text-slate-400">
                          Histórico de Doenças
                        </Label>
                        <p className="whitespace-pre-wrap text-slate-200">
                          {selectedStudent.historyDiseases}
                        </p>
                      </div>
                    )}

                    {selectedStudent.medications && (
                      <div>
                        <Label className="text-slate-400">Medicamentos</Label>
                        <p className="whitespace-pre-wrap text-slate-200">
                          {selectedStudent.medications}
                        </p>
                      </div>
                    )}

                    {selectedStudent.allergies && (
                      <div>
                        <Label className="text-slate-400">Alergias</Label>
                        <p className="whitespace-pre-wrap text-slate-200">
                          {selectedStudent.allergies}
                        </p>
                      </div>
                    )}

                    {selectedStudent.injuries && (
                      <div>
                        <Label className="text-slate-400">Lesões</Label>
                        <p className="whitespace-pre-wrap text-slate-200">
                          {selectedStudent.injuries}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label className="text-slate-400">Rotina Alimentar</Label>
                      <p className="whitespace-pre-wrap text-slate-200">
                        {selectedStudent.alimentalRoutine}
                      </p>
                    </div>

                    <div>
                      <Label className="text-slate-400">Rotina Diária</Label>
                      <p className="whitespace-pre-wrap text-slate-200">
                        {selectedStudent.diaryRoutine}
                      </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label className="text-slate-400">
                          Usa Suplementos
                        </Label>
                        <p className="text-slate-200">
                          {selectedStudent.useSupplements ? "Sim" : "Não"}
                        </p>
                      </div>
                      {selectedStudent.useSupplements &&
                        selectedStudent.whatSupplements && (
                          <div>
                            <Label className="text-slate-400">
                              Quais Suplementos
                            </Label>
                            <p className="text-slate-200">
                              {selectedStudent.whatSupplements}
                            </p>
                          </div>
                        )}
                    </div>

                    {selectedStudent.otherNotes && (
                      <div>
                        <Label className="text-slate-400">
                          Outras Observações
                        </Label>
                        <p className="whitespace-pre-wrap text-slate-200">
                          {selectedStudent.otherNotes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Observações do Professor */}
                <Card className="border-[#C2A537]/30 bg-black/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                      <FileText className="h-5 w-5" />
                      Observações do Professor
                    </CardTitle>
                    <CardDescription>
                      Adicione observações sobre o aluno e acompanhe o histórico
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Botões de Ação */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          setShowAddObservations(!showAddObservations)
                        }
                        className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        {showAddObservations
                          ? "Cancelar"
                          : "Adicionar Observação"}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowGeneralHistory(!showGeneralHistory)
                        }
                        className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537]/10"
                      >
                        {showGeneralHistory ? (
                          <EyeOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Eye className="mr-2 h-4 w-4" />
                        )}
                        Histórico Geral
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() =>
                          setShowPrivateHistory(!showPrivateHistory)
                        }
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        {showPrivateHistory ? (
                          <EyeOff className="mr-2 h-4 w-4" />
                        ) : (
                          <Eye className="mr-2 h-4 w-4" />
                        )}
                        Histórico Particular
                      </Button>
                    </div>

                    {/* Formulário de Adicionar Observações */}
                    {showAddObservations && (
                      <form
                        action={action}
                        className="space-y-4 rounded-lg border border-[#C2A537]/30 bg-slate-900/50 p-4"
                      >
                        <input
                          type="hidden"
                          name="userId"
                          value={selectedStudent.userId}
                        />

                        <div>
                          <Label
                            htmlFor="coachObservations"
                            className="text-slate-300"
                          >
                            Observação Geral
                          </Label>
                          <textarea
                            id="coachObservations"
                            name="coachObservations"
                            rows={3}
                            placeholder="Observações gerais sobre o aluno..."
                            className="mt-1 w-full rounded-md border border-[#C2A537]/30 bg-slate-800 px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="coachObservationsParticular"
                            className="text-slate-300"
                          >
                            Observação Particular
                          </Label>
                          <textarea
                            id="coachObservationsParticular"
                            name="coachObservationsParticular"
                            rows={3}
                            placeholder="Observações particulares (confidenciais)..."
                            className="mt-1 w-full rounded-md border border-red-500/30 bg-slate-800 px-3 py-2 text-slate-200 placeholder:text-slate-500 focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                          />
                          <p className="mt-1 text-xs text-red-400">
                            Observações particulares são confidenciais e
                            visíveis apenas para professores
                          </p>
                        </div>

                        {state.error && (
                          <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3">
                            <p className="text-sm text-red-400">
                              {state.error}
                            </p>
                          </div>
                        )}

                        {state.success && (
                          <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3">
                            <p className="text-sm text-green-400">
                              {state.message}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            disabled={isPending}
                            className="bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
                          >
                            {isPending ? "Salvando..." : "Salvar Observação"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddObservations(false)}
                            className="border-slate-600 text-slate-400 hover:bg-slate-800"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    )}

                    {/* Histórico de Observações Gerais */}
                    {showGeneralHistory && (
                      <div className="rounded-lg border border-[#C2A537]/30 bg-slate-900/50 p-4">
                        <h4 className="mb-3 font-medium text-[#C2A537]">
                          Histórico de Observações Gerais
                        </h4>
                        <div className="max-h-60 overflow-y-auto">
                          {formatObservationsHistory(
                            selectedStudent.coachObservations,
                          )}
                        </div>
                      </div>
                    )}

                    {/* Histórico de Observações Particulares */}
                    {showPrivateHistory && (
                      <div className="rounded-lg border border-red-500/30 bg-slate-900/50 p-4">
                        <h4 className="mb-3 font-medium text-red-400">
                          Histórico de Observações Particulares
                        </h4>
                        <div className="max-h-60 overflow-y-auto">
                          {formatObservationsHistory(
                            selectedStudent.coachObservationsParticular,
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-[#C2A537]/30 bg-black/40">
                <CardContent className="flex min-h-[400px] items-center justify-center">
                  <div className="text-center">
                    <UserCheck className="mx-auto h-12 w-12 text-slate-600" />
                    <p className="mt-4 text-lg text-slate-400">
                      Selecione um aluno para ver os detalhes
                    </p>
                    <p className="text-sm text-slate-500">
                      Use a busca ao lado para encontrar alunos específicos
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachPage;
