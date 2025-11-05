"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search, Users } from "lucide-react";
import { useCallback, useState } from "react";

import { CreateUserForm } from "@/components/Admin/CreateUserForm";
import { UserCard } from "@/components/Admin/UserCard";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useConfirmDialog } from "@/hooks/useConfirmDialog";
import { CreateUserData, User, USER_ROLES, UserRole } from "@/types/user";

interface UserManagementTabProps {
  users: User[];
  onCreateUser?: (data: CreateUserData) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  isLoading?: boolean;
}

export function UserManagementTab({
  users = [],
  onCreateUser,
  onDeleteUser,
  isLoading = false,
}: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      console.log(`🔍 Filtro para ${user.name}:`, {
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

  console.log("🔍 Debug UserManagementTab:", {
    totalUsers: users.length,
    searchTerm,
    selectedRole,
    filteredUsers: filteredUsers.length,
    firstFiltered: filteredUsers[0]?.name,
    allUsersShowing:
      searchTerm.length === 0 ? "SIM (sem filtro)" : "NÃO (com filtro)",
  });

  // Estatísticas
  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    byRole: Object.entries(USER_ROLES).reduce(
      (acc, [role]) => {
        acc[role as UserRole] = users.filter((u) => u.role === role).length;
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
      console.log("🗑️ handleDeleteUser chamado para:", user.name);

      try {
        const confirmed = await confirm({
          title: "Excluir Usuário",
          message: `Tem certeza que deseja excluir permanentemente o usuário "${user.name}"? Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
          type: "danger",
        });

        console.log("🤔 Confirmação do usuário:", confirmed);

        if (confirmed && onDeleteUser) {
          try {
            setActionLoading(true);
            console.log("🔄 Executando delete para usuário:", user.id);
            await onDeleteUser(user.id);
            showSuccessToast(`Usuário "${user.name}" excluído com sucesso!`);
          } catch (error) {
            console.error("❌ Erro ao excluir usuário:", error);
            showErrorToast("Erro ao excluir usuário. Tente novamente.");
          } finally {
            setActionLoading(false);
          }
        }
      } catch (error) {
        console.error("❌ Erro no processo de confirmação:", error);
      }
    },
    [confirm, onDeleteUser],
  );

  const handleEditUser = useCallback((user: User) => {
    // TODO: Implementar modal de edição
    console.log("✏️ Editando usuário:", user.name);
    alert(
      `Funcionalidade de edição em desenvolvimento.\nUsuário: ${user.name}`,
    );
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

      {/* Filtros */}
      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            {/* Busca */}
            <div className="relative flex-1">
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
            <select
              value={selectedRole}
              onChange={(e) =>
                setSelectedRole(e.target.value as UserRole | "all")
              }
              className="w-full rounded-lg border border-[#C2A537]/30 bg-black/60 px-4 py-3 text-white focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537]/20 focus:outline-none sm:w-48"
            >
              <option value="all">Todas as funções</option>
              {Object.entries(USER_ROLES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({stats.byRole[value as UserRole]})
                </option>
              ))}
            </select>
          </div>

          {/* Contador de resultados */}
          <div className="mt-4 border-t border-[#C2A537]/20 pt-4">
            <p className="text-sm text-[#C2A537]">
              {filteredUsers.length}{" "}
              {filteredUsers.length === 1
                ? "usuário encontrado"
                : "usuários encontrados"}
              {searchTerm && ` para "${searchTerm}"`}
            </p>
          </div>
        </div>
      </Card>

      {/* Lista de usuários */}
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
          <motion.div className="space-y-4">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <UserCard
                  user={user}
                  onEdit={handleEditUser}
                  onDelete={handleDeleteUser}
                  isLoading={actionLoading}
                />
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
    </div>
  );
}
