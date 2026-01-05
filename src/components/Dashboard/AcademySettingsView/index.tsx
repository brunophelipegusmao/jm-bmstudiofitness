"use client";

import { motion } from "framer-motion";
import {
  Clock,
  DollarSign,
  FileText,
  Image as ImageIcon,
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

// Funcao para validar se e uma URL valida de imagem
const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === "") return false;

  try {
    const urlObj = new URL(url.trim());
    const pathname = urlObj.pathname.toLowerCase();

    // Verifica se termina com extensao de imagem valida
    const validExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".svg",
      ".bmp",
    ];
    const hasValidExtension = validExtensions.some((ext) =>
      pathname.endsWith(ext),
    );

    // Aceita URLs locais (comecam com /) ou URLs com extensao de imagem
    return pathname.startsWith("/") || hasValidExtension;
  } catch {
    // Se comecar com /  uma URL local valida
    return url.trim().startsWith("/");
  }
};

interface AcademySettingsViewProps {
  onBack?: () => void;
  showBackButton?: boolean;
  showHeader?: boolean;
}

export function AcademySettingsView({
  onBack,
  showBackButton,
  showHeader = false,
}: AcademySettingsViewProps) {
  const [activeTab, setActiveTab] = useState<
    "general" | "hours" | "pricing" | "policies" | "carousel"
  >("general");
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await getStudioSettingsAction();
      if (result.data) {
        setSettings(result.data);
      } else {
        toast.error("Erro ao carregar configuracoes");
      }
    } catch (error) {
      toast.error("Erro ao carregar configuracoes");
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
        carouselImage1: settings.carouselImage1?.trim() || null,
        carouselImage2: settings.carouselImage2?.trim() || null,
        carouselImage3: settings.carouselImage3?.trim() || null,
        carouselImage4: settings.carouselImage4?.trim() || null,
        carouselImage5: settings.carouselImage5?.trim() || null,
        carouselImage6: settings.carouselImage6?.trim() || null,
        carouselImage7: settings.carouselImage7?.trim() || null,
      });

      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Erro ao salvar configuracoes");
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
      description: "Informacoes basicas do estudio",
    },
    {
      id: "hours",
      label: "Horarios",
      icon: Clock,
      description: "Horarios de funcionamento",
    },
    {
      id: "pricing",
      label: "Precos",
      icon: DollarSign,
      description: "Mensalidades e taxas",
    },
    {
      id: "policies",
      label: "Politicas",
      icon: FileText,
      description: "Politicas internas e termos",
    },
    {
      id: "carousel",
      label: "Carrossel",
      icon: ImageIcon,
      description: "Imagens do site/app",
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
      label: "Terca-feira",
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
      label: "Sabado",
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
        <p className="text-slate-400">Erro ao carregar configuracoes</p>
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
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#C2A537]">
              Configuracoes do Estudio
            </h2>
            <p className="text-slate-400">
              Configurar horarios, valores e politicas
            </p>
          </div>
          {onBack && showBackButton !== false && (
            <Button
              onClick={onBack}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Voltar
            </Button>
          )}
        </div>
      )}

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
                Informacoes Gerais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Nome do Estudio</Label>
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
                  <Label className="text-[#C2A537]">Endereco</Label>
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
                Horarios de Funcionamento
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
                Precos e Mensalidades
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Mensalidade Padrao (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={((settings.monthlyFeeDefault ?? 0) / 100).toFixed(2)}
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
                    Taxa de Matricula (R$)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={((settings.registrationFee ?? 0) / 100).toFixed(2)}
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
                    value={(
                      (settings.personalTrainingHourlyRate ?? 0) / 100
                    ).toFixed(2)}
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
                    Dia de Vencimento Padrao
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={settings.paymentDueDateDefault ?? 1}
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
                    Perodo de Carncia (dias)
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.gracePeriodDays ?? 0}
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
                  <Label className="text-[#C2A537]">Check-ins Mximos/Dia</Label>
                  <Input
                    type="number"
                    min="1"
                    value={settings.maxCheckInsPerDay ?? 0}
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
                  checked={settings.allowWeekendCheckIn ?? false}
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
                Politicas e Termos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Politica de Cancelamento
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
                    placeholder="Descreva a politica de cancelamento do estudio..."
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Termos e condicoes</Label>
                  <textarea
                    value={settings.termsAndConditions || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        termsAndConditions: e.target.value,
                      })
                    }
                    rows={4}
                    placeholder="Descreva os termos e condicoes gerais..."
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">
                    Politica de Privacidade
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
                    placeholder="Descreva como os dados dos alunos sao tratados..."
                    className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-white focus:border-[#C2A537] focus:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Carousel Settings */}
      {activeTab === "carousel" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <Card className="border-[#C2A537]/30 bg-black/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <ImageIcon className="h-5 w-5" />
                Imagens do Carrossel
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-400">
                Configure ate 7 imagens para o carrossel da pagina inicial.
                Insira as URLs das imagens.
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 1</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage1 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage1: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 1"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage1 && (
                    <>
                      {isValidImageUrl(settings.carouselImage1) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage1}
                            alt="Preview 1"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 1:",
                                settings.carouselImage1,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 2</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage2 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage2: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 2"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage2 && (
                    <>
                      {isValidImageUrl(settings.carouselImage2) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage2}
                            alt="Preview 2"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 2:",
                                settings.carouselImage2,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 3</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage3 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage3: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 3"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage3 && (
                    <>
                      {isValidImageUrl(settings.carouselImage3) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage3}
                            alt="Preview 3"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 3:",
                                settings.carouselImage3,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 4 (opcional)</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage4 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage4: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 4"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage4 && (
                    <>
                      {isValidImageUrl(settings.carouselImage4) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage4}
                            alt="Preview 4"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 4:",
                                settings.carouselImage4,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 5 (opcional)</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage5 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage5: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 5"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage5 && (
                    <>
                      {isValidImageUrl(settings.carouselImage5) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage5}
                            alt="Preview 5"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 5:",
                                settings.carouselImage5,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 6 (opcional)</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage6 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage6: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 6"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage6 && (
                    <>
                      {isValidImageUrl(settings.carouselImage6) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage6}
                            alt="Preview 6"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 6:",
                                settings.carouselImage6,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[#C2A537]">Imagem 7 (opcional)</Label>
                  <Input
                    type="text"
                    value={settings.carouselImage7 || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        carouselImage7: e.target.value,
                      })
                    }
                    placeholder="URL da imagem 7"
                    className="border-slate-600 bg-slate-800 text-white focus:border-[#C2A537]"
                  />
                  {settings.carouselImage7 && (
                    <>
                      {isValidImageUrl(settings.carouselImage7) ? (
                        <div className="mt-2 h-32 w-full overflow-hidden rounded-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={settings.carouselImage7}
                            alt="Preview 7"
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.error(
                                "Erro ao carregar preview 7:",
                                settings.carouselImage7,
                              );
                              (e.target as HTMLImageElement).src =
                                "/placeholder-gym.jpg";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="mt-2 rounded-md border border-red-500 bg-red-500/10 p-3">
                          <p className="text-sm text-red-400">
                            ️ URL invalida. Use uma URL direta de imagem que
                            termine com .jpg, .png, .gif, etc.
                          </p>
                        </div>
                      )}
                    </>
                  )}
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
              Salvar Configuracoes
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}
