"use client";

/* eslint-disable simple-import-sort/imports */

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Printer,
  User,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { createEmployeeAction } from "@/actions/admin/create-employee-action";
import {
  reactivateEmployeeAction,
  softDeleteEmployeeAction,
} from "@/actions/admin/employee-soft-delete-action";
import {
  getEmployeeTimeRecordsAction,
  registerTimeRecordAction,
  type TimeRecord,
} from "@/actions/admin/employee-time-records-action";
import {
  type EmployeeFullData,
  getEmployeesAction,
} from "@/actions/admin/get-employees-action";
import { updateEmployeeAction } from "@/actions/admin/update-employee-action";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/payment-utils";

// Schema de validação
const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .min(11, "CPF inválido")
    .regex(/^\d{11}$/, "CPF deve conter apenas números"),
  email: z.string().email("E-mail inválido"),
  telephone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço muito curto"),
  bornDate: z.string().min(1, "Data de nascimento é obrigatória"),
  sex: z.enum(["masculino", "feminino"], {
    message: "Selecione o sexo",
  }),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  position: z.string().min(2, "Cargo é obrigatório"),
  shift: z.string().min(1, "Turno é obrigatório"),
  shiftStartTime: z.string().min(1, "Horário de início é obrigatório"),
  shiftEndTime: z.string().min(1, "Horário de fim é obrigatório"),
  salary: z.string().min(1, "Salário é obrigatório"),
  hireDate: z.string().min(1, "Data de contratação é obrigatória"),
});

