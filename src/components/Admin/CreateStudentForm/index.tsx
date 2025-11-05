"use client";

import { motion } from "framer-motion";
import { Save, User, X } from "lucide-react";
import { useState } from "react";

import {
  createStudent,
  CreateStudentData,
} from "@/actions/admin/student-management-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCPF } from "@/lib/utils";

interface CreateStudentFormProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export function CreateStudentForm({
  onCancel,
  onSuccess,
}: CreateStudentFormProps) {
  const [formData, setFormData] = useState<CreateStudentData>({
    name: "",
    cpf: "",
    email: "",
    bornDate: "",
    address: "",
    telephone: "",
    heightCm: "",
    weightKg: "",
    bloodType: "",
    hasPracticedSports: false,
    lastExercise: "",
    historyDiseases: "",
    medications: "",
    sportsHistory: "",
    allergies: "",
    injuries: "",
    alimentalRoutine: "",
    diaryRoutine: "",
    useSupplements: false,
    whatSupplements: "",
    otherNotes: "",
    monthlyFeeValueInCents: 0,
    paymentMethod: "",
    dueDate: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateStudentData, string>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateStudentData, string>> = {};

    // Validações obrigatórias
    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = "CPF é obrigatório";
    } else if (formData.cpf.replace(/\D/g, "").length !== 11) {
      newErrors.cpf = "CPF deve ter 11 dígitos";
    }

    if (!formData.bornDate) {
      newErrors.bornDate = "Data de nascimento é obrigatória";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Endereço é obrigatório";
    }

    if (!formData.telephone.trim()) {
      newErrors.telephone = "Telefone é obrigatório";
    }

    if (!formData.heightCm.trim()) {
      newErrors.heightCm = "Altura é obrigatória";
    }

    if (!formData.weightKg.trim()) {
      newErrors.weightKg = "Peso é obrigatório";
    }

    if (!formData.bloodType.trim()) {
      newErrors.bloodType = "Tipo sanguíneo é obrigatório";
    }

    if (formData.monthlyFeeValueInCents <= 0) {
      newErrors.monthlyFeeValueInCents = "Mensalidade deve ser maior que zero";
    }

    if (!formData.paymentMethod.trim()) {
      newErrors.paymentMethod = "Forma de pagamento é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await createStudent(formData);
      onSuccess();
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      // O erro já será mostrado pelo toast no componente pai
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateStudentData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCpfChange = (value: string) => {
    const formatted = formatCPF(value);
    handleInputChange("cpf", formatted);
  };

  const handleMonthlyFeeChange = (value: string) => {
    const numericValue = parseFloat(value.replace(/[^0-9.,]/g, "").replace(",", "."));
    const cents = isNaN(numericValue) ? 0 : Math.round(numericValue * 100);
    handleInputChange("monthlyFeeValueInCents", cents);
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
                  <h3 className="text-xl font-bold text-white">Cadastrar Novo Aluno</h3>
                  <p className="text-sm text-gray-400">
                    Preencha todos os dados para cadastrar o aluno
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

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Dados Básicos */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">Dados Básicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={errors.name ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="email">E-mail *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className={errors.email ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => handleCpfChange(e.target.value)}
                    placeholder="000.000.000-00"
                    className={errors.cpf ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.cpf && <p className="text-red-500 text-sm mt-1">{errors.cpf}</p>}
                </div>

                <div>
                  <Label htmlFor="bornDate">Data de Nascimento *</Label>
                  <Input
                    id="bornDate"
                    type="date"
                    value={formData.bornDate}
                    onChange={(e) => handleInputChange("bornDate", e.target.value)}
                    className={errors.bornDate ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.bornDate && <p className="text-red-500 text-sm mt-1">{errors.bornDate}</p>}
                </div>

                <div>
                  <Label htmlFor="telephone">Telefone *</Label>
                  <Input
                    id="telephone"
                    value={formData.telephone}
                    onChange={(e) => handleInputChange("telephone", e.target.value)}
                    placeholder="(11) 99999-9999"
                    className={errors.telephone ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.telephone && <p className="text-red-500 text-sm mt-1">{errors.telephone}</p>}
                </div>

                <div>
                  <Label htmlFor="address">Endereço *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={errors.address ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>
              </div>
            </div>

            {/* Dados de Saúde */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">Dados de Saúde</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="heightCm">Altura (cm) *</Label>
                  <Input
                    id="heightCm"
                    value={formData.heightCm}
                    onChange={(e) => handleInputChange("heightCm", e.target.value)}
                    placeholder="175"
                    className={errors.heightCm ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.heightCm && <p className="text-red-500 text-sm mt-1">{errors.heightCm}</p>}
                </div>

                <div>
                  <Label htmlFor="weightKg">Peso (kg) *</Label>
                  <Input
                    id="weightKg"
                    value={formData.weightKg}
                    onChange={(e) => handleInputChange("weightKg", e.target.value)}
                    placeholder="70"
                    className={errors.weightKg ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.weightKg && <p className="text-red-500 text-sm mt-1">{errors.weightKg}</p>}
                </div>

                <div>
                  <Label htmlFor="bloodType">Tipo Sanguíneo *</Label>
                  <select
                    id="bloodType"
                    value={formData.bloodType}
                    onChange={(e) => handleInputChange("bloodType", e.target.value)}
                    className={`w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.bloodType ? "border-red-500" : "border-input"
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Selecione</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                  {errors.bloodType && <p className="text-red-500 text-sm mt-1">{errors.bloodType}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lastExercise">Último Exercício</Label>
                  <Input
                    id="lastExercise"
                    value={formData.lastExercise}
                    onChange={(e) => handleInputChange("lastExercise", e.target.value)}
                    placeholder="Corrida, caminhada, etc."
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="sportsHistory">Histórico Esportivo</Label>
                  <Input
                    id="sportsHistory"
                    value={formData.sportsHistory}
                    onChange={(e) => handleInputChange("sportsHistory", e.target.value)}
                    placeholder="Futebol, natação, etc."
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="historyDiseases">Histórico de Doenças</Label>
                  <textarea
                    id="historyDiseases"
                    value={formData.historyDiseases}
                    onChange={(e) => handleInputChange("historyDiseases", e.target.value)}
                    placeholder="Descreva histórico médico relevante"
                    className="w-full h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="medications">Medicamentos</Label>
                  <textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleInputChange("medications", e.target.value)}
                    placeholder="Liste medicamentos em uso"
                    className="w-full h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="allergies">Alergias</Label>
                  <Input
                    id="allergies"
                    value={formData.allergies}
                    onChange={(e) => handleInputChange("allergies", e.target.value)}
                    placeholder="Alergias conhecidas"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="injuries">Lesões</Label>
                  <Input
                    id="injuries"
                    value={formData.injuries}
                    onChange={(e) => handleInputChange("injuries", e.target.value)}
                    placeholder="Lesões ou limitações"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="alimentalRoutine">Rotina Alimentar</Label>
                  <textarea
                    id="alimentalRoutine"
                    value={formData.alimentalRoutine}
                    onChange={(e) => handleInputChange("alimentalRoutine", e.target.value)}
                    placeholder="Descreva a rotina alimentar"
                    className="w-full h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <Label htmlFor="diaryRoutine">Rotina Diária</Label>
                  <textarea
                    id="diaryRoutine"
                    value={formData.diaryRoutine}
                    onChange={(e) => handleInputChange("diaryRoutine", e.target.value)}
                    placeholder="Descreva a rotina diária"
                    className="w-full h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="hasPracticedSports"
                    checked={formData.hasPracticedSports}
                    onCheckedChange={(checked) => handleInputChange("hasPracticedSports", !!checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="hasPracticedSports">Já praticou esportes</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="useSupplements"
                    checked={formData.useSupplements}
                    onCheckedChange={(checked) => handleInputChange("useSupplements", !!checked)}
                    disabled={isLoading}
                  />
                  <Label htmlFor="useSupplements">Usa suplementos</Label>
                </div>

                {formData.useSupplements && (
                  <div>
                    <Label htmlFor="whatSupplements">Quais suplementos?</Label>
                    <Input
                      id="whatSupplements"
                      value={formData.whatSupplements}
                      onChange={(e) => handleInputChange("whatSupplements", e.target.value)}
                      placeholder="Liste os suplementos utilizados"
                      disabled={isLoading}
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="otherNotes">Observações Gerais</Label>
                <textarea
                  id="otherNotes"
                  value={formData.otherNotes}
                  onChange={(e) => handleInputChange("otherNotes", e.target.value)}
                  placeholder="Outras informações relevantes"
                  className="w-full h-20 rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Dados Financeiros */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-[#C2A537]">Dados Financeiros</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="monthlyFee">Mensalidade (R$) *</Label>
                  <Input
                    id="monthlyFee"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthlyFeeValueInCents / 100}
                    onChange={(e) => handleMonthlyFeeChange(e.target.value)}
                    placeholder="0,00"
                    className={errors.monthlyFeeValueInCents ? "border-red-500" : ""}
                    disabled={isLoading}
                  />
                  {errors.monthlyFeeValueInCents && (
                    <p className="text-red-500 text-sm mt-1">{errors.monthlyFeeValueInCents}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                  <select
                    id="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className={`w-full h-9 rounded-md border bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.paymentMethod ? "border-red-500" : "border-input"
                    }`}
                    disabled={isLoading}
                  >
                    <option value="">Selecione</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="pix">PIX</option>
                    <option value="cartao_debito">Cartão de Débito</option>
                    <option value="cartao_credito">Cartão de Crédito</option>
                    <option value="transferencia">Transferência</option>
                  </select>
                  {errors.paymentMethod && (
                    <p className="text-red-500 text-sm mt-1">{errors.paymentMethod}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="dueDate">Dia de Vencimento</Label>
                  <select
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", parseInt(e.target.value))}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-[#C2A537]/20">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="border-[#C2A537]/30 text-[#C2A537] hover:bg-[#C2A537]/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-[#C2A537] hover:bg-[#B8A533] text-black font-medium"
              >
                {isLoading ? (
                  "Cadastrando..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Cadastrar Aluno
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