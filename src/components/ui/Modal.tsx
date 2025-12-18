"use client";

import { CheckCircle, X, XCircle } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
}

export function Modal({ isOpen, onClose, type, title, message }: ModalProps) {
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-md rounded-lg border bg-linear-to-b from-slate-900 via-slate-900 to-black p-6 shadow-2xl"
        style={{
          borderColor: type === "success" ? "#C2A537" : "#ef4444",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 transition-colors hover:text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Icon */}
        <div className="mb-4 flex justify-center">
          {type === "success" ? (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C2A537]/20">
              <CheckCircle className="h-10 w-10 text-[#C2A537]" />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 text-center">
          <h3
            className="text-xl font-bold"
            style={{
              color: type === "success" ? "#C2A537" : "#ef4444",
            }}
          >
            {title}
          </h3>
          <p className="text-slate-300">{message}</p>
        </div>

        {/* Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-lg px-4 py-3 font-semibold text-black transition-all hover:opacity-90"
            style={{
              background:
                type === "success"
                  ? "linear-gradient(to right, #C2A537, #D4B547)"
                  : "linear-gradient(to right, #ef4444, #dc2626)",
              color: type === "success" ? "#000" : "#fff",
            }}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  );
}
