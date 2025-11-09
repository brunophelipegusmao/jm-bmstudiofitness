"use client";
import { createContext, ReactNode, useContext, useState } from "react";

import { ConfigurationValidator } from "@/lib/configurationValidator";

interface ConfigurationSettings {
  // Layout e Aparência
  theme: "light" | "dark" | "auto";
  dashboardLayout: "cards" | "table" | "compact" | "detailed";
  sidebarCollapsed: boolean;
  showAvatars: boolean;
  compactMode: boolean;
  showTooltips: boolean;
  animationsEnabled: boolean;

  // Tabelas e Visualizações
  studentsViewMode: "detailed" | "compact" | "table";
  showRowNumbers: boolean;
  itemsPerPage: number;
  sortBy: "name" | "date" | "payment";
  sortOrder: "asc" | "desc";

  // Sistema
  autoSave: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  sessionTimeout: number;

  // Notificações
  emailNotifications: boolean;
  pushNotifications: boolean;
  paymentReminders: boolean;
  birthdayAlerts: boolean;
  systemAlerts: boolean;

  // Estúdio
  gymName: string;
  address: string;
  phone: string;
  email: string;
  openTime: string;
  closeTime: string;

  // Dados Sensíveis
  hidePrivateDataByDefault: boolean;
  requirePasswordForSensitiveData: boolean;
  logDataAccess: boolean;
}

interface ConfigurationContextType {
  settings: ConfigurationSettings;
  updateSettings: (newSettings: Partial<ConfigurationSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: ConfigurationSettings = {
  // Layout e Aparência
  theme: "dark",
  dashboardLayout: "cards",
  sidebarCollapsed: false,
  showAvatars: true,
  compactMode: false,
  showTooltips: true,
  animationsEnabled: true,

  // Tabelas e Visualizações
  studentsViewMode: "detailed",
  showRowNumbers: true,
  itemsPerPage: 20,
  sortBy: "name",
  sortOrder: "asc",

  // Sistema
  autoSave: true,
  autoRefresh: true,
  refreshInterval: 30,
  sessionTimeout: 30,

  // Notificações
  emailNotifications: true,
  pushNotifications: false,
  paymentReminders: true,
  birthdayAlerts: true,
  systemAlerts: true,

  // Estúdio
  gymName: "JM Fitness Studio",
  address: "Rua das Flores, 123",
  phone: "(11) 99999-9999",
  email: "contato@jmfitness.com",
  openTime: "06:00",
  closeTime: "22:00",

  // Dados Sensíveis
  hidePrivateDataByDefault: true,
  requirePasswordForSensitiveData: false,
  logDataAccess: true,
};

const ConfigurationContext = createContext<
  ConfigurationContextType | undefined
>(undefined);

export function ConfigurationProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ConfigurationSettings>(() => {
    // Tentar carregar configurações do localStorage
    if (typeof window !== "undefined") {
      const savedSettings = localStorage.getItem("jmfitness-settings");
      if (savedSettings) {
        try {
          return { ...defaultSettings, ...JSON.parse(savedSettings) };
        } catch {
          return defaultSettings;
        }
      }
    }
    return defaultSettings;
  });

  const updateSettings = (newSettings: Partial<ConfigurationSettings>) => {
    // Validar configurações antes de aplicar
    const validation = ConfigurationValidator.validateSettings(newSettings);

    if (!validation.isValid) {
      console.warn("Configurações inválidas:", validation.errors);
      // Em produção, poderia mostrar um toast de erro
      return;
    }

    const updatedSettings = { ...settings, ...validation.sanitized };
    setSettings(updatedSettings);

    // Salvar no localStorage apenas se validação passou
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "jmfitness-settings",
          JSON.stringify(updatedSettings),
        );
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
      }
    }
  };

  const resetSettings = () => {
    setSettings(defaultSettings);

    // Limpar localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("jmfitness-settings");
    }
  };

  return (
    <ConfigurationContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </ConfigurationContext.Provider>
  );
}

export function useConfiguration() {
  const context = useContext(ConfigurationContext);
  if (context === undefined) {
    throw new Error(
      "useConfiguration must be used within a ConfigurationProvider",
    );
  }
  return context;
}

export type { ConfigurationSettings };
