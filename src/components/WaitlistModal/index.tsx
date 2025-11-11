"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, ArrowRight } from "lucide-react";

import { getStudioSettingsAction } from "@/actions/admin/studio-settings-actions";

export default function WaitlistModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkWaitlistStatus();
  }, []);

  async function checkWaitlistStatus() {
    try {
      const result = await getStudioSettingsAction();

      if (result.success && result.data?.waitlistEnabled) {
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Erro ao verificar configurações:", error);
    } finally {
      setHasChecked(true);
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  if (!hasChecked) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="pointer-events-auto relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-[#C2A537]/30 bg-gradient-to-br from-black via-slate-900 to-black p-8 shadow-2xl shadow-[#C2A537]/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Background gradient effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#C2A537]/5 via-transparent to-[#C2A537]/10" />

              {/* Close button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#C2A537]/10 hover:text-[#C2A537]"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#C2A537] to-[#D4B547] shadow-lg shadow-[#C2A537]/30">
                    <Users className="h-10 w-10 text-black" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-4 text-center text-3xl font-bold text-[#C2A537]">
                  Ainda dá tempo!
                </h2>

                {/* Description */}
                <p className="mb-2 text-center text-lg font-medium text-white">
                  Entre na lista de espera
                </p>
                <p className="mb-8 text-center text-slate-400">
                  Logo abriremos novas turmas e entraremos em contato com você!
                </p>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/waitlist"
                    onClick={handleClose}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#C2A537] to-[#D4B547] py-4 font-bold text-black shadow-lg shadow-[#C2A537]/30 transition-all duration-200 hover:from-[#D4B547] hover:to-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/50"
                  >
                    Entrar na Lista de Espera
                    <ArrowRight className="h-5 w-5" />
                  </Link>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 font-medium text-slate-400 transition-colors hover:text-[#C2A537]"
                  >
                    Talvez mais tarde
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
