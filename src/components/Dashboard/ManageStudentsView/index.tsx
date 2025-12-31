"use client";

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
import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditStudentModal } from "@/components/Dashboard/EditStudentModal";
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

  // Hook para dialog de confirmaÃ§Ã£o
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

  // Filtrar estudantes
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm);

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && student.isPaymentUpToDate) ||
      (filterStatus === "inactive" && !student.isPaymentUpToDate);

    return matchesSearch && matchesFilter;
  });

  // Calcular estatÃ­sticas
  const stats = {
    total: students.length,
    active: students.filter((s) => s.isPaymentUpToDate).length,
    inactive: students.filter((s) => !s.isPaymentUpToDate).length,
    pending: students.filter((s) => !s.paid).length,
  };

  const getStatusBadge = (isPaymentUpToDate: boolean) => {
    if (isPaymentUpToDate) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          <UserCheck className="mr-1 h-3 w-3" />
          Ativo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        <UserX className="mr-1 h-3 w-3" />
        Inativo
      </span>
    );
  };

  const getPaymentBadge = (paid: boolean, isPaymentUpToDate: boolean) => {
    if (paid && isPaymentUpToDate) {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Em dia
        </span>
      );
    }
    if (!paid) {
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Pendente
        </span>
      );
    }
    return (
      <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
        Vencido
      </span>
    );
  };

  const handleToggleStatus = async (student: StudentFullData) => {
    try {
      setActionLoading(true);

      // Como nÃ£o temos um campo isActive direto, esta funcionalidade
      // precisaria ser expandida com base na lÃ³gica de negÃ³cio
      showSuccessToast(
        `Status de ${student.name}: ${student.isPaymentUpToDate ? "Em dia" : "Pendente"}`,
      );
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
    // Redirecionar para pÃ¡gina de detalhes ou abrir modal
    console.log("View student:", student);
    showSuccessToast(`Visualizando ${student.name}`);
  };

  const handleDeleteStudent = async (student: StudentFullData) => {
    try {
      const confirmed = await confirm({
        title: "Excluir Aluno",
        message: `Tem certeza que deseja excluir o aluno "${student.name}"? Esta aÃ§Ã£o nÃ£o pode ser desfeita.`,
        confirmText: "Excluir",
        cancelText: "Cancelar",
        type: "danger",
      });

      if (confirmed) {
        setActionLoading(true);
        const result: { success: boolean; error?: string; message?: string } =
          await deleteStudentAction(student.userId);

        if (result.success) {
          showSuccessToast(`Aluno "${student.name}" excluÃ­do com sucesso!`);
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
          â† Voltar
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
                          {getStatusBadge(!!student.isPaymentUpToDate)}
                          {getPaymentBadge(
                            !!student.paid,
                            !!student.isPaymentUpToDate,
                          )}
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
                      {/* Toggle Status Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(student)}
                        className="text-gray-400 hover:text-white"
                        disabled={actionLoading}
                        title={
                          student.isPaymentUpToDate
                            ? "Desativar aluno"
                            : "Ativar aluno"
                        }
                      >
                        {student.isPaymentUpToDate ? (
                          <ToggleRight className="h-5 w-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-red-400" />
                        )}
                      </Button>

                      {/* View Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewStudent(student)}
                        className="text-gray-400 hover:text-white"
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
                        className="text-gray-400 hover:text-white"
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
                        className="text-gray-400 hover:text-red-400"
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

      {/* Modal de EdiÃ§Ã£o */}
      {studentForModal && (
        <EditStudentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setStudentToEdit(null);
          }}
          student={studentForModal}
          onSuccess={async () => {
            // Recarregar lista apÃ³s ediÃ§Ã£o
            const data = await getAllStudentsFullDataAction();
            setStudents(data);
          }}
        />
      )}

      {/* Dialog de confirmaÃ§Ã£o */}
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

