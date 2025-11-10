"use client";

import { useEffect, useState } from "react";

import {
  getStudentsPaymentsAction,
  StudentPaymentData,
} from "@/actions/admin/get-students-payments-action";
import { updatePaymentAction } from "@/actions/admin/update-payment-action";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import { PaymentStatusModal } from "@/components/Admin/PaymentStatusModal";
import { Button } from "@/components/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCPF } from "@/lib/utils";

export default function AdminPaymentsPage() {
  const [students, setStudents] = useState<StudentPaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  // Estados para modais
  const [showUpToDateModal, setShowUpToDateModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);

  // Estados para paginação
  const [currentPageUpToDate, setCurrentPageUpToDate] = useState(1);
  const [currentPageOverdue, setCurrentPageOverdue] = useState(1);
  const itemsPerPage = 5;

  // Carregar dados dos alunos
  useEffect(() => {
    async function loadStudents() {
      try {
        console.log("Carregando dados dos alunos...");
        const data = await getStudentsPaymentsAction();
        console.log("Dados carregados:", data);
        setStudents(data);
      } catch (error) {
        console.error("Erro ao carregar dados dos alunos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadStudents();
  }, []);

  // Atualizar status de pagamento
  const handlePaymentUpdate = async (userId: string, paid: boolean) => {
    setUpdating(userId);
    try {
      const result = await updatePaymentAction(userId, paid);
      if (result.success) {
        // Recarregar dados
        const updatedData = await getStudentsPaymentsAction();
        setStudents(updatedData);
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      alert("Erro ao atualizar pagamento");
    } finally {
      setUpdating(null);
    }
  };

  // Filtrar alunos por status
  const studentsUpToDate = students.filter((s) => s.isUpToDate);
  const studentsOverdue = students.filter((s) => !s.isUpToDate);

  // Paginação para alunos em dia
  const totalPagesUpToDate = Math.ceil(studentsUpToDate.length / itemsPerPage);
  const startIndexUpToDate = (currentPageUpToDate - 1) * itemsPerPage;
  const endIndexUpToDate = startIndexUpToDate + itemsPerPage;
  const paginatedStudentsUpToDate = studentsUpToDate.slice(
    startIndexUpToDate,
    endIndexUpToDate,
  );

  // Paginação para alunos em atraso
  const totalPagesOverdue = Math.ceil(studentsOverdue.length / itemsPerPage);
  const startIndexOverdue = (currentPageOverdue - 1) * itemsPerPage;
  const endIndexOverdue = startIndexOverdue + itemsPerPage;
  const paginatedStudentsOverdue = studentsOverdue.slice(
    startIndexOverdue,
    endIndexOverdue,
  );

  // Calcular totais financeiros
  const totalReceived = studentsUpToDate.reduce((sum, student) => {
    return sum + student.monthlyFeeValueInCents / 100;
  }, 0);

  const totalOverdue = studentsOverdue.reduce((sum, student) => {
    return sum + student.monthlyFeeValueInCents / 100;
  }, 0);

  const totalRevenue = students.reduce((sum, student) => {
    return sum + student.monthlyFeeValueInCents / 100;
  }, 0);

  // Função para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center">
            <div className="mb-4 text-3xl sm:text-4xl">💰</div>
            <p className="text-base text-[#C2A537] sm:text-lg">
              Carregando dados financeiros...
            </p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen sm:py-8">
        <div className="z max-w-7xl space-y-4 px-2 sm:space-y-8 sm:px-4">
          {/* Cabeçalho */}
          <Card className="border-[#C2A537] bg-black/95 backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-xl text-[#C2A537] sm:gap-3 sm:text-2xl lg:text-3xl">
                💰 <span className="xs:inline hidden">Controle</span> Financeiro
              </CardTitle>
              <CardDescription className="text-sm text-slate-300 sm:text-base">
                Gestão completa de mensalidades e pagamentos dos alunos
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Resumo Financeiro */}
          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
            <Card className="border-[#C2A537] bg-[#C2A537]/10 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="mb-1 text-lg sm:mb-2 sm:text-2xl">💵</div>
                  <p className="truncate text-lg font-bold text-[#C2A537] sm:text-2xl">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-xs text-[#C2A537]/80 sm:text-sm">
                    Receita Total
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-green-600 bg-green-900/20 backdrop-blur-sm transition-all hover:bg-green-900/30"
              onClick={() => {
                console.log("Abrindo modal de pagamentos em dia");
                setShowUpToDateModal(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="mb-1 text-lg sm:mb-2 sm:text-2xl">✅</div>
                  <p className="truncate text-lg font-bold text-green-400 sm:text-2xl">
                    {formatCurrency(totalReceived)}
                  </p>
                  <p className="text-xs text-green-300 sm:text-sm">
                    Valores Recebidos
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card
              className="cursor-pointer border-red-600 bg-red-900/20 backdrop-blur-sm transition-all hover:bg-red-900/30"
              onClick={() => {
                console.log("Abrindo modal de pagamentos em atraso");
                setShowOverdueModal(true);
              }}
            >
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="mb-1 text-lg sm:mb-2 sm:text-2xl">⚠️</div>
                  <p className="truncate text-lg font-bold text-red-400 sm:text-2xl">
                    {formatCurrency(totalOverdue)}
                  </p>
                  <p className="text-xs text-red-300 sm:text-sm">
                    Valores em Atraso
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-600 bg-blue-900/20 backdrop-blur-sm">
              <CardContent className="p-3 sm:p-6">
                <div className="text-center">
                  <div className="mb-1 text-lg sm:mb-2 sm:text-2xl">👥</div>
                  <p className="text-lg font-bold text-blue-400 sm:text-2xl">
                    {students.length}
                  </p>
                  <p className="text-xs text-blue-300 sm:text-sm">
                    Total de Alunos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Alunos em Dia */}
          <Card className="border-green-600 bg-green-900/10 backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col items-start gap-2 text-lg text-green-400 sm:flex-row sm:items-center sm:gap-3 sm:text-xl lg:text-2xl">
                <div className="flex items-center gap-2">
                  ✅ <span className="hidden sm:inline">Pagamentos em</span> Dia
                </div>
                <span className="rounded-full bg-green-600 px-2 py-1 text-sm text-white sm:px-3 sm:text-base lg:text-lg">
                  {studentsUpToDate.length}
                </span>
              </CardTitle>
              <CardDescription className="text-sm text-green-300 sm:text-base">
                Total recebido: {formatCurrency(totalReceived)}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {studentsUpToDate.length > 0 ? (
                <>
                  {/* Tabela Desktop */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-green-600/30">
                          <th className="p-3 text-left font-medium text-green-400">
                            Aluno
                          </th>
                          <th className="p-3 text-left font-medium text-green-400">
                            Contato
                          </th>
                          <th className="p-3 text-right font-medium text-green-400">
                            Mensalidade
                          </th>
                          <th className="p-3 text-center font-medium text-green-400">
                            Vencimento
                          </th>
                          <th className="p-3 text-center font-medium text-green-400">
                            Último Pagamento
                          </th>
                          <th className="p-3 text-center font-medium text-green-400">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudentsUpToDate.map((student, index) => (
                          <tr
                            key={student.userId}
                            className={`border-b border-green-600/20 transition-colors hover:bg-green-900/20 ${
                              index % 2 === 0 ? "bg-green-900/5" : ""
                            }`}
                          >
                            <td className="p-3">
                              <div>
                                <div className="font-medium text-white">
                                  {student.name}
                                </div>
                                <div className="text-sm text-slate-400">
                                  CPF: {formatCPF(student.cpf)}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-slate-300">
                                {student.email}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-lg font-bold text-green-400">
                                {student.formattedValue}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="rounded-full bg-green-900/50 px-2 py-1 text-sm text-green-300">
                                Dia {student.dueDate}
                              </span>
                            </td>
                            <td className="p-3 text-center text-slate-300">
                              {student.lastPaymentDate
                                ? new Date(
                                    student.lastPaymentDate,
                                  ).toLocaleDateString("pt-BR")
                                : "Nunca"}
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                onClick={() =>
                                  handlePaymentUpdate(student.userId, false)
                                }
                                disabled={updating === student.userId}
                                variant="outline"
                                size="sm"
                                className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                {updating === student.userId
                                  ? "..."
                                  : "Marcar Pendente"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile/Tablet */}
                  <div className="space-y-3 p-4 lg:hidden">
                    {paginatedStudentsUpToDate.map((student) => (
                      <Card
                        key={student.userId}
                        className="border-green-600/30 bg-green-900/10"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Nome e CPF */}
                            <div>
                              <h3 className="text-base font-semibold text-white">
                                {student.name}
                              </h3>
                              <p className="text-sm text-slate-400">
                                CPF: {formatCPF(student.cpf)}
                              </p>
                            </div>

                            {/* Informações em Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-slate-400">Email:</p>
                                <p className="break-all text-slate-300">
                                  {student.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Mensalidade:</p>
                                <p className="font-bold text-green-400">
                                  {student.formattedValue}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Vencimento:</p>
                                <span className="inline-block rounded-full bg-green-900/50 px-2 py-1 text-xs text-green-300">
                                  Dia {student.dueDate}
                                </span>
                              </div>
                              <div>
                                <p className="text-slate-400">
                                  Último Pagamento:
                                </p>
                                <p className="text-slate-300">
                                  {student.lastPaymentDate
                                    ? new Date(
                                        student.lastPaymentDate,
                                      ).toLocaleDateString("pt-BR")
                                    : "Nunca"}
                                </p>
                              </div>
                            </div>

                            {/* Botão de Ação */}
                            <div className="pt-2">
                              <Button
                                onClick={() =>
                                  handlePaymentUpdate(student.userId, false)
                                }
                                disabled={updating === student.userId}
                                variant="outline"
                                size="sm"
                                className="w-full border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                              >
                                {updating === student.userId
                                  ? "Processando..."
                                  : "Marcar como Pendente"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mb-4 text-4xl">😔</div>
                  <p className="text-slate-400">
                    Nenhum aluno com pagamento em dia
                  </p>
                </div>
              )}

              {/* Paginação Alunos em Dia */}
              {studentsUpToDate.length > 0 && totalPagesUpToDate > 1 && (
                <div className="flex items-center justify-between border-t border-green-600/20 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      onClick={() =>
                        setCurrentPageUpToDate(currentPageUpToDate - 1)
                      }
                      disabled={currentPageUpToDate === 1}
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPageUpToDate(currentPageUpToDate + 1)
                      }
                      disabled={currentPageUpToDate === totalPagesUpToDate}
                      variant="outline"
                      size="sm"
                      className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                    >
                      Próximo
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-green-300">
                        Mostrando{" "}
                        <span className="font-medium">
                          {startIndexUpToDate + 1}
                        </span>{" "}
                        a{" "}
                        <span className="font-medium">
                          {Math.min(endIndexUpToDate, studentsUpToDate.length)}
                        </span>{" "}
                        de{" "}
                        <span className="font-medium">
                          {studentsUpToDate.length}
                        </span>{" "}
                        alunos
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <Button
                          onClick={() =>
                            setCurrentPageUpToDate(currentPageUpToDate - 1)
                          }
                          disabled={currentPageUpToDate === 1}
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                        >
                          Anterior
                        </Button>
                        <span className="relative inline-flex items-center border border-green-600 bg-green-900/20 px-4 py-2 text-sm font-semibold text-green-300">
                          {currentPageUpToDate} de {totalPagesUpToDate}
                        </span>
                        <Button
                          onClick={() =>
                            setCurrentPageUpToDate(currentPageUpToDate + 1)
                          }
                          disabled={currentPageUpToDate === totalPagesUpToDate}
                          variant="outline"
                          size="sm"
                          className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
                        >
                          Próximo
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabela de Alunos em Atraso */}
          <Card className="border-red-600 bg-red-900/10 backdrop-blur-sm">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex flex-col items-start gap-2 text-lg text-red-400 sm:flex-row sm:items-center sm:gap-3 sm:text-xl lg:text-2xl">
                <div className="flex items-center gap-2">
                  ⚠️ <span className="hidden sm:inline">Pagamentos em</span>{" "}
                  Atraso
                </div>
                <span className="rounded-full bg-red-600 px-2 py-1 text-sm text-white sm:px-3 sm:text-base lg:text-lg">
                  {studentsOverdue.length}
                </span>
              </CardTitle>
              <CardDescription className="text-sm text-red-300 sm:text-base">
                Total em atraso: {formatCurrency(totalOverdue)} • Estes alunos
                não podem fazer check-in
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {studentsOverdue.length > 0 ? (
                <>
                  {/* Tabela Desktop */}
                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-red-600/30">
                          <th className="p-3 text-left font-medium text-red-400">
                            Aluno
                          </th>
                          <th className="p-3 text-left font-medium text-red-400">
                            Contato
                          </th>
                          <th className="p-3 text-right font-medium text-red-400">
                            Mensalidade
                          </th>
                          <th className="p-3 text-center font-medium text-red-400">
                            Vencimento
                          </th>
                          <th className="p-3 text-center font-medium text-red-400">
                            Último Pagamento
                          </th>
                          <th className="p-3 text-center font-medium text-red-400">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedStudentsOverdue.map((student, index) => (
                          <tr
                            key={student.userId}
                            className={`border-b border-red-600/20 transition-colors hover:bg-red-900/20 ${
                              index % 2 === 0 ? "bg-red-900/5" : ""
                            }`}
                          >
                            <td className="p-3">
                              <div>
                                <div className="font-medium text-white">
                                  {student.name}
                                </div>
                                <div className="text-sm text-slate-400">
                                  CPF: {formatCPF(student.cpf)}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="text-sm text-slate-300">
                                {student.email}
                              </div>
                            </td>
                            <td className="p-3 text-right">
                              <span className="text-lg font-bold text-red-400">
                                {student.formattedValue}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <span className="rounded-full bg-red-900/50 px-2 py-1 text-sm text-red-300">
                                Dia {student.dueDate}
                              </span>
                            </td>
                            <td className="p-3 text-center text-slate-300">
                              {student.lastPaymentDate
                                ? new Date(
                                    student.lastPaymentDate,
                                  ).toLocaleDateString("pt-BR")
                                : "Nunca"}
                            </td>
                            <td className="p-3 text-center">
                              <Button
                                onClick={() =>
                                  handlePaymentUpdate(student.userId, true)
                                }
                                disabled={updating === student.userId}
                                variant="default"
                                size="sm"
                                className="bg-green-600 text-white hover:bg-green-700"
                              >
                                {updating === student.userId
                                  ? "..."
                                  : "Confirmar Pagamento"}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards Mobile/Tablet */}
                  <div className="space-y-3 p-4 lg:hidden">
                    {paginatedStudentsOverdue.map((student) => (
                      <Card
                        key={student.userId}
                        className="border-red-600/30 bg-red-900/10"
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Nome e CPF */}
                            <div>
                              <h3 className="text-base font-semibold text-white">
                                {student.name}
                              </h3>
                              <p className="text-sm text-slate-400">
                                CPF: {formatCPF(student.cpf)}
                              </p>
                            </div>

                            {/* Informações em Grid */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-slate-400">Email:</p>
                                <p className="break-all text-slate-300">
                                  {student.email}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Mensalidade:</p>
                                <p className="font-bold text-red-400">
                                  {student.formattedValue}
                                </p>
                              </div>
                              <div>
                                <p className="text-slate-400">Vencimento:</p>
                                <span className="inline-block rounded-full bg-red-900/50 px-2 py-1 text-xs text-red-300">
                                  Dia {student.dueDate}
                                </span>
                              </div>
                              <div>
                                <p className="text-slate-400">
                                  Último Pagamento:
                                </p>
                                <p className="text-slate-300">
                                  {student.lastPaymentDate
                                    ? new Date(
                                        student.lastPaymentDate,
                                      ).toLocaleDateString("pt-BR")
                                    : "Nunca"}
                                </p>
                              </div>
                            </div>

                            {/* Botão de Ação */}
                            <div className="pt-2">
                              <Button
                                onClick={() =>
                                  handlePaymentUpdate(student.userId, true)
                                }
                                disabled={updating === student.userId}
                                variant="default"
                                size="sm"
                                className="w-full bg-green-600 text-white hover:bg-green-700"
                              >
                                {updating === student.userId
                                  ? "Processando..."
                                  : "Confirmar Pagamento"}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center">
                  <div className="mb-4 text-4xl">🎉</div>
                  <p className="font-medium text-green-400">
                    Parabéns! Todos os alunos estão em dia!
                  </p>
                  <p className="mt-2 text-slate-400">
                    Nenhum pagamento em atraso
                  </p>
                </div>
              )}

              {/* Paginação Alunos em Atraso */}
              {studentsOverdue.length > 0 && totalPagesOverdue > 1 && (
                <div className="flex items-center justify-between border-t border-red-600/20 px-4 py-3 sm:px-6">
                  <div className="flex flex-1 justify-between sm:hidden">
                    <Button
                      onClick={() =>
                        setCurrentPageOverdue(currentPageOverdue - 1)
                      }
                      disabled={currentPageOverdue === 1}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      Anterior
                    </Button>
                    <Button
                      onClick={() =>
                        setCurrentPageOverdue(currentPageOverdue + 1)
                      }
                      disabled={currentPageOverdue === totalPagesOverdue}
                      variant="outline"
                      size="sm"
                      className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                    >
                      Próximo
                    </Button>
                  </div>
                  <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-red-300">
                        Mostrando{" "}
                        <span className="font-medium">
                          {startIndexOverdue + 1}
                        </span>{" "}
                        a{" "}
                        <span className="font-medium">
                          {Math.min(endIndexOverdue, studentsOverdue.length)}
                        </span>{" "}
                        de{" "}
                        <span className="font-medium">
                          {studentsOverdue.length}
                        </span>{" "}
                        alunos
                      </p>
                    </div>
                    <div>
                      <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                        <Button
                          onClick={() =>
                            setCurrentPageOverdue(currentPageOverdue - 1)
                          }
                          disabled={currentPageOverdue === 1}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          Anterior
                        </Button>
                        <span className="relative inline-flex items-center border border-red-600 bg-red-900/20 px-4 py-2 text-sm font-semibold text-red-300">
                          {currentPageOverdue} de {totalPagesOverdue}
                        </span>
                        <Button
                          onClick={() =>
                            setCurrentPageOverdue(currentPageOverdue + 1)
                          }
                          disabled={currentPageOverdue === totalPagesOverdue}
                          variant="outline"
                          size="sm"
                          className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                        >
                          Próximo
                        </Button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Modais de Status de Pagamento */}
      <PaymentStatusModal
        isOpen={showUpToDateModal}
        onClose={() => setShowUpToDateModal(false)}
        title="Pagamentos em Dia"
        students={studentsUpToDate}
        type="paid"
        onUpdatePayment={handlePaymentUpdate}
      />

      <PaymentStatusModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        title="Pagamentos Pendentes"
        students={studentsOverdue}
        type="pending"
        onUpdatePayment={handlePaymentUpdate}
      />
    </AdminLayout>
  );
}
