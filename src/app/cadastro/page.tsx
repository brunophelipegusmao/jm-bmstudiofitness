"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";

import {
  createAlunoAction,
  FormState,
} from "@/actions/user/create-aluno-action";
import { Button } from "@/components/Button";
import { Container } from "@/components/Container";
import { FieldError } from "@/components/FieldError";
import { InputText } from "@/components/InputText";
import { InputTextarea } from "@/components/InputTextarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: FormState = {
  success: false,
  message: "",
};

export default function CadastroAluno() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createAlunoAction,
    initialState,
  );
  const [hasPracticedSports, setHasPracticedSports] = useState(false);
  const [useSupplements, setUseSupplements] = useState(false);

  // Redirecionar após sucesso
  useEffect(() => {
    if (state.success) {
      setTimeout(() => {
        router.push("/admin"); // ou para onde você quiser redirecionar
      }, 2000);
    }
  }, [state.success, router]);

  const getFieldError = (fieldName: string): string | undefined => {
    return state.errors?.[fieldName]?.[0];
  };

  return (
    <Container>
      <div className="min-h-screen bg-linear-to-br from-black/95 to-gray-900 py-8">
        <div className="mx-auto max-w-4xl">
          <Card className="border-[#C2A537] bg-black/95 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-[#C2A537]">
                Cadastro de Aluno
              </CardTitle>
              <CardDescription className="text-slate-300">
                Preencha todos os dados para realizar o cadastro no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {state.message && (
                <div
                  className={`mb-6 rounded-md p-4 text-center ${
                    state.success
                      ? "border border-green-600 bg-green-900/50 text-green-300"
                      : "border border-red-600 bg-red-900/50 text-red-300"
                  }`}
                >
                  {state.message}
                </div>
              )}

              <form action={formAction} className="space-y-6">
                {/* Dados Básicos */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#C2A537]/30 pb-2 text-lg font-semibold text-[#C2A537]">
                    Dados Básicos
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[#C2A537]">
                        Nome Completo *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Digite seu nome completo"
                        required
                        className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                      />
                      {getFieldError("name") && (
                        <FieldError>{getFieldError("name")}</FieldError>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cpf" className="text-[#C2A537]">
                        CPF *
                      </Label>
                      <Input
                        id="cpf"
                        name="cpf"
                        placeholder="12345678901"
                        maxLength={11}
                        required
                        className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                      />
                      {getFieldError("cpf") && (
                        <FieldError>{getFieldError("cpf")}</FieldError>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="bornDate" className="text-[#C2A537]">
                        Data de Nascimento *
                      </Label>
                      <Input
                        id="bornDate"
                        name="bornDate"
                        type="date"
                        required
                        className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                      />
                      {getFieldError("bornDate") && (
                        <FieldError>{getFieldError("bornDate")}</FieldError>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telephone" className="text-[#C2A537]">
                        Telefone *
                      </Label>
                      <Input
                        id="telephone"
                        name="telephone"
                        placeholder="(11) 99999-9999"
                        required
                        className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                      />
                      {getFieldError("telephone") && (
                        <FieldError>{getFieldError("telephone")}</FieldError>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[#C2A537]">
                      Endereço Completo *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Rua, número, bairro, cidade - CEP"
                      required
                      className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                    />
                    {getFieldError("address") && (
                      <FieldError>{getFieldError("address")}</FieldError>
                    )}
                  </div>
                </div>

                {/* Dados Físicos */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#C2A537]/30 pb-2 text-lg font-semibold text-[#C2A537]">
                    Dados Físicos
                  </h3>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="heightCm" className="text-[#C2A537]">
                        Altura (cm) *
                      </Label>
                      <Input
                        id="heightCm"
                        name="heightCm"
                        type="number"
                        placeholder="170"
                        min="100"
                        max="250"
                        required
                        className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                      />
                      {getFieldError("heightCm") && (
                        <FieldError>{getFieldError("heightCm")}</FieldError>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="weightKg" className="text-[#C2A537]">
                        Peso (kg) *
                      </Label>
                      <Input
                        id="weightKg"
                        name="weightKg"
                        type="number"
                        step="0.1"
                        placeholder="70.5"
                        min="30"
                        max="300"
                        required
                        className="border-[#867536] bg-[#d7ceac] text-black focus:border-[#C2A537]"
                      />
                      {getFieldError("weightKg") && (
                        <FieldError>{getFieldError("weightKg")}</FieldError>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bloodType" className="text-[#C2A537]">
                        Tipo Sanguíneo *
                      </Label>
                      <select
                        id="bloodType"
                        name="bloodType"
                        required
                        className="w-full rounded-md border border-[#867536] bg-[#d7ceac] px-3 py-2 text-black focus:border-[#C2A537] focus:outline-none"
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
                      {getFieldError("bloodType") && (
                        <FieldError>{getFieldError("bloodType")}</FieldError>
                      )}
                    </div>
                  </div>
                </div>

                {/* Histórico de Atividades */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#C2A537]/30 pb-2 text-lg font-semibold text-[#C2A537]">
                    Histórico de Atividades
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="hasPracticedSports"
                        name="hasPracticedSports"
                        checked={hasPracticedSports}
                        onCheckedChange={(checked) =>
                          setHasPracticedSports(checked as boolean)
                        }
                        className="border-[#867536]"
                      />
                      <Label
                        htmlFor="hasPracticedSports"
                        className="text-[#C2A537]"
                      >
                        Já praticou esportes anteriormente
                      </Label>
                      <input
                        type="hidden"
                        name="hasPracticedSports"
                        value={hasPracticedSports.toString()}
                      />
                    </div>

                    <InputText
                      name="lastExercise"
                      labelText="Último Exercício Realizado *"
                      placeholder="Descreva o último exercício que você fez"
                      required
                    />
                    {getFieldError("lastExercise") && (
                      <FieldError>{getFieldError("lastExercise")}</FieldError>
                    )}

                    <InputTextarea
                      name="sportsHistory"
                      labelText="Histórico Esportivo"
                      placeholder="Descreva seu histórico com esportes e atividades físicas"
                    />
                    {getFieldError("sportsHistory") && (
                      <FieldError>{getFieldError("sportsHistory")}</FieldError>
                    )}
                  </div>
                </div>

                {/* Informações de Saúde */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#C2A537]/30 pb-2 text-lg font-semibold text-[#C2A537]">
                    Informações de Saúde
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputTextarea
                      name="historyDiseases"
                      labelText="Histórico de Doenças"
                      placeholder="Informe doenças anteriores ou atuais"
                    />

                    <InputTextarea
                      name="medications"
                      labelText="Medicamentos em Uso"
                      placeholder="Liste medicamentos que usa regularmente"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <InputTextarea
                      name="allergies"
                      labelText="Alergias"
                      placeholder="Informe alergias conhecidas"
                    />

                    <InputTextarea
                      name="injuries"
                      labelText="Lesões"
                      placeholder="Descreva lesões anteriores ou atuais"
                    />
                  </div>
                </div>

                {/* Rotina e Hábitos */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#C2A537]/30 pb-2 text-lg font-semibold text-[#C2A537]">
                    Rotina e Hábitos
                  </h3>

                  <InputTextarea
                    name="alimentalRoutine"
                    labelText="Rotina Alimentar *"
                    placeholder="Descreva seus hábitos alimentares atuais"
                    required
                  />
                  {getFieldError("alimentalRoutine") && (
                    <FieldError>{getFieldError("alimentalRoutine")}</FieldError>
                  )}

                  <InputTextarea
                    name="diaryRoutine"
                    labelText="Rotina Diária *"
                    placeholder="Descreva sua rotina de trabalho/estudos e atividades"
                    required
                  />
                  {getFieldError("diaryRoutine") && (
                    <FieldError>{getFieldError("diaryRoutine")}</FieldError>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useSupplements"
                        name="useSupplements"
                        checked={useSupplements}
                        onCheckedChange={(checked) =>
                          setUseSupplements(checked as boolean)
                        }
                        className="border-[#867536]"
                      />
                      <Label
                        htmlFor="useSupplements"
                        className="text-[#C2A537]"
                      >
                        Usa suplementos alimentares
                      </Label>
                      <input
                        type="hidden"
                        name="useSupplements"
                        value={useSupplements.toString()}
                      />
                    </div>

                    {useSupplements && (
                      <InputTextarea
                        name="whatSupplements"
                        labelText="Quais Suplementos?"
                        placeholder="Liste os suplementos que você usa"
                      />
                    )}
                  </div>
                </div>

                {/* Observações Gerais */}
                <div className="space-y-4">
                  <h3 className="border-b border-[#C2A537]/30 pb-2 text-lg font-semibold text-[#C2A537]">
                    Observações Gerais
                  </h3>

                  <InputTextarea
                    name="otherNotes"
                    labelText="Outras Informações"
                    placeholder="Adicione qualquer informação adicional que considere importante"
                  />
                </div>

                {/* Botão de Envio */}
                <div className="flex justify-center pt-6">
                  <Button
                    type="submit"
                    size="lg"
                    disabled={isPending}
                    className="min-w-[200px]"
                  >
                    {isPending ? "Cadastrando..." : "Cadastrar Aluno"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
