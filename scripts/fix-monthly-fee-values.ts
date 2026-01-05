/**
 * Script para corrigir valores de mensalidade salvos incorretamente no banco
 *
 * Problema: Alguns valores foram salvos como centavos de centavos (multiplicados por 100 a mais)
 * Exemplo: R$ 150,00 deveria ser 15000 centavos, mas foi salvo como 1500000
 *
 * Este script:
 * 1. Lista todos os valores atuais
 * 2. Identifica valores suspeitos (> 500000 centavos = R$ 5000,00)
 * 3. Permite revisão antes de aplicar correções
 * 4. Corrige dividindo por 100 apenas os valores identificados como incorretos
 */

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { financialTable, usersTable } from "@/db/schema";
import { UserRole } from "@/types/user-roles";

interface StudentFinancial {
  userId: string;
  name: string;
  currentValueInCents: number;
  currentValueFormatted: string;
  correctedValueInCents: number;
  correctedValueFormatted: string;
  needsCorrection: boolean;
}

async function analyzeAndFixMonthlyFees() {
  console.log("🔍 Analisando valores de mensalidade...\n");

  // Buscar todos os alunos e seus valores
  const students = await db
    .select({
      userId: usersTable.id,
      name: usersTable.name,
      monthlyFeeInCents: financialTable.monthlyFeeValueInCents,
    })
    .from(financialTable)
    .innerJoin(usersTable, eq(financialTable.userId, usersTable.id))
    .where(
      and(
        eq(usersTable.userRole, UserRole.ALUNO),
        isNull(usersTable.deletedAt),
      ),
    );

  console.log(`📊 Total de alunos encontrados: ${students.length}\n`);

  // Analisar valores e identificar quais precisam correção
  const analysis: StudentFinancial[] = students.map((student) => {
    const currentValue = student.monthlyFeeInCents;
    // Valores acima de R$ 5.000,00 (500000 centavos) são suspeitos
    // Pois o máximo permitido no cadastro é R$ 5.000,00
    const needsCorrection = currentValue > 500000;
    const correctedValue = needsCorrection
      ? Math.round(currentValue / 100)
      : currentValue;

    return {
      userId: student.userId,
      name: student.name,
      currentValueInCents: currentValue,
      currentValueFormatted: formatCurrency(currentValue),
      correctedValueInCents: correctedValue,
      correctedValueFormatted: formatCurrency(correctedValue),
      needsCorrection,
    };
  });

  // Separar alunos que precisam e que não precisam de correção
  const needCorrection = analysis.filter((a) => a.needsCorrection);
  const alreadyCorrect = analysis.filter((a) => !a.needsCorrection);

  console.log("✅ Valores já corretos:");
  if (alreadyCorrect.length === 0) {
    console.log("   Nenhum valor correto encontrado.\n");
  } else {
    alreadyCorrect.forEach((student) => {
      console.log(
        `   ${student.name}: ${student.currentValueFormatted} (${student.currentValueInCents} centavos)`,
      );
    });
    console.log();
  }

  console.log("⚠️  Valores que precisam correção:");
  if (needCorrection.length === 0) {
    console.log("   Nenhum valor precisa ser corrigido! ✨\n");
    return;
  }

  needCorrection.forEach((student) => {
    console.log(`   ${student.name}:`);
    console.log(
      `      Atual: ${student.currentValueFormatted} (${student.currentValueInCents} centavos)`,
    );
    console.log(
      `      Correto: ${student.correctedValueFormatted} (${student.correctedValueInCents} centavos)`,
    );
    console.log();
  });

  // Calcular totais
  const currentTotal = students.reduce(
    (sum, s) => sum + s.monthlyFeeInCents,
    0,
  );
  const correctedTotal = analysis.reduce(
    (sum, a) => sum + a.correctedValueInCents,
    0,
  );

  console.log("📊 RESUMO:");
  console.log(`   Total atual: ${formatCurrency(currentTotal)}`);
  console.log(`   Total corrigido: ${formatCurrency(correctedTotal)}`);
  console.log(
    `   Diferença: ${formatCurrency(currentTotal - correctedTotal)}\n`,
  );

  console.log(
    `💾 Aplicando correções em ${needCorrection.length} registros...\n`,
  );

  // Aplicar correções
  let successCount = 0;
  let errorCount = 0;

  for (const student of needCorrection) {
    try {
      await db
        .update(financialTable)
        .set({
          monthlyFeeValueInCents: student.correctedValueInCents,
          updatedAt: new Date().toISOString().split("T")[0],
        })
        .where(eq(financialTable.userId, student.userId));

      console.log(
        `✅ ${student.name}: ${student.currentValueFormatted} → ${student.correctedValueFormatted}`,
      );
      successCount++;
    } catch (error) {
      console.error(`❌ Erro ao corrigir ${student.name}:`, error);
      errorCount++;
    }
  }

  console.log(`\n🎉 Correção concluída!`);
  console.log(`   ✅ Sucesso: ${successCount}`);
  console.log(`   ❌ Erros: ${errorCount}`);
  console.log(`   ℹ️  Já corretos: ${alreadyCorrect.length}`);
}

function formatCurrency(valueInCents: number): string {
  const valueInReais = valueInCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInReais);
}

// Executar o script
analyzeAndFixMonthlyFees()
  .then(() => {
    console.log("\n✨ Script finalizado com sucesso!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Erro ao executar script:", error);
    process.exit(1);
  });
