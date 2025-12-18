"use client";

import {
  AlertCircle,
  Briefcase,
  CheckCircle,
  Clipboard,
  FileText,
  Home,
  Loader2,
  Phone,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  getMaintenanceSettings,
  updateMaintenanceSettings,
} from "@/actions/admin/maintenance";
import { Modal } from "@/components/ui/Modal";

export function MaintenanceControlPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/waitlist");

  // Estados para controle de rotas
  const [routeHomeEnabled, setRouteHomeEnabled] = useState(true);
  const [routeUserEnabled, setRouteUserEnabled] = useState(false);
  const [routeCoachEnabled, setRouteCoachEnabled] = useState(false);
  const [routeEmployeeEnabled, setRouteEmployeeEnabled] = useState(false);
  const [routeShoppingEnabled, setRouteShoppingEnabled] = useState(false);
  const [routeBlogEnabled, setRouteBlogEnabled] = useState(false);
  const [routeServicesEnabled, setRouteServicesEnabled] = useState(false);
  const [routeContactEnabled, setRouteContactEnabled] = useState(true);
  const [routeWaitlistEnabled, setRouteWaitlistEnabled] = useState(true);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // Carrega as configurações atuais
  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setIsLoading(true);
    try {
      const result = await getMaintenanceSettings();

      if (result.success && result.data) {
        setMaintenanceMode(result.data.maintenanceMode);
        setRedirectUrl(result.data.maintenanceRedirectUrl || "/waitlist");
        setRouteHomeEnabled(result.data.routeHomeEnabled ?? true);
        setRouteUserEnabled(result.data.routeUserEnabled ?? false);
        setRouteCoachEnabled(result.data.routeCoachEnabled ?? false);
        setRouteEmployeeEnabled(result.data.routeEmployeeEnabled ?? false);
        setRouteShoppingEnabled(result.data.routeShoppingEnabled ?? false);
        setRouteBlogEnabled(result.data.routeBlogEnabled ?? false);
        setRouteServicesEnabled(result.data.routeServicesEnabled ?? false);
        setRouteContactEnabled(result.data.routeContactEnabled ?? true);
        setRouteWaitlistEnabled(result.data.routeWaitlistEnabled ?? true);
      } else {
        setModal({
          isOpen: true,
          type: "error",
          title: "Erro ao carregar",
          message:
            result.error ||
            "Não foi possível carregar as configurações de manutenção.",
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Erro ao carregar",
        message:
          "Ocorreu um erro ao carregar as configurações. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    // Validação: pelo menos uma rota de fallback deve estar habilitada
    const hasAtLeastOneFallback =
      routeWaitlistEnabled || routeHomeEnabled || routeContactEnabled;

    if (!hasAtLeastOneFallback) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Configuração inválida",
        message:
          "Você precisa manter pelo menos uma das seguintes rotas habilitadas: Página Inicial, Lista de Espera ou Contato. Isso evita loops de redirecionamento.",
      });
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateMaintenanceSettings({
        maintenanceMode,
        maintenanceRedirectUrl: redirectUrl,
        routeHomeEnabled,
        routeUserEnabled,
        routeCoachEnabled,
        routeEmployeeEnabled,
        routeShoppingEnabled,
        routeBlogEnabled,
        routeServicesEnabled,
        routeContactEnabled,
        routeWaitlistEnabled,
      });

      if (result.success) {
        setModal({
          isOpen: true,
          type: "success",
          title: "Configurações salvas!",
          message:
            result.message || "As configurações foram atualizadas com sucesso.",
        });
      } else {
        setModal({
          isOpen: true,
          type: "error",
          title: "Erro ao salvar",
          message:
            result.error ||
            "Não foi possível salvar as configurações. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Erro ao salvar",
        message: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const handleCloseModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#C2A537]" />
      </div>
    );
  }

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      <div className="rounded-lg border border-[#C2A537]/20 bg-linear-to-b from-slate-900 via-slate-900 to-black">
        <div className="border-b border-[#C2A537]/20 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#C2A537]/10 p-3">
              <Settings className="h-6 w-6 text-[#C2A537]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#C2A537]">
                Configurações de Manutenção
              </h2>
              <p className="text-sm text-slate-400">
                Controle o acesso ao sistema durante manutenções
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Status Atual */}
          <div
            className={`rounded-lg border p-4 ${
              maintenanceMode
                ? "border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950"
                : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
            }`}
          >
            <div className="flex items-center gap-3">
              {maintenanceMode ? (
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              )}
              <div>
                <p className="font-semibold">
                  Status:{" "}
                  {maintenanceMode ? "Modo Manutenção Ativo" : "Sistema Normal"}
                </p>
                <p className="text-muted-foreground text-sm">
                  {maintenanceMode
                    ? "Modo manutenção ativo. Apenas /admin e as rotas que você marcar abaixo estarão acessíveis."
                    : "Sistema normal. O controle de rotas abaixo funciona independentemente do modo manutenção."}
                </p>
              </div>
            </div>
          </div>

          {/* Toggle Modo Manutenção */}
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-1">
                <label
                  htmlFor="maintenance-toggle"
                  className="text-sm font-medium"
                >
                  Modo Manutenção
                </label>
                <p className="text-muted-foreground text-sm">
                  Quando ativo, redireciona usuários para a página configurada
                </p>
              </div>
              <button
                id="maintenance-toggle"
                onClick={() => setMaintenanceMode(!maintenanceMode)}
                className={`focus:ring-primary relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-none ${
                  maintenanceMode ? "bg-orange-600" : "bg-gray-200"
                }`}
                role="switch"
                aria-checked={maintenanceMode}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    maintenanceMode ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* URL de Redirecionamento */}
            <div className="space-y-2">
              <label htmlFor="redirect-url" className="text-sm font-medium">
                URL de Redirecionamento
              </label>
              <p className="text-muted-foreground text-sm">
                Para onde os usuários serão redirecionados durante a manutenção
              </p>
              <select
                id="redirect-url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                className="border-input bg-background ring-offset-background focus:ring-ring w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-offset-2 focus:outline-none"
              >
                <option value="/waitlist">Lista de Espera (/waitlist)</option>
                <option value="/maintenance">
                  Página de Manutenção (/maintenance)
                </option>
              </select>
            </div>
          </div>

          {/* Controle de Acesso às Rotas */}
          <div className="space-y-4">
            <div className="border-t border-[#C2A537]/20 pt-6">
              <h3 className="mb-4 text-lg font-semibold text-[#C2A537]">
                Controle de Acesso às Rotas
              </h3>
              <p className="mb-4 text-sm text-slate-400">
                Ative ou desative o acesso às diferentes áreas do sistema
              </p>
              <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <p className="text-xs text-green-400">
                  <strong>💡 Como funciona:</strong> Se o Modo Manutenção
                  estiver <strong>ATIVO</strong>, apenas as rotas marcadas
                  abaixo poderão ser acessadas. Se estiver{" "}
                  <strong>DESATIVADO</strong>, o controle de rotas funciona
                  normalmente.
                </p>
              </div>
              <div className="mb-6 rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-xs text-blue-400">
                  <strong>⚠️ Importante:</strong> Mantenha pelo menos uma dessas
                  rotas habilitadas:
                  <strong> Página Inicial</strong>,{" "}
                  <strong>Lista de Espera</strong> ou <strong>Contato</strong>.
                  Isso evita loops de redirecionamento.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {/* Rota Home */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Página Inicial
                      </p>
                      <p className="text-xs text-slate-400">/</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRouteHomeEnabled(!routeHomeEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeHomeEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeHomeEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Aluno */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Área do Aluno
                      </p>
                      <p className="text-xs text-slate-400">/user/*</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRouteUserEnabled(!routeUserEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeUserEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeUserEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Coach */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Área do Coach
                      </p>
                      <p className="text-xs text-slate-400">/coach/*</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRouteCoachEnabled(!routeCoachEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeCoachEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeCoachEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Employee */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Área do Funcionário
                      </p>
                      <p className="text-xs text-slate-400">/employee/*</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setRouteEmployeeEnabled(!routeEmployeeEnabled)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeEmployeeEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeEmployeeEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Shopping */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Loja</p>
                      <p className="text-xs text-slate-400">/shopping/*</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setRouteShoppingEnabled(!routeShoppingEnabled)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeShoppingEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeShoppingEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Blog */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">Blog</p>
                      <p className="text-xs text-slate-400">/blog/*</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRouteBlogEnabled(!routeBlogEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeBlogEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeBlogEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Services */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Clipboard className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Serviços
                      </p>
                      <p className="text-xs text-slate-400">/services/*</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setRouteServicesEnabled(!routeServicesEnabled)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeServicesEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeServicesEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Contact */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Contato
                      </p>
                      <p className="text-xs text-slate-400">/contact</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRouteContactEnabled(!routeContactEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeContactEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeContactEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Rota Waitlist */}
                <div className="flex items-center justify-between rounded-lg border border-[#C2A537]/20 bg-slate-900/50 p-4">
                  <div className="flex items-center gap-3">
                    <Clipboard className="h-5 w-5 text-[#C2A537]" />
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        Lista de Espera
                      </p>
                      <p className="text-xs text-slate-400">/waitlist</p>
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      setRouteWaitlistEnabled(!routeWaitlistEnabled)
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      routeWaitlistEnabled ? "bg-[#C2A537]" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        routeWaitlistEnabled ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Importantes */}
          <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <h3 className="mb-2 font-semibold text-blue-300">
              ℹ️ Informações Importantes
            </h3>
            <ul className="space-y-1 text-sm text-blue-200">
              <li>• A área /admin sempre permanecerá acessível</li>
              <li>• Rotas desativadas redirecionarão para a página inicial</li>
              <li>• APIs e assets estáticos continuarão funcionando</li>
              <li>
                • Use isso para ativar rotas conforme implementa os dados reais
              </li>
            </ul>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end gap-3 border-t border-[#C2A537]/20 pt-6">
            <button
              onClick={loadSettings}
              disabled={isSaving}
              className="rounded-md border border-[#C2A537]/20 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-[#C2A537]/10 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-md bg-linear-to-r from-[#C2A537] to-[#D4B547] px-4 py-2 text-sm font-medium text-black transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
