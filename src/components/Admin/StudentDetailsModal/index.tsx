"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Edit,
  Heart,
  Mail,
  Phone,
  Trash2,
  User,
  X,
} from "lucide-react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCPF } from "@/lib/utils";

interface StudentDetailsModalProps {
  student: StudentFullData;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function StudentDetailsModal({
  student,
  onClose,
  onEdit,
  onDelete,
}: StudentDetailsModalProps) {
  const getPaymentStatusColor = () => {
    if (student.isPaymentUpToDate) return "text-green-400 bg-green-400/10";
    if (student.paid) return "text-yellow-400 bg-yellow-400/10";
    return "text-red-400 bg-red-400/10";
  };

  const getPaymentStatusText = () => {
    if (student.isPaymentUpToDate) return "Em dia";
    if (student.paid) return "Vencido";
    return "Pendente";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto mx-4"
      >
        <Card className="border-[#C2A537]/30 bg-black/95 backdrop-blur-lg">
          {/* Header */}
          <div className="border-b border-[#C2A537]/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl border border-[#C2A537]/30 bg-linear-to-br from-black/50 to-black/80">
                  <User className="h-6 w-6 text-[#C2A537]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{student.name}</h3>
                  <p className="text-sm text-gray-400">
                    {student.age} anos • Cadastrado em{" "}
                    {new Date(student.createdAt).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  className="text-[#C2A537] hover:bg-[#C2A537]/20"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-400 hover:bg-red-400/20"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 space-y-8">
            {/* Status de Pagamento */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-[#C2A537]/30 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor()}`}
                    >
                      {getPaymentStatusText()}
                    </span>
                  </div>
                  <CreditCard className="h-5 w-5 text-[#C2A537]" />
                </div>
              </Card>

              <Card className="border-[#C2A537]/30 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Mensalidade</p>
                    <p className="text-lg font-semibold text-white">
                      {student.formattedMonthlyFee}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-[#C2A537]" />
                </div>
              </Card>

              <Card className="border-[#C2A537]/30 bg-black/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Vencimento</p>
                    <p className="text-lg font-semibold text-white">
                      Dia {student.dueDate}
                    </p>
                  </div>
                  <Calendar className="h-5 w-5 text-[#C2A537]" />
                </div>
              </Card>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">Dados Pessoais</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-white">{student.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Telefone</p>
                      <p className="text-white">{student.telephone}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">CPF</p>
                      <p className="text-white">{formatCPF(student.cpf)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-400">Data de Nascimento</p>
                      <p className="text-white">
                        {new Date(student.bornDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Endereço</p>
                    <p className="text-white">{student.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dados de Saúde */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537] flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Dados de Saúde
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-[#C2A537]/30 bg-black/40 p-4">
                  <p className="text-sm text-gray-400">Altura</p>
                  <p className="text-lg font-semibold text-white">{student.heightCm} cm</p>
                </Card>

                <Card className="border-[#C2A537]/30 bg-black/40 p-4">
                  <p className="text-sm text-gray-400">Peso</p>
                  <p className="text-lg font-semibold text-white">{student.weightKg} kg</p>
                </Card>

                <Card className="border-[#C2A537]/30 bg-black/40 p-4">
                  <p className="text-sm text-gray-400">Tipo Sanguíneo</p>
                  <p className="text-lg font-semibold text-white">{student.bloodType}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Histórico Esportivo</p>
                    <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                      {student.sportsHistory || "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Último Exercício</p>
                    <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                      {student.lastExercise || "Não informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Alergias</p>
                    <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                      {student.allergies || "Nenhuma alergia conhecida"}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Histórico de Doenças</p>
                    <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                      {student.historyDiseases || "Nenhum histórico informado"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Medicamentos</p>
                    <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                      {student.medications || "Nenhum medicamento"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400 mb-2">Lesões</p>
                    <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                      {student.injuries || "Nenhuma lesão conhecida"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-2">Rotina Alimentar</p>
                  <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                    {student.alimentalRoutine || "Não informado"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-400 mb-2">Rotina Diária</p>
                  <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                    {student.diaryRoutine || "Não informado"}
                  </p>
                </div>
              </div>

              {student.useSupplements && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Suplementos Utilizados</p>
                  <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                    {student.whatSupplements || "Não especificado"}
                  </p>
                </div>
              )}

              {(student.coachaObservations || student.otherNotes) && (
                <div className="space-y-4 border-t border-[#C2A537]/20 pt-4">
                  <h5 className="text-md font-semibold text-[#C2A537]">Observações</h5>
                  
                  {student.coachaObservations && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Observações do Coach</p>
                      <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                        {student.coachaObservations}
                      </p>
                    </div>
                  )}

                  {student.otherNotes && (
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Observações Gerais</p>
                      <p className="text-white bg-black/40 p-3 rounded-lg border border-[#C2A537]/20">
                        {student.otherNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Informações Financeiras */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">Informações Financeiras</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400">Forma de Pagamento</p>
                    <p className="text-white capitalize">
                      {student.paymentMethod.replace("_", " ")}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-400">Status do Pagamento</p>
                    <p className="text-white">
                      {student.paid ? "Pago" : "Pendente"}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {student.lastPaymentDate && (
                    <div>
                      <p className="text-sm text-gray-400">Último Pagamento</p>
                      <p className="text-white">
                        {new Date(student.lastPaymentDate).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-400">Situação</p>
                    <p className={student.isPaymentUpToDate ? "text-green-400" : "text-red-400"}>
                      {student.isPaymentUpToDate ? "Em dia" : "Pendente/Vencido"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#C2A537]/20 p-6">
            <div className="flex justify-end space-x-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="border-[#C2A537]/30 text-[#C2A537] hover:bg-[#C2A537]/10"
              >
                Fechar
              </Button>
              <Button
                onClick={onEdit}
                className="bg-[#C2A537] hover:bg-[#B8A533] text-black font-medium"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Aluno
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
}