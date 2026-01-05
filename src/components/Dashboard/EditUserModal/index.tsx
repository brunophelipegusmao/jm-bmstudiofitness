"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { getUserDataAction } from "@/actions/admin/get-user-data-action";
import { updateUserAction } from "@/actions/admin/update-user-action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EditUserModalProps {
  userId: string;
  userName: string;
  userRole: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  adminId: string;
}

// Schema base para todos os usuários
const baseSchemaFields = {
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  email: z.string().email("Email inválido"),
  telephone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  cpf: z.string().optional(),
  bornDate: z.string().optional(),
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
};

const baseSchema = z
  .object(baseSchemaFields)
  .refine(
    (data) => {
      // Se a senha foi preenchida, validar requisitos
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Senha deve ter no mínimo 6 caracteres",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      // Se a senha foi preenchida, confirmar senha deve ser igual
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    },
  );

// Schema para funcionários e professores
const employeeSchema = z
  .object({
    ...baseSchemaFields,
    position: z.string().min(2, "Cargo é obrigatório"),
    shift: z.enum(["manha", "tarde", "noite", "integral"]),
    shiftStartTime: z.string().optional(),
    shiftEndTime: z.string().optional(),
    salaryInCents: z.number().min(0, "Salário deve ser maior que zero"),
    salaryChangeReason: z.string().optional(),
    salaryEffectiveDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Senha deve ter no mínimo 6 caracteres",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    },
  );

// Schema para alunos
const studentSchema = z
  .object({
    ...baseSchemaFields,
    monthlyFeeValueInCents: z.number().min(0, "Mensalidade inválida"),
    paymentMethod: z.enum([
      "pix",
      "cartao-credito",
      "cartao-debito",
      "dinheiro",
      "boleto",
    ]),
    dueDate: z.number().min(1).max(31, "Dia de vencimento inválido"),
  })
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password.length >= 6;
      }
      return true;
    },
    {
      message: "Senha deve ter no mínimo 6 caracteres",
      path: ["password"],
    },
  )
  .refine(
    (data) => {
      if (data.password && data.password.length > 0) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "As senhas não coincidem",
      path: ["confirmPassword"],
    },
  );

type FormData = z.infer<typeof baseSchema> &
  Partial<z.infer<typeof employeeSchema>> &
  Partial<z.infer<typeof studentSchema>>;

type UserData = {
  name?: string;
  email?: string;
  telephone?: string;
  address?: string;
  cpf?: string;
  bornDate?: string;
  position?: string;
  shift?: string;
  shiftStartTime?: string;
  shiftEndTime?: string;
  salaryInCents?: number;
  monthlyFeeValueInCents?: number;
  paymentMethod?: string;
  dueDate?: number;
};

type GetUserDataResult = {
  success?: boolean;
  data?: UserData | null;
  error?: string;
} | null;

