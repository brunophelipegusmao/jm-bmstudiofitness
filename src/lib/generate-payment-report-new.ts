import { jsPDF } from "jspdf";
import "jspdf-autotable";

import { StudentPaymentData } from "@/actions/admin/get-students-payments-action";
import { formatCurrency } from "@/lib/payment-utils";

export async function generatePaymentReport(
  students: StudentPaymentData[],
  type: "paid" | "pending",
): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = new jsPDF() as any;

  // Configuração do cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(
    `Relatório de Pagamentos ${type === "paid" ? "Em Dia" : "Pendentes"}`,
    15,
    20,
  );

  // Data do relatório
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 15, 30);

  // Tabela de alunos
  const tableData = students.map((student) => [
    student.name,
    formatCurrency(student.monthlyFeeValueInCents),
    `Dia ${student.dueDate}`,
    student.lastPaymentDate
      ? new Date(student.lastPaymentDate).toLocaleDateString("pt-BR")
      : "Nunca",
  ]);

  doc.autoTable({
    startY: 40,
    head: [["Nome", "Valor", "Vencimento", "Último Pagamento"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: type === "paid" ? [46, 125, 50] : [198, 40, 40],
      textColor: 255,
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Resumo financeiro
  const totalCents = students.reduce(
    (sum, student) => sum + student.monthlyFeeValueInCents,
    0,
  );

  const finalY = doc.lastAutoTable?.finalY ?? 40;

  doc.setFont("helvetica", "bold");
  doc.text("Resumo Financeiro:", 15, finalY + 20);
  doc.setFont("helvetica", "normal");
  doc.text(`Total de alunos: ${students.length}`, 15, finalY + 30);
  doc.text(`Valor total: ${formatCurrency(totalCents)}`, 15, finalY + 40);

  // Salvar o PDF
  doc.save(
    `relatorio-pagamentos-${
      type === "paid" ? "em-dia" : "pendentes"
    }-${new Date().toISOString().split("T")[0]}.pdf`,
  );
}
