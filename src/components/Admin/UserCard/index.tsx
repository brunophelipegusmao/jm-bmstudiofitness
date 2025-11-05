"use client";

import { motion } from "framer-motion";
import { Edit, MoreVertical, Shield, Trash2, User } from "lucide-react";
import { useState } from "react";

import { Card } from "@/components/ui/card";
import { User as UserType, USER_ROLES } from "@/types/user";

interface UserCardProps {
  user: UserType;
  onEdit: (user: UserType) => void;
  onDelete: (user: UserType) => void;
  isLoading?: boolean;
}

export function UserCard({
  user,
  onEdit,
  onDelete,
  isLoading = false,
}: UserCardProps) {
  const [showActions, setShowActions] = useState(false);

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      case "funcionario":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "professor":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "aluno":
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
      default:
        return "text-gray-400 bg-gray-400/10 border-gray-400/20";
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "text-green-400 bg-green-400/10"
      : "text-red-400 bg-red-400/10";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative"
    >
      <Card className="border-[#C2A537]/20 bg-black/40 backdrop-blur-sm transition-all duration-200 hover:border-[#C2A537]/40 hover:bg-[#C2A537]/5">
        <div className="p-4">
          <div className="flex items-start justify-between">
            {/* Informações do usuário */}
            <div className="flex flex-1 items-start space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0 rounded-xl border border-[#C2A537]/30 bg-gradient-to-br from-black/50 to-black/80 p-3">
                <User className="h-6 w-6 text-[#C2A537]" />
              </div>

              {/* Dados */}
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center space-x-3">
                  <h4 className="truncate text-lg font-semibold text-white">
                    {user.name}
                  </h4>

                  {/* Badge de função */}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleColor(user.role)}`}
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    {USER_ROLES[user.role]}
                  </span>

                  {/* Status */}
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(user.isActive)}`}
                  >
                    {user.isActive ? "Ativo" : "Inativo"}
                  </span>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-slate-400">📧 {user.email}</p>
                  {user.cpf && (
                    <p className="text-sm text-slate-500">🆔 CPF: {user.cpf}</p>
                  )}
                  {user.telephone && (
                    <p className="text-sm text-slate-500">
                      📱 {user.telephone}
                    </p>
                  )}
                  <p className="text-sm text-slate-500">
                    📅 Criado em {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu de ações */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                disabled={isLoading}
                className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-white disabled:opacity-50"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {/* Dropdown de ações */}
              {showActions && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute top-full right-0 z-50 mt-2 w-48 rounded-lg border border-[#C2A537]/30 bg-black/95 shadow-xl backdrop-blur-lg"
                  >
                    <div className="py-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(user);
                          setShowActions(false);
                        }}
                        disabled={isLoading}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-[#C2A537]/10 hover:text-white disabled:opacity-50"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(
                            "🗑️ Botão excluir clicado para:",
                            user.name,
                          );
                          onDelete(user);
                          setShowActions(false);
                        }}
                        disabled={isLoading}
                        className="flex w-full items-center space-x-2 px-4 py-2 text-left text-sm text-red-400 transition-colors hover:bg-red-400/10 hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  </motion.div>

                  {/* Overlay para fechar o dropdown quando clicar fora */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowActions(false)}
                  />
                </>
              )}
            </div>
          </div>

          {/* Endereço (se disponível) */}
          {user.address && (
            <div className="mt-3 border-t border-[#C2A537]/20 pt-3">
              <p className="text-sm text-slate-500">📍 {user.address}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Overlay para fechar o dropdown quando clicar fora */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </motion.div>
  );
}
