"use client";

import { useEffect } from "react";

import {
  setupAutoClearOnPageClose,
  setupPeriodicCookieCleanup,
} from "@/lib/client-logout";

export function SecurityManager() {
  useEffect(() => {
    // Configurar limpeza automática ao fechar a página
    const cleanupPageClose = setupAutoClearOnPageClose();

    // Configurar limpeza periódica
    const cleanupPeriodic = setupPeriodicCookieCleanup();

    console.log("🔒 Sistema de segurança de cookies ativado");

    // Cleanup ao desmontar o componente
    return () => {
      if (cleanupPageClose) cleanupPageClose();
      if (cleanupPeriodic) cleanupPeriodic();
      console.log("🔓 Sistema de segurança de cookies desativado");
    };
  }, []);

  // Componente não renderiza nada visualmente
  return null;
}
