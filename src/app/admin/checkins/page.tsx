"use client";

import { useEffect, useState } from "react";

import { getStudentCheckinsAction } from "@/actions/admin/get-student-checkins-action";
import { searchStudentsAction } from "@/actions/admin/search-students-action";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { Button } from "@/components/Button";
import CheckInCalendar from "@/components/CheckInCalendar";
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
  identifier: string | null;
  userName?: string;
}

export default function CheckInsAdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState<StudentData[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(
    null,
  );
  const [checkIns, setCheckIns] = useState<CheckInData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const searchStudents = async (term: string) => {
    if (term.length < 2) {
      setStudents([]);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await searchStudentsAction(term);
      setStudents(res.success && res.data ? res.data : []);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      setStudents([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadStudentCheckIns = async (studentId: string) => {
    setLoading(true);
    try {
      const res = await getStudentCheckinsAction(studentId);
      setCheckIns(res.success && res.data ? res.data : []);
    } catch (error) {
      console.error("Erro ao carregar check-ins:", error);
      setCheckIns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void searchStudents(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const selectStudent = (student: StudentData) => {
    setSelectedStudent(student);
    setStudents([]);
    setSearchTerm("");
    void loadStudentCheckIns(student.id);
  };

  const clearSelection = () => {
    setSelectedStudent(null);
    setCheckIns([]);
    setSearchTerm("");
  };

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
                Pesquise um aluno e visualize seu historico de check-ins
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
                      <CheckInCalendar
                        checkIns={checkIns.map((checkIn) => ({
                          date: new Date(checkIn.checkInDate),
                          time: checkIn.checkInTime,
                          status: "present" as const,
                        }))}
                        onDateClick={(date) => {
                          const dateStr = date.toISOString().split("T")[0];
                          const dayCheckIns = checkIns.filter(
                            (c) => c.checkInDate === dateStr,
                          );
                          if (dayCheckIns.length > 0) {
                            console.log("Check-ins na data:", dayCheckIns);
                          }
                        }}
                        showLegend={true}
                      />

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

              {!selectedStudent && (
                <div className="py-12 text-center">
                  <div className="mb-4 text-4xl">🙂</div>
                  <div className="text-lg text-slate-400">
                    Pesquise um aluno para visualizar seu historico de check-ins
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
