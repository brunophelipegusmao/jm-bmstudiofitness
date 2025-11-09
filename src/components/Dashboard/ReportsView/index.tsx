"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  CreditCard,
  DollarSign,
  Download,
  FileBarChart,
  Filter,
  Loader2,
  PieChart,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  type FinancialReportData,
  getFinancialReportsAction,
} from "@/actions/admin/get-financial-reports-action";
import { showErrorToast, showSuccessToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  generateFinancialReportExcel,
  generateFinancialReportPDF,
} from "@/lib/report-generator";

interface ReportsViewProps {
  onBack: () => void;
}

export function ReportsView({ onBack }: ReportsViewProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [reportType, setReportType] = useState<
    "students" | "payments" | "general"
  >("general");
  const [reportData, setReportData] = useState<FinancialReportData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const result = await getFinancialReportsAction();

      if (result.success && result.data) {
        setReportData(result.data);
      } else {
        showErrorToast(result.error || "Erro ao carregar relatório");
      }
    } catch (error) {
      console.error("Erro ao carregar relatório:", error);
      showErrorToast("Erro ao carregar dados do relatório");
    } finally {
      setIsLoading(false);
    }
  };

  const reportTypes = [
    {
      id: "general",
      title: "Relatório Geral",
      description: "Visão completa do estúdio",
      icon: BarChart3,
      color: "from-blue-600 to-cyan-500",
    },
    {
      id: "students",
      title: "Relatório de Alunos",
      description: "Dados detalhados dos alunos",
      icon: Users,
      color: "from-green-600 to-emerald-500",
    },
    {
      id: "payments",
      title: "Relatório Financeiro",
      description: "Análise de pagamentos e receitas",
      icon: CreditCard,
      color: "from-purple-600 to-violet-500",
    },
  ];

  const periods = [
    { value: "7", label: "Últimos 7 dias" },
    { value: "30", label: "Últimos 30 dias" },
    { value: "90", label: "Últimos 3 meses" },
    { value: "365", label: "Último ano" },
  ];

  const handleGenerateReport = () => {
    if (!reportData) {
      showErrorToast("Nenhum dado disponível para gerar relatório");
      return;
    }

    showSuccessToast("Relatório gerado com sucesso!");
    // Os dados já estão carregados e exibidos na tela
  };

  const handleDownloadReport = (format: "pdf" | "excel") => {
    if (!reportData) {
      showErrorToast("Nenhum dado disponível para download");
      return;
    }

    try {
      if (format === "pdf") {
        generateFinancialReportPDF(reportData);
        showSuccessToast("PDF baixado com sucesso!");
      } else {
        generateFinancialReportExcel(reportData);
        showSuccessToast("Excel baixado com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
      showErrorToast(`Erro ao gerar relatório em ${format.toUpperCase()}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      paid: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      overdue: "bg-red-100 text-red-800",
    };

    const labels = {
      paid: "Pago",
      pending: "Pendente",
      overdue: "Vencido",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badges[status as keyof typeof badges]}`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">Relatórios</h2>
          <p className="text-slate-400">
            Gerar relatórios de alunos e pagamentos
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          ← Voltar
        </Button>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#C2A537]" />
            <p className="mt-2 text-sm text-gray-400">
              Carregando relatório...
            </p>
          </div>
        </div>
      ) : !reportData ? (
        <div className="flex h-96 items-center justify-center">
          <p className="text-gray-400">Nenhum dado disponível</p>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total de Alunos</p>
                    <p className="text-2xl font-bold text-white">
                      {reportData.overview.totalStudents}
                    </p>
                  </div>
                  <div className="rounded-lg bg-blue-500/20 p-2">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Receita Total</p>
                    <p className="text-2xl font-bold text-white">
                      {reportData.overview.totalRevenue}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-500/20 p-2">
                    <DollarSign className="h-5 w-5 text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Crescimento Mensal</p>
                    <p className="text-2xl font-bold text-white">
                      {reportData.overview.monthlyGrowth}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/20 p-2">
                    <TrendingUp className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Taxa de Pagamento</p>
                    <p className="text-2xl font-bold text-white">
                      {reportData.overview.paymentRate}%
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-500/20 p-2">
                    <CreditCard className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Report Type Selection */}
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#C2A537]">
                Tipos de Relatório
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  const isSelected = reportType === type.id;

                  return (
                    <motion.div
                      key={type.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        className={`cursor-pointer bg-black/40 backdrop-blur-sm transition-all duration-300 ${
                          isSelected
                            ? "border-[#C2A537] bg-[#C2A537]/20"
                            : "border-slate-600 hover:border-[#C2A537]/50 hover:bg-black/60"
                        }`}
                        onClick={() =>
                          setReportType(type.id as typeof reportType)
                        }
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`rounded-lg bg-linear-to-br p-2 ${type.color}`}
                            >
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3
                                className={`font-semibold ${isSelected ? "text-[#C2A537]" : "text-white"}`}
                              >
                                {type.title}
                              </h3>
                              <p className="text-sm text-gray-400">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters and Controls */}
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Filter className="h-5 w-5" />
                Filtros e Configurações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {/* Period Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#C2A537]">
                    Período
                  </label>
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  >
                    {periods.map((period) => (
                      <option key={period.value} value={period.value}>
                        {period.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#C2A537]">
                    Data Início
                  </label>
                  <Input
                    type="date"
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#C2A537]">
                    Data Fim
                  </label>
                  <Input
                    type="date"
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4">
                <Button
                  onClick={handleGenerateReport}
                  className="bg-[#C2A537] font-medium text-black hover:bg-[#B8A533]"
                >
                  <FileBarChart className="mr-2 h-4 w-4" />
                  Gerar Relatório
                </Button>

                <Button
                  onClick={() => handleDownloadReport("pdf")}
                  variant="outline"
                  className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537]/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button
                  onClick={() => handleDownloadReport("excel")}
                  variant="outline"
                  className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537]/10"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Excel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments Table */}
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#C2A537]">
                Pagamentos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.recentPayments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between rounded-lg border border-slate-600/50 bg-slate-800/30 p-3"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="rounded-lg bg-[#C2A537]/20 p-2">
                        <User className="h-4 w-4 text-[#C2A537]" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {payment.studentName}
                        </p>
                        <p className="text-sm text-gray-400">{payment.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-white">
                        {payment.amount}
                      </span>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Preview */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                  <BarChart3 className="h-5 w-5" />
                  Crescimento Mensal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.monthlyData.map((data) => (
                    <div
                      key={data.month}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray-400">{data.month}</span>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-white">
                            {data.students} alunos
                          </p>
                          <p className="text-sm text-gray-400">
                            R${" "}
                            {(data.revenue / 100).toFixed(2).replace(".", ",")}
                          </p>
                        </div>
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-700">
                          <div
                            className="h-full bg-linear-to-r from-[#C2A537] to-[#D4B547] transition-all duration-500"
                            style={{
                              width: `${(data.students / Math.max(...reportData.monthlyData.map((d) => d.students))) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                  <PieChart className="h-5 w-5" />
                  Status dos Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-gray-400">Em dia</span>
                    </div>
                    <span className="font-medium text-white">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <span className="text-gray-400">Pendente</span>
                    </div>
                    <span className="font-medium text-white">3.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <span className="text-gray-400">Vencido</span>
                    </div>
                    <span className="font-medium text-white">2.0%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </motion.div>
  );
}
