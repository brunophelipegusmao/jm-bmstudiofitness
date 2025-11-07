"use client";

import { motion } from "framer-motion";
import { Clock, DollarSign, FileText, Save, Settings } from "lucide-react";
import { useState } from "react";

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

  // Mock data para demonstração
  const [settings, setSettings] = useState({
    general: {
      name: "BM Studio Fitness",
      address: "Rua das Flores, 123 - Centro",
      phone: "(11) 99999-9999",
      email: "contato@bmstudio.com",
      website: "www.bmstudio.com",
      capacity: "150",
    },
    hours: {
      monday: { open: "06:00", close: "22:00", closed: false },
      tuesday: { open: "06:00", close: "22:00", closed: false },
      wednesday: { open: "06:00", close: "22:00", closed: false },
      thursday: { open: "06:00", close: "22:00", closed: false },
      friday: { open: "06:00", close: "22:00", closed: false },
      saturday: { open: "08:00", close: "18:00", closed: false },
      sunday: { open: "08:00", close: "16:00", closed: false },
    },
    pricing: {
      monthly: "89.90",
      quarterly: "249.90",
      semester: "449.90",
      annual: "799.90",
      dayPass: "25.00",
      personalTraining: "80.00",
    },
    policies: {
      cancellationPolicy:
        "Cancelamento deve ser solicitado com 30 dias de antecedência.",
      latePaymentFee: "10.00",
      freezePeriod: "2",
      guestPolicy: "Convidados são permitidos até 2 vezes por mês.",
      equipmentPolicy: "Usuários devem limpar equipamentos após o uso.",
    },
  });

  const tabs = [
    {
      id: "general",
      label: "Geral",
      icon: Settings,
      description: "Informações básicas da academia",
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
    { key: "monday", label: "Segunda-feira" },
    { key: "tuesday", label: "Terça-feira" },
    { key: "wednesday", label: "Quarta-feira" },
    { key: "thursday", label: "Quinta-feira" },
    { key: "friday", label: "Sexta-feira" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
  ];

  const handleSaveSettings = () => {
    console.log("Saving settings:", settings);
    // Aqui será implementada a lógica de salvamento
  };

  const updateGeneralSetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [key]: value },
    }));
  };

  const updateHoursSetting = (
    day: string,
    field: string,
    value: string | boolean,
  ) => {
    setSettings((prev) => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: {
          ...prev.hours[day as keyof typeof prev.hours],
          [field]: value,
        },
      },
    }));
  };

  const updatePricingSetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      pricing: { ...prev.pricing, [key]: value },
    }));
  };

  const updatePolicySetting = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      policies: { ...prev.policies, [key]: value },
    }));
  };

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
            Configurações da Academia
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
                  <Label className="text-[#C2A537]">Nome da Academia</Label>
                  <Input
                    value={settings.general.name}
                    onChange={(e) =>
                      updateGeneralSetting("name", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Capacidade Máxima</Label>
                  <Input
                    type="number"
                    value={settings.general.capacity}
                    onChange={(e) =>
                      updateGeneralSetting("capacity", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[#C2A537]">Endereço</Label>
                  <Input
                    value={settings.general.address}
                    onChange={(e) =>
                      updateGeneralSetting("address", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Telefone</Label>
                  <Input
                    value={settings.general.phone}
                    onChange={(e) =>
                      updateGeneralSetting("phone", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Email</Label>
                  <Input
                    type="email"
                    value={settings.general.email}
                    onChange={(e) =>
                      updateGeneralSetting("email", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[#C2A537]">Website</Label>
                  <Input
                    value={settings.general.website}
                    onChange={(e) =>
                      updateGeneralSetting("website", e.target.value)
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
                  const daySettings =
                    settings.hours[day.key as keyof typeof settings.hours];
                  return (
                    <div
                      key={day.key}
                      className="flex items-center gap-4 rounded-lg border border-slate-600/50 bg-slate-800/30 p-3"
                    >
                      <div className="w-32">
                        <span className="font-medium text-white">
                          {day.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={!daySettings.closed}
                          onChange={(e) =>
                            updateHoursSetting(
                              day.key,
                              "closed",
                              !e.target.checked,
                            )
                          }
                          className="rounded"
                        />
                        <span className="text-sm text-gray-400">Aberto</span>
                      </div>

                      {!daySettings.closed && (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">
                              Abertura:
                            </span>
                            <Input
                              type="time"
                              value={daySettings.open}
                              onChange={(e) =>
                                updateHoursSetting(
                                  day.key,
                                  "open",
                                  e.target.value,
                                )
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
                              value={daySettings.close}
                              onChange={(e) =>
                                updateHoursSetting(
                                  day.key,
                                  "close",
                                  e.target.value,
                                )
                              }
                              className="w-24 border-slate-600 bg-slate-800 text-white"
                            />
                          </div>
                        </>
                      )}

                      {daySettings.closed && (
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
                  <Label className="text-[#C2A537]">Mensalidade (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pricing.monthly}
                    onChange={(e) =>
                      updatePricingSetting("monthly", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Trimestral (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pricing.quarterly}
                    onChange={(e) =>
                      updatePricingSetting("quarterly", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Semestral (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pricing.semester}
                    onChange={(e) =>
                      updatePricingSetting("semester", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Anual (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pricing.annual}
                    onChange={(e) =>
                      updatePricingSetting("annual", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Diária (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pricing.dayPass}
                    onChange={(e) =>
                      updatePricingSetting("dayPass", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Personal Training (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={settings.pricing.personalTraining}
                    onChange={(e) =>
                      updatePricingSetting("personalTraining", e.target.value)
                    }
                    className="border-slate-600 bg-slate-800 text-white"
                  />
                </div>
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
                Políticas e Regras
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Política de Cancelamento
                  </Label>
                  <textarea
                    value={settings.policies.cancellationPolicy}
                    onChange={(e) =>
                      updatePolicySetting("cancellationPolicy", e.target.value)
                    }
                    rows={3}
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-[#C2A537]">
                      Taxa de Atraso (R$)
                    </Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={settings.policies.latePaymentFee}
                      onChange={(e) =>
                        updatePolicySetting("latePaymentFee", e.target.value)
                      }
                      className="border-slate-600 bg-slate-800 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[#C2A537]">
                      Período de Congelamento (meses)
                    </Label>
                    <Input
                      type="number"
                      value={settings.policies.freezePeriod}
                      onChange={(e) =>
                        updatePolicySetting("freezePeriod", e.target.value)
                      }
                      className="border-slate-600 bg-slate-800 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Política de Convidados
                  </Label>
                  <textarea
                    value={settings.policies.guestPolicy}
                    onChange={(e) =>
                      updatePolicySetting("guestPolicy", e.target.value)
                    }
                    rows={2}
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Política de Equipamentos
                  </Label>
                  <textarea
                    value={settings.policies.equipmentPolicy}
                    onChange={(e) =>
                      updatePolicySetting("equipmentPolicy", e.target.value)
                    }
                    rows={2}
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
          className="bg-[#C2A537] font-medium text-black hover:bg-[#B8A533]"
        >
          <Save className="mr-2 h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </motion.div>
  );
}
