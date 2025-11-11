"use client";

import {
  Clock,
  Mail,
  Phone,
  Settings,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getStudioSettingsAction,
  updateStudioSettingsAction,
} from "@/actions/admin/studio-settings-actions";
import {
  completeEnrollFromWaitlistAction,
  deleteWaitlistEntryAction,
  getWaitlistAdminAction,
} from "@/actions/admin/waitlist-actions";
import CompleteEnrollmentModal from "@/components/Admin/CompleteEnrollmentModal";
import ExportWaitlistPdfButton from "@/components/Admin/ExportWaitlistPdfButton";

interface WaitlistEntry {
  id: string;
  fullName: string;
  email: string;
  whatsapp: string;
  preferredShift: string;
  goal: string;
  healthRestrictions: string | null;
  position: number;
  status: string;
  createdAt: Date;
  enrolledAt: Date | null;
  userId: string | null;
}

export function AdminSettingsTab() {
  const [waitlistEnabled, setWaitlistEnabled] = useState(false);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [enrollmentModal, setEnrollmentModal] = useState<{
    isOpen: boolean;
    waitlistData: WaitlistEntry | null;
  }>({
    isOpen: false,
    waitlistData: null,
  });

  useEffect(() => {
    loadSettings();
    loadWaitlist();
  }, []);

  async function loadSettings() {
    try {
      const result = await getStudioSettingsAction();
      if (result.success && result.data) {
        setWaitlistEnabled(result.data.waitlistEnabled || false);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  }

  async function loadWaitlist() {
    try {
      const result = await getWaitlistAdminAction();
      if (result.success && result.data) {
        setWaitlist(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleWaitlist() {
    setUpdating(true);
    setMessage(null);

    try {
      const result = await updateStudioSettingsAction({
        waitlistEnabled: !waitlistEnabled,
      });

      if (result.success) {
        setWaitlistEnabled(!waitlistEnabled);
        setMessage({
          type: "success",
          text: `Lista de espera ${!waitlistEnabled ? "ativada" : "desativada"} com sucesso!`,
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao atualizar configuração",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao atualizar configuração",
      });
    } finally {
      setUpdating(false);
    }
  }

  async function handleDeleteEntry(id: string) {
    if (!confirm("Tem certeza que deseja remover esta entrada?")) return;

    try {
      const result = await deleteWaitlistEntryAction(id);
      if (result.success) {
        setMessage({ type: "success", text: "Entrada removida com sucesso" });
        loadWaitlist();
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao remover entrada",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erro ao remover entrada" });
    }
  }

  async function handleEnroll(entry: WaitlistEntry) {
    // Abrir modal com os dados pré-preenchidos
    setEnrollmentModal({
      isOpen: true,
      waitlistData: entry,
    });
  }

  async function handleCompleteEnrollment(
    data: {
      fullName: string;
      cpf: string;
      email: string;
      telephone: string;
      address: string;
      bornDate: string;
      sex: "masculino" | "feminino";
      monthlyFeeValue: string;
      paymentMethod: string;
      dueDate: string;
    },
    waitlistId: string,
  ) {
    try {
      const result = await completeEnrollFromWaitlistAction({
        waitlistId,
        ...data,
      });

      if (result.success) {
        loadWaitlist();
        return {
          success: true,
          userId: result.userId,
          password: result.password,
        };
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao matricular",
        });
        return {
          success: false,
          error: result.error || "Erro ao matricular",
        };
      }
    } catch (error) {
      console.error("Erro ao matricular:", error);
      setMessage({ type: "error", text: "Erro ao matricular" });
      return {
        success: false,
        error: "Erro ao matricular",
      };
    }
  }

  function getShiftLabel(shift: string) {
    const shifts: Record<string, string> = {
      manha: "Manhã",
      tarde: "Tarde",
      noite: "Noite",
    };
    return shifts[shift] || shift;
  }

  function getStatusBadge(status: string) {
    const badges: Record<string, { label: string; className: string }> = {
      waiting: {
        label: "Aguardando",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
      enrolled: {
        label: "Matriculado",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
    };

    const badge = badges[status] || badges.waiting;
    return (
      <span
        className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${badge.className}`}
      >
        {badge.label}
      </span>
    );
  }

  const waitingCount = waitlist.filter((w) => w.status === "waiting").length;

  return (
    <div className="space-y-8">
      {/* Mensagem de feedback */}
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === "success"
              ? "border-green-500/30 bg-green-500/10 text-green-400"
              : "border-red-500/30 bg-red-500/10 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Configurações Gerais */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center gap-3">
          <Settings className="h-6 w-6 text-[#C2A537]" />
          <h2 className="text-2xl font-bold text-white">
            Configurações Gerais
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
            <div>
              <h3 className="mb-1 font-semibold text-white">Lista de Espera</h3>
              <p className="text-sm text-zinc-400">
                Quando ativada, visitantes verão um modal direcionando para a
                lista de espera
              </p>
            </div>
            <button
              onClick={handleToggleWaitlist}
              disabled={updating}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                waitlistEnabled ? "bg-green-500" : "bg-zinc-700"
              } disabled:opacity-50`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                  waitlistEnabled ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          {waitlistEnabled && (
            <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="text-sm text-blue-400">
                ℹ️ A lista de espera está ativa. Visitantes da home page verão
                um modal informando sobre a lista de espera.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Gerenciamento da Lista de Espera */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-[#C2A537]" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                Gerenciar Lista de Espera
              </h2>
              <p className="text-sm text-zinc-400">
                {waitingCount} pessoa(s) aguardando
              </p>
            </div>
          </div>

          <ExportWaitlistPdfButton />
        </div>

        {loading ? (
          <div className="py-8 text-center text-zinc-500">Carregando...</div>
        ) : waitlist.length === 0 ? (
          <div className="py-8 text-center text-zinc-500">
            Nenhuma pessoa na lista de espera
          </div>
        ) : (
          <div className="space-y-4">
            {waitlist.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-5 transition-colors hover:border-zinc-600"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#C2A537]/30 bg-[#C2A537]/20">
                      <span className="text-lg font-bold text-[#C2A537]">
                        {entry.position}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {entry.fullName}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        {getStatusBadge(entry.status)}
                        <span className="text-xs text-zinc-500">
                          <Clock className="mr-1 inline h-3 w-3" />
                          {new Date(entry.createdAt).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {entry.status === "waiting" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEnroll(entry)}
                        className="flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-medium text-white transition-colors hover:bg-green-600"
                      >
                        <UserPlus className="h-4 w-4" />
                        Matricular
                      </button>
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="rounded-lg p-2 text-red-400 transition-colors hover:bg-red-500/20"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Mail className="h-4 w-4" />
                    {entry.email}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Phone className="h-4 w-4" />
                    {entry.whatsapp}
                  </div>
                  <div className="flex items-center gap-2 text-zinc-400">
                    <Clock className="h-4 w-4" />
                    Turno: {getShiftLabel(entry.preferredShift)}
                  </div>
                </div>

                <div className="mt-3 rounded-lg bg-zinc-900/50 p-3">
                  <p className="mb-1 text-xs font-medium text-zinc-500">
                    Objetivo:
                  </p>
                  <p className="text-sm text-zinc-300">{entry.goal}</p>
                </div>

                {entry.healthRestrictions && (
                  <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                    <p className="mb-1 text-xs font-medium text-red-400">
                      Restrições de Saúde:
                    </p>
                    <p className="text-sm text-red-300">
                      {entry.healthRestrictions}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Matrícula Completa */}
      {enrollmentModal.isOpen && enrollmentModal.waitlistData && (
        <CompleteEnrollmentModal
          isOpen={enrollmentModal.isOpen}
          onClose={() =>
            setEnrollmentModal({ isOpen: false, waitlistData: null })
          }
          waitlistData={enrollmentModal.waitlistData}
          onEnroll={handleCompleteEnrollment}
        />
      )}
    </div>
  );
}
