"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (
    password: string,
  ) => Promise<{ isValid: boolean; error?: string }>;
  title?: string;
  description?: string;
}

export function SecurityModal({
  isOpen,
  onClose,
  onValidate,
  title = "Acesso a Dados Sensíveis",
  description = "Para sua segurança, confirme sua senha para acessar esses dados.",
}: SecurityModalProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsValidating(true);

    try {
      const result = await onValidate(password);

      if (result.isValid) {
        setPassword("");
        onClose();
      } else {
        setError(result.error || "Senha incorreta");
      }
    } catch {
      setError("Erro interno. Tente novamente.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleClose = () => {
    setPassword("");
    setError("");
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg border border-[#C2A537]/30 bg-black/90 p-6 shadow-2xl">
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#C2A537]/20">
            <Lock className="h-6 w-6 text-[#C2A537]" />
          </div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="security-password" className="text-white">
              Senha
            </Label>
            <div className="relative mt-1">
              <Input
                id="security-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="border-slate-600 bg-slate-800 pr-10 text-white"
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-500/20 bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800"
              disabled={isValidating}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-[#C2A537] text-black hover:bg-[#D4B547]"
              disabled={isValidating || !password}
            >
              {isValidating ? "Validando..." : "Confirmar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
