import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

import type { FinancialReportData } from "@/actions/admin/get-financial-reports-action";

/**
 * Adiciona cabeçalho com logo e timbre ao PDF
 * Corrigido: Removidos emojis problemáticos e ajustado layout
 */
function addPDFHeader(doc: jsPDF, title: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fundo do cabeçalho (dourado) - ALTURA AUMENTADA PARA 55
  doc.setFillColor(194, 165, 55); // #C2A537
  doc.rect(0, 0, pageWidth, 55, "F");

  // Borda dourada escura no topo
  doc.setFillColor(170, 145, 40);
  doc.rect(0, 0, pageWidth, 2, "F");

  // Logo - Círculo decorativo com JM (fallback sempre, pois PNG precisa ser carregado)
  doc.setFillColor(255, 255, 255);
  doc.circle(35, 28, 16, "F");
  doc.setFillColor(0, 0, 0);
  doc.circle(35, 28, 14, "F");
  
  doc.setTextColor(194, 165, 55);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("JM", 29, 31);

  // Nome da empresa
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("JM FITNESS STUDIO", 65, 18);

  // Slogan
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(40, 40, 40);
  doc.text("TRANSFORMANDO VIDAS ATRAVES DO TREINO", 65, 28);

  // Linha de contato (SEM EMOJIS - corrigido problema Ø)
  doc.setFontSize(8);
  doc.setTextColor(50, 50, 50);
  doc.text("Tel: (21) 98099-5749  |  Rio de Janeiro, RJ", 65, 36);

  // Título do relatório - POSIÇÃO MELHORADA (linha 45 ao invés de 22)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, pageWidth - titleWidth - 15, 45);

  // Linha divisória decorativa
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1.2);
  doc.line(15, 53, pageWidth - 15, 53);

  // Data e hora do relatório (sem emoji)
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const currentDate = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Gerado em: ${currentDate}`, 15, pageHeight - 10);
}

/**
 * Adiciona rodapé ao PDF
 */
function addPDFFooter(doc: jsPDF, pageNumber: number) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Linha divisória superior
  doc.setDrawColor(194, 165, 55);
  doc.setLineWidth(0.8);
  doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

  // Barra dourada inferior
  doc.setFillColor(194, 165, 55);
  doc.rect(0, pageHeight - 15, pageWidth, 15, "F");

  // Número da página
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text(`Pagina ${pageNumber}`, pageWidth / 2, pageHeight - 6, {
    align: "center",
  });

  // Assinatura esquerda
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.text("JM Fitness Studio", 15, pageHeight - 6);

  // Assinatura direita
  doc.text("(c) Todos os direitos reservados", pageWidth - 15, pageHeight - 6, {
    align: "right",
  });
}

/**
 * Gera PDF do relatório financeiro
 */
export function generateFinancialReportPDF(data: FinancialReportData) {
  const doc = new jsPDF();
  let currentY = 60; // AJUSTADO DE 50 PARA 60 (cabeçalho maior)

  // Adicionar cabeçalho
  addPDFHeader(doc, "RELATORIO FINANCEIRO");

  // Resumo executivo em destaque
  doc.setFillColor(240, 240, 240);
  doc.roundedRect(15, currentY, 180, 25, 2, 2, "F");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 165, 55);
  doc.text("RESUMO EXECUTIVO", 20, currentY + 7);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(60, 60, 60);
  doc.text(
    `Total de ${data.overview.totalStudents} alunos • ${data.overview.activeStudents} ativos (${data.overview.paymentRate}%)`,
    20,
    currentY + 14,
  );
  doc.text(
    `Receita: ${data.overview.totalRevenue} • Pendente: ${data.overview.pendingPayments} • Crescimento: ${data.overview.monthlyGrowth}%`,
    20,
    currentY + 20,
  );

  currentY += 35;

  // Seção: Visão Geral
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 165, 55);
  doc.text("INDICADORES FINANCEIROS", 15, currentY);
  currentY += 8;

  // Cards de overview
  const overviewData = [
    ["Total de Alunos", data.overview.totalStudents.toString()],
    ["Alunos Ativos", data.overview.activeStudents.toString()],
    ["Receita Total", data.overview.totalRevenue],
    ["Pagamentos Pendentes", data.overview.pendingPayments],
    ["Crescimento Mensal", `${data.overview.monthlyGrowth}%`],
    ["Taxa de Pagamento", `${data.overview.paymentRate}%`],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Indicador", "Valor"]],
    body: overviewData,
    theme: "grid",
    headStyles: {
      fillColor: [194, 165, 55],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 15, right: 15 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Seção: Pagamentos Recentes
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 165, 55);
  doc.text("ULTIMOS PAGAMENTOS", 15, currentY);
  currentY += 8;

  const paymentsData = data.recentPayments.map((payment) => [
    payment.studentName,
    payment.amount,
    payment.date,
    payment.status === "paid"
      ? "Pago"
      : payment.status === "pending"
        ? "Pendente"
        : "Vencido",
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Aluno", "Valor", "Data", "Status"]],
    body: paymentsData,
    theme: "grid",
    headStyles: {
      fillColor: [194, 165, 55],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 15, right: 15 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Seção: Dados Mensais
  if (currentY > 220) {
    doc.addPage();
    addPDFHeader(doc, "RELATORIO FINANCEIRO");
    addPDFFooter(doc, 1);
    currentY = 60; // AJUSTADO
  }

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(194, 165, 55);
  doc.text("EVOLUCAO MENSAL", 15, currentY);
  currentY += 8;

  const monthlyData = data.monthlyData.map((month) => [
    month.month,
    month.students.toString(),
    `R$ ${(month.revenue / 100).toFixed(2).replace(".", ",")}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Mes", "Alunos", "Receita"]],
    body: monthlyData,
    theme: "grid",
    headStyles: {
      fillColor: [194, 165, 55],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 15, right: 15 },
  });

  // Adicionar rodapé na última página
  addPDFFooter(doc, 1);

  // Download do PDF
  doc.save(
    `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.pdf`,
  );
}

