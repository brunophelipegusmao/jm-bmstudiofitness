"use client";

import {
  BarChart3,
  DollarSign,
  Eye,
  EyeOff,
  Heart,
  LogOut,
  Plus,
  Search,
  User,
  Users,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import { logoutAction } from "@/actions/auth/logout-action";
import { updateCoachObservationsAction } from "@/actions/coach/update-coach-observations-action";
import { AdminLayout } from "@/components/Admin/AdminLayout";
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

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<StudentFullData[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentFullData[]>(
    [],
  );
  const [selectedStudent, setSelectedStudent] =
    useState<StudentFullData | null>(null);
  const [activeTab, setActiveTab] = useState<
    "personal" | "financial" | "health"
  >("personal");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Função para carregar dados dos alunos
  const loadStudents = async () => {
    try {
      const data = await getAllStudentsFullDataAction();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error("Erro ao carregar dados dos alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados dos alunos
  useEffect(() => {
    loadStudents();
  }, []);

  // Filtrar alunos baseado na pesquisa
  useEffect(() => {
    if (!searchTerm) {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.cpf.includes(searchTerm),
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  // Estatísticas
  const totalStudents = students.length;
  const studentsUpToDate = students.filter((s) => s.isPaymentUpToDate).length;
  const studentsOverdue = totalStudents - studentsUpToDate;

  // Dados para gráfico de frequência por turno (simulado)
  const shiftData = [
    {
      shift: "Manhã",
      count: Math.floor(totalStudents * 0.3),
      color: "bg-orange-500",
    },
    {
      shift: "Tarde",
      count: Math.floor(totalStudents * 0.4),
      color: "bg-blue-500",
    },
    {
      shift: "Noite",
      count: Math.floor(totalStudents * 0.3),
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-lg text-[#C2A537]">Carregando dashboard...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen w-full p-2 lg:p-8 xl:p-1">
        <div className="mx-auto space-y-8">
          {/* Cabeçalho */}
          <Card className="border-[#C2A537] bg-black/95">
            <CardHeader>
              <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
                <div className="text-center lg:text-left">
                  <CardTitle className="text-2xl text-[#C2A537] lg:text-3xl xl:text-4xl">
                    🏋️ Dashboard Administrativo
                  </CardTitle>
                  <CardDescription className="text-lg text-slate-300 lg:text-xl">
                    Visualize e gerencie informações completas dos alunos
                  </CardDescription>
                </div>

                {/* Botão de Logout */}
                <form action={logoutAction}>
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
            </CardHeader>
          </Card>

          {/* Estatísticas gerais */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            <Card className="border-blue-600 bg-blue-900/30">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-4">
                  <Users className="h-10 w-10 text-blue-400 lg:h-12 lg:w-12" />
                  <div>
                    <p className="text-2xl font-bold text-blue-400 lg:text-3xl xl:text-4xl">
                      {totalStudents}
                    </p>
                    <p className="text-sm text-blue-300 lg:text-base">
                      Total de Alunos
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-600 bg-green-900/30">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-10 w-10 text-green-400 lg:h-12 lg:w-12" />
                  <div>
                    <p className="text-2xl font-bold text-green-400 lg:text-3xl xl:text-4xl">
                      {studentsUpToDate}
                    </p>
                    <p className="text-sm text-green-300 lg:text-base">
                      Pagamentos em Dia
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-600 bg-red-900/30">
              <CardContent className="p-6 lg:p-8">
                <div className="flex items-center gap-4">
                  <DollarSign className="h-10 w-10 text-red-400 lg:h-12 lg:w-12" />
                  <div>
                    <p className="text-2xl font-bold text-red-400 lg:text-3xl xl:text-4xl">
                      {studentsOverdue}
                    </p>
                    <p className="text-sm text-red-300 lg:text-base">
                      Pagamentos em Atraso
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Frequência por Turno - Linha completa */}
          <div className="w-full">
            <Card className="border-[#C2A537] bg-[#C2A537]/10">
              <CardContent className="p-6 lg:p-8">
                <div className="mb-6 flex items-center gap-4 lg:mb-8">
                  <BarChart3 className="h-10 w-10 text-[#C2A537] lg:h-12 lg:w-12" />
                  <div>
                    <p className="text-xl font-bold text-[#C2A537] lg:text-2xl xl:text-3xl">
                      Frequência por Turno
                    </p>
                    <p className="text-sm text-[#C2A537] lg:text-base">
                      Distribuição dos alunos ao longo do dia
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
                  {shiftData.map((shift) => (
                    <div key={shift.shift} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-white lg:text-xl">
                          {shift.shift}
                        </span>
                        <span className="text-2xl font-bold text-white lg:text-3xl">
                          {shift.count}
                        </span>
                      </div>
                      <div className="h-4 rounded-full bg-slate-700 lg:h-6">
                        <div
                          className={`${shift.color} h-full rounded-full transition-all duration-700 ease-out`}
                          style={{
                            width: `${totalStudents > 0 ? (shift.count / totalStudents) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <div className="text-sm text-slate-400 lg:text-base">
                        {totalStudents > 0
                          ? Math.round((shift.count / totalStudents) * 100)
                          : 0}
                        % do total
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Busca Global */}
          <div className="w-full">
            <Card className="border-[#C2A537]/50 bg-linear-to-r from-[#C2A537]/5 to-transparent shadow-sm">
              <CardContent className="p-3 lg:p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-[#C2A537]" />
                    <h3 className="text-sm font-medium whitespace-nowrap text-[#C2A537] lg:text-base">
                      Buscar Aluno:
                    </h3>
                  </div>
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-3 w-3 -translate-y-1/2 text-slate-400 lg:h-4 lg:w-4" />
                    <Input
                      placeholder="🔍 Nome, email ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="h-8 border-[#867536]/50 bg-[#d7ceac]/80 pl-8 text-sm text-black focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537]/30 lg:h-9 lg:pl-10"
                    />
                    {searchTerm && (
                      <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <span className="rounded-full bg-slate-200/80 px-2 py-1 text-xs text-slate-600">
                          {filteredStudents.length}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Resultados da Busca */}
                {searchTerm && filteredStudents.length > 0 && (
                  <div className="mt-3 max-h-48 space-y-2 overflow-y-auto rounded-lg border border-[#C2A537]/20 bg-black/30 p-3">
                    {filteredStudents.map((student) => (
                      <div
                        key={student.userId}
                        onClick={() => {
                          setSelectedStudent(student);
                          setSearchTerm("");
                        }}
                        className={`cursor-pointer rounded-lg border p-2 transition-colors hover:bg-[#C2A537]/10 ${
                          selectedStudent?.userId === student.userId
                            ? "border-[#C2A537] bg-[#C2A537]/20"
                            : "border-slate-700/50 bg-slate-800/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                              student.isPaymentUpToDate
                                ? "bg-green-600"
                                : "bg-red-600"
                            }`}
                          >
                            <User className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">
                              {student.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {student.email}
                            </p>
                          </div>
                          <div className="text-xs">
                            {student.isPaymentUpToDate ? "✅" : "❌"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Aluno Selecionado */}
                {selectedStudent && (
                  <div className="mt-4 flex items-center justify-between rounded-lg border border-[#C2A537] bg-[#C2A537]/20 p-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${
                          selectedStudent.isPaymentUpToDate
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                      >
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-[#C2A537] lg:text-lg">
                          {selectedStudent.name}
                        </p>
                        <p className="text-sm text-slate-300">
                          {selectedStudent.email}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      className="rounded-md bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                    >
                      Limpar
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Seção principal com lista e detalhes */}
          <div className="grid gap-8 xl:gap-12">
            {/* Detalhes do aluno selecionado - Ocupa toda a largura */}
            <div className="w-full">
              {selectedStudent ? (
                <StudentDetailsCard
                  student={selectedStudent}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              ) : (
                <Card className="border-slate-700 bg-slate-800/50">
                  <CardContent className="flex h-96 items-center justify-center">
                    <div className="text-center">
                      <User className="mx-auto h-16 w-16 text-slate-500" />
                      <p className="mt-4 text-slate-400">
                        Selecione um aluno para ver os detalhes
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

interface StudentDetailsCardProps {
  student: StudentFullData;
  activeTab: "personal" | "financial" | "health";
  setActiveTab: (tab: "personal" | "financial" | "health") => void;
}

function StudentDetailsCard({
  student,
  activeTab,
  setActiveTab,
}: StudentDetailsCardProps) {
  return (
    <Card className="border-[#C2A537] bg-black/95">
      <CardHeader className="p-6 lg:p-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl text-[#C2A537] lg:text-3xl xl:text-4xl">
              {student.name}
            </CardTitle>
            <CardDescription className="text-base text-slate-300 lg:text-lg">
              Cadastrado em{" "}
              {new Date(student.createdAt).toLocaleDateString("pt-BR")}
            </CardDescription>
          </div>
          <div
            className={`rounded-full px-4 py-2 text-sm font-medium lg:px-6 lg:py-3 lg:text-base ${
              student.isPaymentUpToDate
                ? "bg-green-600 text-green-100"
                : "bg-red-600 text-red-100"
            }`}
          >
            {student.isPaymentUpToDate ? "✅ Em dia" : "❌ Atraso"}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-2 rounded-lg bg-slate-800 p-2 lg:space-x-3 lg:p-3">
          {[
            { id: "personal" as const, label: "Dados Pessoais", icon: User },
            { id: "financial" as const, label: "Financeiro", icon: DollarSign },
            { id: "health" as const, label: "Saúde", icon: Heart },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors lg:gap-3 lg:px-6 lg:py-4 lg:text-base ${
                activeTab === tab.id
                  ? "bg-[#C2A537] text-black"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <tab.icon className="h-4 w-4 lg:h-5 lg:w-5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-6 lg:p-8">
        {activeTab === "personal" && <PersonalDataTab student={student} />}
        {activeTab === "financial" && <FinancialDataTab student={student} />}
        {activeTab === "health" && <HealthDataTab student={student} />}
      </CardContent>
    </Card>
  );
}

function PersonalDataTab({ student }: { student: StudentFullData }) {
  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Nome Completo
          </label>
          <p className="text-base text-white lg:text-lg">{student.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Email
          </label>
          <p className="text-base text-white lg:text-lg">{student.email}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            CPF
          </label>
          <p className="text-base text-white lg:text-lg">
            {formatCPF(student.cpf)}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Telefone
          </label>
          <p className="text-base text-white lg:text-lg">{student.telephone}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Data de Nascimento
          </label>
          <p className="text-base text-white lg:text-lg">
            {new Date(student.bornDate).toLocaleDateString("pt-BR")} (
            {student.age} anos)
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Tipo Sanguíneo
          </label>
          <p className="text-base text-white lg:text-lg">{student.bloodType}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#C2A537] lg:text-base">
          Endereço
        </label>
        <p className="text-base text-white lg:text-lg">{student.address}</p>
      </div>

      <div>
        <label className="text-sm font-medium text-[#C2A537]">
          Endereço Completo
        </label>
        <p className="text-white">{student.address}</p>
      </div>
    </div>
  );
}

function FinancialDataTab({ student }: { student: StudentFullData }) {
  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Valor da Mensalidade
          </label>
          <p className="text-2xl font-bold text-white lg:text-3xl xl:text-4xl">
            {student.formattedMonthlyFee}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Método de Pagamento
          </label>
          <p className="text-base text-white capitalize lg:text-lg">
            {student.paymentMethod.replace("_", " ")}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Dia de Vencimento
          </label>
          <p className="text-base text-white lg:text-lg">
            Dia {student.dueDate} de cada mês
          </p>
        </div>
        <div className="md:col-span-2 xl:col-span-1">
          <label className="text-sm font-medium text-[#C2A537] lg:text-base">
            Status do Pagamento
          </label>
          <div
            className={`inline-flex rounded-full px-4 py-2 text-sm font-medium lg:px-6 lg:py-3 lg:text-base ${
              student.isPaymentUpToDate
                ? "bg-green-600 text-green-100"
                : "bg-red-600 text-red-100"
            }`}
          >
            {student.isPaymentUpToDate ? "✅ Em dia" : "❌ Em atraso"}
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-[#C2A537] lg:text-base">
          Último Pagamento
        </label>
        <p className="text-base text-white lg:text-lg">
          {student.lastPaymentDate
            ? new Date(student.lastPaymentDate).toLocaleDateString("pt-BR")
            : "Nenhum pagamento registrado"}
        </p>
      </div>
    </div>
  );
}

function HealthDataTab({ student }: { student: StudentFullData }) {
  const [showAddObservations, setShowAddObservations] = useState(false);
  const [showGeneralHistory, setShowGeneralHistory] = useState(false);
  const [showPrivateHistory, setShowPrivateHistory] = useState(false);

  const initialState = { success: false, error: "", message: "" };
  const [state, action, isPending] = useActionState(
    updateCoachObservationsAction,
    initialState,
  );

  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Dados físicos */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#C2A537] lg:mb-6 lg:text-xl xl:text-2xl">
          Dados Físicos
        </h3>
        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Altura
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.heightCm} cm
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Peso
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.weightKg} kg
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Tipo Sanguíneo
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.bloodType}
            </p>
          </div>
        </div>
      </div>

      {/* Histórico de atividades */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#C2A537] lg:mb-6 lg:text-xl xl:text-2xl">
          Histórico de Atividades
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8 xl:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Praticou esportes antes?
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.hasPracticedSports ? "Sim" : "Não"}
            </p>
          </div>
          <div className="xl:col-span-2">
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Último exercício
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.lastExercise}
            </p>
          </div>
          <div className="md:col-span-2 xl:col-span-3">
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Histórico esportivo
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.sportsHistory}
            </p>
          </div>
        </div>
      </div>

      {/* Saúde e medicamentos */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#C2A537] lg:mb-6 lg:text-xl xl:text-2xl">
          Saúde e Medicamentos
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Histórico de doenças
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.historyDiseases || "Nenhum"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Medicamentos em uso
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.medications || "Nenhum"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Alergias
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.allergies || "Nenhuma"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Lesões
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.injuries || "Nenhuma"}
            </p>
          </div>
        </div>
      </div>

      {/* Hábitos e rotina */}
      <div>
        <h3 className="mb-4 text-lg font-semibold text-[#C2A537] lg:mb-6 lg:text-xl xl:text-2xl">
          Hábitos e Rotina
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Rotina alimentar
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.alimentalRoutine}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Rotina diária
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.diaryRoutine}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-[#C2A537] lg:text-base">
              Usa suplementos?
            </label>
            <p className="text-base text-white lg:text-lg">
              {student.useSupplements ? "Sim" : "Não"}
            </p>
          </div>
          {student.useSupplements && student.whatSupplements && (
            <div>
              <label className="text-sm font-medium text-[#C2A537] lg:text-base">
                Quais suplementos?
              </label>
              <p className="text-base text-white lg:text-lg">
                {student.whatSupplements}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Observações */}
      <div>
        <div className="mb-4 flex items-center justify-between lg:mb-6">
          <h3 className="text-lg font-semibold text-[#C2A537] lg:text-xl xl:text-2xl">
            Observações
          </h3>
          <Button
            onClick={() => setShowAddObservations(!showAddObservations)}
            variant="outline"
            className="border-[#C2A537] bg-black/95 text-[#C2A537] hover:bg-[#C2A537]/10 hover:text-[#D4B547]"
          >
            <Plus className="mr-2 h-4 w-4" />
            {showAddObservations ? "Cancelar" : "Adicionar Observação"}
          </Button>
        </div>

        {/* Formulário de Observações */}
        {showAddObservations && (
          <Card className="mb-6 border-[#C2A537]/30 bg-black/40">
            <CardHeader>
              <CardTitle className="text-[#C2A537]">
                Adicionar Observação de Treinamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form action={action} className="space-y-4">
                <input type="hidden" name="studentId" value={student.userId} />

                <div>
                  <Label
                    htmlFor="generalObservations"
                    className="text-slate-300"
                  >
                    Observações Gerais (visíveis para o aluno)
                  </Label>
                  <textarea
                    id="generalObservations"
                    name="generalObservations"
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-[#C2A537]/30 bg-slate-900/50 p-3 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]"
                    placeholder="Digite observações sobre o treino, progresso, etc."
                    defaultValue={student.coachaObservations || ""}
                  />
                </div>

                <div>
                  <Label
                    htmlFor="privateObservations"
                    className="text-slate-300"
                  >
                    Observações Particulares (apenas para treinadores/admin)
                  </Label>
                  <textarea
                    id="privateObservations"
                    name="privateObservations"
                    rows={3}
                    className="mt-1 block w-full rounded-md border border-[#C2A537]/30 bg-slate-900/50 p-3 text-slate-200 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]"
                    placeholder="Digite observações privadas, anotações pessoais..."
                    defaultValue={student.coachObservationsParticular || ""}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="border-[#C2A537] bg-[#C2A537] text-black hover:bg-[#D4B547]"
                  >
                    {isPending ? "Salvando..." : "Salvar Observações"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddObservations(false)}
                    className="border-slate-600 text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6 lg:space-y-8">
          {student.otherNotes && (
            <div>
              <label className="text-sm font-medium text-[#C2A537] lg:text-base">
                Observações do aluno
              </label>
              <p className="text-base text-white lg:text-lg">
                {student.otherNotes}
              </p>
            </div>
          )}
          {student.coachaObservations && (
            <div>
              <label className="text-sm font-medium text-[#C2A537] lg:text-base">
                Observações do treinador
              </label>
              <p className="text-base text-white lg:text-lg">
                {student.coachaObservations}
              </p>
              <Button
                onClick={() => setShowGeneralHistory(!showGeneralHistory)}
                variant="ghost"
                className="mt-2 text-slate-400 hover:text-[#C2A537]"
              >
                <Eye className="mr-2 h-4 w-4" />
                {showGeneralHistory ? "Ocultar" : "Ver"} histórico
              </Button>
            </div>
          )}
          {student.coachObservationsParticular && (
            <div>
              <label className="text-sm font-medium text-[#C2A537] lg:text-base">
                Observações particulares
              </label>
              <p className="text-base text-white lg:text-lg">
                {student.coachObservationsParticular}
              </p>
              <Button
                onClick={() => setShowPrivateHistory(!showPrivateHistory)}
                variant="ghost"
                className="mt-2 text-slate-400 hover:text-[#C2A537]"
              >
                <EyeOff className="mr-2 h-4 w-4" />
                {showPrivateHistory ? "Ocultar" : "Ver"} histórico
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-xs text-slate-400 lg:mt-8 lg:text-sm">
        Dados de saúde atualizados em:{" "}
        {new Date(student.healthUpdatedAt).toLocaleDateString("pt-BR")}
      </div>
    </div>
  );
}
