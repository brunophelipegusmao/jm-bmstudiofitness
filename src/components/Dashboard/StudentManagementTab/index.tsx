"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Search,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useCallback, useState } from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import {
  deleteStudent,
  updateStudentPaymentStatus,
} from "@/actions/admin/student-management-actions";
import { CreateStudentForm } from "@/components/Admin/CreateStudentForm";
import { EditStudentForm } from "@/components/Admin/EditStudentForm";
import { StudentCard } from "@/components/Admin/StudentCard";
import { StudentDetailsModal } from "@/components/Admin/StudentDetailsModal";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { useToast } from "@/hooks/useToast";

interface StudentManagementTabProps {
  students: StudentFullData[];
}

export function StudentManagementTab({ students }: StudentManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentFullData | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "pending">("all");

  const { showSuccessToast, showErrorToast } = useToast();
  const confirmDialog = useConfirmDialog();

  // Filtrar estudantes baseado na busca e status
  const filteredStudents = students.filter((student) => {
    const matchesSearch = !searchTerm.trim() || 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""));

    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && student.isPaymentUpToDate) ||
      (filterStatus === "inactive" && !student.isPaymentUpToDate) ||
      (filterStatus === "pending" && !student.paid);

    return matchesSearch && matchesStatus;
  });

  const handleDeleteStudent = useCallback(
    async (student: StudentFullData) => {
      try {
        const confirmed = await confirmDialog.confirm({
          title: "Excluir Aluno",
          message: `Tem certeza que deseja excluir o aluno "${student.name}"? Esta ação não pode ser desfeita.`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
          type: "danger",
        });

        if (confirmed) {
          setActionLoading(true);
          
          try {
            await deleteStudent(student.userId);
            showSuccessToast("Aluno excluído com sucesso!");
            
            // Fechar modais se o aluno excluído estava sendo visualizado
            if (selectedStudent?.userId === student.userId) {
              setSelectedStudent(null);
              setShowDetailsModal(false);
              setShowEditForm(false);
            }
          } catch (error) {
            console.error("Erro ao excluir aluno:", error);
            showErrorToast(error instanceof Error ? error.message : "Erro ao excluir aluno");
          } finally {
            setActionLoading(false);
          }
        }
      } catch (error) {
        console.error("Erro no processo de confirmação:", error);
      }
    },
    [confirmDialog, showSuccessToast, showErrorToast, selectedStudent],
  );

  const handleEditStudent = useCallback((student: StudentFullData) => {
    setSelectedStudent(student);
    setShowEditForm(true);
  }, []);

  const handleViewStudent = useCallback((student: StudentFullData) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  }, []);

  const handleTogglePaymentStatus = useCallback(
    async (student: StudentFullData) => {
      try {
        setActionLoading(true);
        const newPaidStatus = !student.paid;
        const paymentDate = newPaidStatus ? new Date().toISOString().split("T")[0] : undefined;
        
        await updateStudentPaymentStatus(student.userId, newPaidStatus, paymentDate);
        
        showSuccessToast(
          newPaidStatus 
            ? "Pagamento confirmado com sucesso!" 
            : "Status de pagamento atualizado!"
        );
      } catch (error) {
        console.error("Erro ao atualizar pagamento:", error);
        showErrorToast("Erro ao atualizar status de pagamento");
      } finally {
        setActionLoading(false);
      }
    },
    [showSuccessToast, showErrorToast],
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <User className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total de Alunos</p>
                <p className="text-xl font-bold text-white">{students.length}</p>
              </div>
            </div>
          </Card>

          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-500/20">
                <UserCheck className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Em Dia</p>
                <p className="text-xl font-bold text-white">
                  {students.filter(s => s.isPaymentUpToDate).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Calendar className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Vencidos</p>
                <p className="text-xl font-bold text-white">
                  {students.filter(s => s.paid && !s.isPaymentUpToDate).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <UserX className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Pendentes</p>
                <p className="text-xl font-bold text-white">
                  {students.filter(s => !s.paid).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Controles */}
        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <h3 className="text-xl font-bold text-[#C2A537]">Gerenciar Alunos</h3>
              <Button
                onClick={() => setShowCreateForm(true)}
                className="bg-[#C2A537] hover:bg-[#B8A533] text-black font-medium"
              >
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Aluno
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar por nome, email ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-[#C2A537]/30 text-white placeholder-gray-400"
                />
              </div>
              
              <div className="flex gap-2">
                {[
                  { key: "all", label: "Todos", count: students.length },
                  { key: "active", label: "Em Dia", count: students.filter(s => s.isPaymentUpToDate).length },
                  { key: "inactive", label: "Vencidos", count: students.filter(s => s.paid && !s.isPaymentUpToDate).length },
                  { key: "pending", label: "Pendentes", count: students.filter(s => !s.paid).length },
                ].map((filter) => (
                  <Button
                    key={filter.key}
                    variant={filterStatus === filter.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(filter.key as typeof filterStatus)}
                    className={
                      filterStatus === filter.key
                        ? "bg-[#C2A537] hover:bg-[#B8A533] text-black"
                        : "border-[#C2A537]/30 text-[#C2A537] hover:bg-[#C2A537]/10"
                    }
                  >
                    {filter.label} ({filter.count})
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Lista de Alunos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <motion.div
              key={student.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <StudentCard
                student={student}
                onEdit={() => handleEditStudent(student)}
                onDelete={() => handleDeleteStudent(student)}
                onView={() => handleViewStudent(student)}
                onTogglePayment={() => handleTogglePaymentStatus(student)}
                isLoading={actionLoading}
              />
            </motion.div>
          ))}
        </div>

        {/* Estado vazio */}
        {filteredStudents.length === 0 && (
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm p-12">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {searchTerm.trim() ? "Nenhum aluno encontrado" : "Nenhum aluno cadastrado"}
              </h3>
              <p className="text-gray-400 mb-6">
                {searchTerm.trim() 
                  ? "Tente ajustar os termos de busca ou filtros" 
                  : "Comece cadastrando seu primeiro aluno"}
              </p>
              {!searchTerm.trim() && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-[#C2A537] hover:bg-[#B8A533] text-black font-medium"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar Primeiro Aluno
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Modais */}
      {showCreateForm && (
        <CreateStudentForm
          onCancel={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            showSuccessToast("Aluno cadastrado com sucesso!");
          }}
        />
      )}

      {showEditForm && selectedStudent && (
        <EditStudentForm
          student={selectedStudent}
          onCancel={() => {
            setShowEditForm(false);
            setSelectedStudent(null);
          }}
          onSuccess={() => {
            setShowEditForm(false);
            setSelectedStudent(null);
            showSuccessToast("Aluno atualizado com sucesso!");
          }}
        />
      )}

      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
          onEdit={() => {
            setShowDetailsModal(false);
            setShowEditForm(true);
          }}
          onDelete={() => {
            setShowDetailsModal(false);
            handleDeleteStudent(selectedStudent);
          }}
        />
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.options.title}
        message={confirmDialog.options.message}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        onConfirm={confirmDialog.handleConfirm}
        onCancel={confirmDialog.handleCancel}
        type={confirmDialog.options.type}
      />
    </>
  );
}