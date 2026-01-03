"use client";

import { format } from "date-fns";

import type { StudentFullProfile } from "@/actions/admin/get-student-full-profile-action";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface StudentViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StudentFullProfile | null;
}

export function StudentViewModal({ isOpen, onClose, data }: StudentViewModalProps) {
  if (!data) return null;
  const { student, health, financial, checkIns } = data;

  const formatDate = (value?: string | Date | null) => {
    if (!value) return "-";
    try {
      return format(new Date(value), "dd/MM/yyyy");
    } catch {
      return String(value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl bg-black/90 text-white border border-[#C2A537]/30">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#C2A537]">
            Detalhes do aluno
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto pr-3">
          <div className="space-y-6">
            <section className="rounded-lg border border-[#C2A537]/20 bg-black/40 p-4">
              <h3 className="mb-3 text-lg font-semibold text-white">Dados pessoais</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Info label="Nome" value={student.name} />
                <Info label="E-mail" value={student.email} />
                <Info label="CPF" value={student.cpf} />
                <Info label="Telefone" value={student.telephone} />
                <Info label="Endereco" value={student.address} />
                <Info label="Data de nascimento" value={formatDate(student.bornDate)} />
                <Info label="Status" value={student.isActive ? "Ativo" : "Inativo"} />
                <Info label="Perfil" value={student.userRole ?? "aluno"} />
              </div>
            </section>

            <section className="rounded-lg border border-[#C2A537]/20 bg-black/40 p-4">
              <h3 className="mb-3 text-lg font-semibold text-white">Saúde</h3>
              {health ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Info label="Altura" value={health.heightCm ?? "-"} />
                  <Info label="Peso" value={health.weightKg ?? "-"} />
                  <Info label="Tipo sanguineo" value={health.bloodType ?? "-"} />
                  <Info label="Atualizado em" value={formatDate(health.updatedAt as string)} />
                  <Info label="Historico esportes" value={health.sportsHistory ?? "-"} />
                  <Info label="Observações" value={health.otherNotes ?? "-"} />
                </div>
              ) : (
                <p className="text-sm text-slate-300">Sem dados de Saúde.</p>
              )}
            </section>

            <section className="rounded-lg border border-[#C2A537]/20 bg-black/40 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Financeiro</h3>
                {financial.length > 0 && (
                  <Badge className="bg-[#C2A537]/20 text-[#C2A537]">
                    {financial[0].paid ? "Em dia" : "Pendente"}
                  </Badge>
                )}
              </div>
              {financial.length === 0 ? (
                <p className="text-sm text-slate-300">Sem registros financeiros.</p>
              ) : (
                <div className="space-y-2 pt-2">
                  {financial.map((fin) => (
                    <div
                      key={fin.id}
                      className="rounded border border-[#C2A537]/10 bg-black/30 p-3 text-sm"
                    >
                      <div className="flex flex-wrap gap-4">
                        <span>Valor: R$ {(fin.amountInCents / 100).toFixed(2)}</span>
                        <span>Vencimento: {fin.dueDate ?? "-"}</span>
                        <span>Pagamento: {fin.paid ? "Pago" : "Em aberto"}</span>
                        <span>Metodo: {fin.paymentMethod ?? "-"}</span>
                        <span>Ultimo pagamento: {formatDate(fin.lastPaymentDate)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-lg border border-[#C2A537]/20 bg-black/40 p-4">
              <h3 className="mb-3 text-lg font-semibold text-white">Check-ins recentes</h3>
              {checkIns.length === 0 ? (
                <p className="text-sm text-slate-300">Sem check-ins registrados.</p>
              ) : (
                <div className="space-y-2 text-sm text-slate-200">
                  {checkIns.slice(0, 10).map((c) => (
                    <div
                      key={c.id}
                      className="rounded border border-[#C2A537]/10 bg-black/30 p-2"
                    >
                      <div className="flex flex-wrap gap-3">
                        <span>{formatDate(c.checkInDate)}</span>
                        <span>{c.checkInTime ?? "-"}</span>
                        <span>Metodo: {c.method ?? "-"}</span>
                        <span>ID: {c.identifier ?? "-"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col rounded border border-[#C2A537]/10 bg-black/30 p-3">
      <span className="text-xs uppercase tracking-wide text-[#C2A537]/80">
        {label}
      </span>
      <span className="text-sm text-slate-100">{value ?? "-"}</span>
    </div>
  );
}
