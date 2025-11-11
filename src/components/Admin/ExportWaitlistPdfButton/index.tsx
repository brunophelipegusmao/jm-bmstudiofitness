"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

import { exportWaitlistPdfAction } from "@/actions/admin/export-waitlist-pdf-action";

export default function ExportWaitlistPdfButton() {
  const [isExporting, setIsExporting] = useState(false);

  async function handleExport() {
    try {
      setIsExporting(true);

      // Buscar dados formatados
      const result = await exportWaitlistPdfAction();

      if (!result.success || !result.data) {
        alert("Erro ao buscar dados da lista de espera");
        return;
      }

      // Criar documento PDF
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Configurar fonte
      doc.setFont("helvetica");

      // Título
      doc.setFontSize(18);
      doc.setTextColor(194, 165, 55); // Cor dourada #C2A537
      doc.text("LISTA DE ESPERA - JM FITNESS STUDIO", 148, 20, {
        align: "center",
      });

      // Data de geração
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const today = new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
      doc.text(`Gerado em: ${today}`, 148, 28, { align: "center" });

      // Tabela
      autoTable(doc, {
        startY: 35,
        head: [
          [
            "Pos.",
            "Nome Completo",
            "Email",
            "WhatsApp",
            "Turno",
            "Objetivo",
            "Restrições",
            "Status",
            "Data",
          ],
        ],
        body: result.data.map((entry) => [
          entry.position,
          entry.fullName,
          entry.email,
          entry.whatsapp,
          entry.preferredShift,
          entry.goal,
          entry.healthRestrictions,
          entry.status,
          entry.createdAt,
        ]),
        theme: "striped",
        headStyles: {
          fillColor: [194, 165, 55], // Cor dourada #C2A537
          textColor: [0, 0, 0],
          fontStyle: "bold",
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        columnStyles: {
          0: { cellWidth: 12, halign: "center" }, // Posição
          1: { cellWidth: 35 }, // Nome
          2: { cellWidth: 40 }, // Email
          3: { cellWidth: 28 }, // WhatsApp
          4: { cellWidth: 18, halign: "center" }, // Turno
          5: { cellWidth: 45 }, // Objetivo
          6: { cellWidth: 40 }, // Restrições
          7: { cellWidth: 22, halign: "center" }, // Status
          8: { cellWidth: 20, halign: "center" }, // Data
        },
        margin: { top: 35, left: 10, right: 10 },
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `Página ${i} de ${pageCount}`,
          148,
          doc.internal.pageSize.height - 10,
          { align: "center" },
        );
        doc.text(
          "JM Fitness Studio - Lista de Espera",
          10,
          doc.internal.pageSize.height - 10,
        );
      }

      // Salvar PDF
      const fileName = `lista-espera-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#C2A537] to-[#D4B547] px-4 py-2 font-semibold text-black shadow-lg transition-all duration-200 hover:from-[#D4B547] hover:to-[#C2A537] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Gerando PDF...
        </>
      ) : (
        <>
          <FileDown className="h-4 w-4" />
          Exportar PDF
        </>
      )}
    </button>
  );
}
