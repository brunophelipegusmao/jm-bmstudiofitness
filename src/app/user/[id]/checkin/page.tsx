"use client";

import { useActionState, useEffect, useState } from "react";

import { checkInAction, CheckInFormState } from "@/actions/user/checkin-action";
import { Button } from "@/components/Button";
import { CheckInSuccessModal } from "@/components/CheckInSuccessModal";
import { Container } from "@/components/Container";
import { FieldError } from "@/components/FieldError";
import { PaymentWarningDialog } from "@/components/PaymentWarningDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatDatePtBR,
  getDayOfWeekName,
  getNextMonday,
  isCheckInAllowed,
} from "@/lib/checkin-utils";

const initialState: CheckInFormState = {
  success: false,
  message: "",
};

export default function CheckInPage() {
  const [state, formAction, isPending] = useActionState(
    checkInAction,
    initialState,
  );
  const [identifier, setIdentifier] = useState("");
  const [inputType, setInputType] = useState<"cpf" | "email" | "unknown">(
    "unknown",
  );
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Detectar tipo de input baseado no que o usuário digita
  useEffect(() => {
    if (identifier.length === 0) {
      setInputType("unknown");
    } else if (/^\d{1,11}$/.test(identifier)) {
      setInputType("cpf");
    } else if (identifier.includes("@")) {
      setInputType("email");
    } else {
      setInputType("unknown");
    }
  }, [identifier]);

  const getFieldError = (fieldName: string): string | undefined => {
    return state.errors?.[fieldName]?.[0];
  };

  const getInputPlaceholder = () => {
    switch (inputType) {
      case "cpf":
        return "12345678901";
      case "email":
        return "seu@email.com";
      default:
        return "Digite seu CPF ou email";
    }
  };

  const getInputLabel = () => {
    switch (inputType) {
      case "cpf":
        return "CPF (11 dígitos)";
      case "email":
        return "Email";
      default:
        return "CPF ou Email";
    }
  };

  // Mostrar modal de sucesso e limpar formulário após check-in bem sucedido
  useEffect(() => {
    if (state.success && state.userName) {
      console.log("Check-in bem sucedido, mostrando modal...", {
        success: state.success,
        userName: state.userName,
      });

      setIdentifier("");
      setShowSuccessModal(true);
    }
  }, [state.success, state.userName]);

  // Mostrar dialog de pagamento quando necessário
  useEffect(() => {
    if (state.showPaymentDialog) {
      setShowPaymentDialog(true);
    }
  }, [state.showPaymentDialog]);

  return (
    <Container>
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br py-8">
        <Card className="w-[450px] max-w-md border-[#C2A537] bg-black/95 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#C2A537]">
              Check-in de Aluno
            </CardTitle>
            <CardDescription className="text-slate-300">
              Digite seu CPF ou email para confirmar sua presença
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Indicador de horário atual */}
            <div className="mb-6 rounded-md border border-[#C2A537]/30 bg-[#C2A537]/10 p-3 text-center">
              <p className="text-sm font-medium text-[#C2A537]">
                {new Date().toLocaleString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Sao_Paulo",
                })}
              </p>
            </div>

            {/* Aviso de final de semana */}
            {!isCheckInAllowed() && (
              <div className="mb-6 rounded-md border border-yellow-600 bg-yellow-900/50 p-4 text-center text-yellow-300">
                <div className="mb-2 flex items-center justify-center">
                  <span className="text-2xl">🚫</span>
                </div>
                <p className="font-medium">
                  Estúdio fechado nos finais de semana
                </p>
                <p className="mt-2 text-sm opacity-80">
                  Check-ins são permitidos apenas de segunda a sexta-feira.
                </p>
                <p className="mt-1 text-sm opacity-80">
                  Próximo check-in disponível: {formatDatePtBR(getNextMonday())}
                </p>
              </div>
            )}

            {/* Mensagem de erro - não mostrar se for erro de pagamento (será mostrado no dialog) */}
            {state.message && !state.showPaymentDialog && !state.success && (
              <div className="mb-6 rounded-md border border-red-600 bg-red-900/50 p-4 text-center text-red-300">
                <div className="mb-2 flex items-center justify-center">
                  <span className="text-2xl">❌</span>
                </div>
                <p className="font-medium">{state.message}</p>
              </div>
            )}

            {/* Modal de sucesso */}
            <CheckInSuccessModal
              userName={state.userName || ""}
              isOpen={showSuccessModal && !!state.userName && state.success}
              onClose={() => {
                console.log("Fechando modal de sucesso...");
                setShowSuccessModal(false);
              }}
            />

            <form action={formAction} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-[#C2A537]">
                  {getInputLabel()} *
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={getInputPlaceholder()}
                  required
                  autoComplete="off"
                  disabled={!isCheckInAllowed()}
                  className={`border-[#867536] py-3 text-lg focus:border-[#C2A537] ${
                    !isCheckInAllowed()
                      ? "cursor-not-allowed bg-gray-300 text-gray-500"
                      : "bg-[#d7ceac] text-black"
                  }`}
                />
                {getFieldError("identifier") && (
                  <FieldError>{getFieldError("identifier")}</FieldError>
                )}

                {/* Dicas visuais */}
                <div className="mt-2 text-xs text-slate-400">
                  {inputType === "cpf" && (
                    <p>💡 Digite apenas números (11 dígitos)</p>
                  )}
                  {inputType === "email" && <p>💡 Digite seu email completo</p>}
                  {inputType === "unknown" && identifier.length > 0 && (
                    <p>⚠️ Digite um CPF (11 números) ou email válido</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={
                  isPending || identifier.length === 0 || !isCheckInAllowed()
                }
                className="w-full py-4 text-lg"
              >
                {!isCheckInAllowed() ? (
                  <span className="flex items-center gap-2">
                    <span>🚫</span>
                    Check-in indisponível nos finais de semana
                  </span>
                ) : isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Verificando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span>📝</span>
                    Fazer Check-in
                  </span>
                )}
              </Button>
            </form>

            {/* Informações adicionais */}
            <div className="mt-8 border-t border-[#C2A537]/30 pt-6">
              <h3 className="mb-3 text-center font-medium text-[#C2A537]">
                Informações Importantes
              </h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Você só pode fazer check-in uma vez por dia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Use o mesmo CPF ou email do seu cadastro</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>•</span>
                  <span>Em caso de problemas, procure a recepção</span>
                </li>
              </ul>
              {/* Aviso sobre pagamentos */}``
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dialog de advertência de pagamento */}
      {state.showPaymentDialog && state.userName && state.paymentInfo && (
        <PaymentWarningDialog
          isOpen={showPaymentDialog}
          onClose={() => {
            setShowPaymentDialog(false);
            setIdentifier(""); // Limpar o formulário ao fechar
          }}
          userName={state.userName}
          paymentInfo={state.paymentInfo}
        />
      )}
    </Container>
  );
}
