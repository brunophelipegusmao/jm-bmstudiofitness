"use client";

import { Dumbbell } from "lucide-react";
import { useEffect } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";

interface CheckInSuccessModalProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckInSuccessModal({
  userName,
  isOpen,
  onClose,
}: CheckInSuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      console.log("Modal aberto, iniciando timer...");
      const timer = setTimeout(() => {
        console.log("Timer finalizado, fechando modal...");
        onClose();
      }, 5000);

      return () => {
        console.log("Limpando timer...");
        clearTimeout(timer);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  console.log("Renderizando modal de sucesso", { userName, isOpen });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white sm:max-w-md">
        <DialogTitle className="flex items-center gap-3 text-2xl text-[#C2A537]">
          <Dumbbell className="h-8 w-8 animate-bounce" />
          Check-in Concluído!
        </DialogTitle>
        <DialogDescription className="text-center text-lg text-slate-300">
          <div className="space-y-4">
            <p>Bem-vindo(a), {userName}!</p>
            <p>Check-in realizado com sucesso!</p>
            <div className="mt-2 text-2xl font-bold text-[#C2A537]">
              Vejo você suado!!!
            </div>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