const editEmployeeSchema = z.object({
  email: z.string().email("E-mail inválido"),
  telephone: z.string().min(10, "Telefone inválido"),
  address: z.string().min(5, "Endereço muito curto"),
  position: z.string().min(2, "Cargo é obrigatório"),
  shift: z.string().min(1, "Turno é obrigatório"),
  shiftStartTime: z.string().min(1, "Horário de início é obrigatório"),
  shiftEndTime: z.string().min(1, "Horário de fim é obrigatório"),
  salary: z.string().min(1, "Salário é obrigatório"),
  salaryChangeReason: z.string().optional(),
  salaryEffectiveDate: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;
type EditEmployeeFormData = z.infer<typeof editEmployeeSchema>;

export function EmployeeTab() {
  const [employees, setEmployees] = useState<EmployeeFullData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeFullData | null>(null);
  const [employeeToDelete, setEmployeeToDelete] =
    useState<EmployeeFullData | null>(null);
  const [employeeToReactivate, setEmployeeToReactivate] =
    useState<EmployeeFullData | null>(null);
  const [isTimeRecordsModalOpen, setIsTimeRecordsModalOpen] = useState(false);
  const [selectedEmployeeForTimeRecords, setSelectedEmployeeForTimeRecords] =
    useState<EmployeeFullData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const result = await getEmployeesAction();
      if (result.success && result.data) {
        setEmployees(result.data);
      } else {
        showErrorToast(result.error || "Erro ao carregar funcionários");
      }
    } catch (error) {
      console.error("Erro ao carregar funcionários:", error);
      showErrorToast("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      const result = await createEmployeeAction({
        ...data,
        salaryInCents: Math.round(parseFloat(data.salary) * 100),
      });

      if (result.success) {
        showSuccessToast("Funcionário cadastrado com sucesso!");
        setIsCreateModalOpen(false);
        reset();
        loadEmployees();
      } else {
        showErrorToast(result.error || "Erro ao cadastrar funcionário");
      }
    } catch (error) {
      console.error("Erro ao cadastrar funcionário:", error);
      showErrorToast("Erro ao cadastrar funcionário");
    }
  };

  const getShiftBadge = (shift: string) => {
    const shifts: Record<string, { label: string; color: string }> = {
      manha: { label: "Manhã", color: "bg-yellow-500/20 text-yellow-400" },
      tarde: { label: "Tarde", color: "bg-orange-500/20 text-orange-400" },
      noite: { label: "Noite", color: "bg-blue-500/20 text-blue-400" },
      integral: {
        label: "Integral",
        color: "bg-purple-500/20 text-purple-400",
      },
    };
    const shiftData = shifts[shift] || {
      label: shift,
      color: "bg-slate-500/20 text-slate-400",
    };
    return (
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${shiftData.color}`}
      >
        {shiftData.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Funcionários</h2>
          <p className="text-slate-400">
            {employees.length}{" "}
            {employees.length === 1
              ? "funcionário cadastrado"
              : "funcionários cadastrados"}
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#C2A537] font-semibold text-black hover:bg-[#D4B547]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Funcionário
        </Button>
      </div>

      {/* Lista de Funcionários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C2A537] border-t-transparent" />
          </div>
        ) : employees.length === 0 ? (
          <div className="col-span-full rounded-lg border border-slate-700 bg-slate-800/30 p-12 text-center">
            <Briefcase className="mx-auto mb-4 h-12 w-12 text-slate-600" />
            <h3 className="mb-2 text-lg font-medium text-white">
              Nenhum funcionário cadastrado
            </h3>
            <p className="text-sm text-slate-400">
              Clique em &quot;Novo Funcionário&quot; para cadastrar o primeiro
            </p>
          </div>
        ) : (
          employees.map((employee) => (
            <Card
              key={employee.id}
              className={`border-slate-700/50 transition-all ${
                employee.deletedAt
                  ? "border-red-900/30 bg-red-950/20"
                  : "bg-slate-800/30 hover:border-[#C2A537]/50"
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle
                      className={`text-lg ${employee.deletedAt ? "text-red-400" : "text-white"}`}
                    >
                      {employee.name}
                      {employee.deletedAt && (
                        <span className="ml-2 text-xs text-red-500">
                          (Inativo)
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-slate-400">
                      {employee.position}
                    </p>
                  </div>
                  {getShiftBadge(employee.shift)}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Clock className="h-4 w-4 text-[#C2A537]" />
                  <span>
                    {employee.shiftStartTime} - {employee.shiftEndTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <DollarSign className="h-4 w-4 text-[#C2A537]" />
                  <span className="font-semibold">
                    {employee.salaryInCents !== undefined
                      ? formatCurrency(employee.salaryInCents)
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Calendar className="h-4 w-4 text-[#C2A537]" />
                  <span>
                    Contratado em{" "}
                    {employee.hireDate
                      ? new Date(employee.hireDate).toLocaleDateString("pt-BR")
                      : "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <User className="h-4 w-4 text-[#C2A537]" />
                  <span>{employee.email}</span>
                </div>

                {/* Botões de Ação */}
                <div className="mt-4 space-y-2 border-t border-slate-700 pt-3">
                  {!employee.deletedAt ? (
                    <>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537] hover:text-black"
                          onClick={() => {
                            setSelectedEmployee(employee);
                            setIsEditModalOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          onClick={() => setEmployeeToDelete(employee)}
                        >
                          Desativar
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white"
                        onClick={() => {
                          setSelectedEmployeeForTimeRecords(employee);
                          setIsTimeRecordsModalOpen(true);
                        }}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        Controle de Ponto
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                      onClick={() => setEmployeeToReactivate(employee)}
                    >
                      Reativar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto border-[#C2A537]/30 bg-slate-900 sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">
              Cadastrar Novo Funcionário
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[#C2A537]">
                Dados Pessoais
              </h3>

              <div>
                <Label htmlFor="name" className="text-white">
                  Nome Completo
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="cpf" className="text-white">
                    CPF
                  </Label>
                  <Input
                    id="cpf"
                    {...register("cpf")}
                    placeholder="00000000000"
                    maxLength={11}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.cpf && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.cpf.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="sex" className="text-white">
                    Sexo
                  </Label>
                  <select
                    id="sex"
                    {...register("sex")}
                    className="ring-offset-background flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#C2A537] focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                  </select>
                  {errors.sex && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.sex.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="text-white">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="telephone" className="text-white">
                    Telefone
                  </Label>
                  <Input
                    id="telephone"
                    {...register("telephone")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.telephone && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.telephone.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="address" className="text-white">
                  Endereço
                </Label>
                <Input
                  id="address"
                  {...register("address")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="bornDate" className="text-white">
                    Data de Nascimento
                  </Label>
                  <Input
                    id="bornDate"
                    type="date"
                    {...register("bornDate")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.bornDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.bornDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password" className="text-white">
                    Senha
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    {...register("password")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Dados Funcionais */}
            <div className="space-y-4 border-t border-slate-700/50 pt-6">
              <h3 className="text-lg font-semibold text-[#C2A537]">
                Dados Funcionais
              </h3>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="position" className="text-white">
                    Cargo
                  </Label>
                  <Input
                    id="position"
                    {...register("position")}
                    placeholder="Ex: Professor, Recepcionista"
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.position.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shift" className="text-white">
                    Turno
                  </Label>
                  <select
                    id="shift"
                    {...register("shift")}
                    className="ring-offset-background flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#C2A537] focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    <option value="">Selecione</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                    <option value="integral">Integral</option>
                  </select>
                  {errors.shift && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.shift.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="shiftStartTime" className="text-white">
                    Horário de Início
                  </Label>
                  <Input
                    id="shiftStartTime"
                    type="time"
                    {...register("shiftStartTime")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.shiftStartTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.shiftStartTime.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shiftEndTime" className="text-white">
                    Horário de Término
                  </Label>
                  <Input
                    id="shiftEndTime"
                    type="time"
                    {...register("shiftEndTime")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.shiftEndTime && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.shiftEndTime.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="salary" className="text-white">
                    Salário (R$)
                  </Label>
                  <Input
                    id="salary"
                    type="number"
                    step="0.01"
                    {...register("salary")}
                    placeholder="0.00"
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.salary && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.salary.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="hireDate" className="text-white">
                    Data de Contratação
                  </Label>
                  <Input
                    id="hireDate"
                    type="date"
                    {...register("hireDate")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.hireDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.hireDate.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botões */}
            <div className="flex gap-3 border-t border-slate-700/50 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  reset();
                }}
                disabled={isSubmitting}
                className="flex-1 border-slate-700 text-white hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-[#C2A537] font-semibold text-black hover:bg-[#D4B547]"
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar Funcionário"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      {selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onSuccess={loadEmployees}
        />
      )}

      {/* Dialog de Confirmação de Desativação */}
      <AlertDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
      >
        <AlertDialogContent className="border-red-900/30 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Desativar Funcionário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja desativar{" "}
              <span className="font-semibold text-white">
                {employeeToDelete?.name}
              </span>
              ? O funcionário será marcado como inativo mas seus dados serão
              preservados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={async () => {
                if (!employeeToDelete) return;

                const result = await softDeleteEmployeeAction(
                  employeeToDelete.id,
                );
                if (result.success) {
                  showSuccessToast("Funcionário desativado com sucesso");
                  loadEmployees();
                } else {
                  showErrorToast(
                    result.error || "Erro ao desativar funcionário",
                  );
                }
                setEmployeeToDelete(null);
              }}
            >
              Desativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Confirmação de Reativação */}
      <AlertDialog
        open={!!employeeToReactivate}
        onOpenChange={(open) => !open && setEmployeeToReactivate(null)}
      >
        <AlertDialogContent className="border-green-900/30 bg-slate-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Reativar Funcionário
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Tem certeza que deseja reativar{" "}
              <span className="font-semibold text-white">
                {employeeToReactivate?.name}
              </span>
              ? O funcionário voltará a aparecer como ativo no sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 text-white hover:bg-slate-800">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={async () => {
                if (!employeeToReactivate) return;

                const result = await reactivateEmployeeAction(
                  employeeToReactivate.id,
                );
                if (result.success) {
                  showSuccessToast("Funcionário reativado com sucesso");
                  loadEmployees();
                } else {
                  showErrorToast(
                    result.error || "Erro ao reativar funcionário",
                  );
                }
                setEmployeeToReactivate(null);
              }}
            >
              Reativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Controle de Ponto */}
      {selectedEmployeeForTimeRecords && (
        <TimeRecordsModal
          employee={selectedEmployeeForTimeRecords}
          isOpen={isTimeRecordsModalOpen}
          onClose={() => {
            setIsTimeRecordsModalOpen(false);
            setSelectedEmployeeForTimeRecords(null);
          }}
        />
      )}
    </div>
  );
}

// Componente Modal de Edição
function EditEmployeeModal({
  employee,
  isOpen,
  onClose,
  onSuccess,
}: {
  employee: EmployeeFullData;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [showSalaryFields, setShowSalaryFields] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<EditEmployeeFormData>({
    resolver: zodResolver(editEmployeeSchema),
    defaultValues: {
      email: employee.email,
      telephone: employee.telephone,
      address: employee.address,
      position: employee.position,
      shift: employee.shift,
      shiftStartTime: employee.shiftStartTime,
      shiftEndTime: employee.shiftEndTime,
      salary: ((employee.salaryInCents ?? 0) / 100).toFixed(2),
    },
  });

  const currentSalary = watch("salary");
  const originalSalary = ((employee.salaryInCents ?? 0) / 100).toFixed(2);

  useEffect(() => {
    setShowSalaryFields(currentSalary !== originalSalary);
  }, [currentSalary, originalSalary]);

  const onSubmit = async (data: EditEmployeeFormData) => {
    try {
      const salaryChanged =
        parseFloat(data.salary) !== (employee.salaryInCents ?? 0) / 100;

      if (
        salaryChanged &&
        (!data.salaryChangeReason || !data.salaryEffectiveDate)
      ) {
        showErrorToast(
          "Preencha o motivo e a data efetiva da alteração salarial",
        );
        return;
      }

      const result = await updateEmployeeAction({
        id: employee.id,
        email: data.email,
        telephone: data.telephone,
        address: data.address,
        position: data.position,
        shift: data.shift,
        shiftStartTime: data.shiftStartTime,
        shiftEndTime: data.shiftEndTime,
        salaryInCents: Math.round(parseFloat(data.salary) * 100),
        salaryChangeReason: data.salaryChangeReason,
        salaryEffectiveDate: data.salaryEffectiveDate,
      });

      if (result.success) {
        showSuccessToast("Funcionário atualizado com sucesso!");
        onClose();
        onSuccess();
      } else {
        showErrorToast(result.error || "Erro ao atualizar funcionário");
      }
    } catch (error) {
      console.error("Erro ao atualizar funcionário:", error);
      showErrorToast("Erro ao atualizar funcionário");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#C2A537]/30 bg-slate-900 sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            Editar Funcionário
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {employee.name} - {employee.cpf}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Dados de Contato */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#C2A537]">
              Dados de Contato
            </h3>

            <div>
              <Label htmlFor="edit-email" className="text-white">
                E-mail
              </Label>
              <Input
                id="edit-email"
                type="email"
                {...register("email")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-telephone" className="text-white">
                  Telefone
                </Label>
                <Input
                  id="edit-telephone"
                  {...register("telephone")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.telephone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.telephone.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-address" className="text-white">
                  Endereço
                </Label>
                <Input
                  id="edit-address"
                  {...register("address")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.address.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[#C2A537]">
              Dados Profissionais
            </h3>

            <div>
              <Label htmlFor="edit-position" className="text-white">
                Cargo
              </Label>
              <Input
                id="edit-position"
                {...register("position")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.position && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.position.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="edit-shift" className="text-white">
                Turno
              </Label>
              <select
                id="edit-shift"
                {...register("shift")}
                className="ring-offset-background flex h-10 w-full rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#C2A537] focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <option value="">Selecione</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="integral">Integral</option>
              </select>
              {errors.shift && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.shift.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-shiftStartTime" className="text-white">
                  Horário de Início
                </Label>
                <Input
                  id="edit-shiftStartTime"
                  type="time"
                  {...register("shiftStartTime")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.shiftStartTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.shiftStartTime.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="edit-shiftEndTime" className="text-white">
                  Horário de Término
                </Label>
                <Input
                  id="edit-shiftEndTime"
                  type="time"
                  {...register("shiftEndTime")}
                  className="border-slate-700 bg-slate-800 text-white"
                />
                {errors.shiftEndTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.shiftEndTime.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-salary" className="text-white">
                Salário (R$)
              </Label>
              <Input
                id="edit-salary"
                type="number"
                step="0.01"
                {...register("salary")}
                className="border-slate-700 bg-slate-800 text-white"
              />
              {errors.salary && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.salary.message}
                </p>
              )}
            </div>

            {/* Campos adicionais se o salário mudou */}
            {showSalaryFields && (
              <div className="space-y-4 rounded-lg border border-amber-900/30 bg-amber-950/20 p-4">
                <p className="text-sm text-amber-400">
                  ⚠️ Você alterou o salário. Informe o motivo e a data efetiva
                  da mudança.
                </p>

                <div>
                  <Label
                    htmlFor="edit-salaryChangeReason"
                    className="text-white"
                  >
                    Motivo da Alteração *
                  </Label>
                  <Input
                    id="edit-salaryChangeReason"
                    {...register("salaryChangeReason")}
                    placeholder="Ex: Promoção, Ajuste de mercado, etc."
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.salaryChangeReason && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.salaryChangeReason.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label
                    htmlFor="edit-salaryEffectiveDate"
                    className="text-white"
                  >
                    Data Efetiva *
                  </Label>
                  <Input
                    id="edit-salaryEffectiveDate"
                    type="date"
                    {...register("salaryEffectiveDate")}
                    className="border-slate-700 bg-slate-800 text-white"
                  />
                  {errors.salaryEffectiveDate && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.salaryEffectiveDate.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <DialogFooter className="gap-3 border-t border-slate-700/50 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#C2A537] font-semibold text-black hover:bg-[#D4B547]"
            >
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Componente Modal de Controle de Ponto
function TimeRecordsModal({
  employee,
  isOpen,
  onClose,
}: {
  employee: EmployeeFullData;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(1); // Primeiro dia do mês atual
    return date.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    return date.toISOString().split("T")[0];
  });
  const [registering, setRegistering] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTimeRecords = async () => {
      setLoading(true);
      try {
        const result = await getEmployeeTimeRecordsAction(
          employee.employeeId,
          startDate,
          endDate,
        );
        if (result.success && result.data) {
          setTimeRecords(result.data);
        } else {
          showErrorToast(result.error || "Erro ao carregar registros");
        }
      } catch (error) {
        console.error("Erro ao carregar registros:", error);
        showErrorToast("Erro ao carregar registros");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadTimeRecords();
    }
  }, [isOpen, startDate, endDate, employee.employeeId]);

  const reloadTimeRecords = async () => {
    setLoading(true);
    try {
      const result = await getEmployeeTimeRecordsAction(
        employee.employeeId,
        startDate,
        endDate,
      );
      if (result.success && result.data) {
        setTimeRecords(result.data);
      } else {
        showErrorToast(result.error || "Erro ao carregar registros");
      }
    } catch (error) {
      console.error("Erro ao carregar registros:", error);
      showErrorToast("Erro ao carregar registros");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterTimeRecord = async (type: "checkIn" | "checkOut") => {
    setRegistering(true);
    try {
      const now = new Date();
      const date = now.toISOString().split("T")[0];
      const time = now.toTimeString().split(" ")[0].substring(0, 5); // HH:MM

      const result = await registerTimeRecordAction({
        employeeId: employee.employeeId,
        date,
        checkInTime: type === "checkIn" ? time : "",
        checkOutTime: type === "checkOut" ? time : undefined,
      });

      if (result.success) {
        showSuccessToast(
          type === "checkIn"
            ? "Entrada registrada com sucesso!"
            : "Saída registrada com sucesso!",
        );
        reloadTimeRecords();
      } else {
        showErrorToast(result.error || "Erro ao registrar ponto");
      }
    } catch (error) {
      console.error("Erro ao registrar ponto:", error);
      showErrorToast("Erro ao registrar ponto");
    } finally {
      setRegistering(false);
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const winPrint = window.open(
      "",
      "",
      "left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0",
    );
    if (!winPrint) return;

    winPrint.document.write(`
      <html>
        <head>
          <title>Relatório de Ponto - ${employee.name}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #000;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            h2 {
              font-size: 18px;
              margin-bottom: 20px;
              color: #666;
            }
            .info {
              margin-bottom: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .info p {
              margin: 5px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #C2A537;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .summary {
              margin-top: 20px;
              padding: 10px;
              background: #f5f5f5;
              border-radius: 5px;
            }
            .footer {
              margin-top: 40px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    winPrint.document.close();
    winPrint.focus();
    winPrint.print();
    winPrint.close();
  };

  const calculateTotalHours = () => {
    return timeRecords.reduce((total, record) => {
      if (record.totalHours) {
        const [hours, minutes] = record.totalHours.split(":").map(Number);
        return total + hours + minutes / 60;
      }
      return total;
    }, 0);
  };

  const totalHours = calculateTotalHours();
  const totalDays = timeRecords.filter(
    (r) => r.checkInTime && r.checkOutTime,
  ).length;

  // Verificar se já tem registro de entrada hoje
  const today = new Date().toISOString().split("T")[0];
  const todayRecord = timeRecords.find((r) => r.date === today);
  const hasCheckedInToday = todayRecord?.checkInTime;
  const hasCheckedOutToday = todayRecord?.checkOutTime;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-[#C2A537]/30 bg-slate-900 sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white">
            Controle de Ponto
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {employee.name} - {employee.position}
          </DialogDescription>
        </DialogHeader>

        {/* Área de impressão */}
        <div ref={printRef}>
          <div className="hidden print:block">
            <h1>Relatório de Controle de Ponto</h1>
            <h2>JM Fitness Studio</h2>
            <div className="info">
              <p>
                <strong>Funcionário:</strong> {employee.name}
              </p>
              <p>
                <strong>CPF:</strong> {employee.cpf}
              </p>
              <p>
                <strong>Cargo:</strong> {employee.position}
              </p>
              <p>
                <strong>Período:</strong>{" "}
                {new Date(startDate).toLocaleDateString("pt-BR")} até{" "}
                {new Date(endDate).toLocaleDateString("pt-BR")}
              </p>
              <p>
                <strong>Data de Emissão:</strong>{" "}
                {new Date().toLocaleDateString("pt-BR")} às{" "}
                {new Date().toLocaleTimeString("pt-BR")}
              </p>
            </div>
          </div>

          {/* Registrar Ponto Hoje */}
          <div className="mb-6 space-y-3 print:hidden">
            <h3 className="text-lg font-semibold text-white">
              Registrar Ponto Hoje
            </h3>
            <div className="flex gap-3">
              <Button
                onClick={() => handleRegisterTimeRecord("checkIn")}
                disabled={registering || !!hasCheckedInToday}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                {hasCheckedInToday ? "Entrada Registrada" : "Registrar Entrada"}
              </Button>
              <Button
                onClick={() => handleRegisterTimeRecord("checkOut")}
                disabled={
                  registering || !hasCheckedInToday || !!hasCheckedOutToday
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Clock className="mr-2 h-4 w-4" />
                {hasCheckedOutToday ? "Saída Registrada" : "Registrar Saída"}
              </Button>
            </div>
            {todayRecord && (
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-3 text-sm text-slate-300">
                <p>
                  Hoje:{" "}
                  {hasCheckedInToday && `Entrada às ${todayRecord.checkInTime}`}
                  {hasCheckedOutToday &&
                    ` • Saída às ${todayRecord.checkOutTime}`}
                  {todayRecord.totalHours &&
                    ` • Total: ${todayRecord.totalHours}h`}
                </p>
              </div>
            )}
          </div>

          {/* Filtros */}
          <div className="mb-6 grid gap-4 md:grid-cols-2 print:hidden">
            <div>
              <Label htmlFor="startDate" className="text-white">
                Data Inicial
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="text-white">
                Data Final
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border-slate-700 bg-slate-800 text-white"
              />
            </div>
          </div>

          {/* Resumo */}
          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">
                  Total de Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">{totalDays}</p>
              </CardContent>
            </Card>
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">
                  Total de Horas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {Math.floor(totalHours)}h {Math.round((totalHours % 1) * 60)}
                  min
                </p>
              </CardContent>
            </Card>
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-400">
                  Média Diária
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-white">
                  {totalDays > 0
                    ? `${(totalHours / totalDays).toFixed(1)}h`
                    : "0h"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Registros */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#C2A537] border-t-transparent" />
            </div>
          ) : timeRecords.length === 0 ? (
            <div className="rounded-lg border border-slate-700 bg-slate-800/30 p-12 text-center">
              <Clock className="mx-auto mb-4 h-12 w-12 text-slate-600" />
              <h3 className="mb-2 text-lg font-medium text-white">
                Nenhum registro encontrado
              </h3>
              <p className="text-sm text-slate-400">
                Não há registros de ponto para o período selecionado
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Entrada
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Saída
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-white print:hidden">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {timeRecords.map((record, index) => (
                    <tr
                      key={record.id}
                      className={`border-b border-slate-700/50 ${
                        index % 2 === 0 ? "bg-slate-800/20" : "bg-slate-800/10"
                      }`}
                    >
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {new Date(record.date).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {record.checkInTime || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-300">
                        {record.checkOutTime || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-white">
                        {record.totalHours || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm print:hidden">
                        {record.approved ? (
                          <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                            Aprovado
                          </span>
                        ) : (
                          <span className="rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400">
                            Pendente
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo para impressão */}
          <div className="summary hidden print:block">
            <h3 style={{ marginBottom: "10px" }}>Resumo do Período</h3>
            <p>
              <strong>Total de Dias Trabalhados:</strong> {totalDays}
            </p>
            <p>
              <strong>Total de Horas:</strong> {Math.floor(totalHours)}h{" "}
              {Math.round((totalHours % 1) * 60)}min
            </p>
            <p>
              <strong>Média de Horas por Dia:</strong>{" "}
              {totalDays > 0 ? `${(totalHours / totalDays).toFixed(1)}h` : "0h"}
            </p>
          </div>

          <div className="footer hidden print:block">
            <p>
              JM Fitness Studio - Relatório gerado em{" "}
              {new Date().toLocaleDateString("pt-BR")} às{" "}
              {new Date().toLocaleTimeString("pt-BR")}
            </p>
          </div>
        </div>

        {/* Botões */}
        <DialogFooter className="gap-3 border-t border-slate-700/50 pt-6 print:hidden">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="border-slate-700 text-white hover:bg-slate-800"
          >
            Fechar
          </Button>
          <Button
            type="button"
            onClick={handlePrint}
            className="bg-[#C2A537] font-semibold text-black hover:bg-[#D4B547]"
          >
            <Printer className="mr-2 h-4 w-4" />
            Imprimir Relatório
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
