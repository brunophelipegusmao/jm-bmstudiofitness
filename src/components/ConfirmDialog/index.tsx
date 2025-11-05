"use client";

import { AnimatePresence,motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "warning" | "danger" | "info";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      // Previne scroll do body quando modal está aberto
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!mounted) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          bg: "from-red-900/90 to-red-800/90",
          border: "border-red-500/50",
          confirmBtn: "bg-red-600 hover:bg-red-700",
          icon: "text-red-400",
        };
      case "info":
        return {
          bg: "from-blue-900/90 to-blue-800/90",
          border: "border-blue-500/50",
          confirmBtn: "bg-blue-600 hover:bg-blue-700",
          icon: "text-blue-400",
        };
      default: // warning
        return {
          bg: "from-black/95 via-[#1b1b1a]/95 to-black/95",
          border: "border-[#C2A537]/60",
          confirmBtn:
            "bg-gradient-to-r from-[#C2A537] to-[#D4B547] hover:from-[#D4B547] hover:to-[#E6C658] text-black font-semibold shadow-lg shadow-[#C2A537]/25",
          icon: "text-[#C2A537]",
        };
    }
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
            style={{
              background: `
                radial-gradient(circle at 20% 80%, rgba(194, 165, 55, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(194, 165, 55, 0.1) 0%, transparent 50%),
                rgba(0, 0, 0, 0.9)
              `,
            }}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={`relative w-full max-w-md rounded-2xl border-2 ${styles.border} bg-gradient-to-br ${styles.bg} p-6 shadow-2xl shadow-black/50 backdrop-blur-xl`}
          >
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <motion.div
                  className={`rounded-xl border border-[#C2A537]/30 bg-gradient-to-br from-black/50 to-black/80 p-3 ${styles.icon}`}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogOut className="h-6 w-6" />
                </motion.div>
                <div>
                  <h3 className="mb-1 text-xl font-bold text-white">{title}</h3>
                  <div className="h-0.5 w-12 bg-gradient-to-r from-[#C2A537] to-[#D4B547]" />
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="rounded-lg p-2 transition-colors hover:bg-white/10"
              >
                <X className="h-5 w-5 text-gray-400 hover:text-white" />
              </motion.button>
            </div>

            {/* Message */}
            <p className="mb-6 leading-relaxed text-gray-300">{message}</p>

            {/* Actions */}
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-600 px-4 py-2.5 font-medium text-gray-300 transition-all duration-200 hover:bg-gray-700/50 hover:text-white"
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                className={`flex-1 rounded-xl px-4 py-2.5 font-medium ${styles.confirmBtn} shadow-lg transition-all duration-200`}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
