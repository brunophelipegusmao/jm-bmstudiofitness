"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  Loader2,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useEffect, useState } from "react";

import { deleteStudentAction } from "@/actions/admin/delete-student-action";
import { getStudentFullProfileAction } from "@/actions/admin/get-student-full-profile-action";
import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import { updateStudentAction } from "@/actions/admin/update-student-action";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditStudentModal } from "@/components/Dashboard/EditStudentModal";
import { StudentViewModal } from "@/components/Dashboard/StudentViewModal";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";

interface ManageStudentsViewProps {
  onBack: () => void;
}

export function ManageStudentsView({ onBack }: ManageStudentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [students, setStudents] = useState<StudentFullData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<StudentFullData | null>(
    null,
  );
  const [studentViewData, setStudentViewData] = useState<{
    profile: Awaited<ReturnType<typeof getStudentFullProfileAction>> | null;
    open: boolean;
  }>({ profile: null, open: false });
  const studentForModal = studentToEdit
    ? {
        ...studentToEdit,
        bornDate:
          typeof studentToEdit.bornDate === "string"
            ? studentToEdit.bornDate
            : studentToEdit.bornDate?.toISOString() ?? "",
        monthlyFeeValueInCents: studentToEdit.monthlyFeeValueInCents ?? 0,
        paymentMethod: studentToEdit.paymentMethod ?? "",
        dueDate: studentToEdit.dueDate ?? 1,
      }
    : null;

  // Hook para dialog de confirmacao
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirmDialog();

  // Carregar alunos do banco de dados
  useEffect(() => {
    async function loadStudents() {
      try {
        setLoading(true);
        const data = await getAllStudentsFullDataAction();
        setStudents(data);
      } catch (error) {
        console.error("Erro ao carregar alunos:", error);
        showErrorToast("Erro ao carregar lista de alunos");
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  // Remover perfis que não são alunos (admin/master/employee/coach)
  const studentPool = students.filter((student) => {
    const role = (student.userRole || student.role || "").toLowerCase();
    return !["admin", "master", "employee", "funcionario", "funcionário", "coach"].includes(role);
  });

  // Filtrar estudantes
  const filteredStudents = studentPool.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && student.active) ||
      (filterStatus === "inactive" && !student.active);

    return matchesSearch && matchesFilter;
  });

  // Calcular estatísticas (somente alunos)
  const stats = {
    total: studentPool.length,
    active: studentPool.filter((s) => s.active).length,
    inactive: studentPool.filter((s) => !s.active).length,
    pending: studentPool.filter((s) => s.paid === false).length,
  };


  const getStatusBadge = (active: boolean) => {
    if (active) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-200 ring-1 ring-green-500/40">
          <UserCheck className="mr-1 h-3 w-3" />
          Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-semibold text-red-200 ring-1 ring-red-500/40">
        <UserX className="mr-1 h-3 w-3" />
        Inativo
      </span>
    );
  };

  const getPaymentBadge = (paid?: boolean, isPaymentUpToDate?: boolean) => {
    if (paid === false || isPaymentUpToDate === false) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-500/40">
          Pendente
        </span>
      );
    }

    if (paid === true || isPaymentUpToDate === true) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-500/15 px-2.5 py-0.5 text-xs font-semibold text-green-200 ring-1 ring-green-500/40">
          Em dia
        </span>
      );
    }

    return (
      <span className="inline-flex items-center rounded-full bg-slate-500/15 px-2.5 py-0.5 text-xs font-semibold text-slate-200 ring-1 ring-slate-500/40">
        Sem registro
      </span>
    );
  };

  const handleToggleStatus = async (student: StudentFullData) => {
    try {
      const confirmed = await confirm({
        title: student.active ? "Desativar aluno" : "Ativar aluno",
        message: student.active
          ? `Deseja desativar o aluno "${student.name}"?`
          : `Deseja ativar o aluno "${student.name}"?`,
        confirmText: student.active ? "Desativar" : "Ativar",
        cancelText: "Cancelar",
        type: "warning",
      });
      if (!confirmed) return;

      setActionLoading(true);
      const result = await updateStudentAction({
        id: student.userId,
        isActive: !student.active,
      });

      if (!result.success) {
        showErrorToast(result.error || "Erro ao alterar status do aluno");
        return;
      }

      const data = await getAllStudentsFullDataAction();
      setStudents(data);
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showErrorToast("Erro ao alterar status do aluno");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditStudent = (student: StudentFullData) => {
    setStudentToEdit(student);
    setIsEditModalOpen(true);
  };

  const handleViewStudent = (student: StudentFullData) => {
    void (async () => {
      try {
        setActionLoading(true);
        const profile = await getStudentFullProfileAction(student.userId);
        setStudentViewData({ profile, open: true });
      } catch (error) {
        console.error("Erro ao carregar detalhes do aluno:", error);
        showErrorToast("Erro ao carregar detalhes do aluno");
      } finally {
        setActionLoading(false);
      }
    })();
  };

  const handleDeleteStudent = async (student: StudentFullData) => {
    try {
      const confirmed = await confirm({
        title: "Excluir Aluno",
        message: `Tem certeza que deseja excluir o aluno "${student.name}"? Esta acao nao pode ser desfeita.`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        type: "danger",
      });

      if (confirmed) {
        setActionLoading(true);
        const result: { success: boolean; error?: string; message?: string } =
          await deleteStudentAction(student.userId);

        if (result.success) {
          showSuccessToast(`Aluno "${student.name}" excluido com sucesso!`);
          // Recarregar lista
          const data = await getAllStudentsFullDataAction();
          setStudents(data);
        } else {
          showErrorToast(result.error || "Erro ao excluir aluno");
        }
      }
    } catch (error) {
      console.error("Erro ao excluir aluno:", error);
      showErrorToast("Erro ao excluir aluno");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Gerenciar Alunos
          </h2>
          <p className="text-slate-400">
            Editar, ativar/desativar alunos existentes
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          Voltar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-blue-500/20 p-2">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <UserCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Ativos</p>
                <p className="text-xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-red-500/20 p-2">
                <UserX className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Inativos</p>
                <p className="text-xl font-bold text-white">{stats.inactive}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-yellow-500/20 p-2">
                <User className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pendentes</p>
                <p className="text-xl font-bold text-white">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#C2A537]">Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border-[#C2A537]/30 bg-black/50 pl-10 text-white placeholder-gray-400"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              {[
                { key: "all", label: "Todos" },
                { key: "active", label: "Ativos" },
                { key: "inactive", label: "Inativos" },
              ].map((filter) => (
                <Button
                  key={filter.key}
                  variant={filterStatus === filter.key ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setFilterStatus(filter.key as typeof filterStatus)
                  }
                  className={
                    filterStatus === filter.key
                      ? "bg-[#C2A537] text-black hover:bg-[#B8A533]"
                      : "border-[#C2A537]/30 text-[#C2A537] hover:bg-[#C2A537]/10"
                  }
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-[#C2A537]">Lista de Alunos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-[#C2A537]" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-8 text-center">
                <User className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Nenhum aluno encontrado
                </h3>
                <p className="text-gray-400">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            ) : (
              filteredStudents.map((student) => (
                <motion.div
                  key={student.userId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg border border-[#C2A537]/20 bg-black/30 p-4 transition-all duration-300 hover:bg-black/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="rounded-lg bg-[#C2A537]/20 p-2">
                        <User className="h-5 w-5 text-[#C2A537]" />
                      </div>

                      <div className="flex-1">
                        <div className="mb-1 flex items-center space-x-3">
                          <h3 className="font-semibold text-white">
                            {student.name}
                          </h3>
                          {getStatusBadge(!!student.active)}
                          {getPaymentBadge(student.paid, student.isPaymentUpToDate)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{student.email}</span>
                          <span>{student.cpf}</span>
                          <span>{student.telephone}</span>
                          <span>{student.formattedMonthlyFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Toggle Status Button (switch compacto, preto/dourado) */}
                      <button
                        onClick={() => handleToggleStatus(student)}
                        disabled={actionLoading}
                        title={student.active ? "Desativar aluno" : "Ativar aluno"}
                        className={clsx(
                          "relative h-5 w-10 rounded-full border transition-all duration-200 ease-out",
                          student.active
                            ? "border-[#C2A537]/80 bg-[#C2A537]/60 shadow-[0_0_8px_rgba(194,165,55,0.35)]"
                            : "border-[#C2A537]/40 bg-black/85",
                          actionLoading && "opacity-60 cursor-not-allowed",
                        )}
                        type="button"
                      >
                        <span
                          className={clsx(
                            "absolute top-0.5 h-4 w-4 rounded-full bg-gradient-to-br from-[#FFE17D] via-[#C2A537] to-[#9c7c1f] shadow transition-all duration-200 ease-out",
                            student.active ? "right-0.5" : "left-0.5",
                          )}
                        />
                      </button>

                      {/* View Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                        className="text-gray-300 hover:text-[#C2A537]"
                        disabled={actionLoading}
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStudent(student)}
                        className="text-gray-300 hover:text-[#C2A537]"
                        disabled={actionLoading}
                        title="Editar aluno"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student)}
                        className="text-gray-300 hover:text-red-400"
                        disabled={actionLoading}
                        title="Excluir aluno"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de edicao */}
      {studentForModal && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setStudentToEdit(null);
          }}
          student={studentForModal}
          onSuccess={async () => {
            // Recarregar lista apos edicao
            const data = await getAllStudentsFullDataAction();
            setStudents(data);
          }}
        />
      )}

      {/* Modal de visualizacao */}
      {studentViewData.profile && (
        <StudentViewModal
          isOpen={studentViewData.open}
          data={studentViewData.profile}
          onClose={() => setStudentViewData({ profile: null, open: false })}
        />
      )}

      {/* Dialog de confirmacao */}
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </motion.div>
  );
}










