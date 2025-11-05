"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  CreditCard,
  Edit,
  Eye,
  Mail,
  MoreVertical,
  Phone,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCPF } from "@/lib/utils";

interface StudentCardProps {
  student: StudentFullData;
  onEdit: () => void;
  onDelete: () => void;
  onView: () => void;
  onTogglePayment: () => void;
  isLoading?: boolean;
}

export function StudentCard({
  student,
  onEdit,
  onDelete,
  onView,
  onTogglePayment,
  isLoading = false,
}: StudentCardProps) {
  const [showActions, setShowActions] = useState(false);

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
    <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-all duration-300 group">
      <div className="p-6 space-y-4">
        {/* Header do Card */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-[#C2A537]/20">
              <User className="h-5 w-5 text-[#C2A537]" />
            </div>
            <div>
              <h3 className="font-semibold text-white truncate max-w-40">
                {student.name}
              </h3>
              <p className="text-sm text-gray-400">
                {student.age} anos
              </p>
            </div>
          </div>

          {/* Menu de Ações */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 text-gray-400 hover:text-white"
              disabled={isLoading}
            >
              <MoreVertical className="h-4 w-4" />
            </Button>

            {showActions && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute right-0 top-8 z-50 w-48 rounded-lg border border-[#C2A537]/30 bg-black/95 backdrop-blur-lg shadow-lg"
                onMouseLeave={() => setShowActions(false)}
              >
                <div className="p-2 space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onView();
                      setShowActions(false);
                    }}
                    className="w-full justify-start text-white hover:bg-[#C2A537]/20 h-8"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                      setShowActions(false);
                    }}
                    className="w-full justify-start text-white hover:bg-[#C2A537]/20 h-8"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTogglePayment();
                      setShowActions(false);
                    }}
                    className="w-full justify-start text-white hover:bg-[#C2A537]/20 h-8"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    {student.paid ? "Marcar Pendente" : "Marcar Pago"}
                  </Button>

                  <div className="border-t border-[#C2A537]/20 my-1" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                      setShowActions(false);
                    }}
                    className="w-full justify-start text-red-400 hover:bg-red-400/20 h-8"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir
                  </Button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Status de Pagamento */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor()}`}
          >
            {getPaymentStatusText()}
          </span>
          <span className="text-sm text-gray-400">
            {student.formattedMonthlyFee}
          </span>
        </div>

        {/* Informações de Contato */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Mail className="h-4 w-4" />
            <span className="truncate">{student.email}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Phone className="h-4 w-4" />
            <span>{student.telephone}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <User className="h-4 w-4" />
            <span>{formatCPF(student.cpf)}</span>
          </div>
        </div>

        {/* Data de Vencimento */}
        <div className="flex items-center justify-between pt-2 border-t border-[#C2A537]/20">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>Venc: {student.dueDate}</span>
          </div>
          
          {student.lastPaymentDate && (
            <span className="text-xs text-gray-500">
              Últ. pag: {new Date(student.lastPaymentDate).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>

        {/* Botão Principal */}
        <Button
          onClick={onView}
          className="w-full bg-transparent border border-[#C2A537]/30 text-[#C2A537] hover:bg-[#C2A537] hover:text-black transition-all duration-300"
          disabled={isLoading}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver Detalhes
        </Button>
      </div>
    </Card>
  );
}