"use client";
import {
  CalendarIcon,
  FileText,
  Save,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";
import { useActionState, useState } from "react";

import {
  createAlunoAction,
  FormState,
} from "@/actions/user/create-aluno-action";
import { ManageStudentsView } from "@/components/Dashboard/ManageStudentsView";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeadfaça oer, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdministrativeTab() {
  const [showForm, setShowForm] = useState(false);
  const [showManageStudents, setShowManageStudents] = useState(false);
  const [formState, formAction, isPending] = useActionState<
    FormState,
    FormData
  >(createAlunoAction, { success: false, message: "" });

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
      action: () => alert("🚧 Funcionalidade em desenvolvimento"),
    },
    {
      id: "settings",
      title: "Configurações da Academia",
      description: "Configurar horários, valores e políticas",
      icon: Settings,
      color: "from-amber-600 to-yellow-500",
      action: () => alert("🚧 Funcionalidade em desenvolvimento"),
    },
  ];

  if (showManageStudents) {
    return (
      <ManageStudentsView onBack={() => setShowManageStudents(false)} />
    );
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
            ← Voltar
          </Button>
        </div>

        <Card className="border-[#C2A537]/50 bg-black/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#C2A537]">
              <UserPlus className="h-6 w-6" />
              Formulário de Cadastro
            </CardTitle>
            {formState.success && (
              <div className="animate-in fade-in rounded-lg border border-green-500/50 bg-green-900/50 p-4 duration-300">
                <p className="font-medium text-green-400">
                  ✅ {formState.message}
                </p>
              </div>
            )}
            {!formState.success && formState.message && (
              <div className="animate-in fade-in rounded-lg border border-red-500/50 bg-red-900/50 p-4 duration-300">
                <p className="font-medium text-red-400">
                  ❌ {formState.message}
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-6">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Dados Pessoais
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
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
                      />
                      <CalendarIcon className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    </div>
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
                <h3 className="text-lg font-semibold text-white">
                  Dados Financeiros
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label
                      htmlFor="monthlyFee"
                      className="font-semibold text-[#C2A537]"
                    >
                      Mensalidade (R$) *
                    </Label>
                    <Input
                      id="monthlyFee"
                      name="monthlyFee"
                      type="number"
                      step="0.01"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="99.99"
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
                    <Input
                      id="dueDate"
                      name="dueDate"
                      type="number"
                      min="1"
                      max="31"
                      required
                      className="border-slate-600 bg-slate-800 text-white"
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              {/* Dados Físicos */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Dados Físicos
                </h3>
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
              </div>

              {/* Histórico de Saúde */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
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
                </div>
              </div>

              {/* Histórico Esportivo */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">
                  Histórico Esportivo
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Praticou esportes antes?</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasPracticedSports"
                          value="true"
                          className="mr-2"
                        />
                        <span className="text-white">Sim</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="hasPracticedSports"
                          value="false"
                          className="mr-2"
                        />
                        <span className="text-white">Não</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="lastExercise">Último Exercício</Label>
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
                <h3 className="text-lg font-semibold text-white">
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
                        />
                        <span className="text-white">Sim</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="useSupplements"
                          value="false"
                          className="mr-2"
                        />
                        <span className="text-white">Não</span>
                      </label>
                    </div>
                  </div>
                  <div>
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
      {/* Cabeçalho */}
      <div className="text-center">
        <h2 className="mb-2 text-3xl font-bold text-[#C2A537]">
          Painel Administrativo
        </h2>
        <p className="text-slate-400">
          Gerencie alunos, relatórios e configurações da academia
        </p>
      </div>

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
                <p className="text-xl font-bold text-white">--</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/50 bg-green-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <span className="font-bold text-white">✓</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Pagamentos em Dia</p>
                <p className="text-xl font-bold text-white">--</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/50 bg-amber-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500">
                <span className="font-bold text-white">⚠</span>
              </div>
              <div>
                <p className="text-sm text-slate-400">Pendências</p>
                <p className="text-xl font-bold text-white">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
