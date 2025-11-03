"use client";

import { Eye, EyeOff, Shield } from "lucide-react";
import { useState } from "react";

import { SecurityModal } from "@/components/SecurityModal";
import { Button } from "@/components/ui/button";
import { useSecurityValidation } from "@/hooks/useSecurityValidation";

interface SensitiveDataProps {
  data: string;
  type: "cpf" | "phone" | "email" | "address" | "medical" | "payment";
  studentId?: string;
  label?: string;
  className?: string;
  showToggle?: boolean;
}

export function SensitiveData({
  data,
  type,
  studentId,
  label,
  className = "",
  showToggle = true,
}: SensitiveDataProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const {
    validateSensitiveDataAccess,
    logDataAccess,
    shouldHideSensitiveData,
    maskSensitiveData,
    requiresPassword,
  } = useSecurityValidation();

  const shouldHide = shouldHideSensitiveData(type);
  const maskedData =
    type === "cpf" || type === "phone" || type === "email"
      ? maskSensitiveData(data, type)
      : "***";

  const handleReveal = async () => {
    if (requiresPassword) {
      setShowSecurityModal(true);
    } else {
      setIsRevealed(true);
      if (studentId) {
        logDataAccess(studentId, type, "view");
      }
    }
  };

  const handlePasswordValidation = async (password: string) => {
    const result = await validateSensitiveDataAccess(password);
    if (result.isValid) {
      setIsRevealed(true);
      if (studentId) {
        logDataAccess(studentId, type, "view");
      }
    }
    return result;
  };

  const displayData = shouldHide && !isRevealed ? maskedData : data;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {label && <span className="text-sm text-slate-400">{label}:</span>}

      <span className="font-mono text-white">{displayData}</span>

      {shouldHide && showToggle && (
        <Button
          size="sm"
          variant="ghost"
          onClick={isRevealed ? () => setIsRevealed(false) : handleReveal}
          className="h-6 w-6 p-0 text-slate-400 hover:text-[#C2A537]"
          title={isRevealed ? "Ocultar dados" : "Revelar dados"}
        >
          {isRevealed ? (
            <EyeOff className="h-3 w-3" />
          ) : (
            <Eye className="h-3 w-3" />
          )}
        </Button>
      )}

      {requiresPassword && shouldHide && (
        <div title="Dados protegidos por senha">
          <Shield className="h-3 w-3 text-yellow-500" />
        </div>
      )}

      <SecurityModal
        isOpen={showSecurityModal}
        onClose={() => setShowSecurityModal(false)}
        onValidate={handlePasswordValidation}
        title="Acesso a Dados Sensíveis"
        description={`Para revelar ${label || type}, confirme sua senha.`}
      />
    </div>
  );
}
