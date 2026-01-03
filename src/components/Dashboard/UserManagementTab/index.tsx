"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Edit,
  Eye,
  Mail,
  Phone,
  Plus,
  Power,
  Search,
  Shield,
  Trash2,
  User as UserIcon,
  Users,
} from "lucide-react";
import { useCallback, useState } from "react";

import { deleteStudentAction } from "@/actions/admin/delete-student-action";
import { toggleUserStatusAction } from "@/actions/admin/toggle-user-status-action";
import { CreateUserForm } from "@/components/Admin/CreateUserForm";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { EditUserModal } from "@/components/Dashboard/EditUserModal";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { getPaymentDelayDays } from "@/lib/payment-utils";
import { CreateUserData, User, USER_ROLES, UserRole } from "@/types/user";

interface UserManagementTabProps {
  users: User[];
  onCreateUser?: (data: CreateUserData) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onToggleStatus?: (userId: string, newStatus: boolean) => void;
  isLoading?: boolean;
  adminId: string;
}

export function UserManagementTab({
  users = [],
  onCreateUser,
  onDeleteUser,
  onUpdateUser,
  onToggleStatus,
  isLoading = false,
  adminId,
}: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);

  // Hook para o dialog de confirmação elegante
  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirmDialog();

  // Filtrar usuários
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cpf && user.cpf.includes(searchTerm.replace(/\D/g, "")));

    const matchesRole = selectedRole === "all" || user.role === selectedRole;

    const shouldShow = matchesSearch && matchesRole;

    // Log detalhado apenas quando há busca ativa
    if (searchTerm.length > 0) {
      console.log(` Filtro para ${user.name}:`, {
        searchTerm,
        matchesSearch,
        matchesRole,
        shouldShow,
        userRole: user.role,
        selectedRole,
      });
    }

    return shouldShow;
  });

  console.log(" Debug UserManagementTab:", {
    totalUsers: users.length,
    searchTerm,
    selectedRole,
    filteredUsers: filteredUsers.length,
    firstFiltered: filteredUsers[0]?.name,
    allUsersShowing:
      searchTerm.length === 0 ? "SIM (sem filtro)" : "NO (com filtro)",
  });

  // Estatísticas
  const stats = {
    total: filteredUsers.length,
    active: filteredUsers.filter((u) => u.isActive).length,
    byRole: Object.entries(USER_ROLES).reduce(
      (acc, [role]) => {
        acc[role as UserRole] = filteredUsers.filter(
          (u) => u.role === role,
        ).length;
        return acc;
      },
      {} as Record<UserRole, number>,
    ),
  };

  const handleCreateUser = useCallback(
    async (data: CreateUserData) => {
      if (!onCreateUser) return;

      try {
        setActionLoading(true);
        await onCreateUser(data);
        setShowCreateForm(false);
        showSuccessToast("Usuário criado com sucesso!");
      } catch (error) {
        console.error("Erro ao criar usuário:", error);
        showErrorToast("Erro ao criar usuário. Tente novamente.");
      } finally {
        setActionLoading(false);
      }
    },
    [onCreateUser],
  );

  const handleDeleteUser = useCallback(
    async (user: User) => {
      console.log("? handleDeleteUser chamado para:", user.name);

      try {
        const confirmed = await confirm({
          title: "Excluir Usuário",
          message: `Tem certeza que deseja excluir permanentemente o usuário "${user.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
          type: "danger",
        });

        console.log(" Confirmação do usuário:", confirmed);

        if (confirmed) {
          try {
            setActionLoading(true);
            console.log(" Executando delete para usuário:", user.id);

            // If a parent provided a delete handler, prefer that (keeps container in control)
            if (typeof onDeleteUser === "function") {
              await onDeleteUser(user.id);
              // parent handler should handle state update/notifications
            } else {
              const result: {
                success?: boolean;
                error?: string;
                message?: string;
              } = await deleteStudentAction(user.id);

              if (result.success) {
                showSuccessToast(
                  `Usuário "${user.name}" excluído com sucesso!`,
                );
                setIsUserModalOpen(false);
              } else {
                const errorMessage =
                  result.error || result.message || "Erro ao excluir usurio";
                showErrorToast(errorMessage);
              }
            }
          } catch (error) {
            console.error(" Erro ao excluir usuário:", error);
            showErrorToast("Erro ao excluir usuário. Tente novamente.");
          } finally {
            setActionLoading(false);
          }
        }
      } catch (error) {
        console.error(" Erro no processo de confirmação:", error);
      }
    },
    [confirm, onDeleteUser],
  );

  const handleEditUser = useCallback(async (user: User) => {
    try {
      console.log(
        " handleEditUser chamado para:",
        user.name,
        "Role:",
        user.role,
      );
      setUserToEdit(user);
      setIsEditModalOpen(true);
      setIsUserModalOpen(false); // Fechar modal de visualização
      console.log(" Modal de edição aberto");
    } catch (error) {
      console.error(" Erro ao abrir modal de edição:", error);
      showErrorToast("Erro ao abrir modal de edição");
    }
  }, []);

  const handleToggleUserStatus = useCallback(async (user: User) => {
    if (user.role === "admin") {
      showErrorToast("Não é possível desativar usuários administradores");
      return;
    }

    try {
      setActionLoading(true);
      const newStatus = !user.isActive;

      const result: {
        success?: boolean;
        error?: string;
        message?: string;
      } = await toggleUserStatusAction(user.id, newStatus);

      if (result.success) {
        showSuccessToast(
          `Usurio ${newStatus ? "ativado" : "desativado"} com sucesso!`,
        );
        // Atualizar estado atravs do callback
        if (onToggleStatus) {
          onToggleStatus(user.id, newStatus);
        }
        setIsUserModalOpen(false);
      } else {
        const errorMessage =
          result.error || result.message || "Erro ao alterar status do usurio";
        showErrorToast(errorMessage);
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      showErrorToast("Erro ao alterar status do usuário");
    } finally {
      setActionLoading(false);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciar Usuários</h2>
          <p className="text-gray-400">Crie e gerencie usuários do sistema</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="self-start bg-linear-to-r from-[#C2A537] to-[#D4B547] font-semibold text-black hover:from-[#D4B547] hover:to-[#E6C658] sm:self-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Criar Usuário
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <Users className="h-8 w-8 text-[#C2A537]" />
              <div>
                <p className="text-sm text-gray-400">Total</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                <div className="h-4 w-4 rounded-full bg-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Ativos</p>
                <p className="text-2xl font-bold text-white">{stats.active}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Funcionários</p>
                <p className="text-2xl font-bold text-white">
                  {stats.byRole.funcionario + stats.byRole.admin}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-gray-500/30 bg-gray-500/5 backdrop-blur-sm">
          <div className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-500/20">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Alunos</p>
                <p className="text-2xl font-bold text-white">
                  {stats.byRole.aluno}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros - Busca ocupando toda a linha */}
      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <div className="p-4">
          {/* Busca - linha completa */}
          <div className="relative mb-4">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtro por função */}
          <div className="flex items-center gap-3">
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as UserRole | "all")
              }
              className="w-full rounded-lg border border-[#C2A537]/30 bg-black/60 px-4 py-3 text-white focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537]/20 focus:outline-none sm:w-64"
            >
              <option value="all">Todas as funções</option>
              {Object.entries(USER_ROLES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({stats.byRole[value as UserRole]})
                </option>
              ))}
            </select>

            {/* Contador de resultados */}
            <p className="text-sm text-[#C2A537]">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "usuário encontrado"
                : "usuários encontrados"}
            </p>
          </div>
        </div>
      </Card>

      {/* Grid de Cards de usuários */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-[#C2A537]/30 border-t-[#C2A537]"
            />
          </div>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-slate-700/50 bg-slate-800/30">
            <div className="p-12 text-center">
              <Users className="mx-auto mb-4 h-16 w-16 text-slate-600" />
              <h3 className="mb-2 text-lg font-medium text-slate-400">
                {searchTerm
                  ? "Nenhum usuário encontrado"
                  : "Nenhum usuário cadastrado"}
              </h3>
              <p className="text-sm text-slate-500">
                {searchTerm
                  ? "Tente ajustar os filtros de busca"
                  : "Clique em 'Criar Usuário' para adicionar o primeiro usuário"}
              </p>
            </div>
          </Card>
        ) : (
          <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="group border-[#C2A537]/30 bg-black/40 backdrop-blur-sm transition-all hover:border-[#C2A537] hover:shadow-lg hover:shadow-[#C2A537]/20">
                  <div className="p-5">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C2A537]/20 text-lg font-bold text-[#C2A537]">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-white transition-colors group-hover:text-[#C2A537]">
                            {user.name}
                          </h3>
                          <p className="text-xs text-slate-400">{user.email}</p>
                        </div>
                      </div>
                      <div
                        className={`h-3 w-3 rounded-full ${
                          user.isActive
                            ? "bg-green-500 shadow-lg shadow-green-500/50"
                            : "bg-red-500 shadow-lg shadow-red-500/50"
                        }`}
                      />
                    </div>

                    <div className="space-y-2 border-t border-[#C2A537]/20 pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Função:</span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            user.role === "admin"
                              ? "bg-purple-500/20 text-purple-400"
                              : user.role === "funcionario"
                                ? "bg-blue-500/20 text-blue-400"
                                : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {USER_ROLES[user.role]}
                        </span>
                      </div>
                      {user.cpf && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-400">CPF:</span>
                          <span className="font-mono text-slate-300">
                            {user.cpf}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-400">Status:</span>
                        <span
                          className={`font-medium ${
                            user.isActive ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {user.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-[#C2A537]/20 pt-3">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedUser(user);
                          setIsUserModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="min-w-[70px] flex-1 border-blue-500/50 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                        title="Visualizar detalhes"
                      >
                        <Eye className="mr-1 h-3 w-3" />
                        Ver
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditUser(user);
                        }}
                        variant="outline"
                        size="sm"
                        className="min-w-20 flex-1 border-[#C2A537]/50 bg-[#C2A537]/10 text-[#C2A537] hover:bg-[#C2A537]/20"
                        disabled={actionLoading}
                        title="Editar dados"
                      >
                        <Edit className="mr-1 h-3 w-3" />
                        Editar
                      </Button>

                      {user.role !== "admin" && (
                        <>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleUserStatus(user);
                            }}
                            variant="outline"
                            size="sm"
                            className={`min-w-[100px] flex-1 ${
                              user.isActive
                                ? "border-amber-500/50 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                                : "border-green-500/50 bg-green-500/10 text-green-400 hover:bg-green-500/20"
                            }`}
                            disabled={actionLoading}
                            title={user.isActive ? "Desativar" : "Ativar"}
                          >
                            <Power className="mr-1 h-3 w-3" />
                            {user.isActive ? "Desativar" : "Ativar"}
                          </Button>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteUser(user);
                            }}
                            variant="outline"
                            size="sm"
                            className="min-w-10 border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            disabled={actionLoading}
                            title="Excluir aluno"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Modal de criação */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateUserForm
            onSubmit={handleCreateUser}
            onCancel={() => setShowCreateForm(false)}
            isLoading={actionLoading}
          />
        )}
      </AnimatePresence>

      {/* Diálogo de confirmação elegante para exclusão */}
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

      {/* Modal de Gerenciamento do Usuário */}
      <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#C2A537]">
              <UserIcon className="h-6 w-6" />
              Gerenciar Usuário
            </DialogTitle>
            <DialogDescription>
              Visualize e gerencie as informações do usuário
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* Header do Usuário */}
              <div className="flex items-start gap-4 rounded-lg border border-[#C2A537]/30 bg-black/40 p-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#C2A537]/20 text-3xl font-bold text-[#C2A537]">
                  {selectedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white">
                    {selectedUser.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        selectedUser.role === "admin"
                          ? "bg-purple-500/20 text-purple-400"
                          : selectedUser.role === "funcionario"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-gray-500/20 text-gray-400"
                      }`}
                    >
                      {USER_ROLES[selectedUser.role]}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${
                        selectedUser.isActive
                          ? "bg-green-500/20 text-green-400"
                          : "bg-red-500/20 text-red-400"
                      }`}
                    >
                      {selectedUser.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Informações do Usuário */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-[#C2A537]">
                  <UserIcon className="h-5 w-5" />
                  Informações Pessoais
                </h4>
                <div className="grid gap-4 rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3">
                    <Mail className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-400">Email</p>
                      <p className="font-medium text-white">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>
                  {selectedUser.cpf && (
                    <div className="flex items-center gap-3 border-b border-slate-700/50 pb-3">
                      <UserIcon className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">CPF</p>
                        <p className="font-mono font-medium text-white">
                          {selectedUser.cpf}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedUser.telephone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-400">Telefone</p>
                        <p className="font-medium text-white">
                          {selectedUser.telephone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Permissões */}
              <div className="space-y-4">
                <h4 className="flex items-center gap-2 text-lg font-semibold text-[#C2A537]">
                  <Shield className="h-5 w-5" />
                  Permissões e Acesso
                </h4>
                <div className="rounded-lg border border-slate-700/50 bg-slate-800/30 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">
                        Nível de acesso
                      </span>
                      <span className="font-medium text-white">
                        {USER_ROLES[selectedUser.role]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-700/50 pt-3">
                      <span className="text-sm text-slate-400">
                        Status da conta
                      </span>
                      <span
                        className={`font-medium ${
                          selectedUser.isActive
                            ? "text-green-400"
                            : "text-red-400"
                        }`}
                      >
                        {selectedUser.isActive ? "Ativa" : "Inativa"}
                      </span>
                    </div>

                    {/* Toggle de Ativação (apenas para não-admins) */}
                    {selectedUser.role !== "admin" && (
                      <div className="border-t border-slate-700/50 pt-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Power className="h-4 w-4 text-slate-400" />
                            <span className="text-sm text-slate-400">
                              Controle de Acesso
                            </span>
                          </div>
                          <button
                            onClick={() => handleToggleUserStatus(selectedUser)}
                            disabled={actionLoading}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-[#C2A537] focus:ring-offset-2 focus:ring-offset-slate-900 focus:outline-none ${
                              selectedUser.isActive
                                ? "bg-green-500"
                                : "bg-red-500"
                            } ${actionLoading ? "opacity-50" : ""}`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                selectedUser.isActive
                                  ? "translate-x-6"
                                  : "translate-x-1"
                              }`}
                            />
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-slate-500">
                          {selectedUser.isActive
                            ? "Usuário tem acesso ao sistema"
                            : "Usuário bloqueado do sistema"}
                        </p>

                        {/* Alerta de Pagamento em Atraso (apenas para alunos) */}
                        {selectedUser.role === "aluno" &&
                          (() => {
                            // Simulação de dados de pagamento - substituir por dados reais
                            const dueDate = 10;
                            const lastPaymentDate = null; // Simular sem pagamento
                            const paid = false;
                            const delayDays = getPaymentDelayDays(
                              dueDate,
                              lastPaymentDate,
                              paid,
                            );

                            if (delayDays > 10) {
                              return (
                                <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                                  <div>
                                    <p className="text-sm font-medium text-red-400">
                                      Pagamento em atraso
                                    </p>
                                    <p className="text-xs text-red-300">
                                      {delayDays} dias de atraso. Usuário deve
                                      ser desativado.
                                    </p>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-3 border-t border-slate-700/50 pt-6">
                <Button
                  onClick={() => handleEditUser(selectedUser)}
                  disabled={actionLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Usuário
                </Button>
                {selectedUser.role !== "admin" && (
                  <Button
                    onClick={() => {
                      setIsUserModalOpen(false);
                      handleDeleteUser(selectedUser);
                    }}
                    variant="destructive"
                    className="flex-1"
                    disabled={actionLoading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Usuário
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      {userToEdit && (
        <>
          {console.log(" Renderizando EditUserModal com:", {
            userId: userToEdit.id,
            userName: userToEdit.name,
            userRole: userToEdit.role,
            adminId,
            isOpen: isEditModalOpen,
          })}
          <EditUserModal
            userId={userToEdit.id}
            userName={userToEdit.name}
            userRole={userToEdit.role}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setUserToEdit(null);
            }}
            onSuccess={() => {
              // Atualizar através do callback
              if (onUpdateUser) {
                onUpdateUser(userToEdit.id, {});
              }
              setIsEditModalOpen(false);
              setUserToEdit(null);
            }}
            adminId={adminId}
          />
        </>
      )}
    </div>
  );
}


