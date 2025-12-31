"use client";

import { ArrowLeft, ImageIcon, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { updateEventAction } from "@/actions/admin/manage-events-action";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Event } from "@/types/events";

interface EditEventFormProps {
  event: Event;
  onComplete: () => void;
  onCancel: () => void;
}

export function EditPostForm({
  event,
  onComplete,
  onCancel,
}: EditEventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    hideLocation: false,
    imageUrl: "",
    published: false,
    requireAttendance: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setFormData({
      title: event.title,
      description: event.description ?? "",
      date: event.date ? event.date.toISOString().slice(0, 10) : "",
      time: event.time || "",
      location: event.location || "",
      hideLocation: event.hideLocation ?? false,
      imageUrl: event.imageUrl || "",
      published: event.published ?? false,
      requireAttendance: event.requireAttendance ?? false,
    });
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.date) {
      alert("Preencha titulo, data e descricao do evento.");
      return;
    }

    try {
      setLoading(true);
      await updateEventAction(event.id, {
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
      onComplete();
    } catch (error) {
      console.error("Error updating event:", error);
      alert("Erro ao atualizar evento. Tente novamente.");
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
          <h2 className="text-2xl font-bold text-[#C2A537]">Editar Evento</h2>
          <p className="text-slate-400">
            Ajuste as informacoes do evento "{event.title}"
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
        <Card className="border-slate-700/50 bg-slate-800/30">
          <CardHeader>
            <CardTitle className="text-[#C2A537]">
              Informacoes do Evento
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
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Descreva o evento"
                className="min-h-[200px] w-full rounded-md border border-slate-600 bg-slate-800/50 px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                required
              />
            </div>

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
                onChange={(e) => handleChange("hideLocation", e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
              />
              <Label htmlFor="hideLocation" className="text-slate-300">
                Ocultar local na pagina publica
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-slate-300">
                URL da Imagem (opcional)
              </Label>
              <div className="relative">
                <ImageIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleChange("imageUrl", e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="border-slate-600 bg-slate-800/50 pl-10 text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="published"
                checked={formData.published}
                onChange={(e) => handleChange("published", e.target.checked)}
                className="rounded border-slate-600 bg-slate-800 text-[#C2A537] focus:ring-[#C2A537]"
              />
              <Label htmlFor="published" className="text-slate-300">
                Evento publicado
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

            <div className="rounded-lg border border-slate-600 bg-slate-700/50 p-4">
              <h4 className="mb-2 font-medium text-slate-300">
                Informacoes do Evento
              </h4>
              <div className="grid gap-2 text-sm text-slate-400">
                <div className="flex justify-between">
                  <span>Criado em:</span>
                  <span>
                    {event.createdAt
                      ? new Date(event.createdAt).toLocaleString("pt-BR")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Ultima atualizacao:</span>
                  <span>
                    {event.updatedAt
                      ? new Date(event.updatedAt).toLocaleString("pt-BR")
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status atual:</span>
                  <span
                    className={
                      event.published ? "text-green-400" : "text-orange-400"
                    }
                  >
                    {event.published ? "Publicado" : "Rascunho"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
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
                {loading ? "Salvando..." : "Salvar Alteracoes"}
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
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