export function EditUserModal({
  userId,
  userName,
  userRole,
  isOpen,
  onClose,
  onSuccess,
  adminId,
}: EditUserModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const isEmployee = userRole === "funcionario" || userRole === "professor";
  const isStudent = userRole === "aluno";

  const schema = isEmployee
    ? employeeSchema
    : isStudent
      ? studentSchema
      : baseSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const shift = watch("shift");

  useEffect(() => {
    console.log("Debug EditUserModal useEffect:", {
      isOpen,
      userId,
      userName,
      userRole,
      adminId,
    });
    if (isOpen) {
      setIsFetching(true);
      console.log("Debug Buscando dados do usuário:", userId);
      getUserDataAction(userId).then((result: GetUserDataResult) => {
        console.log("Debug Resultado getUserDataAction:", result);
        if (result && result.success && result.data) {
          const data = result.data;

          // Dados básicos
          setValue("name", data.name ?? "");
          setValue("email", data.email ?? "");
          setValue("telephone", data.telephone ?? "");
          setValue("address", data.address ?? "");
          if (data.cpf) setValue("cpf", data.cpf);
          if (data.bornDate) setValue("bornDate", data.bornDate);

          // Dados de funcionário/professor
          if (isEmployee) {
            if (data.position) setValue("position", data.position);
            if (data.shift)
              setValue(
                "shift",
                data.shift as "manha" | "tarde" | "noite" | "integral",
              );
            if (data.shiftStartTime)
              setValue("shiftStartTime", data.shiftStartTime);
            if (data.shiftEndTime) setValue("shiftEndTime", data.shiftEndTime);
            if (data.salaryInCents !== undefined)
              setValue("salaryInCents", data.salaryInCents);
          }

          // Dados de aluno
          if (isStudent) {
            if (data.monthlyFeeValueInCents !== undefined) {
              setValue("monthlyFeeValueInCents", data.monthlyFeeValueInCents);
            }
            if (data.paymentMethod) {
              setValue(
                "paymentMethod",
                data.paymentMethod as
                  | "pix"
                  | "cartao-credito"
                  | "cartao-debito"
                  | "dinheiro"
                  | "boleto",
              );
            }
            if (data.dueDate !== undefined) setValue("dueDate", data.dueDate);
          }
        } else {
          toast.error(
            (result && result.error) || "Erro ao carregar dados do usuário",
          );
          onClose();
        }
        setIsFetching(false);
      });
    } else {
      reset();
    }
  }, [isOpen, userId, setValue, reset, onClose, isEmployee, isStudent, userName, userRole, adminId]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    // Remover confirmPassword e preparar dados
    const { password, ...restData } = data;

    // Só incluir password se foi preenchida
    const updateData: Partial<FormData> & { id: string } = {
      id: userId,
      ...restData,
    };

    if (password && password.trim().length > 0) {
      updateData.password = password;
    }

    const result = await updateUserAction(adminId, updateData);

    if (result.success) {
      toast.success("Usuário atualizado com sucesso!");
      onSuccess();
      onClose();
    } else {
      toast.error(result.error || "Erro ao atualizar usuário");
    }

    setIsLoading(false);
  };

  const handleSendResetEmail = async () => {
    const email = getValues("email");
    if (!email) {
      toast.error("Email não encontrado para este usuário.");
      return;
    }
    setIsSendingReset(true);
    try {
      const resp = await fetch("/api/user/request-reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await resp.json().catch(() => ({}));
      if (resp.ok && data?.success !== false) {
        toast.success("E-mail de redefinição enviado para " + email);
      } else {
        toast.error(data?.message || "Não foi possível enviar o e-mail.");
      }
    } catch (err) {
      console.error("Erro ao enviar e-mail de redefinição:", err);
      toast.error("Erro ao enviar e-mail de redefinição.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Editar{" "}
            {userRole === "aluno"
              ? "Aluno"
              : userRole === "professor"
                ? "Professor"
                : userRole === "funcionario"
                  ? "Funcionário"
                  : "Usuário"}
            : {userName}
          </DialogTitle>
        </DialogHeader>

        {isFetching ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Carregando dados...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="specific">
                  {isEmployee
                    ? "Dados Profissionais"
                    : isStudent
                      ? "Dados Financeiros"
                      : "Outros Dados"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input id="email" type="email" {...register("email")} />
                    {errors.email && (
                      <p className="text-sm text-red-500">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telephone">Telefone *</Label>
                    <Input id="telephone" {...register("telephone")} />
                    {errors.telephone && (
                      <p className="text-sm text-red-500">
                        {errors.telephone.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço *</Label>
                  <Input id="address" {...register("address")} />
                  {errors.address && (
                    <p className="text-sm text-red-500">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      {...register("cpf")}
                      placeholder="000.000.000-00"
                    />
                    {errors.cpf && (
                      <p className="text-sm text-red-500">
                        {errors.cpf.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bornDate">Data de Nascimento</Label>
                    <Input
                      id="bornDate"
                      type="date"
                      {...register("bornDate")}
                    />
                    {errors.bornDate && (
                      <p className="text-sm text-red-500">
                        {errors.bornDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      {...register("password")}
                      placeholder="Deixe em branco para não alterar"
                    />
                    {errors.password && (
                      <p className="text-sm text-red-500">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      {...register("confirmPassword")}
                      placeholder="Confirme a nova senha"
                    />
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="specific" className="mt-4 space-y-4">
                {isEmployee && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="position">Cargo *</Label>
                        <Input id="position" {...register("position")} />
                        {errors.position && (
                          <p className="text-sm text-red-500">
                            {errors.position.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shift">Turno *</Label>
                        <Select
                          onValueChange={(value) =>
                            setValue(
                              "shift",
                              value as "manha" | "tarde" | "noite" | "integral",
                            )
                          }
                          defaultValue={shift}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o turno" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manha">Manhã</SelectItem>
                            <SelectItem value="tarde">Tarde</SelectItem>
                            <SelectItem value="noite">Noite</SelectItem>
                            <SelectItem value="integral">Integral</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.shift && (
                          <p className="text-sm text-red-500">
                            {errors.shift.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="shiftStartTime">
                          Início do Expediente
                        </Label>
                        <Input
                          id="shiftStartTime"
                          type="time"
                          {...register("shiftStartTime")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="shiftEndTime">Fim do Expediente</Label>
                        <Input
                          id="shiftEndTime"
                          type="time"
                          {...register("shiftEndTime")}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salary">Salário (R$) *</Label>
                      <Input
                        id="salary"
                        type="number"
                        step="0.01"
                        {...register("salaryInCents", {
                          setValueAs: (value) =>
                            Math.round(parseFloat(value) * 100),
                        })}
                        onChange={(e) => {
                          const valueInReais = parseFloat(e.target.value) || 0;
                          setValue(
                            "salaryInCents",
                            Math.round(valueInReais * 100),
                          );
                        }}
                        defaultValue={(watch("salaryInCents") || 0) / 100}
                      />
                      {errors.salaryInCents && (
                        <p className="text-sm text-red-500">
                          {errors.salaryInCents.message}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="salaryChangeReason">
                          Motivo da Mudança Salarial
                        </Label>
                        <Input
                          id="salaryChangeReason"
                          {...register("salaryChangeReason")}
                          placeholder="Ex: Promoção, ajuste anual..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="salaryEffectiveDate">
                          Data Efetiva
                        </Label>
                        <Input
                          id="salaryEffectiveDate"
                          type="date"
                          {...register("salaryEffectiveDate")}
                        />
                      </div>
                    </div>
                  </>
                )}

                {isStudent && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="monthlyFee">Mensalidade (R$) *</Label>
                        <Input
                          id="monthlyFee"
                          type="number"
                          step="0.01"
                          {...register("monthlyFeeValueInCents", {
                            setValueAs: (value) =>
                              Math.round(parseFloat(value) * 100),
                          })}
                          onChange={(e) => {
                            const valueInReais =
                              parseFloat(e.target.value) || 0;
                            setValue(
                              "monthlyFeeValueInCents",
                              Math.round(valueInReais * 100),
                            );
                          }}
                          defaultValue={
                            (watch("monthlyFeeValueInCents") || 0) / 100
                          }
                        />
                        {errors.monthlyFeeValueInCents && (
                          <p className="text-sm text-red-500">
                            {errors.monthlyFeeValueInCents.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dueDate">Dia de Vencimento *</Label>
                        <Input
                          id="dueDate"
                          type="number"
                          min="1"
                          max="31"
                          {...register("dueDate", {
                            setValueAs: (value) => parseInt(value),
                          })}
                        />
                        {errors.dueDate && (
                          <p className="text-sm text-red-500">
                            {errors.dueDate.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">
                        Método de Pagamento *
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          setValue(
                            "paymentMethod",
                            value as
                              | "pix"
                              | "cartao-credito"
                              | "cartao-debito"
                              | "dinheiro"
                              | "boleto",
                          )
                        }
                        defaultValue={watch("paymentMethod")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o método" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="cartao-credito">
                            Cartão de Crédito
                          </SelectItem>
                          <SelectItem value="cartao-debito">
                            Cartão de Débito
                          </SelectItem>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.paymentMethod && (
                        <p className="text-sm text-red-500">
                          {errors.paymentMethod.message}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {!isEmployee && !isStudent && (
                  <div className="text-muted-foreground py-8 text-center">
                    Nenhum dado adicional disponível para este tipo de usuário.
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={handleSendResetEmail}
                disabled={isLoading || isSendingReset}
              >
                {isSendingReset ? "Enviando..." : "Enviar link de senha"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
