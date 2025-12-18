"use client";

import { useEffect } from "react";

import {
  setupAutoClearOnPageClose,
  setupPeriodicCookieCleanup,
} from "@/lib/client-logout";

/**
 * SessionManager
 *
 * Componente responsável por gerenciar a sessão do usuário e garantir
 * que os tokens JWT sejam limpos quando:
 * - O navegador é fechado
 * - A aba é fechada
 * - O usuário faz logout
 * - A sessão fica inativa por 30 minutos
 * - A página fica oculta por 1 minuto (mobile)
 */
export function SessionManager() {
  useEffect(() => {
    console.log("🔐 SessionManager: Inicializando gerenciamento de sessão...");

    // Configurar limpeza automática ao fechar página/navegador
    const cleanupPageClose = setupAutoClearOnPageClose();

    // Configurar limpeza periódica de cookies suspeitos
    const cleanupPeriodic = setupPeriodicCookieCleanup();

    console.log("✅ SessionManager: Proteção de tokens ativada");
    console.log("📋 Tokens serão limpos automaticamente ao:");
    console.log("   ✓ Fechar o navegador");
    console.log("   ✓ Fechar a aba");
    console.log("   ✓ 30 minutos de inatividade");
    console.log("   ✓ 1 minuto com página oculta (mobile)");

    // Cleanup ao desmontar componente
    return () => {
      console.log("🔐 SessionManager: Removendo listeners de sessão");
      if (cleanupPageClose) cleanupPageClose();
      if (cleanupPeriodic) cleanupPeriodic();
    };
  }, []);

  // Este componente não renderiza nada visualmente
  return null;
}
