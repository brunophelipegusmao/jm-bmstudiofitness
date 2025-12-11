"use client";

import { AlertCircle, CheckCircle, X } from "lucide-react";
import { useEffect } from "react";

interface FormFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
  details?: string[];
}

export function FormFeedbackModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  details,
}: FormFeedbackModalProps) {
  console.log("📢 [FEEDBACK MODAL] isOpen:", isOpen, "type:", type);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const colors = {
    success: {
      bg: "bg-green-900/90",
      border: "border-green-500",
      icon: "text-green-400",
      button: "bg-green-600 hover:bg-green-700",
    },
    error: {
      bg: "bg-red-900/90",
      border: "border-red-500",
      icon: "text-red-400",
      button: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      bg: "bg-amber-900/90",
      border: "border-amber-500",
      icon: "text-amber-400",
      button: "bg-amber-600 hover:bg-amber-700",
    },
  };

  const config = colors[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div
        className={`animate-in zoom-in-95 relative w-full max-w-md rounded-lg border-2 ${config.border} ${config.bg} p-6 shadow-2xl backdrop-blur-sm duration-300`}
      >
        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Ícone e Título */}
        <div className="mb-4 flex items-start gap-3">
          <div className={`mt-1 ${config.icon}`}>
            {type === "success" ? (
              <CheckCircle className="h-8 w-8" />
            ) : (
              <AlertCircle className="h-8 w-8" />
            )}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
        </div>

        {/* Mensagem */}
        <p className="mb-4 text-slate-200">{message}</p>

        {/* Detalhes (lista de erros ou informações adicionais) */}
        {details && details.length > 0 && (
          <div className="mb-4 rounded-md border border-white/20 bg-black/30 p-3">
            <p className="mb-2 text-sm font-semibold text-white">Detalhes:</p>
            <ul className="space-y-1 text-sm text-slate-300">
              {details.map((detail, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Botão de ação */}
        <button
          onClick={onClose}
          className={`w-full rounded-md px-4 py-2 font-semibold text-white transition-colors ${config.button}`}
        >
          {type === "success" ? "Entendi" : "Fechar"}
        </button>
      </div>
    </div>
  );
}
