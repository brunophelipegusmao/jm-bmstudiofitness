"use client";

import { motion } from "framer-motion";
import {
  Clock,
  DollarSign,
  FileText,
  Loader2,
  Save,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  getStudioSettingsAction,
  type StudioSettings,
} from "@/actions/admin/get-studio-settings-action";
import { updateStudioSettingsAction } from "@/actions/admin/update-studio-settings-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AcademySettingsViewProps {
  onBack: () => void;
}

export function AcademySettingsView({ onBack }: AcademySettingsViewProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "hours" | "pricing" | "policies"
  >("general");
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getStudioSettingsAction();
      setSettings(data);
    } catch (error) {
      toast.error("Erro ao carregar configurações");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const result = await updateStudioSettingsAction({
        studioName: settings.studioName,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        city: settings.city,
        state: settings.state,
        zipCode: settings.zipCode,
        mondayOpen: settings.mondayOpen,
        mondayClose: settings.mondayClose,
        tuesdayOpen: settings.tuesdayOpen,
        tuesdayClose: settings.tuesdayClose,
        wednesdayOpen: settings.wednesdayOpen,
        wednesdayClose: settings.wednesdayClose,
        thursdayOpen: settings.thursdayOpen,
        thursdayClose: settings.thursdayClose,
        fridayOpen: settings.fridayOpen,
        fridayClose: settings.fridayClose,
        saturdayOpen: settings.saturdayOpen,
        saturdayClose: settings.saturdayClose,
        sundayOpen: settings.sundayOpen,
        sundayClose: settings.sundayClose,
        monthlyFeeDefault: settings.monthlyFeeDefault,
        registrationFee: settings.registrationFee,
        personalTrainingHourlyRate: settings.personalTrainingHourlyRate,
        paymentDueDateDefault: settings.paymentDueDateDefault,
        gracePeriodDays: settings.gracePeriodDays,
        maxCheckInsPerDay: settings.maxCheckInsPerDay,
        allowWeekendCheckIn: settings.allowWeekendCheckIn,
        termsAndConditions: settings.termsAndConditions,
        privacyPolicy: settings.privacyPolicy,
        cancellationPolicy: settings.cancellationPolicy,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao salvar configurações");
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    {
      id: "general",
      label: "Geral",
      icon: Settings,
      description: "Informações básicas do estúdio",
    },
    {
      id: "hours",
      label: "Horários",
      icon: Clock,
      description: "Horários de funcionamento",
    },
    {
      id: "pricing",
      label: "Valores",
      icon: DollarSign,
      description: "Preços e mensalidades",
    },
    {
      id: "policies",
      label: "Políticas",
      icon: FileText,
      description: "Regras e políticas",
    },
  ];

  const daysOfWeek = [
    {
      key: "monday",
      label: "Segunda-feira",
      openKey: "mondayOpen" as const,
      closeKey: "mondayClose" as const,
    },
    {
      key: "tuesday",
      label: "Terça-feira",
      openKey: "tuesdayOpen" as const,
      closeKey: "tuesdayClose" as const,
    },
    {
      key: "wednesday",
      label: "Quarta-feira",
      openKey: "wednesdayOpen" as const,
      closeKey: "wednesdayClose" as const,
    },
    {
      key: "thursday",
      label: "Quinta-feira",
      openKey: "thursdayOpen" as const,
      closeKey: "thursdayClose" as const,
    },
    {
      key: "friday",
      label: "Sexta-feira",
      openKey: "fridayOpen" as const,
      closeKey: "fridayClose" as const,
    },
    {
      key: "saturday",
      label: "Sábado",
      openKey: "saturdayOpen" as const,
      closeKey: "saturdayClose" as const,
    },
    {
      key: "sunday",
      label: "Domingo",
      openKey: "sundayOpen" as const,
      closeKey: "sundayClose" as const,
    },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#C2A537]" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-400">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Configurações do Estúdio
          </h2>
          <p className="text-slate-400">
            Configurar horários, valores e políticas
          </p>
        </div>
        <Button
          onClick={onBack}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-800"
        >
          ← Voltar
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <Button
                  key={tab.id}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "bg-[#C2A537] text-black hover:bg-[#B8A533]"
                      : "border-[#C2A537]/30 text-[#C2A537] hover:bg-[#C2A537]/10"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      {activeTab === "general" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Settings className="h-5 w-5" />
                Informações Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Nome do Estúdio</Label>
                  <Input
                    value={settings.studioName}
                    onChange={(e) =>
                      setSettings({ ...settings, studioName: e.target.value })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Telefone</Label>
                  <Input
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[#C2A537]">Email</Label>
                  <Input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[#C2A537]">Endereço</Label>
                  <Input
                    value={settings.address}
                    onChange={(e) =>
                      setSettings({ ...settings, address: e.target.value })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Cidade</Label>
                  <Input
                    value={settings.city}
                    onChange={(e) =>
                      setSettings({ ...settings, city: e.target.value })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Estado</Label>
                  <Input
                    value={settings.state}
                    onChange={(e) =>
                      setSettings({ ...settings, state: e.target.value })
                    }
                    maxLength={2}
                    className="border-slate-600 bg-slate-800 text-white uppercase"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">CEP</Label>
                  <Input
                    value={settings.zipCode}
                    onChange={(e) =>
                      setSettings({ ...settings, zipCode: e.target.value })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Hours Settings */}
      {activeTab === "hours" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {daysOfWeek.map((day) => {
                  const openTime = settings[day.openKey];
                  const closeTime = settings[day.closeKey];
                  const isClosed = !openTime || !closeTime;

                  return (
                    <div
                      key={day.key}
                      className="flex flex-wrap items-center gap-4 rounded-lg border border-slate-600/50 bg-slate-800/30 p-3"
                    >
                      <div className="w-32">
                        <span className="font-medium text-white">
                          {day.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!isClosed}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSettings({
                                ...settings,
                                [day.openKey]: "06:00",
                                [day.closeKey]: "22:00",
                              });
                            } else {
                              setSettings({
                                ...settings,
                                [day.openKey]: null,
                                [day.closeKey]: null,
                              });
                            }
                          }}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-400">Aberto</span>
                      </div>

                      {!isClosed && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              Abertura:
                            </span>
                            <Input
                              type="time"
                              value={openTime || ""}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  [day.openKey]: e.target.value,
                                })
                              }
                              className="w-24 border-slate-600 bg-slate-800 text-white"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              Fechamento:
                            </span>
                            <Input
                              type="time"
                              value={closeTime || ""}
                              onChange={(e) =>
                                setSettings({
                                  ...settings,
                                  [day.closeKey]: e.target.value,
                                })
                              }
                              className="w-24 border-slate-600 bg-slate-800 text-white"
                            />
                          </div>
                        </>
                      )}

                      {isClosed && (
                        <span className="text-sm text-red-400">Fechado</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pricing Settings */}
      {activeTab === "pricing" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <DollarSign className="h-5 w-5" />
                Preços e Mensalidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Mensalidade Padrão (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(settings.monthlyFeeDefault / 100).toFixed(2)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        monthlyFeeDefault: Math.round(
                          parseFloat(e.target.value) * 100,
                        ),
                      })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Taxa de Matrícula (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(settings.registrationFee / 100).toFixed(2)}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        registrationFee: Math.round(
                          parseFloat(e.target.value) * 100,
                        ),
                      })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Personal Training - Hora (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={(settings.personalTrainingHourlyRate / 100).toFixed(
                      2,
                    )}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        personalTrainingHourlyRate: Math.round(
                          parseFloat(e.target.value) * 100,
                        ),
                      })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Dia de Vencimento Padrão
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={settings.paymentDueDateDefault}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        paymentDueDateDefault: parseInt(e.target.value),
                      })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Período de Carência (dias)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.gracePeriodDays}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        gracePeriodDays: parseInt(e.target.value),
                      })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Check-ins Máximos/Dia
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.maxCheckInsPerDay}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        maxCheckInsPerDay: parseInt(e.target.value),
                      })
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-slate-600/50 bg-slate-800/30 p-3">
                <input
                  type="checkbox"
                  checked={settings.allowWeekendCheckIn}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      allowWeekendCheckIn: e.target.checked,
                    })
                  }
                  className="rounded"
                />
                <Label className="text-white">
                  Permitir check-in nos finais de semana
                </Label>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Policies Settings */}
      {activeTab === "policies" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <FileText className="h-5 w-5" />
                Políticas e Termos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Política de Cancelamento
                  </Label>
                  <textarea
                    value={settings.cancellationPolicy || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        cancellationPolicy: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Descreva a política de cancelamento do estúdio..."
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Termos e Condições</Label>
                  <textarea
                    value={settings.termsAndConditions || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        termsAndConditions: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Descreva os termos e condições gerais..."
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Política de Privacidade
                  </Label>
                  <textarea
                    value={settings.privacyPolicy || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        privacyPolicy: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Descreva como os dados dos alunos são tratados..."
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-[#C2A537] font-medium text-black hover:bg-[#B8A533]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
