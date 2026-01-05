"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Plus, Power, Search, Shield, Trash2, User as UserIcon, Users } from "lucide-react";
import { useCallback, useMemo, useState } from "react";

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
import { CreateUserData, User, USER_ROLES, UserRole } from "@/types/user";

interface UserManagementTabProps {
  users: User[];
  onCreateUser?: (data: CreateUserData) => Promise<void>;
  onDeleteUser?: (userId: string) => Promise<void>;
  onUpdateUser?: (userId: string, updates: Partial<User>) => void;
  onToggleStatus?: (userId: string, newStatus: boolean) => void;
  isLoading?: boolean;
  adminId: string;
  adminRole?: string; // para regras de MASTER
}

export function UserManagementTab({
  users = [],
  onCreateUser,
  onDeleteUser,
  onUpdateUser,
  onToggleStatus,
  isLoading = false,
  adminId,
  adminRole,
}: UserManagementTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | "all">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { confirm, isOpen, options, handleConfirm, handleCancel } =
    useConfirmDialog();

  // Oculta ADMIN apenas quando for o especial "Administrador"?
  // Pelo pedido: "não ocultar admin"; logo não filtramos admin aqui.
  const visibleUsers = useMemo(() => {
    return users.filter(
      (u) => adminRole === "master" || u.role !== "master" || u.id === adminId,
    );
  }, [users, adminRole, adminId]);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return visibleUsers.filter((user) => {
      const matchesSearch =
        !term ||
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        (user.cpf && user.cpf.includes(term.replace(/\D/g, "")));
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  }, [visibleUsers, searchTerm, selectedRole]);

  const stats = useMemo(() => {
    return {
      total: filteredUsers.length,
      active: filteredUsers.filter((u) => u.isActive).length,
      byRole: Object.keys(USER_ROLES).reduce(
        (acc, role) => {
          acc[role as UserRole] = filteredUsers.filter(
            (u) => u.role === role,
          ).length;
          return acc;
        },
        {} as Record<UserRole, number>,
      ),
    };
  }, [filteredUsers]);

  const handleCreateUser = useCallback(
    async (data: CreateUserData) => {
      if (onCreateUser) {
        setActionLoading(true);
        try {
          await onCreateUser(data);
          showSuccessToast("Usuário criado");
          setShowCreateForm(false);
        } catch (error) {
          console.error(error);
          showErrorToast("Erro ao criar usuário");
        } finally {
          setActionLoading(false);
        }
      }
    },
    [onCreateUser],
  );

  const handleDeleteUser = useCallback(
    async (target?: User) => {
      const user = target ?? selectedUser;
      if (!user || !onDeleteUser) return;
      if (!user.id) {
        showErrorToast("Usuário sem ID válido");
        return;
      }
      if (user.role === "master" && adminRole !== "master") {
        showErrorToast("Apenas MASTER pode excluir o usuário MASTER");
        return;
      }
      const confirmed = await confirm({
        title: "Excluir usuário",
        message:
          "Tudo relacionado a este usuário (check-ins, financeiro, dados pessoais, permissões) será excluído. Deseja continuar?",
        confirmText: "Excluir definitivamente",
        cancelText: "Cancelar",
        type: "danger",
      });
      if (!confirmed) return;

      setActionLoading(true);
      try {
        await onDeleteUser(user.id);
        showSuccessToast("Usuário excluído");
        setSelectedUser(null);
      } catch (error) {
        console.error(error);
        showErrorToast("Erro ao excluir usuário");
      } finally {
        setActionLoading(false);
      }
    },
    [selectedUser, onDeleteUser, confirm, adminRole],
  );

  const handleEditUser = useCallback(
    (user: User) => {
      if (user.role === "master" && adminRole !== "master") {
        showErrorToast("Apenas MASTER pode editar o usuário MASTER");
        return;
      }
      setSelectedUser(user);
      setIsEditModalOpen(true);
    },
    [adminRole],
  );

  const handleToggleUserStatus = useCallback(
    async (user: User) => {
      if (user.role === "admin") {
        showErrorToast("Não é possível desativar administradores");
        return;
      }
      if (user.role === "master" && adminRole !== "master") {
        showErrorToast("Apenas MASTER pode alterar o status do usuário MASTER");
        return;
      }
      setActionLoading(true);
      try {
        const newStatus = !user.isActive;
        const result = await toggleUserStatusAction(user.id, newStatus);
        if (result.success) {
          showSuccessToast(
            `Usuário ${newStatus ? "ativado" : "desativado"} com sucesso`,
          );
          if (onToggleStatus) onToggleStatus(user.id, newStatus);
          setSelectedUser((prev) =>
            prev && prev.id === user.id ? { ...prev, isActive: newStatus } : prev,
          );
        } else {
          showErrorToast(result.error || "Erro ao alterar status");
        }
      } catch (error) {
        console.error(error);
        showErrorToast("Erro ao alterar status");
      } finally {
        setActionLoading(false);
      }
    },
    [adminRole, onToggleStatus],
  );

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Total" value={stats.total} icon={<Users className="h-5 w-5" />} />
        <StatCard title="Ativos" value={stats.active} icon={<Check className="h-5 w-5" />} color="green" />
        <StatCard
          title="Administradores"
          value={stats.byRole.admin ?? 0}
          icon={<Shield className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Alunos"
          value={stats.byRole.aluno ?? 0}
          icon={<UserIcon className="h-5 w-5" />}
        />
      </div>

      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <div className="p-4 space-y-4">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole | "all")}
              className="w-full rounded-lg border border-[#C2A537]/30 bg-black/60 px-4 py-3 text-white focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537]/20 focus:outline-none sm:w-64"
            >
              <option value="all">Todos</option>
              {Object.entries(USER_ROLES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-400">
              {filteredUsers.length} resultado(s)
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-[#C2A537]/20 bg-black/50 p-4 shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold text-white">{user.name}</p>
                  {user.role === "master" && (
                    <span className="rounded-full bg-purple-700/30 px-2 text-[10px] text-purple-200">
                      MASTER
                    </span>
                  )}
                  {user.role === "admin" && (
                    <span className="rounded-full bg-amber-700/30 px-2 text-[10px] text-amber-200">
                      ADMIN
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 rounded-full border border-blue-500/30 text-blue-200 hover:border-blue-400 hover:bg-blue-500/10"
                  onClick={() => handleEditUser(user)}
                  disabled={isLoading || actionLoading}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                {user.role !== "master" || adminRole === "master" ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-full border border-red-500/30 text-red-300 hover:border-red-400 hover:bg-red-500/10"
                  onClick={() => {
                    setSelectedUser(user);
                    void handleDeleteUser(user);
                  }}
                    disabled={isLoading || actionLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-9 w-9 rounded-full border text-xs ${
                    user.isActive
                      ? "border-green-500/30 text-green-300 hover:border-green-400 hover:bg-green-500/10"
                      : "border-red-500/30 text-red-300 hover:border-red-400 hover:bg-red-500/10"
                  }`}
                  onClick={() => handleToggleUserStatus(user)}
                  disabled={isLoading || actionLoading}
                  title={user.isActive ? "Desativar" : "Ativar"}
                >
                  <Power className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent className="bg-slate-900 text-white">
          <DialogHeader>
            <DialogTitle>Novo usuário</DialogTitle>
            <DialogDescription className="text-slate-400">
              Preencha os dados abaixo para criar um novo usuário
            </DialogDescription>
          </DialogHeader>
          <CreateUserForm
            onSubmit={async (data) => {
              await handleCreateUser(data);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {isEditModalOpen && selectedUser && (
          <EditUserModal
            userId={selectedUser.id}
            userName={selectedUser.name}
            userRole={selectedUser.role}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => onUpdateUser?.(selectedUser.id, {})}
            adminId={adminId}
          />
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={isOpen}
        onConfirm={handleConfirm}
        onClose={handleCancel}
        title={options.title}
        message={options.message}
        confirmText={options.confirmText}
        cancelText={options.cancelText}
        type={options.type}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color?: "green" | "yellow";
}) {
  const base =
    color === "green"
      ? "from-green-600/15 to-green-900/10 text-green-200"
      : color === "yellow"
        ? "from-amber-600/15 to-amber-900/10 text-amber-200"
        : "from-blue-600/15 to-blue-900/10 text-blue-200";
  return (
    <div
      className={`rounded-lg border border-[#C2A537]/30 bg-gradient-to-br p-4 shadow ${base}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-zinc-300">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="rounded-full bg-black/40 p-3 text-[#C2A537]">
          {icon}
        </div>
      </div>
    </div>
  );
}
import { Edit } from "lucide-react";
