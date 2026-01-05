"use client";

import {
  Clock,
  Image as ImageIcon,
  Mail,
  Phone,
  PlayCircle,
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
import { AcademySettingsView } from "@/components/Dashboard/AcademySettingsView";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
  const [bannerSaving, setBannerSaving] = useState(false);
  const [homeSaving, setHomeSaving] = useState(false);
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
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [bannerMediaType, setBannerMediaType] = useState<"image" | "video">(
    "image",
  );
  const [bannerUrl, setBannerUrl] = useState("");
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerDescription, setBannerDescription] = useState("");
  const [carouselEnabled, setCarouselEnabled] = useState(true);
  const [carouselImages, setCarouselImages] = useState<string[]>(
    Array(7).fill(""),
  );
  const [carouselCaptions, setCarouselCaptions] = useState<string[]>(
    Array(7).fill(""),
  );
  const [historyMarkdown, setHistoryMarkdown] = useState("");
  const [historyImage, setHistoryImage] = useState("");
  const [foundationDate, setFoundationDate] = useState("");
  const { user } = useCurrentUser();

  const tabs = [
    { id: "home", label: "Home" },
    { id: "banner", label: "Banner" },
    { id: "waitlist", label: "Lista de Espera" },
    { id: "academy", label: "Dados da Academia" },
  ] as const;
  // Abre diretamente a lista de espera ao entrar em settings
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]["id"]>(
    "waitlist",
  );

  useEffect(() => {
    void loadSettings();
    void loadWaitlist();
  }, []);

  async function loadSettings() {
    try {
      const result = await getStudioSettingsAction();
      if (result.success && result.data) {
        setWaitlistEnabled(result.data.waitlistEnabled || false);
        setCarouselEnabled(result.data.carouselEnabled !== false);
        setCarouselImages([
          result.data.carouselImage1 || "",
          result.data.carouselImage2 || "",
          result.data.carouselImage3 || "",
          result.data.carouselImage4 || "",
          result.data.carouselImage5 || "",
          result.data.carouselImage6 || "",
          result.data.carouselImage7 || "",
        ]);
        setCarouselCaptions([
          result.data.carouselCaption1 || "",
          result.data.carouselCaption2 || "",
          result.data.carouselCaption3 || "",
          result.data.carouselCaption4 || "",
          result.data.carouselCaption5 || "",
          result.data.carouselCaption6 || "",
          result.data.carouselCaption7 || "",
        ]);
        setHistoryMarkdown(result.data.homeHistoryMarkdown || "");
        setHistoryImage(result.data.homeHistoryImage || "");
        setFoundationDate(result.data.foundationDate || "");
        setBannerEnabled(result.data.promoBannerEnabled ?? false);
        setBannerMediaType(result.data.promoBannerMediaType ?? "image");
        setBannerUrl(result.data.promoBannerUrl ?? "");
        setBannerTitle(result.data.promoBannerTitle ?? "");
        setBannerDescription(result.data.promoBannerDescription ?? "");
      }
    } catch (error) {
      console.error("Erro ao carregar configuracoes:", error);
    }
  }

  async function loadWaitlist() {
    try {
      const result = await getWaitlistAdminAction();
      if (result.success && result.data) {
        setWaitlist(result.data);
      } else if (!result.success) {
        setMessage({
          type: "error",
          text: result.error || "Erro ao carregar lista de espera",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
      setMessage({
        type: "error",
        text: "Erro ao carregar lista de espera",
      });
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
        const enabled = !waitlistEnabled;
        setWaitlistEnabled(enabled);
        setMessage({
          type: "success",
          text: `Lista de espera ${enabled ? "ativada" : "desativada"} com sucesso!`,
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao atualizar configuracao",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao atualizar configuracao",
      });
    } finally {
      setUpdating(false);
    }
  }

  async function handleSaveBanner() {
    setBannerSaving(true);
    setMessage(null);

    try {
      const result = await updateStudioSettingsAction({
        promoBannerEnabled: bannerEnabled,
        promoBannerMediaType: bannerMediaType,
        promoBannerUrl: bannerUrl || null,
        promoBannerTitle: bannerTitle || null,
        promoBannerDescription: bannerDescription || null,
      });

      if (result.success) {
        setMessage({
          type: "success",
          text: "Banner atualizado com sucesso!",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao salvar banner",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar banner:", error);
      setMessage({
        type: "error",
        text: "Erro ao salvar banner",
      });
    } finally {
      setBannerSaving(false);
    }
  }

  async function handleSaveHome() {
    setHomeSaving(true);
    setMessage(null);

    const filledImages = carouselImages.filter((img) => img && img.trim() !== "");
    if (carouselEnabled && filledImages.length < 3) {
      setMessage({
        type: "error",
        text: "Para habilitar o carrossel, informe pelo menos 3 imagens.",
      });
      setHomeSaving(false);
      return;
    }

    try {
      const payload = {
        carouselEnabled,
        carouselImage1: carouselImages[0] || null,
        carouselImage2: carouselImages[1] || null,
        carouselImage3: carouselImages[2] || null,
        carouselImage4: carouselImages[3] || null,
        carouselImage5: carouselImages[4] || null,
        carouselImage6: carouselImages[5] || null,
        carouselImage7: carouselImages[6] || null,
        carouselCaption1: carouselCaptions[0] || null,
        carouselCaption2: carouselCaptions[1] || null,
        carouselCaption3: carouselCaptions[2] || null,
        carouselCaption4: carouselCaptions[3] || null,
        carouselCaption5: carouselCaptions[4] || null,
        carouselCaption6: carouselCaptions[5] || null,
        carouselCaption7: carouselCaptions[6] || null,
        homeHistoryMarkdown: historyMarkdown || null,
        homeHistoryImage: historyImage || null,
        foundationDate: foundationDate || null,
      };

      const result = await updateStudioSettingsAction(payload);
      if (result.success) {
        setMessage({
          type: "success",
          text: "Configurações da home atualizadas com sucesso!",
        });
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao salvar configurações da home",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar home:", error);
      setMessage({
        type: "error",
        text: "Erro ao salvar configurações da home",
      });
    } finally {
      setHomeSaving(false);
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

  async function handleDeleteAllWaitlist() {
    const notEnrolled = waitlist.filter(
      (entry) => entry.status !== "enrolled" && entry.status !== "converted",
    );

    const baseWarning =
      "Tem certeza que deseja apagar toda a lista de espera? Esta ação não pode ser desfeita.";

    if (notEnrolled.length > 0) {
      const proceed = confirm(
        `${baseWarning}\n\nHá ${notEnrolled.length} pessoas não matriculadas. Deseja continuar mesmo assim?`,
      );
      if (!proceed) return;
    } else {
      const proceed = confirm(baseWarning);
      if (!proceed) return;
    }

    try {
      setUpdating(true);
      const result = await deleteWaitlistEntryAction("all");
      if (result.success) {
        setMessage({ type: "success", text: "Lista de espera apagada" });
        setWaitlist([]);
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao apagar lista de espera",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao apagar lista de espera",
      });
    } finally {
      setUpdating(false);
    }
  }

  function handleEnroll(entry: WaitlistEntry) {
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
        setMessage({
          type: "success",
          text:
            "Matrícula concluída. Enviamos um e-mail para o aluno criar a senha e confirmar o cadastro.",
        });
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
      manha: "Manha",
      tarde: "Tarde",
      noite: "Noite",
    };
    return shifts[shift] || shift;
  }

  function getStatusBadge(status: string) {
    const badges: Record<string, { label: string; className: string }> = {
      pending: {
        label: "Pendente",
        className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      },
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

  const waitingCount = waitlist.filter(
    (w) => w.status === "waiting" || w.status === "pending",
  ).length;

  if (user && user.role !== "admin" && user.role !== "master") {
    return (
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-zinc-200">
        Acesso restrito. Apenas administradores e master podem editar estas configurações.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2 overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/70 p-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`min-w-[140px] rounded-lg px-4 py-2 text-sm font-semibold transition ${
              activeTab === tab.id
                ? "bg-[#C2A537] text-black shadow-lg shadow-[#C2A537]/30"
                : "text-zinc-300 hover:bg-zinc-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

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

      {activeTab === "home" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C2A537]/10 text-[#C2A537]">
              <ImageIcon className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Home</h2>
              <p className="text-sm text-zinc-400">
                Configure carrossel, história e métricas da página inicial.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              <div>
                <h3 className="mb-1 font-semibold text-white">Ativar carrossel</h3>
                <p className="text-sm text-zinc-400">
                  Quando ativo, é necessário ter pelo menos 3 imagens.
                </p>
              </div>
              <button
                onClick={() => setCarouselEnabled((v) => !v)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  carouselEnabled ? "bg-green-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    carouselEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {carouselImages.map((img, index) => (
                <div key={index} className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-sm text-zinc-300">
                      Imagem {index + 1}
                      {index < 3 && <span className="text-[#C2A537]"> *</span>}
                    </label>
                    <input
                      type="url"
                      value={img}
                      onChange={(e) => {
                        const next = [...carouselImages];
                        next[index] = e.target.value;
                        setCarouselImages(next);
                      }}
                      placeholder="https://..."
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm text-zinc-300">Legenda {index + 1}</label>
                    <input
                      type="text"
                      value={carouselCaptions[index] || ""}
                      onChange={(e) => {
                        const next = [...carouselCaptions];
                        next[index] = e.target.value;
                        setCarouselCaptions(next);
                      }}
                      placeholder="Legenda exibida sobre a imagem"
                      className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-zinc-300">História (Markdown)</label>
                <RichTextEditor
                  value={historyMarkdown}
                  onChange={setHistoryMarkdown}
                  placeholder="Conte a história do estúdio..."
                  minHeight={200}
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm text-zinc-300">Imagem da seção</label>
                  <input
                    type="url"
                    value={historyImage}
                    onChange={(e) => setHistoryImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-zinc-300">Data de fundação</label>
                  <input
                    type="date"
                    value={foundationDate}
                    onChange={(e) => setFoundationDate(e.target.value)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                  />
                  <p className="text-xs text-zinc-500">
                    Usada para calcular anos de experiência exibidos na home.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveHome}
                disabled={homeSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C2A537] px-4 py-2 font-semibold text-black transition hover:bg-[#D4B547] disabled:opacity-60"
              >
                {homeSaving ? "Salvando..." : "Salvar configurações da home"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "banner" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C2A537]/10 text-[#C2A537]">
              {bannerMediaType === "video" ? (
                <PlayCircle className="h-7 w-7" />
              ) : (
                <ImageIcon className="h-7 w-7" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Banner / Modal da Home
              </h2>
              <p className="text-sm text-zinc-400">
                Defina um banner de imagem ou vídeo curto para exibir como modal ao acessar a home (/).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
              <div>
                <h3 className="mb-1 font-semibold text-white">
                  Ativar banner modal
                </h3>
                <p className="text-sm text-zinc-400">
                  Quando ativo e com URL preenchida, um modal será exibido apenas na página inicial.
                </p>
              </div>
              <button
                onClick={() => setBannerEnabled((v) => !v)}
                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                  bannerEnabled ? "bg-green-500" : "bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                    bannerEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-zinc-300">Tipo</label>
                <select
                  value={bannerMediaType}
                  onChange={(e) =>
                    setBannerMediaType(e.target.value as "image" | "video")
                  }
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white"
                >
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo curto</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm text-zinc-300">
                  URL da imagem ou do vídeo
                </label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://... (mp4, jpg, png ou link embed YouTube)"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm text-zinc-300">Título (opcional)</label>
                <input
                  type="text"
                  value={bannerTitle}
                  onChange={(e) => setBannerTitle(e.target.value)}
                  placeholder="Ex.: Novas turmas abertas"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm text-zinc-300">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={bannerDescription}
                  onChange={(e) => setBannerDescription(e.target.value)}
                  placeholder="Mensagem curta exibida no modal"
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800/60 p-3 text-white placeholder:text-zinc-500"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveBanner}
                disabled={bannerSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#C2A537] px-4 py-2 font-semibold text-black transition hover:bg-[#D4B547] disabled:opacity-60"
              >
                {bannerSaving ? "Salvando..." : "Salvar banner"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "waitlist" && (
        <div className="space-y-8">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center gap-3">
              <Settings className="h-6 w-6 text-[#C2A537]" />
              <h2 className="text-2xl font-bold text-white">Lista de Espera</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                <div>
                  <h3 className="mb-1 font-semibold text-white">
                    Habilitar lista de espera
                  </h3>
                  <p className="text-sm text-zinc-400">
                    Quando ativada, visitantes verão um modal direcionando para a lista de espera.
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
                    A lista de espera está ativa. Visitantes da home page verão um modal informando sobre a lista de espera.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#C2A537]" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Gerenciar Lista de Espera</h2>
                  <p className="text-sm text-zinc-400">{waitingCount} pessoa(s) aguardando</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ExportWaitlistPdfButton />
                <button
                  onClick={handleDeleteAllWaitlist}
                  disabled={updating}
                  className="rounded-lg border border-red-500/40 px-4 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  Apagar lista
                </button>
              </div>
            </div>

            {loading ? (
              <div className="py-8 text-center text-zinc-500">Carregando...</div>
            ) : waitlist.length === 0 ? (
              <div className="py-8 text-center text-zinc-500">Nenhuma pessoa na lista de espera</div>
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
                          <span className="text-lg font-bold text-[#C2A537]">{entry.position}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{entry.fullName}</h3>
                          <div className="mt-1 flex items-center gap-2">
                            {getStatusBadge(entry.status)}
                            <span className="text-xs text-zinc-500">
                              <Clock className="mr-1 inline h-3 w-3" />
                              {new Date(entry.createdAt).toLocaleDateString("pt-BR")}
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
                      <p className="mb-1 text-xs font-medium text-zinc-500">Objetivo:</p>
                      <p className="text-sm text-zinc-300">{entry.goal}</p>
                    </div>

                    {entry.healthRestrictions && (
                      <div className="mt-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                        <p className="mb-1 text-xs font-medium text-red-400">Restrições de Saúde:</p>
                        <p className="text-sm text-red-300">{entry.healthRestrictions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "academy" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 backdrop-blur-sm">
          <AcademySettingsView showBackButton={false} showHeader={false} />
        </div>
      )}

      {enrollmentModal.isOpen && enrollmentModal.waitlistData && (
        <CompleteEnrollmentModal
          isOpen={enrollmentModal.isOpen}
          onClose={() => setEnrollmentModal({ isOpen: false, waitlistData: null })}
          waitlistData={enrollmentModal.waitlistData}
          onEnroll={handleCompleteEnrollment}
        />
      )}
    </div>
  );
}
