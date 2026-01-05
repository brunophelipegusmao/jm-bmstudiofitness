"use client";

import { motion } from "framer-motion";
import { Clock, Loader2, UserCheck } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { quickCheckInAction } from "@/actions/user/quick-check-in-action";
import { CheckInSuccessModal } from "@/components/CheckInSuccessModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface QuickCheckInState {
  success: boolean;
  message: string;
  userName?: string;
}

const initialState: QuickCheckInState = {
  success: false,
  message: "",
};

export default function QuickCheckInCard() {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [state, formAction, isPending] = useActionState(
    quickCheckInAction,
    initialState,
  );

  const duplicateMessage = (() => {
    const normalized = state.message.toLowerCase();
    return (
      normalized.includes("ja registrado para hoje") ||
      normalized.includes("já registrado para hoje")
    );
  })();

  // Mostrar modal quando o check-in for bem sucedido
  useEffect(() => {
    if (state.success) {
      setShowSuccessModal(true);
      setShowDuplicateModal(false);
      return;
    }

    if (duplicateMessage) {
      setShowDuplicateModal(true);
    }
  }, [state.success, state.message, duplicateMessage]);

  return (
    <div className="flex flex-1 justify-center">
      <div className="perspective-1000 relative">
        {/* Background decorativo para o card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="absolute -inset-4 animate-pulse rounded-3xl bg-linear-to-l from-[#C2A537]/15 via-[#C2A537]/5 to-[#C2A537]/15 blur-xl"
        ></motion.div>

        <motion.div
          initial={{ rotateX: 15, rotateY: 15, z: -100 }}
          animate={{ rotateX: 0, rotateY: 0, z: 0 }}
          whileHover={{
            rotateX: -5,
            rotateY: -5,
            z: 50,
            transition: { duration: 0.3 },
          }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ transformStyle: "preserve-3d" }}
          className="transform-gpu"
        >
          <Card className="hover:shadow-3xl relative w-[400px] max-w-md border-2 border-[#C2A537]/50 bg-black/95 shadow-2xl shadow-[#C2A537]/20 backdrop-blur-lg transition-all duration-300 hover:shadow-[#C2A537]/30 md:max-w-lg lg:max-w-xl">
            <CardHeader>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <CardTitle className="flex items-center gap-3 bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-xl font-bold text-transparent md:text-2xl">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <UserCheck className="h-6 w-6 text-[#C2A537]" />
                  </motion.div>
                  Check-in Rápido
                </CardTitle>
                <CardDescription className="text-sm text-slate-300 md:text-base">
                  Digite seu CPF ou email para registrar sua presença
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                {state.message && !duplicateMessage && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className={`mb-4 rounded-lg border p-3 text-sm backdrop-blur-sm ${
                      state.success
                        ? "border-green-500/50 bg-green-900/20 text-green-300"
                        : "border-red-500/50 bg-red-900/20 text-red-300"
                    }`}
                  >
                    {state.message}
                  </motion.div>
                )}

                <form action={formAction} className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1 }}
                    className="grid gap-3"
                  >
                    <Label
                      htmlFor="identifier"
                      className="font-medium text-[#C2A537]"
                    >
                      CPF ou Email
                    </Label>
                    <Input
                      id="identifier"
                      name="identifier"
                      type="text"
                      placeholder="12345678900 ou e-mail"
                      required
                      disabled={isPending}
                      className="border-[#C2A537]/30 bg-slate-900/50 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]/20"
                    />
                  </motion.div>

                  {/* Espaçamento adicional para igualar altura do login */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                    className="grid gap-3"
                  >
                    <div className="text-center">
                      <p className="text-sm text-slate-400">
                        Acesso rápido e seguro para check-in
                      </p>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.2 }}
                  >
                    <Button
                      type="submit"
                      disabled={isPending}
                      className="w-full transform bg-linear-to-r from-[#C2A537] to-[#D4B547] font-semibold text-black transition-all duration-700 hover:scale-[1.02] hover:from-[#D4B547] hover:to-[#E6C658] hover:shadow-xl hover:shadow-[#C2A537]/30 active:scale-[0.98]"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Fazendo Check-in...
                        </>
                      ) : (
                        <>
                          <Clock className="mr-2 h-4 w-4" />
                          Fazer Check-in
                        </>
                      )}
                    </Button>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 1.4 }}
                    className="text-center"
                  >
                    <p className="text-sm text-slate-400">
                      O check-in registra sua presença no estúdio hoje
                    </p>
                  </motion.div>
                </form>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de sucesso de check-in */}
        <CheckInSuccessModal
          userName={state.userName || ""}
          isOpen={showSuccessModal && !!state.userName && state.success}
          onClose={() => setShowSuccessModal(false)}
        />

        {showDuplicateModal && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-[#C2A537]/50 bg-slate-900/95 p-6 text-center shadow-2xl shadow-[#C2A537]/30">
              <h3 className="text-xl font-semibold text-[#C2A537]">
                Você já suou bastante hoje, nos vemos amanhã!
              </h3>
              <p className="mt-3 text-sm text-slate-200">
                Apenas um check-in é permitido por dia.
              </p>
              <Button
                className="mt-5 w-full bg-[#C2A537] text-black hover:bg-[#C2A537]/90"
                onClick={() => setShowDuplicateModal(false)}
              >
                Entendido
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
