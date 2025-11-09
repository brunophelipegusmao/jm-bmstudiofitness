"use client";

import { useCallback, useState } from "react";

import { useConfiguration } from "@/contexts/ConfigurationContext";

interface SecurityValidationResult {
  isValid: boolean;
  error?: string;
}

export function useSecurityValidation() {
  const { settings } = useConfiguration();
  const [isValidating, setIsValidating] = useState(false);

  // Simula validação de senha para dados sensíveis
  const validateSensitiveDataAccess = useCallback(
    async (password?: string): Promise<SecurityValidationResult> => {
      if (!settings.requirePasswordForSensitiveData) {
        return { isValid: true };
      }

      if (!password) {
        return {
          isValid: false,
          error: "Senha é obrigatória para acessar dados sensíveis",
        };
      }

      setIsValidating(true);

      try {
        // Simular validação de senha (em produção, isso seria uma API call)
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Por enquanto, aceitar qualquer senha (em produção, validar com backend)
        if (password.length < 4) {
          return { isValid: false, error: "Senha muito curta" };
        }

        return { isValid: true };
      } catch (error) {
        return { isValid: false, error: "Erro interno de validação" };
      } finally {
        setIsValidating(false);
      }
    },
    [settings.requirePasswordForSensitiveData],
  );

  // Log de acesso a dados sensíveis
  const logDataAccess = useCallback(
    (
      studentId: string,
      dataType: string,
      action: "view" | "edit" | "export",
    ) => {
      if (!settings.logDataAccess) return;

      const logEntry = {
        timestamp: new Date().toISOString(),
        studentId,
        dataType,
        action,
        userId: "current-admin", // Em produção, pegar do contexto de auth
        ip: "unknown", // Em produção, pegar IP real
      };

      // Salvar no localStorage (em produção, enviar para API)
      const logs = JSON.parse(
        localStorage.getItem("jmfitness-access-logs") || "[]",
      );
      logs.push(logEntry);

      // Manter apenas os últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem("jmfitness-access-logs", JSON.stringify(logs));
    },
    [settings.logDataAccess],
  );

  // Verificar se dados devem ser ocultos
  const shouldHideSensitiveData = useCallback(
    (
      dataType: "cpf" | "phone" | "address" | "medical" | "payment" | "email",
    ) => {
      if (!settings.hidePrivateDataByDefault) return false;

      // Sempre ocultar dados médicos e financeiros por padrão
      if (dataType === "medical" || dataType === "payment") return true;

      return settings.hidePrivateDataByDefault;
    },
    [settings.hidePrivateDataByDefault],
  );

  // Mascarar dados sensíveis
  const maskSensitiveData = useCallback(
    (value: string, type: "cpf" | "phone" | "email") => {
      if (!value) return "";

      switch (type) {
        case "cpf":
          return value.replace(/(\d{3})\d{3}(\d{3})/, "$1.***.$2-**");
        case "phone":
          return value.replace(/(\d{2})\d{5}(\d{4})/, "($1) *****-$2");
        case "email":
          const [user, domain] = value.split("@");
          return `${user.slice(0, 2)}***@${domain}`;
        default:
          return "***";
      }
    },
    [],
  );

  return {
    validateSensitiveDataAccess,
    logDataAccess,
    shouldHideSensitiveData,
    maskSensitiveData,
    isValidating,
    requiresPassword: settings.requirePasswordForSensitiveData,
    logsEnabled: settings.logDataAccess,
  };
}