/**
 * Gera Excel do relatório financeiro
 */
export function generateFinancialReportExcel(data: FinancialReportData) {
  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Sheet 1: Visão Geral
  const overviewData = [
    ["JM FITNESS STUDIO - RELATORIO FINANCEIRO"],
    [`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`],
    [],
    ["VISAO GERAL"],
    ["Indicador", "Valor"],
    ["Total de Alunos", data.overview.totalStudents],
    ["Alunos Ativos", data.overview.activeStudents],
    ["Receita Total", data.overview.totalRevenue],
    ["Pagamentos Pendentes", data.overview.pendingPayments],
    ["Crescimento Mensal", `${data.overview.monthlyGrowth}%`],
    ["Taxa de Pagamento", `${data.overview.paymentRate}%`],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(overviewData);

  // Estilizar cabeçalho (primeira linha)
  ws1["A1"] = { v: "JM FITNESS STUDIO - RELATORIO FINANCEIRO", t: "s" };

  // Ajustar largura das colunas
  ws1["!cols"] = [{ wch: 30 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws1, "Visao Geral");

  // Sheet 2: Pagamentos Recentes
  const paymentsHeader = [["Aluno", "Valor", "Data", "Status"]];
  const paymentsData = data.recentPayments.map((payment) => [
    payment.studentName,
    payment.amount,
    payment.date,
    payment.status === "paid"
      ? "Pago"
      : payment.status === "pending"
        ? "Pendente"
        : "Vencido",
  ]);

  const ws2 = XLSX.utils.aoa_to_sheet([
    ["PAGAMENTOS RECENTES"],
    [],
    ...paymentsHeader,
    ...paymentsData,
  ]);

  ws2["!cols"] = [{ wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 12 }];

  XLSX.utils.book_append_sheet(wb, ws2, "Pagamentos Recentes");

  // Sheet 3: Dados Mensais
  const monthlyHeader = [["Mes", "Alunos", "Receita"]];
  const monthlyData = data.monthlyData.map((month) => [
    month.month,
    month.students,
    `R$ ${(month.revenue / 100).toFixed(2).replace(".", ",")}`,
  ]);

  const ws3 = XLSX.utils.aoa_to_sheet([
    ["CRESCIMENTO MENSAL"],
    [],
    ...monthlyHeader,
    ...monthlyData,
  ]);

  ws3["!cols"] = [{ wch: 15 }, { wch: 12 }, { wch: 20 }];

  XLSX.utils.book_append_sheet(wb, ws3, "Crescimento Mensal");

  // Download do Excel
  XLSX.writeFile(
    wb,
    `relatorio-financeiro-${new Date().toISOString().split("T")[0]}.xlsx`,
  );
}
