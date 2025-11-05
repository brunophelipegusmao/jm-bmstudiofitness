import { Activity, Calendar, Eye, EyeOff, Heart, User } from "lucide-react";
import { useState } from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { SensitiveData } from "@/components/SensitiveData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { formatCPF } from "@/lib/utils";

interface StudentsTabProps {
  students: StudentFullData[];
}

export function StudentsTab({ students }: StudentsTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentFullData | null>(null);
  const [activeDetailTab, setActiveDetailTab] = useState<
    "personal" | "checkins" | "financial" | "health"
  >("personal");
  const [showPrivateData, setShowPrivateData] = useState(false);

  // Busca simples por nome, email ou CPF
  const filteredStudents = students.filter((student) => {
    if (!searchTerm.trim()) return false;

    const searchLower = searchTerm.toLowerCase();
    return (
      student.name.toLowerCase().includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower) ||
      student.cpf.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""))
    );
  });

  return (
    <div className="space-y-6">
      {/* Busca Simples */}
      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#C2A537]">
              Buscar Alunos
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Digite o nome, email ou CPF do aluno..."
                className="w-full rounded-lg border border-[#C2A537]/30 bg-black/60 px-4 py-3 text-white placeholder-slate-400 transition-all duration-200 focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537]/20 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 transition-colors hover:text-[#C2A537]"
                >
                  ✕
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-[#C2A537]">
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1 ? "resultado" : "resultados"}{" "}
                encontrado(s)
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Busca */}
      {searchTerm && filteredStudents.length > 0 && (
        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="max-h-96 space-y-3 overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.userId}
                  onClick={() => setSelectedStudent(student)}
                  className="cursor-pointer rounded-lg border border-[#C2A537]/20 bg-black/40 p-3 transition-all duration-200 hover:border-[#C2A537]/40 hover:bg-[#C2A537]/5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        {student.name}
                      </h4>
                      <p className="text-sm text-slate-400">{student.email}</p>
                      <p className="text-sm text-slate-500">
                        CPF: {formatCPF(student.cpf)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {student.isPaymentUpToDate ? (
                        <span className="text-sm text-green-400">✓ Em dia</span>
                      ) : (
                        <span className="text-sm text-red-400">
                          ⚠ Atrasado
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Aluno Selecionado */}
      {selectedStudent && (
        <Card className="border-[#C2A537]/40 bg-black/40 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#C2A537]">
                Detalhes do Aluno
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedStudent(null)}
                className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
              >
                Fechar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Informações Pessoais */}
              <div className="space-y-4">
                <h4 className="mb-3 font-semibold text-white">
                  Informações Pessoais
                </h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[#C2A537]">Nome</Label>
                    <p className="text-white">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <Label className="text-[#C2A537]">Email</Label>
                    <p className="text-white">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <Label className="text-[#C2A537]">CPF</Label>
                    <p className="text-white">
                      {formatCPF(selectedStudent.cpf)}
                    </p>
                  </div>
                  {selectedStudent.telephone && (
                    <div>
                      <Label className="text-[#C2A537]">Telefone</Label>
                      <p className="text-white">{selectedStudent.telephone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="mb-3 font-semibold text-white">Status</h4>
                <div className="space-y-2">
                  <div>
                    <Label className="text-[#C2A537]">Pagamento</Label>
                    <p
                      className={
                        selectedStudent.isPaymentUpToDate
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {selectedStudent.isPaymentUpToDate
                        ? "✓ Em dia"
                        : "⚠ Atrasado"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há busca ativa */}
      {!searchTerm && (
        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-[#C2A537]/50" />
            <h3 className="mb-2 text-lg font-semibold text-[#C2A537]">
              Buscar Alunos
            </h3>
            <p className="mb-4 text-slate-400">
              Digite o nome, email ou CPF do aluno no campo de busca acima.
            </p>
            <div className="text-sm text-slate-500">
              Total de alunos cadastrados: {students.length}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem quando não há resultados */}
      {searchTerm && filteredStudents.length === 0 && (
        <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-red-400/50" />
            <h3 className="mb-2 text-lg font-semibold text-red-400">
              Nenhum Aluno Encontrado
            </h3>
            <p className="mb-4 text-slate-400">
              Não encontramos alunos com &ldquo;{searchTerm}&rdquo;.
            </p>
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
            >
              Limpar Busca
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Detalhes do Aluno Selecionado */}
      {selectedStudent && (
        <Card className="border-[#C2A537]/50 bg-black/60">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-[#C2A537]">
                  {selectedStudent.name}
                </CardTitle>
                <p className="text-slate-400">
                  Cadastrado em{" "}
                  {new Date(selectedStudent.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => setShowPrivateData(!showPrivateData)}
                  variant="outline"
                  size="sm"
                  className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
                >
                  {showPrivateData ? (
                    <EyeOff className="mr-2 h-4 w-4" />
                  ) : (
                    <Eye className="mr-2 h-4 w-4" />
                  )}
                  {showPrivateData ? "Ocultar" : "Dados Sensíveis"}
                </Button>
                <div
                  className={`rounded-full px-4 py-2 text-sm font-medium ${
                    selectedStudent.isPaymentUpToDate
                      ? "bg-green-600 text-green-100"
                      : "bg-red-600 text-red-100"
                  }`}
                >
                  {selectedStudent.isPaymentUpToDate
                    ? "✅ Em dia"
                    : "❌ Pendente"}
                </div>
              </div>
            </div>

            {/* Sub-abas para detalhes */}
            <div className="flex space-x-2 rounded-lg bg-slate-800/50 p-2">
              {[
                { id: "personal" as const, label: "Pessoais", icon: User },
                { id: "checkins" as const, label: "Check-ins", icon: Activity },
                {
                  id: "financial" as const,
                  label: "Financeiro",
                  icon: Calendar,
                },
                { id: "health" as const, label: "Saúde", icon: Heart },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    activeDetailTab === tab.id
                      ? "bg-[#C2A537] text-black"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            {activeDetailTab === "personal" && (
              <PersonalDataSection
                student={selectedStudent}
                showPrivateData={showPrivateData}
              />
            )}
            {activeDetailTab === "checkins" && <CheckInsSection />}
            {activeDetailTab === "financial" && (
              <FinancialSection student={selectedStudent} />
            )}
            {activeDetailTab === "health" && (
              <HealthSection
                student={selectedStudent}
                showPrivateData={showPrivateData}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!selectedStudent && (
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardContent className="flex h-64 items-center justify-center">
            <div className="text-center">
              <User className="mx-auto mb-4 h-16 w-16 text-slate-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-400">
                Pesquisar Aluno
              </h3>
              <p className="text-sm text-slate-500">
                Use o campo de busca acima para encontrar e visualizar os dados
                de um aluno
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Componente para dados pessoais
function PersonalDataSection({
  student,
  showPrivateData,
}: {
  student: StudentFullData;
  showPrivateData: boolean;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[#C2A537]">
          Informações Básicas
        </h4>

        <div>
          <Label className="text-slate-400">Nome Completo</Label>
          <p className="text-white">{student.name}</p>
        </div>

        <div>
          <Label className="text-slate-400">Email</Label>
          <SensitiveData
            data={student.email}
            type="email"
            studentId={student.userId}
            className="text-white"
          />
        </div>

        <div>
          <Label className="text-slate-400">CPF</Label>
          <SensitiveData
            data={formatCPF(student.cpf)}
            type="cpf"
            studentId={student.userId}
            className="text-white"
          />
        </div>

        <div>
          <Label className="text-slate-400">Telefone</Label>
          <SensitiveData
            data={student.telephone}
            type="phone"
            studentId={student.userId}
            className="text-white"
          />
        </div>

        <div>
          <Label className="text-slate-400">Data de Nascimento</Label>
          <p className="text-white">
            {new Date(student.bornDate).toLocaleDateString("pt-BR")}
          </p>
        </div>

        <div>
          <Label className="text-slate-400">Idade</Label>
          <p className="text-white">{student.age} anos</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[#C2A537]">Outros Dados</h4>

        {showPrivateData && (
          <div>
            <Label className="text-slate-400">Endereço</Label>
            <p className="text-white">{student.address}</p>
          </div>
        )}

        <div>
          <Label className="text-slate-400">Tipo de Usuário</Label>
          <p className="text-white">{student.userRole}</p>
        </div>

        <div>
          <Label className="text-slate-400">Data de Cadastro</Label>
          <p className="text-white">
            {new Date(student.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para check-ins (será implementado com integração ao backend)
function CheckInsSection() {
  return (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-[#C2A537]">
        Histórico de Check-ins
      </h4>

      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 text-center">
        <Activity className="mx-auto mb-4 h-12 w-12 text-slate-500" />
        <h3 className="mb-2 text-lg font-medium text-slate-300">
          Check-ins em Desenvolvimento
        </h3>
        <p className="text-sm text-slate-400">
          A integração com os dados de check-ins será implementada em breve. Por
          enquanto, você pode visualizar check-ins na seção específica do
          dashboard.
        </p>
      </div>
    </div>
  );
}

// Componente para dados financeiros
function FinancialSection({ student }: { student: StudentFullData }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[#C2A537]">
          Status Financeiro
        </h4>

        <div>
          <Label className="text-slate-400">Status de Pagamento</Label>
          <p
            className={`text-lg font-semibold ${
              student.paid ? "text-green-400" : "text-red-400"
            }`}
          >
            {student.paid ? "✅ Em dia" : "❌ Pendente"}
          </p>
        </div>

        <div>
          <Label className="text-slate-400">Valor da Mensalidade</Label>
          <p className="text-xl font-bold text-white">
            {student.formattedMonthlyFee}
          </p>
        </div>

        <div>
          <Label className="text-slate-400">Dia do Vencimento</Label>
          <p className="text-white">Dia {student.dueDate}</p>
        </div>

        <div>
          <Label className="text-slate-400">Método de Pagamento</Label>
          <p className="text-white">{student.paymentMethod}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-[#C2A537]">Histórico</h4>

        <div>
          <Label className="text-slate-400">Último Pagamento</Label>
          <p className="text-white">
            {student.lastPaymentDate
              ? new Date(student.lastPaymentDate).toLocaleDateString("pt-BR")
              : "Não informado"}
          </p>
        </div>

        <div>
          <Label className="text-slate-400">Status Atual</Label>
          <p
            className={`text-lg font-medium ${
              student.isPaymentUpToDate ? "text-green-400" : "text-red-400"
            }`}
          >
            {student.isPaymentUpToDate
              ? "Pagamento em dia"
              : "Pagamento em atraso"}
          </p>
        </div>
      </div>
    </div>
  );
}

// Componente para dados de saúde
function HealthSection({
  student,
  showPrivateData,
}: {
  student: StudentFullData;
  showPrivateData: boolean;
}) {
  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-[#C2A537]">Dados de Saúde</h4>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <Label className="text-slate-400">Altura</Label>
            <p className="text-lg font-medium text-white">
              {student.heightCm} cm
            </p>
          </div>

          <div>
            <Label className="text-slate-400">Peso</Label>
            <p className="text-lg font-medium text-white">
              {student.weightKg} kg
            </p>
          </div>

          {showPrivateData && (
            <div>
              <Label className="text-slate-400">Tipo Sanguíneo</Label>
              <p className="text-lg font-medium text-white">
                {student.bloodType}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-slate-400">Praticou Esportes</Label>
            <p className="text-white">
              {student.hasPracticedSports ? "Sim" : "Não"}
            </p>
          </div>

          <div>
            <Label className="text-slate-400">Usa Suplementos</Label>
            <p className="text-white">
              {student.useSupplements ? "Sim" : "Não"}
            </p>
          </div>

          <div>
            <Label className="text-slate-400">Última Atualização</Label>
            <p className="text-white">
              {new Date(student.healthUpdatedAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </div>

      {showPrivateData && (
        <div className="space-y-4">
          <h5 className="text-md font-semibold text-[#C2A537]">
            Informações Detalhadas
          </h5>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-slate-400">Último Exercício</Label>
              <p className="text-white">{student.lastExercise}</p>
            </div>

            <div>
              <Label className="text-slate-400">Histórico de Doenças</Label>
              <p className="text-white">{student.historyDiseases}</p>
            </div>

            <div>
              <Label className="text-slate-400">Medicamentos</Label>
              <p className="text-white">{student.medications}</p>
            </div>

            <div>
              <Label className="text-slate-400">Alergias</Label>
              <p className="text-white">{student.allergies}</p>
            </div>

            <div>
              <Label className="text-slate-400">Lesões</Label>
              <p className="text-white">{student.injuries}</p>
            </div>

            <div>
              <Label className="text-slate-400">Histórico Esportivo</Label>
              <p className="text-white">{student.sportsHistory}</p>
            </div>

            {student.whatSupplements && (
              <div className="md:col-span-2">
                <Label className="text-slate-400">Quais Suplementos</Label>
                <p className="text-white">{student.whatSupplements}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-slate-400">Rotina Alimentar</Label>
              <p className="text-white">{student.alimentalRoutine}</p>
            </div>

            <div>
              <Label className="text-slate-400">Rotina Diária</Label>
              <p className="text-white">{student.diaryRoutine}</p>
            </div>

            {student.otherNotes && (
              <div>
                <Label className="text-slate-400">Outras Observações</Label>
                <p className="text-white">{student.otherNotes}</p>
              </div>
            )}

            {student.coachaObservations && (
              <div>
                <Label className="text-slate-400">Observações do Coach</Label>
                <p className="text-white">{student.coachaObservations}</p>
              </div>
            )}

            {student.coachObservationsParticular && showPrivateData && (
              <div>
                <Label className="text-slate-400">
                  Observações Particulares do Coach
                </Label>
                <p className="text-white">
                  {student.coachObservationsParticular}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
