"use client";

import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateEventFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    date: string;
    time?: string;
    location?: string;
    hideLocation?: boolean;
    imageUrl?: string;
    published: boolean;
  }) => Promise<void>;
  onCancel: () => void;
}

export function CreatePostFormAdvanced({
  onSubmit,
  onCancel,
}: CreateEventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    hideLocation: false,
    imageUrl: "",
    published: true,
    requireAttendance: false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      alert("Por favor, preencha titulo, data e descricao do evento.");
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time || undefined,
        location: formData.location || undefined,
        hideLocation: formData.hideLocation,
        imageUrl: formData.imageUrl || undefined,
        published: formData.published,
        requireAttendance: formData.requireAttendance,
      });
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Erro ao criar evento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="animate-in slide-in-from-right-5 space-y-6 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">Criar Evento</h2>
          <p className="text-slate-400">
            Preencha as informacoes para publicar um novo evento.
          </p>
        </div>
        <Button
          onClick={onCancel}
          className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">
                  Detalhes do Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-slate-300">
                    Titulo *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Digite o titulo do evento"
                    className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                    required
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date" className="text-slate-300">
                      Data *
                    </Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange("date", e.target.value)}
                      className="border-slate-600 bg-slate-800/50 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time" className="text-slate-300">
                      Hora
                    </Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange("time", e.target.value)}
                      className="border-slate-600 bg-slate-800/50 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-slate-300">
                    Descricao *
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Adicione os detalhes do evento"
                    className="min-h-[220px] w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    required
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">Local e Hora</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-slate-300">
                    Local (opcional)
                  </Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    placeholder="Ex: Rua das Flores, 123"
                    className="border-slate-600 bg-slate-800/50 text-white placeholder-slate-400"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="hideLocation"
                    checked={formData.hideLocation}
                    onChange={(e) =>
                      handleChange("hideLocation", e.target.checked)
                    }
                    className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
                  />
                  <Label htmlFor="hideLocation" className="text-slate-300">
                    Ocultar local na página pública
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
                <CardTitle className="text-[#C2A537]">Imagem</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <ImageIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange("imageUrl", e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                    className="border-slate-600 bg-slate-800/50 pl-10 text-white placeholder-slate-400"
                  />
                </div>
                {formData.imageUrl && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="h-32 w-full rounded border border-slate-600 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardHeader>
              <CardTitle className="text-[#C2A537]">Publicacao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) =>
                      handleChange("published", e.target.checked)
                    }
                  className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
                />
                <Label htmlFor="published" className="text-slate-300">
                  Publicar imediatamente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="requireAttendance"
                  checked={formData.requireAttendance}
                  onChange={(e) =>
                    handleChange("requireAttendance", e.target.checked)
                  }
                  className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
                />
                <Label htmlFor="requireAttendance" className="text-slate-300">
                  Solicitar confirmação de presença
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>
        </div>

        <div className="flex gap-4 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#C2A537] text-black hover:bg-[#D4B547] disabled:opacity-50"
          >
            {loading ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-black" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {loading ? "Criando..." : "Criar Evento"}
          </Button>

          <Button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="border-slate-600 bg-slate-700 text-slate-300 hover:bg-slate-600"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}
