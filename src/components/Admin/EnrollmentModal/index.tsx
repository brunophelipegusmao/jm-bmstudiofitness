"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CheckCircle2, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
}

export default function EnrollmentModal({
  isOpen,
  onClose,
  studentName,
}: EnrollmentModalProps) {
  const router = useRouter();

  function handleGoToManageStudents() {
    router.push("/admin/dashboard?tab=administrative");
  }

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
            onClick={onClose}
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
                onClick={onClose}
                className="absolute top-4 right-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-[#C2A537]/10 hover:text-[#C2A537]"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Content */}
              <div className="relative">
                {/* Success Icon */}
                <div className="mb-6 flex justify-center">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg shadow-green-500/30">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="mb-4 text-center text-3xl font-bold text-[#C2A537]">
                  Usuário Criado!
                </h2>

                {/* Student Name */}
                <div className="mb-6 text-center">
                  <p className="mb-2 text-lg font-medium text-white">
                    {studentName}
                  </p>
                  <p className="text-sm text-slate-400">
                    foi cadastrado no sistema com sucesso.
                  </p>
                </div>

                {/* Info Box */}
                <div className="mb-8 space-y-4">
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                    <div className="flex gap-3">
                      <UserPlus className="h-5 w-5 shrink-0 text-blue-400" />
                      <div className="text-sm text-blue-400">
                        <p className="mb-2 font-semibold">Próximos passos:</p>
                        <ol className="list-decimal space-y-1 pl-4">
                          <li>
                            Clique em{" "}
                            <strong>
                              &quot;Ir para Cadastro de Alunos&quot;
                            </strong>{" "}
                            abaixo
                          </li>
                          <li>
                            Na tela que abrir, clique em{" "}
                            <strong>&quot;Gerenciar Alunos&quot;</strong>
                          </li>
                          <li>
                            Busque por <strong>{studentName}</strong>
                          </li>
                          <li>
                            Clique em <strong>&quot;Editar&quot;</strong> para
                            completar todos os dados
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleGoToManageStudents}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-[#C2A537] to-[#D4B547] px-6 py-4 font-bold text-black shadow-lg shadow-[#C2A537]/30 transition-all duration-200 hover:from-[#D4B547] hover:to-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/50"
                  >
                    Ir para Cadastro de Alunos
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <button
                    onClick={onClose}
                    className="w-full py-3 font-medium text-slate-400 transition-colors hover:text-[#C2A537]"
                  >
                    Completar depois
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
