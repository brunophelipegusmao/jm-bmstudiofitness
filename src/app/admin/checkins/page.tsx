"use client";

import { useEffect, useState } from "react";

import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Button } from "@/components/Button";
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

// Tipos
interface StudentData {
  id: string;
  name: string;
  email: string;
  cpf: string;
}

interface CheckInData {
  id: string;
  userId: string;
  checkInDate: string;
  checkInTime: string;
  method: string;
  identifier: string;
  userName: string;
}

export default function CheckInsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null,
  );
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Buscar alunos baseado no termo de pesquisa
  const searchStudents = async (term: string) => {
    if (term.length < 2) {
      setStudents([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await fetch(
        `/api/students/search?q=${encodeURIComponent(term)}`,
      );
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
    } finally {
      setSearchLoading(false);
    }
  };

  // Carregar check-ins do aluno selecionado
  const loadStudentCheckIns = async (studentId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/checkins/student/${studentId}`);
      if (response.ok) {
        const data = await response.json();
        setCheckIns(data);
      }
    } catch (error) {
      console.error("Erro ao carregar check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchStudents(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const selectStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setStudents([]);
    setSearchTerm("");
    loadStudentCheckIns(student.id);
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setCheckIns([]);
    setSearchTerm("");
  };

  // Função para navegar entre meses
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Função para verificar se um dia tem check-in
  const hasCheckIn = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return checkIns.some((checkIn) => checkIn.checkInDate === dateStr);
  };

  // Função para obter check-ins de um dia específico
  const getCheckInsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return checkIns.filter((checkIn) => checkIn.checkInDate === dateStr);
  };

  // Gerar calendário
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    // Gerar 42 dias (6 semanas)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return { days, firstDay, lastDay };
  };

  const { days, firstDay } = generateCalendar();

  return (
    <AdminLayout>
      <div className="py-4 sm:py-8">
        <div className="mx-auto max-w-6xl">
          <Card className="border-[#C2A537] bg-black/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-[#C2A537]">
                Check-ins por Aluno
              </CardTitle>
              <CardDescription className="text-slate-300">
                Pesquise um aluno e visualize seu histórico de check-ins
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Pesquisa de aluno */}
              <div className="mb-6">
                <Label htmlFor="search" className="mb-2 text-[#C2A537]">
                  Pesquisar Aluno
                </Label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Digite nome, CPF ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                  />

                  {searchLoading && (
                    <div className="absolute top-3 right-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C2A537] border-t-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Lista de resultados da pesquisa */}
                {students.length > 0 && (
                  <div className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-[#867536] bg-[#d7ceac]">
                    {students.map((student) => (
                      <button
                        key={student.id}
                        onClick={() => selectStudent(student)}
                        className="w-full border-b border-[#867536] p-3 text-left text-black last:border-b-0 hover:bg-[#C2A537]/20"
                      >
                        <div className="font-medium">{student.name}</div>
                        <div className="text-sm text-gray-600">
                          CPF: {formatCPF(student.cpf)} | Email: {student.email}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Aluno selecionado */}
              {selectedStudent && (
                <div className="mb-6">
                  <div className="flex items-center justify-between rounded-lg border border-[#C2A537] bg-[#C2A537]/10 p-4">
                    <div>
                      <div className="text-lg font-medium text-[#C2A537]">
                        {selectedStudent.name}
                      </div>
                      <div className="text-sm text-slate-400">
                        CPF: {formatCPF(selectedStudent.cpf)} | Email:{" "}
                        {selectedStudent.email}
                      </div>
                    </div>
                    <Button
                      onClick={clearSelection}
                      variant="outline"
                      className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-black"
                    >
                      Limpar
                    </Button>
                  </div>
                </div>
              )}

              {/* Calendário */}
              {selectedStudent && (
                <div className="space-y-6">
                  {loading ? (
                    <div className="py-12 text-center">
                      <div className="text-lg text-[#C2A537]">
                        Carregando check-ins...
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Navegação do calendário */}
                      <div className="flex items-center justify-between">
                        <Button
                          onClick={() => navigateMonth("prev")}
                          variant="outline"
                          className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-black"
                        >
                          ← Mês Anterior
                        </Button>

                        <h3 className="text-xl font-medium text-[#C2A537]">
                          {firstDay
                            .toLocaleDateString("pt-BR", {
                              month: "long",
                              year: "numeric",
                            })
                            .replace(/^\w/, (c) => c.toUpperCase())}
                        </h3>

                        <Button
                          onClick={() => navigateMonth("next")}
                          variant="outline"
                          className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-black"
                        >
                          Próximo Mês →
                        </Button>
                      </div>

                      {/* Grade do calendário */}
                      <div className="grid grid-cols-7 gap-1 rounded-lg border border-[#867536] p-4">
                        {/* Cabeçalho dos dias da semana */}
                        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                          (day) => (
                            <div
                              key={day}
                              className="p-2 text-center text-sm font-medium text-[#C2A537]"
                            >
                              {day}
                            </div>
                          ),
                        )}

                        {/* Dias do calendário */}
                        {days.map((day, index) => {
                          const isCurrentMonth =
                            day.getMonth() === currentDate.getMonth();
                          const hasCheckin = hasCheckIn(day);
                          const dayCheckIns = getCheckInsForDate(day);

                          return (
                            <div
                              key={index}
                              className={`relative min-h-[60px] p-2 text-center ${isCurrentMonth ? "text-white" : "text-slate-600"} ${hasCheckin ? "border border-green-500 bg-green-900/30" : "border border-slate-700"} rounded-lg transition-colors hover:bg-slate-800/50`}
                              title={
                                hasCheckin
                                  ? `${dayCheckIns.length} check-in(s)`
                                  : ""
                              }
                            >
                              <div className="text-sm">{day.getDate()}</div>
                              {hasCheckin && (
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 transform">
                                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                                  <div className="mt-1 text-xs text-green-400">
                                    {dayCheckIns.length}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Estatísticas */}
                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="rounded-lg border border-[#C2A537]/30 bg-[#C2A537]/10 p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#C2A537]">
                              {checkIns.length}
                            </div>
                            <div className="text-sm text-slate-400">
                              Total de Check-ins
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-green-600/30 bg-green-900/20 p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                              {
                                checkIns.filter((c) => c.method === "cpf")
                                  .length
                              }
                            </div>
                            <div className="text-sm text-slate-400">
                              Via CPF
                            </div>
                          </div>
                        </div>

                        <div className="rounded-lg border border-blue-600/30 bg-blue-900/20 p-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {
                                checkIns.filter((c) => c.method === "email")
                                  .length
                              }
                            </div>
                            <div className="text-sm text-slate-400">
                              Via Email
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Estado inicial */}
              {!selectedStudent && (
                <div className="py-12 text-center">
                  <div className="mb-4 text-6xl">👤</div>
                  <div className="text-lg text-slate-400">
                    Pesquise um aluno para visualizar seu histórico de check-ins
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
