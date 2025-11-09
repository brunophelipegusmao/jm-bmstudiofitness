"use client";
import {
  Bell,
  Database,
  Grid3x3,
  Layout,
  List,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Save,
  Settings,
  Smartphone,
  Sun,
  TableIcon,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfiguration } from "@/contexts/ConfigurationContext";

export function ConfigurationTab() {
  const { settings, updateSettings, resetSettings } = useConfiguration();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // As configurações já são salvas automaticamente
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("✅ Configurações salvas com sucesso!");
    } catch {
      alert("❌ Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm("Tem certeza que deseja restaurar as configurações padrão?")) {
      resetSettings();
      alert("✅ Configurações restauradas!");
    }
  };

  const layoutOptions = [
    {
      id: "cards",
      label: "Cards",
      icon: Grid3x3,
      description: "Visualização em cartões",
    },
    {
      id: "table",
      label: "Tabela",
      icon: TableIcon,
      description: "Visualização em tabela",
    },
    {
      id: "compact",
      label: "Compacto",
      icon: List,
      description: "Mais informações em menos espaço",
    },
    {
      id: "detailed",
      label: "Detalhado",
      icon: Layout,
      description: "Visualização completa",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Configurações do Sistema
          </h2>
          <p className="text-slate-400">
            Personalize a experiência do dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Restaurar Padrão
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#C2A537] text-black hover:bg-[#C2A537]/90"
          >
            {isSaving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Layout dos Dashboards */}
      <Card className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Layout className="h-5 w-5" />
            Layout dos Dashboards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Layout Principal */}
          <div className="space-y-3">
            <Label className="text-white">Layout Principal</Label>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {layoutOptions.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() =>
                    updateSettings({
                      dashboardLayout: layout.id as
                        | "cards"
                        | "table"
                        | "compact"
                        | "detailed",
                    })
                  }
                  className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all hover:scale-105 ${
                    settings.dashboardLayout === layout.id
                      ? "border-[#C2A537] bg-[#C2A537]/20 text-[#C2A537]"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <layout.icon className="h-6 w-6" />
                  <span className="font-medium">{layout.label}</span>
                  <span className="text-xs opacity-75">
                    {layout.description}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visualização de Alunos */}
          <div className="space-y-3">
            <Label className="text-white">Visualização de Alunos</Label>
            <div className="flex gap-4">
              {[
                { id: "detailed", label: "Detalhada" },
                { id: "compact", label: "Compacta" },
                { id: "table", label: "Tabela" },
              ].map((view) => (
                <button
                  key={view.id}
                  onClick={() =>
                    updateSettings({
                      studentsViewMode: view.id as
                        | "detailed"
                        | "compact"
                        | "table",
                    })
                  }
                  className={`rounded-lg border px-4 py-2 transition-colors ${
                    settings.studentsViewMode === view.id
                      ? "border-[#C2A537] bg-[#C2A537]/20 text-[#C2A537]"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opções de Interface */}
          <div className="space-y-4">
            <Label className="text-white">Opções de Interface</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { key: "showAvatars", label: "Mostrar avatars dos usuários" },
                { key: "compactMode", label: "Modo compacto" },
                { key: "showTooltips", label: "Mostrar dicas de ferramentas" },
                { key: "animationsEnabled", label: "Habilitar animações" },
                { key: "showRowNumbers", label: "Mostrar números das linhas" },
                { key: "sidebarCollapsed", label: "Manter sidebar recolhida" },
              ].map((option) => (
                <div key={option.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={option.key}
                    checked={
                      settings[option.key as keyof typeof settings] as boolean
                    }
                    onCheckedChange={(checked) =>
                      updateSettings({ [option.key]: checked })
                    }
                  />
                  <Label
                    htmlFor={option.key}
                    className="cursor-pointer text-sm text-slate-300"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações de Tema */}
          <div className="space-y-3">
            <Label className="text-white">Tema do Sistema</Label>
            <div className="flex gap-4">
              {[
                { id: "light", label: "Claro", icon: Sun },
                { id: "dark", label: "Escuro", icon: Moon },
                { id: "auto", label: "Automático", icon: Monitor },
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() =>
                    updateSettings({
                      theme: theme.id as "light" | "dark" | "auto",
                    })
                  }
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2 transition-colors ${
                    settings.theme === theme.id
                      ? "border-[#C2A537] bg-[#C2A537]/20 text-[#C2A537]"
                      : "border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <theme.icon className="h-4 w-4" />
                  {theme.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Tabelas */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm"
        style={{ animationDelay: "100ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <TableIcon className="h-5 w-5" />
            Configurações de Tabelas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="itemsPerPage">Itens por Página</Label>
              <select
                id="itemsPerPage"
                value={settings.itemsPerPage}
                onChange={(e) =>
                  updateSettings({ itemsPerPage: parseInt(e.target.value) })
                }
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div>
              <Label htmlFor="sortBy">Ordenar Por</Label>
              <select
                id="sortBy"
                value={settings.sortBy}
                onChange={(e) =>
                  updateSettings({
                    sortBy: e.target.value as "name" | "date" | "payment",
                  })
                }
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
              >
                <option value="name">Nome</option>
                <option value="date">Data de Cadastro</option>
                <option value="payment">Status de Pagamento</option>
              </select>
            </div>

            <div>
              <Label htmlFor="sortOrder">Ordem</Label>
              <select
                id="sortOrder"
                value={settings.sortOrder}
                onChange={(e) =>
                  updateSettings({
                    sortOrder: e.target.value as "asc" | "desc",
                  })
                }
                className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configurações do Estúdio */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm"
        style={{ animationDelay: "200ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Users className="h-5 w-5" />
            Informações do Estúdio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="gymName">Nome do Estúdio</Label>
              <Input
                id="gymName"
                value={settings.gymName}
                onChange={(e) => updateSettings({ gymName: e.target.value })}
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="gymPhone">Telefone</Label>
              <Input
                id="gymPhone"
                value={settings.phone}
                onChange={(e) => updateSettings({ phone: e.target.value })}
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="gymAddress">Endereço</Label>
              <Input
                id="gymAddress"
                value={settings.address}
                onChange={(e) => updateSettings({ address: e.target.value })}
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="gymEmail">Email</Label>
              <Input
                id="gymEmail"
                type="email"
                value={settings.email}
                onChange={(e) => updateSettings({ email: e.target.value })}
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="openTime">Horário de Abertura</Label>
              <Input
                id="openTime"
                type="time"
                value={settings.openTime}
                onChange={(e) => updateSettings({ openTime: e.target.value })}
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>

            <div>
              <Label htmlFor="closeTime">Horário de Fechamento</Label>
              <Input
                id="closeTime"
                type="time"
                value={settings.closeTime}
                onChange={(e) => updateSettings({ closeTime: e.target.value })}
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidade e Segurança */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm"
        style={{ animationDelay: "300ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Database className="h-5 w-5" />
            Privacidade e Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                key: "hidePrivateDataByDefault",
                label: "Ocultar dados sensíveis por padrão",
                desc: "CPF, telefone e endereço ficam ocultos inicialmente",
              },
              {
                key: "requirePasswordForSensitiveData",
                label: "Exigir senha para acessar dados sensíveis",
                desc: "Solicita confirmação de senha para visualizar dados sensíveis",
              },
              {
                key: "logDataAccess",
                label: "Registrar acessos aos dados dos alunos",
                desc: "Mantém histórico de quem acessou dados de cada aluno",
              },
            ].map((option) => (
              <div
                key={option.key}
                className="flex items-start justify-between"
              >
                <div className="flex-1">
                  <Label className="text-white">{option.label}</Label>
                  <p className="text-sm text-slate-400">{option.desc}</p>
                </div>
                <Checkbox
                  checked={
                    settings[option.key as keyof typeof settings] as boolean
                  }
                  onCheckedChange={(checked) =>
                    updateSettings({ [option.key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm"
        style={{ animationDelay: "400ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                key: "emailNotifications",
                label: "Notificações por email",
                icon: "📧",
              },
              {
                key: "pushNotifications",
                label: "Notificações push",
                icon: "🔔",
              },
              {
                key: "paymentReminders",
                label: "Lembretes de pagamento",
                icon: "💰",
              },
              {
                key: "birthdayAlerts",
                label: "Alertas de aniversário",
                icon: "🎂",
              },
              { key: "systemAlerts", label: "Alertas do sistema", icon: "⚠️" },
            ].map((notification) => (
              <div
                key={notification.key}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{notification.icon}</span>
                  <Label className="cursor-pointer text-slate-300">
                    {notification.label}
                  </Label>
                </div>
                <Checkbox
                  checked={
                    settings[
                      notification.key as keyof typeof settings
                    ] as boolean
                  }
                  onCheckedChange={(checked) =>
                    updateSettings({ [notification.key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sistema */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm"
        style={{ animationDelay: "500ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Database className="h-5 w-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto-save e Auto-refresh */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Salvamento Automático</Label>
                <p className="text-sm text-slate-400">
                  Salva alterações automaticamente
                </p>
              </div>
              <Checkbox
                checked={settings.autoSave}
                onCheckedChange={(checked) =>
                  updateSettings({ autoSave: checked as boolean })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white">Atualização Automática</Label>
                <p className="text-sm text-slate-400">
                  Atualiza dados automaticamente
                </p>
              </div>
              <Checkbox
                checked={settings.autoRefresh}
                onCheckedChange={(checked) =>
                  updateSettings({ autoRefresh: checked as boolean })
                }
              />
            </div>
          </div>

          {/* Intervalos */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-white">
                Intervalo de Atualização (segundos)
              </Label>
              <Input
                type="number"
                min="10"
                max="300"
                value={settings.refreshInterval}
                onChange={(e) =>
                  updateSettings({
                    refreshInterval: parseInt(e.target.value) || 30,
                  })
                }
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-white">Timeout da Sessão (minutos)</Label>
              <Input
                type="number"
                min="5"
                max="480"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  updateSettings({
                    sessionTimeout: parseInt(e.target.value) || 30,
                  })
                }
                className="border-slate-600 bg-slate-800 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades Futuras */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-slate-700/50 bg-slate-800/30"
        style={{ animationDelay: "600ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Settings className="h-5 w-5" />
            Próximas Funcionalidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                icon: Palette,
                title: "Temas Personalizados",
                desc: "Criação de temas com cores personalizadas",
              },
              {
                icon: Smartphone,
                title: "App Mobile",
                desc: "Configurações para aplicativo móvel",
              },
              {
                icon: Database,
                title: "Backup Automático",
                desc: "Backup dos dados em nuvem",
              },
              {
                icon: Users,
                title: "Gestão de Permissões",
                desc: "Controle de acesso por usuário",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-3 rounded-lg border border-slate-600 bg-slate-700/50 p-4 transition-all hover:border-slate-500 hover:bg-slate-700/70"
              >
                <feature.icon className="mt-0.5 h-5 w-5 text-[#C2A537]" />
                <div>
                  <h4 className="font-medium text-white">{feature.title}</h4>
                  <p className="text-sm text-slate-400">{feature.desc}</p>
                  <span className="mt-2 inline-block rounded bg-slate-600 px-2 py-1 text-xs text-slate-300">
                    Em breve
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Logs de Segurança */}
      <Card
        className="animate-in fade-in-50 slide-in-from-bottom-4 border-[#C2A537]/50 bg-black/60 backdrop-blur-sm"
        style={{ animationDelay: "700ms" }}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#C2A537]">
            <Database className="h-5 w-5" />
            Logs de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Registros de acesso a dados sensíveis dos alunos. Estes logs são
              mantidos para auditoria e segurança.
            </p>

            <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-3">
                <div>
                  <div className="text-slate-400">Total de Acessos</div>
                  <div className="font-semibold text-white">
                    {(() => {
                      try {
                        const logs = JSON.parse(
                          localStorage.getItem("jmfitness-access-logs") || "[]",
                        );
                        return logs.length;
                      } catch {
                        return 0;
                      }
                    })()}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Último Acesso</div>
                  <div className="font-semibold text-white">
                    {(() => {
                      try {
                        const logs = JSON.parse(
                          localStorage.getItem("jmfitness-access-logs") || "[]",
                        );
                        if (logs.length > 0) {
                          const lastLog = logs[logs.length - 1];
                          return new Date(lastLog.timestamp).toLocaleString(
                            "pt-BR",
                          );
                        }
                        return "Nenhum";
                      } catch {
                        return "N/A";
                      }
                    })()}
                  </div>
                </div>

                <div>
                  <div className="text-slate-400">Status</div>
                  <div
                    className={`font-semibold ${settings.logDataAccess ? "text-green-400" : "text-red-400"}`}
                  >
                    {settings.logDataAccess ? "Ativo" : "Inativo"}
                  </div>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-700 pt-4">
                <Button
                  onClick={() => {
                    // Toggle da exibição dos logs completos
                    const element =
                      document.getElementById("access-logs-viewer");
                    if (element) {
                      element.style.display =
                        element.style.display === "none" ? "block" : "none";
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="border-[#C2A537]/50 text-[#C2A537] hover:bg-[#C2A537]/10"
                >
                  Ver Logs Completos
                </Button>
              </div>
            </div>

            <div id="access-logs-viewer" style={{ display: "none" }}>
              <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="text-sm text-slate-400">
                  📊 Para implementar os logs completos, importe e use o
                  componente AccessLogsViewer
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
