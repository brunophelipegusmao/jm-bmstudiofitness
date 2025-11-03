"use client";

import { DollarSign, Eye, EyeOff, User, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import {
  DashboardHeader,
  FrequencyChart,
  LoadingSpinner,
  SearchBar,
  SearchResults,
  SelectedStudent,
  StatCard,
  StudentDetails,
} from "@/components/Dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  mockApiDelay,
  mockDashboardStats,
  mockStudentsData,
} from "@/lib/mock-data";
import { formatCPF } from "@/lib/utils";

// Tipos mockados baseados nos dados
type StudentFullData = (typeof mockStudentsData)[0];

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

  // Função para carregar dados dos alunos (mockada)
  const loadStudents = async () => {
    try {
      // Simula delay de API
      await mockApiDelay(800);
      setStudents(mockStudentsData);
      setFilteredStudents(mockStudentsData);
    } catch (error) {
      console.error("Erro ao carregar dados dos alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  // Filtrar alunos baseado no termo de busca
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        student.name.toLowerCase().includes(searchLower) ||
        student.email.toLowerCase().includes(searchLower) ||
        student.cpf.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""))
      );
    });

    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  // Calcular estatísticas
  const stats = mockDashboardStats;
  const totalStudents = stats.totalStudents;
  const studentsUpToDate = stats.studentsUpToDate;
  const studentsOverdue = stats.studentsOverdue;
  const shiftData = stats.shiftData;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner
            message="Carregando dashboard..."
            variant="gym"
            size="lg"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen w-full p-2 lg:p-8 xl:p-1">
        <div className="mx-auto space-y-8">
          {/* Cabeçalho */}
          <DashboardHeader
            title="🏋️ Dashboard Administrativo"
            description="Visualize e gerencie informações completas dos alunos - Modo Demo"
          />

          {/* Estatísticas gerais */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:gap-8">
            <StatCard
              title="Total de Alunos"
              value={totalStudents}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Pagamentos em Dia"
              value={studentsUpToDate}
              icon={DollarSign}
              color="green"
            />
            <StatCard
              title="Pagamentos em Atraso"
              value={studentsOverdue}
              icon={DollarSign}
              color="red"
            />
          </div>

          {/* Gráfico de Frequência por Turno - Linha completa */}
          <div className="w-full">
            <FrequencyChart
              title="Frequência por Turno"
              subtitle="Distribuição dos alunos ao longo do dia"
              data={shiftData}
              total={totalStudents}
            />
          </div>

          {/* Busca Global */}
          <div className="w-full">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="🔍 Nome, email ou CPF..."
              resultsCount={filteredStudents.length}
            >
              {/* Resultados da Busca */}
              {searchTerm && filteredStudents.length > 0 && (
                <SearchResults
                  students={filteredStudents.map((student) => ({
                    userId: student.userId,
                    name: student.name,
                    email: student.email,
                    isPaymentUpToDate: student.isPaymentUpToDate,
                  }))}
                  onSelect={(simplifiedStudent) => {
                    const fullStudent = filteredStudents.find(
                      (s) => s.userId === simplifiedStudent.userId,
                    );
                    if (fullStudent) {
                      setSelectedStudent(fullStudent);
                    }
                  }}
                  onClear={() => setSearchTerm("")}
                  selectedStudentId={selectedStudent?.userId}
                />
              )}

              {/* Aluno Selecionado */}
              {selectedStudent && (
                <SelectedStudent
                  student={{
                    userId: selectedStudent.userId,
                    name: selectedStudent.name,
                    email: selectedStudent.email,
                    isPaymentUpToDate: selectedStudent.isPaymentUpToDate,
                  }}
                  onClear={() => setSelectedStudent(null)}
                />
              )}
            </SearchBar>
          </div>

          {/* Seção principal com lista e detalhes */}
          <div className="w-full">
            {/* Detalhes do aluno selecionado - Ocupa toda a largura */}
            <div className="w-full">
              {selectedStudent ? (
                <StudentDetails
                  student={{
                    name: selectedStudent.name,
                    createdAt: selectedStudent.createdAt,
                    isPaymentUpToDate: selectedStudent.isPaymentUpToDate,
                  }}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                >
                  {activeTab === "personal" && (
                    <PersonalDataTab student={selectedStudent} />
                  )}
                  {activeTab === "financial" && (
                    <FinancialDataTab student={selectedStudent} />
                  )}
                  {activeTab === "health" && (
                    <HealthDataTab student={selectedStudent} />
                  )}
                </StudentDetails>
              ) : (
                <Card className="border-slate-700 bg-slate-800/50">
                  <CardContent className="flex h-96 items-center justify-center">
                    <div className="text-center">
                      <User className="mx-auto mb-4 h-16 w-16 text-slate-600" />
                      <p className="text-lg text-slate-400">
                        Selecione um aluno para ver os detalhes
                      </p>
                      <p className="text-sm text-slate-500">
                        Use a busca acima para encontrar um aluno específico
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

function PersonalDataTab({ student }: { student: StudentFullData }) {
  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Informações Básicas */}
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400">Nome Completo</Label>
              <p className="text-lg font-medium text-white">{student.name}</p>
            </div>
            <div>
              <Label className="text-slate-400">Email</Label>
              <p className="text-white">{student.email}</p>
            </div>
            <div>
              <Label className="text-slate-400">CPF</Label>
              <p className="text-white">{formatCPF(student.cpf)}</p>
            </div>
            <div>
              <Label className="text-slate-400">Data de Nascimento</Label>
              <p className="text-white">
                {new Date(student.bornDate).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              📞 Contato & Endereço
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400">Telefone</Label>
              <p className="text-white">{student.telephone}</p>
            </div>
            <div>
              <Label className="text-slate-400">Endereço</Label>
              <p className="text-white">{student.address}</p>
            </div>
            <div>
              <Label className="text-slate-400">Turno Preferencial</Label>
              <p className="text-white">{student.shift}</p>
            </div>
            <div>
              <Label className="text-slate-400">Data de Cadastro</Label>
              <p className="text-white">
                {new Date(student.createdAt).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function FinancialDataTab({ student }: { student: StudentFullData }) {
  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <DollarSign className="h-5 w-5" />
              Status de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400">Status Atual</Label>
              <p
                className={`text-lg font-semibold ${
                  student.financial.paid ? "text-green-400" : "text-red-400"
                }`}
              >
                {student.financial.paid ? "✅ Em dia" : "❌ Pendente"}
              </p>
            </div>
            <div>
              <Label className="text-slate-400">Valor da Mensalidade</Label>
              <p className="text-xl font-bold text-white">
                {(
                  student.financial.monthlyFeeValueInCents / 100
                ).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
            <div>
              <Label className="text-slate-400">Dia do Vencimento</Label>
              <p className="text-white">Dia {student.financial.dueDate}</p>
            </div>
            <div>
              <Label className="text-slate-400">Último Pagamento</Label>
              <p className="text-white">
                {student.financial.lastPaymentDate
                  ? new Date(
                      student.financial.lastPaymentDate,
                    ).toLocaleDateString("pt-BR")
                  : "Não informado"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              📊 Check-ins Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {student.checkIns.slice(0, 5).map((checkin) => (
                <div
                  key={checkin.id}
                  className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-3"
                >
                  <div>
                    <p className="font-medium text-white">
                      {new Date(checkin.checkInDate).toLocaleDateString(
                        "pt-BR",
                      )}
                    </p>
                    <p className="text-sm text-slate-400">
                      {checkin.checkInTime}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#C2A537]/20 px-2 py-1 text-xs text-[#C2A537]">
                    {checkin.method}
                  </span>
                </div>
              ))}
              {student.checkIns.length === 0 && (
                <p className="text-center text-slate-400">
                  Nenhum check-in registrado
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function HealthDataTab({ student }: { student: StudentFullData }) {
  const [showPrivateHistory, setShowPrivateHistory] = useState(false);

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              ⚕️ Métricas de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-slate-400">Altura</Label>
              <p className="text-lg font-medium text-white">
                {student.healthMetrics.heightCm} cm
              </p>
            </div>
            <div>
              <Label className="text-slate-400">Peso</Label>
              <p className="text-lg font-medium text-white">
                {student.healthMetrics.weightKg} kg
              </p>
            </div>
            <div>
              <Label className="text-slate-400">Tipo Sanguíneo</Label>
              <p className="text-lg font-medium text-white">
                {student.healthMetrics.bloodType}
              </p>
            </div>
            <div>
              <Label className="text-slate-400">Última Atualização</Label>
              <p className="text-white">
                {new Date(student.healthMetrics.updatedAt).toLocaleDateString(
                  "pt-BR",
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              📝 Observações do Coach (Demo)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-slate-600 bg-slate-800/80 p-4">
              <p className="text-sm text-slate-300">
                Este é um campo de demonstração para observações do coach. Em
                produção, aqui ficaria um formulário para adicionar e editar
                observações privadas sobre o progresso do aluno.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowPrivateHistory(!showPrivateHistory)}
                variant="outline"
                size="sm"
                className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
              >
                {showPrivateHistory ? (
                  <EyeOff className="mr-2 h-4 w-4" />
                ) : (
                  <Eye className="mr-2 h-4 w-4" />
                )}
                {showPrivateHistory ? "Ocultar" : "Mostrar"} Histórico
              </Button>
            </div>

            {showPrivateHistory && (
              <div className="space-y-2">
                <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-3">
                  <p className="text-sm text-slate-300">
                    <strong>01/11/2024:</strong> Aluno demonstra boa evolução
                    nos exercícios de força.
                  </p>
                </div>
                <div className="rounded-lg border border-slate-600 bg-slate-800/50 p-3">
                  <p className="text-sm text-slate-300">
                    <strong>15/10/2024:</strong> Frequência regular, recomendo
                    aumentar carga nos próximos treinos.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
