import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  createExpenseAction,
  CreateExpenseInput,
  deleteExpenseAction,
  getExpensesAction,
  updateExpenseAction,
} from "@/actions/admin/expenses-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { paymentMethodOptions } from "@/db/schema";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import {
  ExpenseCategory,
  expenseCategoryOptions,
} from "@/types/expense-categories";

import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { ExpenseReport } from "./ExpenseReport";
import type { Expense } from "./types";

const formSchema = z.object({
  description: z.string().min(3, "Descrição deve ter no mínimo 3 caracteres"),
  category: z.string(),
  amountInCents: z.number().min(1, "Valor deve ser maior que 0"),
  dueDate: z.date(),
  paymentMethod: z.string(),
  recurrent: z.boolean(),
  notes: z.string().optional(),
  attachment: z.string().optional(),
});

export function ExpenseForm() {
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      category: "",
      amountInCents: 0,
      dueDate: new Date(),
      paymentMethod: "",
      recurrent: false,
      notes: "",
      attachment: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);

      const input: CreateExpenseInput = {
        ...values,
        category: values.category as ExpenseCategory,
        amountInCents: Math.round(values.amountInCents * 100),
        dueDate: format(values.dueDate, "yyyy-MM-dd"),
      };

      const result = await createExpenseAction(input);

      if (result.error) {
        throw new Error(result.error);
      }

      toast.success("Despesa criada com sucesso!");
      form.reset();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao criar despesa";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="border-slate-700/50 bg-slate-800/30">
      <CardHeader>
        <CardTitle className="text-[#C2A537]">Nova Despesa</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {expenseCategoryOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountInCents"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      className="border-slate-700 bg-slate-900 text-slate-200 placeholder:text-slate-400"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de vencimento</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "border-slate-700 bg-slate-900 pl-3 text-left font-normal text-slate-200",
                            !field.value && "text-slate-400",
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Forma de Pagamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma forma de pagamento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {paymentMethodOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Despesa Recorrente</FormLabel>
                    <FormDescription>
                      Marque esta opção se esta é uma despesa que se repete
                      mensalmente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#C2A537]/20 text-[#C2A537] hover:bg-[#C2A537]/30"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Cadastrar Despesa
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export function ExpenseTable({
  expenses: initialExpenses,
}: {
  expenses?: Expense[];
}) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses || []);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      const result = await getExpensesAction();
      if (!result.error && result.expenses) {
        setExpenses(
          result.expenses.map((expense) => ({
            ...expense,
            createdAt: expense.createdAt.toString(),
          })),
        );
      } else if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao carregar despesas";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#C2A537]" />
      </div>
    );
  }

  if (showReport) {
    return (
      <>
        <div className="mb-4">
          <Button
            onClick={() => setShowReport(false)}
            variant="outline"
            className="border-slate-700 bg-slate-800/30 text-[#C2A537] hover:bg-slate-800/50 hover:text-[#C2A537]"
          >
            Voltar para Lista
          </Button>
        </div>
        <ExpenseReport expenses={expenses} />
      </>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-[#C2A537]">
          Lista de Despesas
        </h2>
        <Button
          onClick={() => setShowReport(true)}
          className="bg-[#C2A537]/20 text-[#C2A537] hover:bg-[#C2A537]/30"
        >
          Ver Relatório
        </Button>
      </div>

      <div className="rounded-md border border-slate-700 bg-slate-800/30">
        <div className="border-b border-slate-700 p-4">
          <h3 className="text-lg font-semibold text-[#C2A537]">
            Todas as Despesas
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-[#C2A537]">Descrição</TableHead>
              <TableHead className="text-[#C2A537]">Categoria</TableHead>
              <TableHead className="text-[#C2A537]">Valor</TableHead>
              <TableHead className="text-[#C2A537]">Vencimento</TableHead>
              <TableHead className="text-[#C2A537]">Status</TableHead>
              <TableHead className="text-[#C2A537]">Recorrente</TableHead>
              <TableHead className="text-[#C2A537]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.map((expense) => {
              const category = expenseCategoryOptions.find(
                (opt) => opt.value === expense.category,
              );

              return (
                <TableRow key={expense.id}>
                  <TableCell className="text-slate-200">
                    {expense.description}
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {category?.label}
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {formatCurrency(expense.amountInCents)}
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {format(new Date(expense.dueDate), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={expense.paid ? "success" : "destructive"}
                      className={
                        expense.paid
                          ? "bg-green-900/30 text-green-400"
                          : "bg-red-900/30 text-red-400"
                      }
                    >
                      {expense.paid ? "Pago" : "Pendente"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-200">
                    {expense.recurrent ? "Sim" : "Não"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {!expense.paid && (
                        <Button
                          size="sm"
                          className="bg-[#C2A537]/20 text-[#C2A537] hover:bg-[#C2A537]/30"
                          onClick={async () => {
                            try {
                              const result = await updateExpenseAction({
                                id: expense.id,
                                paid: true,
                                paymentDate: format(new Date(), "yyyy-MM-dd"),
                              });

                              if (result.success) {
                                toast.success("Despesa marcada como paga");
                                setExpenses((prev) =>
                                  prev.map((e) =>
                                    e.id === expense.id
                                      ? {
                                          ...e,
                                          paid: true,
                                          paymentDate: format(
                                            new Date(),
                                            "yyyy-MM-dd",
                                          ),
                                        }
                                      : e,
                                  ),
                                );
                              } else {
                                throw new Error(result.error);
                              }
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : "Erro ao atualizar despesa",
                              );
                            }
                          }}
                        >
                          Marcar como pago
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="bg-red-900/20 text-red-400 hover:bg-red-900/30"
                        onClick={() => setExpenseToDelete(expense.id)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmationDialog
        isOpen={expenseToDelete !== null}
        onOpenChange={(open) => {
          if (!open) setExpenseToDelete(null);
        }}
        onConfirm={async () => {
          if (!expenseToDelete) return;

          try {
            const result = await deleteExpenseAction(expenseToDelete);

            if (result.success) {
              toast.success("Despesa excluída com sucesso");
              setExpenses((prev) =>
                prev.filter((e) => e.id !== expenseToDelete),
              );
              setExpenseToDelete(null);
            } else {
              throw new Error(result.error);
            }
          } catch (error) {
            toast.error(
              error instanceof Error
                ? error.message
                : "Erro ao excluir despesa",
            );
          }
        }}
      />
    </div>
  );
}
