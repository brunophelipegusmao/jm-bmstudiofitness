"use client";

import { motion } from "framer-motion";
import {
  Edit,
  Eye,
  MoreVertical,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
  User,
  UserCheck,
  UserX,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data - será substituído pelos dados reais depois
const mockStudents = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@email.com",
    cpf: "123.456.789-00",
    phone: "(11) 99999-9999",
    status: "active",
    paymentStatus: "up-to-date",
    monthlyFee: "R$ 89,90",
    joinDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@email.com",
    cpf: "987.654.321-00",
    phone: "(11) 88888-8888",
    status: "active",
    paymentStatus: "overdue",
    monthlyFee: "R$ 89,90",
    joinDate: "2024-02-20",
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@email.com",
    cpf: "456.789.123-00",
    phone: "(11) 77777-7777",
    status: "inactive",
    paymentStatus: "pending",
    monthlyFee: "R$ 89,90",
    joinDate: "2024-03-10",
  },
];

interface ManageStudentsViewProps {
  onBack: () => void;
}

export function ManageStudentsView({ onBack }: ManageStudentsViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "inactive"
  >("all");

  // Filtrar estudantes
  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.cpf.includes(searchTerm);

    const matchesFilter =
      filterStatus === "all" || student.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    if (status === "active") {
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

  const getPaymentBadge = (paymentStatus: string) => {
    const badges = {
      "up-to-date": "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };

    const labels = {
      "up-to-date": "Em dia",
      overdue: "Vencido",
      pending: "Pendente",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badges[paymentStatus as keyof typeof badges]}`}
      >
        {labels[paymentStatus as keyof typeof labels]}
      </span>
    );
  };

  const handleToggleStatus = (studentId: string) => {
    // Aqui será implementada a lógica de ativar/desativar
    console.log("Toggle status for student:", studentId);
  };

  const handleEditStudent = (studentId: string) => {
    // Aqui será implementada a lógica de edição
    console.log("Edit student:", studentId);
  };

  const handleViewStudent = (studentId: string) => {
    // Aqui será implementada a lógica de visualização
    console.log("View student:", studentId);
  };

  const handleDeleteStudent = (studentId: string) => {
    // Aqui será implementada a lógica de exclusão
    console.log("Delete student:", studentId);
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
          ← Voltar
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
                <p className="text-xl font-bold text-white">
                  {mockStudents.length}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {mockStudents.filter((s) => s.status === "active").length}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {mockStudents.filter((s) => s.status === "inactive").length}
                </p>
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
                <p className="text-xl font-bold text-white">
                  {
                    mockStudents.filter((s) => s.paymentStatus === "pending")
                      .length
                  }
                </p>
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
            {filteredStudents.length === 0 ? (
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
                  key={student.id}
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
                          {getStatusBadge(student.status)}
                          {getPaymentBadge(student.paymentStatus)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{student.email}</span>
                          <span>{student.cpf}</span>
                          <span>{student.phone}</span>
                          <span>{student.monthlyFee}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {/* Toggle Status Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(student.id)}
                        className="text-gray-400 hover:text-white"
                        title={
                          student.status === "active"
                            ? "Desativar aluno"
                            : "Ativar aluno"
                        }
                      >
                        {student.status === "active" ? (
                          <ToggleRight className="h-5 w-5 text-green-400" />
                        ) : (
                          <ToggleLeft className="h-5 w-5 text-red-400" />
                        )}
                      </Button>

                      {/* View Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewStudent(student.id)}
                        className="text-gray-400 hover:text-white"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* Edit Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStudent(student.id)}
                        className="text-gray-400 hover:text-white"
                        title="Editar aluno"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteStudent(student.id)}
                        className="text-gray-400 hover:text-red-400"
                        title="Excluir aluno"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      {/* More Options */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-white"
                        title="Mais opções"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          className="bg-[#C2A537] font-medium text-black hover:bg-[#B8A533]"
          onClick={() => console.log("Add new student")}
        >
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Novo Aluno
        </Button>
      </div>
    </motion.div>
  );
}
