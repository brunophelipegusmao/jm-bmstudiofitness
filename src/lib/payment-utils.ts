/**
 * Utilitários para verificação de pagamentos
 */

/**
 * Verifica se o pagamento está em dia baseado na data de vencimento
 * @param dueDate Dia do mês para vencimento (1-10)
 * @param lastPaymentDate Data do último pagamento
 * @param paid Status de pagamento atual
 * @returns true se o pagamento está em dia, false caso contrário
 */
export function isPaymentUpToDate(
  dueDate: number,
  lastPaymentDate: string | null,
  paid: boolean,
): boolean {
  // Usar UTC para evitar problemas com fuso horário
  const today = new Date();
  const currentDay = today.getUTCDate();
  const currentMonth = today.getUTCMonth();
  const currentYear = today.getUTCFullYear();

  // Se não tem data de último pagamento ou não está marcado como pago
  if (!lastPaymentDate || !paid) {
    // Está em dia apenas se ainda não passou do vencimento
    return currentDay <= dueDate;
  }

  try {
    const lastPayment = new Date(lastPaymentDate);
    const lastPaymentMonth = lastPayment.getUTCMonth();
    const lastPaymentYear = lastPayment.getUTCFullYear();

    // Verifica primeiro se o pagamento foi feito neste mês
    if (lastPaymentMonth === currentMonth && lastPaymentYear === currentYear) {
      return true;
    }

    // Se o pagamento foi feito no mês anterior e ainda não chegou no vencimento
    if (currentDay <= dueDate) {
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;

      if (
        lastPaymentMonth === previousMonth &&
        lastPaymentYear === previousYear
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Erro ao processar data de pagamento:", error);
    return false;
  }
}

/**
 * Calcula quantos dias restam até o vencimento
 * @param dueDate Dia do mês para vencimento (1-10)
 * @returns Número de dias até o vencimento (negativo se já venceu)
 */
export function getDaysUntilDue(dueDate: number): number {
  try {
    const today = new Date();
    const currentDay = today.getUTCDate();
    const currentMonth = today.getUTCMonth();
    const currentYear = today.getUTCFullYear();

    // Validar dueDate
    if (dueDate < 1 || dueDate > 31) {
      console.error("Data de vencimento inválida:", dueDate);
      return 0;
    }

    // Data de vencimento neste mês (UTC)
    const dueThisMonth = new Date(Date.UTC(currentYear, currentMonth, dueDate));

    // Se já passou do vencimento neste mês, calcular para o próximo mês
    if (currentDay > dueDate) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      const dueNextMonth = new Date(Date.UTC(nextYear, nextMonth, dueDate));

      const diffTime = dueNextMonth.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Ainda não venceu neste mês
    const diffTime = dueThisMonth.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error("Erro ao calcular dias até o vencimento:", error);
    return 0;
  }
}

/**
 * Verifica se um dia está dentro do limite de até o 10º dia útil
 * @param day Dia do mês (1-31)
 * @returns true se está dentro do limite, false caso contrário
 */
export function isValidDueDate(day: number): boolean {
  return day >= 1 && day <= 10;
}

/**
 * Formata o valor em centavos para exibição em reais
 * @param valueInCents Valor em centavos
 * @returns String formatada em reais (ex: "R$ 150,00")
 */
export function formatCurrency(valueInCents: number): string {
  const valueInReais = valueInCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInReais);
}

/**
 * Converte valor em reais para centavos
 * @param valueInReais Valor em reais
 * @returns Valor em centavos
 */
export function convertToCents(valueInReais: number): number {
  return Math.round(valueInReais * 100);
}

/**
 * Calcula quantos dias de atraso o usuário tem no pagamento
 * @param dueDate Dia do mês para vencimento (1-10)
 * @param lastPaymentDate Data do último pagamento
 * @param paid Status de pagamento atual
 * @returns Número de dias em atraso (0 se estiver em dia)
 */
export function getPaymentDelayDays(
  dueDate: number,
  lastPaymentDate: string | null,
  paid: boolean,
): number {
  if (paid && lastPaymentDate) {
    const lastPayment = new Date(lastPaymentDate);
    const today = new Date();

    // Se pagou neste mês, não há atraso
    if (
      lastPayment.getMonth() === today.getMonth() &&
      lastPayment.getFullYear() === today.getFullYear()
    ) {
      return 0;
    }
  }

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Data de vencimento neste mês
  const dueThisMonth = new Date(currentYear, currentMonth, dueDate);

  // Se ainda não passou do vencimento, não há atraso
  if (currentDay <= dueDate) {
    return 0;
  }

  // Calcular dias de atraso
  const diffTime = today.getTime() - dueThisMonth.getTime();
  const delayDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return delayDays;
}
