"use client";

import { ConfigurationSettings } from "@/contexts/ConfigurationContext";

export class ConfigurationValidator {
  // Validar configurações antes de salvar
  static validateSettings(settings: Partial<ConfigurationSettings>): {
    isValid: boolean;
    errors: string[];
    sanitized: Partial<ConfigurationSettings>;
  } {
    const errors: string[] = [];
    const sanitized: Partial<ConfigurationSettings> = {};

    // Validar e sanitizar cada campo
    for (const [key, value] of Object.entries(settings)) {
      try {
        switch (key) {
          // Validações de Layout
          case "theme":
            if (typeof value === "string" && ["light", "dark", "auto"].includes(value)) {
              sanitized.theme = value as "light" | "dark" | "auto";
            } else {
              errors.push("Tema inválido");
            }
            break;

          case "dashboardLayout":
            if (
              typeof value === "string" &&
              ["cards", "table", "compact", "detailed"].includes(value)
            ) {
              sanitized.dashboardLayout = value as
                | "cards"
                | "table"
                | "compact"
                | "detailed";
            } else {
              errors.push("Layout do dashboard inválido");
            }
            break;

          case "studentsViewMode":
            if (typeof value === "string" && ["detailed", "compact", "table"].includes(value)) {
              sanitized.studentsViewMode = value as
                | "detailed"
                | "compact"
                | "table";
            } else {
              errors.push("Modo de visualização de estudantes inválido");
            }
            break;

          // Validações de números
          case "itemsPerPage":
            const itemsPerPage = Number(value);
            if (itemsPerPage >= 5 && itemsPerPage <= 100) {
              sanitized.itemsPerPage = itemsPerPage;
            } else {
              errors.push("Items por página deve estar entre 5 e 100");
            }
            break;

          case "refreshInterval":
            const refreshInterval = Number(value);
            if (refreshInterval >= 10 && refreshInterval <= 300) {
              sanitized.refreshInterval = refreshInterval;
            } else {
              errors.push(
                "Intervalo de atualização deve estar entre 10 e 300 segundos",
              );
            }
            break;

          case "sessionTimeout":
            const sessionTimeout = Number(value);
            if (sessionTimeout >= 5 && sessionTimeout <= 480) {
              sanitized.sessionTimeout = sessionTimeout;
            } else {
              errors.push("Timeout da sessão deve estar entre 5 e 480 minutos");
            }
            break;

          // Validações de texto (sanitização)
          case "gymName":
            if (typeof value === "string") {
              const sanitizedText = this.sanitizeText(value, 100);
              if (sanitizedText.length > 0) {
                sanitized.gymName = sanitizedText;
              } else {
                errors.push(`${key} não pode estar vazio`);
              }
            }
            break;

          case "address":
            if (typeof value === "string") {
              const sanitizedText = this.sanitizeText(value, 100);
              if (sanitizedText.length > 0) {
                sanitized.address = sanitizedText;
              } else {
                errors.push(`${key} não pode estar vazio`);
              }
            }
            break;

          case "phone":
            if (typeof value === "string") {
              const sanitizedPhone = this.sanitizePhone(value);
              if (sanitizedPhone) {
                sanitized.phone = sanitizedPhone;
              } else {
                errors.push("Formato de telefone inválido");
              }
            }
            break;

          case "email":
            if (typeof value === "string") {
              const sanitizedEmail = this.sanitizeEmail(value);
              if (sanitizedEmail) {
                sanitized.email = sanitizedEmail;
              } else {
                errors.push("Formato de email inválido");
              }
            }
            break;

          case "openTime":
            if (typeof value === "string") {
              const sanitizedTime = this.sanitizeTime(value);
              if (sanitizedTime) {
                sanitized.openTime = sanitizedTime;
              } else {
                errors.push(`${key} deve ter formato HH:MM`);
              }
            }
            break;

          case "closeTime":
            if (typeof value === "string") {
              const sanitizedTime = this.sanitizeTime(value);
              if (sanitizedTime) {
                sanitized.closeTime = sanitizedTime;
              } else {
                errors.push(`${key} deve ter formato HH:MM`);
              }
            }
            break;

          // Validações de ordenação
          case "sortBy":
            if (typeof value === "string" && ["name", "date", "payment"].includes(value)) {
              sanitized.sortBy = value as "name" | "date" | "payment";
            } else {
              errors.push("Campo de ordenação inválido");
            }
            break;

          case "sortOrder":
            if (typeof value === "string" && ["asc", "desc"].includes(value)) {
              sanitized.sortOrder = value as "asc" | "desc";
            } else {
              errors.push("Ordem de classificação inválida");
            }
            break;

          // Validações booleanas
          case "sidebarCollapsed":
            if (typeof value === "boolean") {
              sanitized.sidebarCollapsed = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "showAvatars":
            if (typeof value === "boolean") {
              sanitized.showAvatars = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "compactMode":
            if (typeof value === "boolean") {
              sanitized.compactMode = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "showTooltips":
            if (typeof value === "boolean") {
              sanitized.showTooltips = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "animationsEnabled":
            if (typeof value === "boolean") {
              sanitized.animationsEnabled = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "showRowNumbers":
            if (typeof value === "boolean") {
              sanitized.showRowNumbers = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "autoSave":
            if (typeof value === "boolean") {
              sanitized.autoSave = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "autoRefresh":
            if (typeof value === "boolean") {
              sanitized.autoRefresh = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "emailNotifications":
            if (typeof value === "boolean") {
              sanitized.emailNotifications = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "pushNotifications":
            if (typeof value === "boolean") {
              sanitized.pushNotifications = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "paymentReminders":
            if (typeof value === "boolean") {
              sanitized.paymentReminders = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "birthdayAlerts":
            if (typeof value === "boolean") {
              sanitized.birthdayAlerts = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "systemAlerts":
            if (typeof value === "boolean") {
              sanitized.systemAlerts = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "hidePrivateDataByDefault":
            if (typeof value === "boolean") {
              sanitized.hidePrivateDataByDefault = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "requirePasswordForSensitiveData":
            if (typeof value === "boolean") {
              sanitized.requirePasswordForSensitiveData = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;
          case "logDataAccess":
            if (typeof value === "boolean") {
              sanitized.logDataAccess = value;
            } else {
              errors.push(`${key} deve ser verdadeiro ou falso`);
            }
            break;

          default:
            // Ignorar campos desconhecidos
            break;
        }
      } catch (error) {
        errors.push(`Erro ao validar ${key}: ${error}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitized,
    };
  }

  // Sanitizar texto removendo caracteres perigosos
  static sanitizeText(text: string, maxLength: number = 255): string {
    return text
      .trim()
      .replace(/[<>]/g, "") // Remove potenciais tags HTML
      .replace(/['"]/g, "") // Remove aspas
      .slice(0, maxLength);
  }

  // Sanitizar telefone
  static sanitizePhone(phone: string): string | null {
    const cleaned = phone.replace(/\D/g, "");

    // Aceitar formatos brasileiros (10 ou 11 dígitos)
    if (cleaned.length === 10 || cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{4,5})(\d{4})/, "($1) $2-$3");
    }

    return null;
  }

  // Sanitizar email
  static sanitizeEmail(email: string): string | null {
    const sanitized = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(sanitized) && sanitized.length <= 100) {
      return sanitized;
    }

    return null;
  }

  // Sanitizar horário (HH:MM)
  static sanitizeTime(time: string): string | null {
    const timeRegex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;

    if (timeRegex.test(time)) {
      return time;
    }

    return null;
  }

  // Verificar configurações de segurança
  static validateSecuritySettings(settings: ConfigurationSettings): {
    isSecure: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Verificar configurações de privacidade
    if (!settings.hidePrivateDataByDefault) {
      warnings.push("Dados sensíveis são exibidos por padrão");
      recommendations.push(
        "Considere ocultar dados sensíveis por padrão para maior segurança",
      );
    }

    if (!settings.requirePasswordForSensitiveData) {
      warnings.push("Acesso a dados sensíveis não requer senha");
      recommendations.push(
        "Habilite a verificação de senha para dados sensíveis",
      );
    }

    if (!settings.logDataAccess) {
      warnings.push("Acessos a dados não são registrados");
      recommendations.push("Habilite o log de acessos para auditoria");
    }

    // Verificar timeout da sessão
    if (settings.sessionTimeout > 60) {
      warnings.push("Timeout da sessão muito longo");
      recommendations.push("Configure um timeout menor para maior segurança");
    }

    // Verificar configurações de notificação
    if (!settings.systemAlerts) {
      warnings.push("Alertas do sistema desabilitados");
      recommendations.push(
        "Habilite alertas do sistema para ser notificado sobre eventos importantes",
      );
    }

    return {
      isSecure: warnings.length === 0,
      warnings,
      recommendations,
    };
  }
}
