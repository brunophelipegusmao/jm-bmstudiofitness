"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, Save, User, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCPF } from "@/lib/utils";
import {
  CreateUserData,
  USER_ROLE_DESCRIPTIONS,
  USER_ROLES,
  UserRole,
} from "@/types/user";

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateUserForm({
  onSubmit,
  onCancel,
  isLoading = false,
}: CreateUserFormProps) {
  const [formData, setFormData] = useState<CreateUserData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "aluno" as UserRole,
    cpf: "",
    telephone: "",
    address: "",
    bornDate: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateUserData, string>>
  >({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateUserData, string>> = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Nome deve ter pelo menos 2 caracteres";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else {
      // Validação robusta de senha
      const password = formData.password;
      const hasMinLength = password.length >= 8;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumber = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password,
      );

      if (!hasMinLength) {
        newErrors.password = "Senha deve ter pelo menos 8 caracteres";
      } else if (!hasUpperCase) {
        newErrors.password = "Senha deve ter pelo menos uma letra maiúscula";
      } else if (!hasLowerCase) {
        newErrors.password = "Senha deve ter pelo menos uma letra minúscula";
      } else if (!hasNumber) {
        newErrors.password = "Senha deve ter pelo menos um número";
      } else if (!hasSpecialChar) {
        newErrors.password =
          "Senha deve ter pelo menos um caractere especial (!@#$%^&*()_+-=[]{};':\"\\|,.<>/?)";
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Senhas não coincidem";
    }

    // Validações condicionais
    if (formData.cpf && formData.cpf.replace(/\D/g, "").length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    if (
      formData.telephone &&
      formData.telephone.replace(/\D/g, "").length < 10
    ) {
      newErrors.telephone = "Telefone inválido";
    }

    if (formData.bornDate) {
      const birthDate = new Date(formData.bornDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 12 || age > 120) {
        newErrors.bornDate = "Data de nascimento inválida";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const handleInputChange = (field: keyof CreateUserData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCPFChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    handleInputChange("cpf", formattedCPF);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto"
      >
        <Card className="border-[#C2A537]/30 bg-black/95 backdrop-blur-lg">
          <div className="border-b border-[#C2A537]/20 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="rounded-xl border border-[#C2A537]/30 bg-gradient-to-br from-black/50 to-black/80 p-3">
                  <User className="h-6 w-6 text-[#C2A537]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Criar Novo Usuário
                  </h3>
                  <p className="text-sm text-gray-400">
                    Preencha os dados para criar um usuário
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">
                Dados Básicos
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Digite o nome completo"
                    className={errors.name ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Digite o email"
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="password">Senha *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Digite a senha"
                      className={
                        errors.password ? "border-red-500 pr-10" : "pr-10"
                      }
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}

                  {/* Indicador de requisitos de senha */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-gray-400">
                      A senha deve conter:
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div
                        className={`flex items-center gap-1 ${
                          formData.password.length >= 8
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-xs">
                          {formData.password.length >= 8 ? "✓" : "○"}
                        </span>
                        Mín. 8 caracteres
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          /[A-Z]/.test(formData.password)
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-xs">
                          {/[A-Z]/.test(formData.password) ? "✓" : "○"}
                        </span>
                        Uma maiúscula
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          /[a-z]/.test(formData.password)
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-xs">
                          {/[a-z]/.test(formData.password) ? "✓" : "○"}
                        </span>
                        Uma minúscula
                      </div>
                      <div
                        className={`flex items-center gap-1 ${
                          /\d/.test(formData.password)
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-xs">
                          {/\d/.test(formData.password) ? "✓" : "○"}
                        </span>
                        Um número
                      </div>
                      <div
                        className={`col-span-2 flex items-center gap-1 ${
                          /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                            formData.password,
                          )
                            ? "text-green-400"
                            : "text-gray-400"
                        }`}
                      >
                        <span className="text-xs">
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                            formData.password,
                          )
                            ? "✓"
                            : "○"}
                        </span>
                        Um caractere especial (!@#$%^&*)
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Confirme a senha"
                      className={
                        errors.confirmPassword
                          ? "border-red-500 pr-10"
                          : "pr-10"
                      }
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Nível de Acesso */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">
                Nível de Acesso
              </h4>

              <div>
                <Label htmlFor="role">Função *</Label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    handleInputChange("role", e.target.value as UserRole)
                  }
                  className="w-full rounded-lg border border-[#C2A537]/30 bg-black/60 px-4 py-3 text-white focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537]/20 focus:outline-none"
                  disabled={isLoading}
                >
                  {Object.entries(USER_ROLES).map(([value, label]) => (
                    <option
                      key={value}
                      value={value}
                      className="bg-black text-white"
                    >
                      {label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-gray-400">
                  {USER_ROLE_DESCRIPTIONS[formData.role]}
                </p>
              </div>
            </div>

            {/* Dados Complementares */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">
                Dados Complementares (Opcionais)
              </h4>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    type="text"
                    value={formData.cpf}
                    onChange={(e) => handleCPFChange(e.target.value)}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    className={errors.cpf ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-500">{errors.cpf}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telephone">Telefone</Label>
                  <Input
                    id="telephone"
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      handleInputChange("telephone", e.target.value)
                    }
                    placeholder="(11) 99999-9999"
                    className={errors.telephone ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.telephone}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="bornDate">Data de Nascimento</Label>
                  <Input
                    id="bornDate"
                    type="date"
                    value={formData.bornDate}
                    onChange={(e) =>
                      handleInputChange("bornDate", e.target.value)
                    }
                    className={errors.bornDate ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.bornDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bornDate}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    placeholder="Rua, número, bairro, cidade"
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 border-t border-[#C2A537]/20 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancel}
                disabled={isLoading}
                className="text-gray-400 hover:text-white"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-[#C2A537] to-[#D4B547] font-semibold text-black hover:from-[#D4B547] hover:to-[#E6C658]"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black"
                  />
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Criar Usuário
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
