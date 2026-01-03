"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarClock,
  Loader2,
  MapPin,
  Share2,
  Ticket,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import {
  confirmEventAttendanceAction,
  getPublishedEventBySlugAction,
} from "@/actions/public/event-action";
import { deletePersonalEventAction } from "@/actions/user/delete-personal-event-action";
import { updatePersonalEventAction } from "@/actions/user/update-personal-event-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import type { Event } from "@/types/events";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = useMemo(() => {
    const value = params?.slug;
    if (!value) return "";
    return Array.isArray(value) ? value[0] : value.toString();
  }, [params]);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmName, setConfirmName] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [confirmationSuccess, setConfirmationSuccess] = useState<string | null>(
    null,
  );
  const { user } = useCurrentUser();

  const isPersonal = slug?.startsWith("personal-");
  const personalId = isPersonal ? slug.replace("personal-", "") : null;
  const userRole = user?.role?.toUpperCase?.();
  const privilegedRoles = new Set([
    "MASTER",
    "ADMIN",
    "FUNCIONARIO",
    "EMPLOYEE",
  ]);

  const canManagePersonal =
    isPersonal &&
    !!user &&
    ((!!user.id && event?.authorId === user.id) ||
      (userRole ? privilegedRoles.has(userRole) : false));

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState<string | null>("");
  const [editLocation, setEditLocation] = useState<string | null>("");
  const [editHideLocation, setEditHideLocation] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  useEffect(() => {
    if (!slug) return;
    async function loadEvent() {
      setLoading(true);
      setError(null);
      try {
        const data = await getPublishedEventBySlugAction(slug);
        if (!data) {
          setError("Evento não encontrado ou não publicado.");
          setEvent(null);
        } else {
          setEvent(data);
        }
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o evento.");
      } finally {
        setLoading(false);
      }
    }
    void loadEvent();
  }, [slug]);

  useEffect(() => {
    if (event) {
      setEditTitle(event.title);
      setEditDescription(event.description);
      setEditDate(event.date ? format(event.date, "yyyy-MM-dd") : "");
      setEditTime(event.time ?? "");
      setEditLocation(event.location ?? "");
      setEditHideLocation(event.hideLocation ?? false);
    }
  }, [event]);

  const formattedDate = useMemo(() => {
    if (!event) return "";
    return format(event.date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  }, [event]);

  const formattedTime = useMemo(() => {
    if (!event?.time) return null;
    return event.time;
  }, [event]);

  const handleConfirmAttendance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!event?.requireAttendance || !slug) return;
    setConfirming(true);
    setConfirmationSuccess(null);
    try {
      const result = await confirmEventAttendanceAction(slug, {
        name: confirmName.trim(),
        email: confirmEmail.trim() || undefined,
      });
      if (result.success) {
        setConfirmationSuccess("Presença confirmada com sucesso!");
        setConfirmName("");
        setConfirmEmail("");
      } else {
        setError("Não foi possível confirmar presença. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      setError("Falha ao confirmar presença. Verifique os dados e tente novamente.");
    } finally {
      setConfirming(false);
    }
  };

  const handleUpdatePersonal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!personalId || !canManagePersonal) return;
    setSavingEdit(true);
    setError(null);
    try {
      await updatePersonalEventAction({
        id: personalId,
        title: editTitle,
        description: editDescription,
        date: editDate,
        time: editTime || null,
        location: editLocation || null,
        hideLocation: editHideLocation,
      });
      const refreshed = await getPublishedEventBySlugAction(slug);
      if (refreshed) setEvent(refreshed);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      setError("Não foi possível atualizar o evento.");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePersonal = async () => {
    if (!personalId || !canManagePersonal) return;
    setSavingEdit(true);
    setError(null);
    try {
      await deletePersonalEventAction(personalId);
      router.push("/events");
    } catch (err) {
      console.error(err);
      setError("Não foi possível excluir o evento.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <section className="relative w-full bg-linear-to-b from-black via-slate-900/80 to-black pb-12 pt-16 sm:pt-20">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent" />
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              className="border-[#C2A537]/40 bg-black/50 text-[#C2A537] hover:border-[#C2A537] hover:bg-[#C2A537]/10"
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
            <Badge className="bg-[#C2A537]/15 text-[#C2A537]">
              Evento
            </Badge>
          </div>

          {loading ? (
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <div className="h-64 animate-pulse rounded-2xl bg-slate-900/60" />
              <div className="h-64 animate-pulse rounded-2xl bg-slate-900/60" />
            </div>
          ) : error ? (
            <Card className="border-red-500/30 bg-red-900/20 text-red-100">
              <CardHeader>
                <CardTitle>Erro</CardTitle>
                <CardDescription className="text-red-200">
                  {error}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : event ? (
            <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
              <Card className="border-[#C2A537]/30 bg-linear-to-br from-black/70 via-slate-900/70 to-black/80 shadow-xl shadow-[#C2A537]/10">
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-[#C2A537]">
                    <CalendarClock className="h-5 w-5" />
                    <span>{formattedDate}</span>
                    {formattedTime ? <span>• {formattedTime}</span> : null}
                  </div>
                  <div>
                    <CardTitle className="text-3xl text-white">
                      {event.title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-slate-300">
                      {event.summary || event.description.slice(0, 180)}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {event.imageUrl ? (
                    <div className="overflow-hidden rounded-xl border border-[#C2A537]/20">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="h-64 w-full object-cover transition duration-700 hover:scale-[1.02]"
                      />
                    </div>
                  ) : null}

                  {!event.hideLocation && event.location ? (
                    <div className="flex items-center gap-2 text-sm text-slate-200">
                      <MapPin className="h-4 w-4 text-[#C2A537]" />
                      <span>{event.location}</span>
                    </div>
                  ) : null}

                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                    <h3 className="text-lg font-semibold text-white">Descrição</h3>
                    <p className="whitespace-pre-line text-slate-200 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-[#C2A537]/30 bg-slate-950/70">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                      <Ticket className="h-5 w-5" />
                      Participação
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Confirme presença ou compartilhe com a sua equipe.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <Share2 className="h-4 w-4 text-[#C2A537]" />
                      <span>Link: /events/event/{event.slug}</span>
                    </div>

                    {event.requireAttendance ? (
                      <form
                        onSubmit={handleConfirmAttendance}
                        className="space-y-3 rounded-lg border border-slate-800 bg-black/40 p-3"
                      >
                        <div className="space-y-1">
                          <Label htmlFor="name">Nome</Label>
                          <Input
                            id="name"
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                            placeholder="Seu nome completo"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="email">Email (opcional)</Label>
                          <Input
                            id="email"
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            placeholder="voce@email.com"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={confirming}
                          className="w-full bg-[#C2A537] text-black hover:bg-[#c7b04a]"
                        >
                          {confirming ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : null}
                          Confirmar presença
                        </Button>
                        {confirmationSuccess ? (
                          <p className="text-sm text-green-300">
                            {confirmationSuccess}
                          </p>
                        ) : null}
                        {error ? (
                          <p className="text-sm text-red-300">{error}</p>
                        ) : null}
                      </form>
                    ) : (
                      <p className="rounded-lg border border-slate-800 bg-slate-900/50 p-3 text-sm text-slate-200">
                        Este evento não requer confirmação de presença.
                      </p>
                    )}

                    {canManagePersonal ? (
                      <div className="space-y-3 rounded-lg border border-[#C2A537]/30 bg-black/40 p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-[#C2A537]">
                            Gerenciar evento pessoal
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditMode((prev) => !prev)}
                            className="text-slate-200 hover:text-[#C2A537]"
                          >
                            {editMode ? "Cancelar edição" : "Editar"}
                          </Button>
                        </div>

                        {editMode ? (
                          <form className="space-y-3" onSubmit={handleUpdatePersonal}>
                            <div className="space-y-1">
                              <Label htmlFor="edit-title">Título</Label>
                              <Input
                                id="edit-title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="edit-description">Descrição</Label>
                              <Textarea
                                id="edit-description"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                required
                                className="min-h-[80px]"
                              />
                            </div>
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              <div className="space-y-1">
                                <Label htmlFor="edit-date">Data</Label>
                                <Input
                                  id="edit-date"
                                  type="date"
                                  value={editDate}
                                  onChange={(e) => setEditDate(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="edit-time">Hora</Label>
                                <Input
                                  id="edit-time"
                                  type="time"
                                  value={editTime ?? ""}
                                  onChange={(e) => setEditTime(e.target.value || "")}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor="edit-location">Local (opcional)</Label>
                              <Input
                                id="edit-location"
                                value={editLocation ?? ""}
                                onChange={(e) => setEditLocation(e.target.value)}
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="edit-hide"
                                checked={editHideLocation}
                                onCheckedChange={(checked) =>
                                  setEditHideLocation(!!checked)
                                }
                              />
                              <Label htmlFor="edit-hide" className="text-sm text-slate-200">
                                Ocultar local
                              </Label>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="submit"
                                disabled={savingEdit}
                                className="bg-[#C2A537] text-black hover:bg-[#c7b04a]"
                              >
                                {savingEdit ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Salvar alterações
                              </Button>
                              <Button
                                type="button"
                                variant="destructive"
                                disabled={savingEdit}
                                onClick={handleDeletePersonal}
                              >
                                Excluir evento
                              </Button>
                            </div>
                          </form>
                        ) : (
                          <Button
                            variant="destructive"
                            className="w-full"
                            disabled={savingEdit}
                            onClick={handleDeletePersonal}
                          >
                            Excluir evento
                          </Button>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="border-[#C2A537]/20 bg-black/60">
                  <CardHeader>
                    <CardTitle className="text-base text-[#C2A537]">
                      Observações
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Informações adicionais sobre o evento.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      readOnly
                      value={
                        event.summary ||
                        "Fique atento às comunicações da academia para mais detalhes."
                      }
                      className="min-h-[80px] bg-slate-900/60 text-slate-200"
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
