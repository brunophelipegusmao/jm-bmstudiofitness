"use client";

import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudentCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    name: string;
    email: string;
    password: string;
  } | null;
}

export function StudentCredentialsModal({
  isOpen,
  onClose,
  credentials,
}: StudentCredentialsModalProps) {
  if (!credentials) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 text-white">
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Check className="h-6 w-6 text-green-500" />
          Aluno cadastrado com sucesso!
        </DialogTitle>

        <div className="mt-4 space-y-4">
          <p>O aluno foi cadastrado com as seguintes credenciais de acesso:</p>

          <div className="rounded-md bg-slate-800 p-4">
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Nome:</span> {credentials.name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                {credentials.email}
              </p>
              <p>
                <span className="font-semibold">Senha:</span>{" "}
                <code className="rounded bg-slate-700 px-1 py-0.5">
                  {credentials.password}
                </code>
              </p>
            </div>
          </div>

          <p className="text-sm text-slate-300">
            ⚠️ Por favor, forneça estas credenciais ao aluno de forma segura. O
            aluno poderá alterar sua senha após o primeiro acesso.
          </p>

          <div className="mt-4 flex justify-end">
            <Button
              onClick={onClose}
              className="bg-[#C2A537] hover:bg-[#A88E2E]"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
