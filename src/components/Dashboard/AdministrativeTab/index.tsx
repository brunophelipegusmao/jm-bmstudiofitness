"use client";
import {
  CalendarIcon,
  DollarSign,
  FileText,
  Save,
  Settings,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";

import {
  DashboardStats,
  getDashboardStatsAction,
} from "@/actions/admin/get-dashboard-stats-action";
import {
  getStudentsPaymentsAction,
  StudentPaymentData,
} from "@/actions/admin/get-students-payments-action";
import { updatePaymentAction } from "@/actions/admin/update-payment-action";
import {
  createAlunoAction,
  FormState,
} from "@/actions/user/create-aluno-action";
import { BodyMeasurementsHistoryView } from "@/components/Admin/BodyMeasurementsHistoryView";
import { FormFeedbackModal } from "@/components/Admin/FormFeedbackModal";
import { PaymentStatusModal } from "@/components/Admin/PaymentStatusModal";
import { StudentCredentialsModal } from "@/components/Admin/StudentCredentialsModal";
import { AcademySettingsView } from "@/components/Dashboard/AcademySettingsView";
import { ManageStudentsView } from "@/components/Dashboard/ManageStudentsView";
import { ReportsView } from "@/components/Dashboard/ReportsView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/payment-utils";

interface User {
  id: string;
  name: string;
  userRole: string;
}

interface AdministrativeTabProps {
  user: User;
  onStudentsChange?: () => void | Promise<void>;
}

export function AdministrativeTab({
  user,
  onStudentsChange,
}: AdministrativeTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [bodyFatPercentage, setBodyFatPercentage] = useState<number | null>(
    null,
  );
  const [selectedGender, setSelectedGender] = useState<string>("");

  const calculateBodyFat = async (
    gender: string,
    age: number,
    fold1: number,
    fold2: number,
    fold3: number,
  ) => {
    const sumFolds = fold1 + fold2 + fold3;
    let dc;

    if (gender === "feminino") {
      // Fórmula para mulheres (tríceps, suprailíaca e coxa)
      dc =
        1.099421 -
        0.0009928 * sumFolds +
        0.0000023 * Math.pow(sumFolds, 2) -
        0.0001392 * age;
    } else {
      // Fórmula para homens (peitoral, abdominal e coxa)
      dc =
        1.10938 -
        0.0008267 * sumFolds +
        0.0000016 * Math.pow(sumFolds, 2) -
        0.0002574 * age;
    }

    // Fórmula de Siri para percentual de gordura
    const fatPercentage = 495 / dc - 450;
    const bodyFatValue = Number(fatPercentage.toFixed(2));
    setBodyFatPercentage(bodyFatValue);

    // Salva os dados via API somente se tivermos um userId (edição de aluno)
    const studentIdElement =
      typeof document !== "undefined"
        ? (document.getElementById("studentId") as HTMLInputElement | null)
        : null;
    const studentId = studentIdElement?.value || null;

    const weightValue = parseFloat(
      (document.getElementById("weightKg") as HTMLInputElement)?.value || "0",
    );
    const heightValue = parseFloat(
      (document.getElementById("heightCm") as HTMLInputElement)?.value || "0",
    );

    const measurementData: Record<string, unknown> = {
      userId: studentId,
      weightKg: isNaN(weightValue) ? null : weightValue,
      heightCm: isNaN(heightValue) ? null : heightValue,
      bodyFatPercentage: bodyFatValue,
      measuredBy: user?.id || null,
      notes: "Medição realizada durante cadastro/atualização",
    };

    if (gender === "feminino") {
      const tricepsValue = parseFloat(
        (document.getElementById("tricepsFold") as HTMLInputElement)?.value ||
          "0",
      );
      const suprailiacValue = parseFloat(
        (document.getElementById("suprailiacFold") as HTMLInputElement)
          ?.value || "0",
      );
      const thighValue = parseFloat(
        (document.getElementById("thighFold") as HTMLInputElement)?.value ||
          "0",
      );

      Object.assign(measurementData, {
        tricepsSkinfoldMm: isNaN(tricepsValue) ? null : tricepsValue,
        suprailiacSkinfoldMm: isNaN(suprailiacValue) ? null : suprailiacValue,
        thighSkinfoldMm: isNaN(thighValue) ? null : thighValue,
      });
    } else {
      const chestValue = parseFloat(
        (document.getElementById("chestFold") as HTMLInputElement)?.value ||
          "0",
      );
      const abdominalValue = parseFloat(
        (document.getElementById("abdominalFold") as HTMLInputElement)?.value ||
          "0",
      );
      const thighValue = parseFloat(
        (document.getElementById("thighFold") as HTMLInputElement)?.value ||
          "0",
      );

      Object.assign(measurementData, {
        chestSkinfoldMm: isNaN(chestValue) ? null : chestValue,
        abdominalSkinfoldMm: isNaN(abdominalValue) ? null : abdominalValue,
        thighSkinfoldMm: isNaN(thighValue) ? null : thighValue,
      });
    }

    if (studentId) {
      try {
        await fetch("/api/admin/body-measurements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(measurementData),
        });
        toast.success("Medições salvas com sucesso");
      } catch (error) {
        console.error("Error saving body measurements via API:", error);
        toast.error("Erro ao salvar medições");
      }
    } else {
      // Sem userId (novo cadastro)  salvará apenas quando o aluno existir
      console.debug("Skipping save: no studentId available yet");
    }
  };

  const calculateAge = (bornDate: string) => {
    const today = new Date();
    const birthDate = new Date(bornDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    setCalculatedAge(age);
    return age;
  };
  const [showUpToDateModal, setShowUpToDateModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [studentsData, setStudentsData] = useState<StudentPaymentData[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [formState, formAction, isPending] = useActionState<
    FormState,
    FormData
  >(createAlunoAction, { success: false, message: "" });

  // Log para debug do isPending
  useEffect(() => {
    console.log(" [COMPONENT] isPending mudou:", isPending);
  }, [isPending]);

  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackModalConfig, setFeedbackModalConfig] = useState<{
    type: "success" | "error" | "warning";
    title: string;
    message: string;
    details?: string[];
  }>({
    type: "success",
    title: "",
    message: "",
    details: [],
  });

  // Validação client-side antes do submit
  const validateForm = (formElement: HTMLFormElement): boolean => {
    const requiredFields = [
      { id: "name", label: "Nome Completo" },
      { id: "email", label: "Email" },
      { id: "cpf", label: "CPF" },
      { id: "sex", label: "Sexo" },
      { id: "telephone", label: "Telefone" },
      { id: "bornDate", label: "Data de Nascimento" },
      { id: "address", label: "Endereço" },
      { id: "monthlyFee", label: "Mensalidade" },
      { id: "paymentMethod", label: "Método de Pagamento" },
      { id: "dueDate", label: "Dia de Vencimento" },
    ];

    const missingFields: string[] = [];

    requiredFields.forEach((field) => {
      const element = formElement.querySelector(`#${field.id}`) as
        | HTMLInputElement
        | HTMLTextAreaElement
        | HTMLSelectElement;
      if (element && (!element.value || element.value.trim() === "")) {
        missingFields.push(field.label);
      }
    });

    if (missingFields.length > 0) {
      setFeedbackModalConfig({
        type: "warning",
        title: "Campos Obrigatórios Faltando",
        message:
          "Por favor, preencha todos os campos obrigatórios antes de salvar.",
        details: missingFields.map((field) => `${field} não foi preenchido`),
      });
      setShowFeedbackModal(true);
      return false;
    }

    return true;
  };

  // Carregar estatísticas ao montar o componente
  useEffect(() => {
    async function loadStats() {
      try {
        setLoadingStats(true);
        const result = await getDashboardStatsAction();
        if (result.success && result.stats) {
          setStats(result.stats);
        }
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      } finally {
        setLoadingStats(false);
      }
    }

    loadStats();
  }, []);

  // Recarregar estatísticas quando um aluno for cadastrado com sucesso
  useEffect(() => {
    console.log(" [COMPONENT] formState mudou:", {
      success: formState.success,
      message: formState.message ?? "Aluno cadastrado com sucesso!",
      hasCredentials: !!formState.credentials,
    });

    if (formState.success) {
      console.log(" [COMPONENT] Aluno cadastrado com sucesso!");
      async function reloadStats() {
        const result = await getDashboardStatsAction();
        if (result.success && result.stats) {
          setStats(result.stats);
        }
      }
      reloadStats();

      // Recarregar lista de alunos
      if (onStudentsChange) {
        console.log("? [COMPONENT] Recarregando lista de alunos...");
        onStudentsChange();
      }

      // Mostrar modal de sucesso
      setFeedbackModalConfig({
        type: "success",
        title: "Aluno Cadastrado com Sucesso!",
        message: formState.message ?? "Aluno cadastrado com sucesso!",
        details: formState.credentials
          ? [
              formState.credentials.name ? `Nome: ${formState.credentials.name}` : null,
              formState.credentials.email ? `Email: ${formState.credentials.email}` : null,
              "Um e-mail de confirmação foi enviado com as credenciais de acesso.",
            ].filter(Boolean) as string[]
          : undefined,
      });
      setShowFeedbackModal(true);

      // Se o servidor retornou o id do usuário criado, salvar as medições enviadas no formulário
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((formState as any).createdUserId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newUserId = (formState as any).createdUserId as string;
        // Salvar medições que o treinador já tenha preenchido no formulário
        const saveMeasurementsForUser = async (userId: string) => {
          try {
            const weightValue = parseFloat(
              (document.getElementById("weightKg") as HTMLInputElement)
                ?.value || "0",
            );
            const heightValue = parseFloat(
              (document.getElementById("heightCm") as HTMLInputElement)
                ?.value || "0",
            );

            const payload: Record<string, unknown> = {
              userId,
              weightKg: isNaN(weightValue) ? null : weightValue,
              heightCm: isNaN(heightValue) ? null : heightValue,
              bodyFatPercentage: bodyFatPercentage,
              measuredBy: user?.id || null,
              notes: "Medição inicial no cadastro",
            };

            if (selectedGender === "feminino") {
              payload.tricepsSkinfoldMm =
                parseFloat(
                  (document.getElementById("tricepsFold") as HTMLInputElement)
                    ?.value || "0",
                ) || null;
              payload.suprailiacSkinfoldMm =
                parseFloat(
                  (
                    document.getElementById(
                      "suprailiacFold",
                    ) as HTMLInputElement
                  )?.value || "0",
                ) || null;
              payload.thighSkinfoldMm =
                parseFloat(
                  (document.getElementById("thighFold") as HTMLInputElement)
                    ?.value || "0",
                ) || null;
            } else {
              payload.chestSkinfoldMm =
                parseFloat(
                  (document.getElementById("chestFold") as HTMLInputElement)
                    ?.value || "0",
                ) || null;
              payload.abdominalSkinfoldMm =
                parseFloat(
                  (document.getElementById("abdominalFold") as HTMLInputElement)
                    ?.value || "0",
                ) || null;
              payload.thighSkinfoldMm =
                parseFloat(
                  (document.getElementById("thighFold") as HTMLInputElement)
                    ?.value || "0",
                ) || null;
            }

            await fetch("/api/admin/body-measurements", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(payload),
            });
          } catch (error) {
            console.error("Erro ao salvar medições iniciais:", error);
          }
        };

        void saveMeasurementsForUser(newUserId);
      }
    } else if (!formState.success && formState.message) {
      console.log(" [COMPONENT] Erro ao cadastrar aluno");
      // Mostrar modal de erro
      const errorDetails: string[] = [];

      if (formState.errors) {
        Object.entries(formState.errors).forEach(([field, messages]) => {
          errorDetails.push(`${field}: ${messages.join(", ")}`);
        });
      }

      setFeedbackModalConfig({
        type: "error",
        title: "Erro ao Cadastrar Aluno",
        message: formState.message ?? "Aluno cadastrado com sucesso!",
        details: errorDetails.length > 0 ? errorDetails : undefined,
      });
      setShowFeedbackModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formState.success, formState.message, formState.credentials]);

  const adminActions = [
    {
      id: "new-student",
      title: "Cadastrar Novo Aluno",
      description: "Adicionar um novo aluno com dados completos",
      icon: UserPlus,
      color: "from-green-600 to-emerald-500",
      action: () => setShowForm(true),
    },
    {
      id: "manage-students",
      title: "Gerenciar Alunos",
      description: "Editar, ativar/desativar alunos existentes",
      icon: Users,
      color: "from-blue-600 to-cyan-500",
      action: () => setShowManageStudents(true),
    },
    {
      id: "reports",
      title: "Relatórios",
      description: "Gerar relatórios de alunos e pagamentos",
      icon: FileText,
      color: "from-purple-600 to-violet-500",
      action: () => setShowReports(true),
    },
    {
      id: "settings",
      title: "Configurações do Estúdio",
      description: "Configurar horários, valores e políticas",
      icon: Settings,
      color: "from-amber-600 to-yellow-500",
      action: () => setShowSettings(true),
    },
  ];

  if (showManageStudents) {
    return <ManageStudentsView onBack={() => setShowManageStudents(false)} />;
  }

  if (showReports) {
    return <ReportsView onBack={() => setShowReports(false)} />;
  }

  if (showSettings) {
    return <AcademySettingsView onBack={() => setShowSettings(false)} />;
  }

  if (showForm) {
    return (
      <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Cadastrar Novo Aluno
          </h2>
          <Button
            variant="outline"
            onClick={() => setShowForm(false)}
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
             Voltar
          </Button>
        </div>

        <Card className="border-[#C2A537]/50 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <UserPlus className="h-6 w-6" />
              Formulário de Cadastro
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2A537]">
                    <Users className="h-4 w-4 text-black" />
                  </div>
                  Dados Pessoais
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="font-semibold text-[#C2A537]"
                    >
                      Nome Completo *
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="Nome completo do aluno"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="font-semibold text-[#C2A537]"
                    >
                      Email *
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="cpf"
                      className="font-semibold text-[#C2A537]"
                    >
                      CPF *
                    </Label>
                    <Input
                      id="cpf"
                      name="cpf"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="000.000.000-00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="sex"
                      className="font-semibold text-[#C2A537]"
                    >
                      Sexo *
                    </Label>
                    <select
                      id="sex"
                      name="sex"
                      required
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      onChange={(e) => {
                        setSelectedGender(e.target.value);
                      }}
                    >
                      <option value="">Selecione</option>
                      <option value="masculino">Masculino</option>
                      <option value="feminino">Feminino</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="telephone"
                      className="font-semibold text-[#C2A537]"
                    >
                      Telefone *
                    </Label>
                    <Input
                      id="telephone"
                      name="telephone"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bornDate"
                      className="font-semibold text-[#C2A537]"
                    >
                      Data de Nascimento *
                    </Label>
                    <div className="relative">
                      <Input
                        id="bornDate"
                        name="bornDate"
                        type="date"
                        required
                        className="border-slate-600 bg-slate-800 text-white"
                        onChange={(e) => calculateAge(e.target.value)}
                      />
                      <CalendarIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
                    {calculatedAge !== null && (
                      <p className="mt-1 text-sm text-slate-400">
                        Idade: {calculatedAge} anos
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="font-semibold text-[#C2A537]"
                  >
                    Endereço Completo *
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    required
                    className="border-slate-600 bg-slate-800 text-white"
                    placeholder="Rua, número, bairro, cidade, CEP"
                  />
                </div>
              </div>

              {/* Dados Financeiros */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2A537]">
                    <DollarSign className="h-4 w-4 text-black" />
                  </div>
                  Dados Financeiros
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="monthlyFee"
                      className="font-semibold text-[#C2A537]"
                    >
                      Mensalidade *
                    </Label>
                    <Input
                      id="monthlyFee"
                      name="monthlyFee"
                      type="text"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="R$ 150,00"
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value) {
                          const numValue = parseFloat(value) / 100;
                          e.target.value = numValue.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="paymentMethod"
                      className="font-semibold text-[#C2A537]"
                    >
                      Método de Pagamento *
                    </Label>
                    <select
                      id="paymentMethod"
                      name="paymentMethod"
                      required
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                    >
                      <option value="">Selecione</option>
                      <option value="PIX">PIX</option>
                      <option value="DINHEIRO">Dinheiro</option>
                      <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                      <option value="CARTAO_DEBITO">Cartão de Débito</option>
                      <option value="TRANSFERENCIA">Transferência</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="dueDate"
                      className="font-semibold text-[#C2A537]"
                    >
                      Dia de Vencimento *
                    </Label>
                    <select
                      id="dueDate"
                      name="dueDate"
                      required
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                    >
                      <option value="">Selecione</option>
                      <option value="5">Dia 05</option>
                      <option value="10">Dia 10</option>
                      <option value="15">Dia 15</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados Físicos */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2A537]">
                    <svg
                      className="h-4 w-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 7h16M4 12h16m-7 5h7"
                      />
                    </svg>
                  </div>
                  Dados Físicos
                </h3>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="heightCm"
                        className="font-semibold text-[#C2A537]"
                      >
                        Altura (cm)
                      </Label>
                      <Input
                        id="heightCm"
                        name="heightCm"
                        type="number"
                        className="border-slate-600 bg-slate-800 text-white"
                        placeholder="175"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="weightKg"
                        className="font-semibold text-[#C2A537]"
                      >
                        Peso (kg)
                      </Label>
                      <Input
                        id="weightKg"
                        name="weightKg"
                        type="number"
                        step="0.1"
                        className="border-slate-600 bg-slate-800 text-white"
                        placeholder="70.5"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 font-semibold text-[#C2A537]">
                      Medidas de Dobras Cutâneas (mm)
                    </h4>
                    <div className="grid gap-4 md:grid-cols-3">
                      {selectedGender === "masculino" ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="chestFold">Peitoral</Label>
                            <Input
                              id="chestFold"
                              name="chestFold"
                              type="number"
                              step="0.1"
                              className="border-slate-600 bg-slate-800 text-white"
                              onChange={(e) => {
                                const chest = parseFloat(e.target.value);
                                const abdominal = parseFloat(
                                  (
                                    document.getElementById(
                                      "abdominalFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                const thigh = parseFloat(
                                  (
                                    document.getElementById(
                                      "thighFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                if (
                                  chest &&
                                  abdominal &&
                                  thigh &&
                                  calculatedAge
                                ) {
                                  calculateBodyFat(
                                    selectedGender,
                                    calculatedAge,
                                    chest,
                                    abdominal,
                                    thigh,
                                  );
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="abdominalFold">Abdominal</Label>
                            <Input
                              id="abdominalFold"
                              name="abdominalFold"
                              type="number"
                              step="0.1"
                              className="border-slate-600 bg-slate-800 text-white"
                              onChange={(e) => {
                                const abdominal = parseFloat(e.target.value);
                                const chest = parseFloat(
                                  (
                                    document.getElementById(
                                      "chestFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                const thigh = parseFloat(
                                  (
                                    document.getElementById(
                                      "thighFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                if (
                                  chest &&
                                  abdominal &&
                                  thigh &&
                                  calculatedAge
                                ) {
                                  calculateBodyFat(
                                    selectedGender,
                                    calculatedAge,
                                    chest,
                                    abdominal,
                                    thigh,
                                  );
                                }
                              }}
                            />
                          </div>
                        </>
                      ) : selectedGender === "feminino" ? (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="tricepsFold">Tríceps</Label>
                            <Input
                              id="tricepsFold"
                              name="tricepsFold"
                              type="number"
                              step="0.1"
                              className="border-slate-600 bg-slate-800 text-white"
                              onChange={(e) => {
                                const triceps = parseFloat(e.target.value);
                                const suprailiac = parseFloat(
                                  (
                                    document.getElementById(
                                      "suprailiacFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                const thigh = parseFloat(
                                  (
                                    document.getElementById(
                                      "thighFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                if (
                                  triceps &&
                                  suprailiac &&
                                  thigh &&
                                  calculatedAge
                                ) {
                                  calculateBodyFat(
                                    selectedGender,
                                    calculatedAge,
                                    triceps,
                                    suprailiac,
                                    thigh,
                                  );
                                }
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="suprailiacFold">Suprailíaca</Label>
                            <Input
                              id="suprailiacFold"
                              name="suprailiacFold"
                              type="number"
                              step="0.1"
                              className="border-slate-600 bg-slate-800 text-white"
                              onChange={(e) => {
                                const suprailiac = parseFloat(e.target.value);
                                const triceps = parseFloat(
                                  (
                                    document.getElementById(
                                      "tricepsFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                const thigh = parseFloat(
                                  (
                                    document.getElementById(
                                      "thighFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                if (
                                  triceps &&
                                  suprailiac &&
                                  thigh &&
                                  calculatedAge
                                ) {
                                  calculateBodyFat(
                                    selectedGender,
                                    calculatedAge,
                                    triceps,
                                    suprailiac,
                                    thigh,
                                  );
                                }
                              }}
                            />
                          </div>
                        </>
                      ) : null}
                      {selectedGender && (
                        <div className="space-y-2">
                          <Label htmlFor="thighFold">Coxa</Label>
                          <Input
                            id="thighFold"
                            name="thighFold"
                            type="number"
                            step="0.1"
                            className="border-slate-600 bg-slate-800 text-white"
                            onChange={(e) => {
                              const thigh = parseFloat(e.target.value);
                              if (selectedGender === "masculino") {
                                const chest = parseFloat(
                                  (
                                    document.getElementById(
                                      "chestFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                const abdominal = parseFloat(
                                  (
                                    document.getElementById(
                                      "abdominalFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                if (
                                  chest &&
                                  abdominal &&
                                  thigh &&
                                  calculatedAge
                                ) {
                                  calculateBodyFat(
                                    selectedGender,
                                    calculatedAge,
                                    chest,
                                    abdominal,
                                    thigh,
                                  );
                                }
                              } else {
                                const triceps = parseFloat(
                                  (
                                    document.getElementById(
                                      "tricepsFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                const suprailiac = parseFloat(
                                  (
                                    document.getElementById(
                                      "suprailiacFold",
                                    ) as HTMLInputElement
                                  )?.value || "0",
                                );
                                if (
                                  triceps &&
                                  suprailiac &&
                                  thigh &&
                                  calculatedAge
                                ) {
                                  calculateBodyFat(
                                    selectedGender,
                                    calculatedAge,
                                    triceps,
                                    suprailiac,
                                    thigh,
                                  );
                                }
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {bodyFatPercentage !== null && (
                      <div className="mt-4 rounded-md border border-[#C2A537] bg-[#C2A537]/10 p-3">
                        <p className="text-lg font-semibold text-[#C2A537]">
                          Percentual de Gordura: {bodyFatPercentage}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Histórico de Saúde */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2A537]">
                    <svg
                      className="h-4 w-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Histórico de Saúde
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="historyDiseases"
                      className="font-semibold text-[#C2A537]"
                    >
                      Histórico de Doenças
                    </Label>
                    <textarea
                      id="historyDiseases"
                      name="historyDiseases"
                      rows={3}
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      placeholder="Descreva doenças anteriores ou atuais"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="medications"
                      className="font-semibold text-[#C2A537]"
                    >
                      Medicamentos
                    </Label>
                    <textarea
                      id="medications"
                      name="medications"
                      rows={3}
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      placeholder="Liste medicamentos em uso"
                    />
                  </div>
                  <div>
                    <Label htmlFor="allergies">Alergias</Label>
                    <textarea
                      id="allergies"
                      name="allergies"
                      rows={3}
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      placeholder="Descreva alergias conhecidas"
                    />
                  </div>
                  <div>
                    <Label htmlFor="injuries">Lesões</Label>
                    <textarea
                      id="injuries"
                      name="injuries"
                      rows={3}
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      placeholder="Descreva lesões anteriores ou atuais"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="bloodType"
                      className="font-semibold text-[#C2A537]"
                    >
                      Tipo Sanguíneo
                    </Label>
                    <select
                      id="bloodType"
                      name="bloodType"
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
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
                  </div>
                </div>
              </div>

              {/* Histórico Esportivo */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2A537]">
                    <svg
                      className="h-4 w-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  Histórico Esportivo
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Praticou alguma atividade física?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasPracticedSports"
                          value="true"
                          className="mr-2"
                          onChange={(e) => {
                            const practicesSports = document.getElementById(
                              "hasPracticedSportsInput",
                            );
                            if (practicesSports) {
                              practicesSports.style.display =
                                e.target.value === "true" ? "block" : "none";
                            }
                          }}
                        />
                        <span className="text-white">Sim</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasPracticedSports"
                          value="false"
                          className="mr-2"
                          onChange={(e) => {
                            const practicesSports = document.getElementById(
                              "hasPracticedSportsInput",
                            );
                            if (practicesSports) {
                              practicesSports.style.display =
                                e.target.value === "true" ? "block" : "none";
                            }
                          }}
                        />
                        <span className="text-white">Não</span>
                      </label>
                    </div>
                  </div>
                  <div id="hasPracticedSportsInput" style={{ display: "none" }}>
                    <Label htmlFor="lastExercise">Descreva</Label>
                    <Input
                      id="lastExercise"
                      name="lastExercise"
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="Ex: Caminhada há 2 meses"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="sportsHistory">Histórico Esportivo</Label>
                  <textarea
                    id="sportsHistory"
                    name="sportsHistory"
                    rows={3}
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                    placeholder="Descreva esportes praticados anteriormente"
                  />
                </div>
              </div>

              {/* Hábitos e Rotina */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#C2A537]">
                    <svg
                      className="h-4 w-4 text-black"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  Hábitos e Rotina
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="alimentalRoutine">Rotina Alimentar</Label>
                    <textarea
                      id="alimentalRoutine"
                      name="alimentalRoutine"
                      rows={3}
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      placeholder="Descreva os hábitos alimentares"
                    />
                  </div>
                  <div>
                    <Label htmlFor="diaryRoutine">Rotina Diária</Label>
                    <textarea
                      id="diaryRoutine"
                      name="diaryRoutine"
                      rows={3}
                      className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                      placeholder="Descreva a rotina diária"
                    />
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Usa suplementos?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="useSupplements"
                          value="true"
                          className="mr-2"
                          onChange={(e) => {
                            const supplementsInput =
                              document.getElementById("supplementsInput");
                            if (supplementsInput) {
                              supplementsInput.style.display =
                                e.target.value === "true" ? "block" : "none";
                            }
                          }}
                        />
                        <span className="text-white">Sim</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="useSupplements"
                          value="false"
                          className="mr-2"
                          onChange={(e) => {
                            const supplementsInput =
                              document.getElementById("supplementsInput");
                            if (supplementsInput) {
                              supplementsInput.style.display =
                                e.target.value === "true" ? "block" : "none";
                            }
                          }}
                        />
                        <span className="text-white">Não</span>
                      </label>
                    </div>
                  </div>
                  <div id="supplementsInput" style={{ display: "none" }}>
                    <Label htmlFor="whatSupplements">Quais Suplementos?</Label>
                    <Input
                      id="whatSupplements"
                      name="whatSupplements"
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="Liste os suplementos utilizados"
                    />
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Observações
                </h3>
                <div>
                  <Label htmlFor="otherNotes">Outras Observações</Label>
                  <textarea
                    id="otherNotes"
                    name="otherNotes"
                    rows={4}
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                    placeholder="Qualquer informação adicional relevante"
                  />
                </div>
              </div>

              {/* Histórico de Medições */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Histórico de Medições
                </h3>
                <BodyMeasurementsHistoryView userId={""} />
              </div>

              {/* Botão de Submit */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-800"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-[#C2A537] text-black hover:bg-[#C2A537]/90 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                      Cadastrando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Cadastrar Aluno
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Grid de Ações */}
      <div className="grid gap-6 md:grid-cols-2">
        {adminActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Card
              key={action.id}
              className="group animate-in fade-in-50 slide-in-from-bottom-4 relative cursor-pointer overflow-hidden border-slate-700 bg-slate-800/50 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[#C2A537]/50"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={action.action}
            >
              {/* Gradient Background */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${action.color} opacity-0 transition-opacity duration-300 group-hover:opacity-10`}
              />

              <CardContent className="relative p-6">
                <div className="flex items-start space-x-4">
                  <div
                    className={`rounded-lg bg-linear-to-br p-3 ${action.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-[#C2A537]">
                      {action.title}
                    </h3>
                    <p className="text-slate-400 transition-colors group-hover:text-slate-300">
                      {action.description}
                    </p>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute top-6 right-6 translate-x-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C2A537]">
                    <span className="font-bold text-black">→</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cards Informativos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-blue-500/50 bg-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total de Alunos</p>
                {loadingStats ? (
                  <div className="h-7 w-12 animate-pulse rounded bg-slate-700" />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {stats?.totalStudents || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-green-500/50 bg-green-900/20 transition-all hover:bg-green-900/40"
          onClick={async () => {
            try {
              setIsLoadingStudents(true);
              const data = await getStudentsPaymentsAction();
              setStudentsData(data.filter((student) => student.isUpToDate));
              setShowUpToDateModal(true);
            } catch (error) {
              console.error("Erro ao carregar dados dos alunos:", error);
            } finally {
              setIsLoadingStudents(false);
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <span className="font-bold text-white">✓</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Pagamentos em Dia</p>
                {loadingStats || isLoadingStudents ? (
                  <div className="h-7 w-12 animate-pulse rounded bg-slate-700" />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {stats?.paymentsUpToDate || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer border-amber-500/50 bg-amber-900/20 transition-all hover:bg-amber-900/40"
          onClick={async () => {
            try {
              setIsLoadingStudents(true);
              const data = await getStudentsPaymentsAction();
              setStudentsData(data.filter((student) => !student.isUpToDate));
              setShowOverdueModal(true);
            } catch (error) {
              console.error("Erro ao carregar dados dos alunos:", error);
            } finally {
              setIsLoadingStudents(false);
            }
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
                <span className="font-bold text-white">!</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Pendências</p>
                {loadingStats || isLoadingStudents ? (
                  <div className="h-7 w-12 animate-pulse rounded bg-slate-700" />
                ) : (
                  <p className="text-xl font-bold text-white">
                    {stats?.pendingPayments || 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Adicionais de Estatísticas */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-500/50 bg-purple-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Receita Mensal</p>
                  {loadingStats ? (
                    <div className="h-7 w-24 animate-pulse rounded bg-slate-700" />
                  ) : (
                    <p className="text-xl font-bold text-white">
                      {formatCurrency(stats?.totalMonthlyRevenue || 0)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/50 bg-cyan-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-cyan-500">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Novos este Mês</p>
                  {loadingStats ? (
                    <div className="h-7 w-12 animate-pulse rounded bg-slate-700" />
                  ) : (
                    <p className="text-xl font-bold text-white">
                      {stats?.newStudentsThisMonth || 0}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <PaymentStatusModal
        isOpen={showUpToDateModal}
        onClose={() => setShowUpToDateModal(false)}
        title="Pagamentos em Dia"
        students={studentsData}
        type="paid"
        onUpdatePayment={async (userId, paid) => {
          try {
            await updatePaymentAction(userId, paid);
            const data = await getStudentsPaymentsAction();
            setStudentsData(data.filter((student) => student.isUpToDate));
            const result = await getDashboardStatsAction();
            if (result.success && result.stats) {
              setStats(result.stats);
            }
          } finally {
            // Payment updated
          }
        }}
      />

      <PaymentStatusModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        title="Pendências"
        students={studentsData}
        type="pending"
        onUpdatePayment={async (userId, paid) => {
          try {
            await updatePaymentAction(userId, paid);
            const data = await getStudentsPaymentsAction();
            setStudentsData(data.filter((student) => !student.isUpToDate));
            const result = await getDashboardStatsAction();
            if (result.success && result.stats) {
              setStats(result.stats);
            }
          } finally {
            // Payment updated
          }
        }}
      />

      {/* Modal de feedback (sucesso/erro) */}
      <FormFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => {
          setShowFeedbackModal(false);
          // Após fechar o modal de feedback, mostrar o modal de credenciais se houver
          if (
            formState.success &&
            formState.credentials &&
            !showCredentialsModal
          ) {
            setTimeout(() => {
              setShowCredentialsModal(true);
            }, 300);
          }
        }}
        type={feedbackModalConfig.type}
        title={feedbackModalConfig.title}
        message={feedbackModalConfig.message}
        details={feedbackModalConfig.details}
      />

      {/* Modal de credenciais do novo aluno */}
      <StudentCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => {
          setShowCredentialsModal(false);
          setShowForm(false); // Fechar o formulário também
        }}
        credentials={formState.credentials || null}
      />
    </div>
  );
}


