"use client";

import { Edit3, Eye, EyeOff, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import {
  createEventAction,
  deleteEventAction,
  getEventsAction,
  downloadEventAttendancePdfAction,
  getEventAttendanceAction,
  updateEventAction,
} from "@/actions/admin/manage-events-action";
import { CreatePostFormAdvanced } from "@/components/Dashboard/CreatePostFormAdvanced";
import { EditPostForm } from "@/components/Dashboard/EditPostForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Event } from "@/types/events";

export function ManagePostForm() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [attendanceByEvent, setAttendanceByEvent] = useState<
    Record<string, Awaited<ReturnType<typeof getEventAttendanceAction>>>
  >({});
  const [loadingAttendanceId, setLoadingAttendanceId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await getEventsAction();
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem gerenciar eventos.");
      } else {
        alert("Erro ao carregar eventos. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoadAttendance = async (eventId: string) => {
    if (attendanceByEvent[eventId]) return;
    try {
      setLoadingAttendanceId(eventId);
      const data = await getEventAttendanceAction(eventId);
      setAttendanceByEvent((prev) => ({ ...prev, [eventId]: data }));
    } catch (error) {
      console.error("Error loading attendance:", error);
      alert("Erro ao carregar confirmações.");
    } finally {
      setLoadingAttendanceId(null);
    }
  };

  const handleCreateEvent = async (eventData: {
    title: string;
    description: string;
    date: string;
    time?: string;
    location?: string;
    hideLocation?: boolean;
    imageUrl?: string;
    published: boolean;
  }) => {
    try {
      await createEventAction(eventData);
      setShowCreateForm(false);
      await loadEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem criar eventos.");
      } else {
        alert("Erro ao criar evento. Tente novamente.");
      }
      throw error;
    }
  };

  const handleTogglePublished = async (
    eventId: string,
    published: boolean,
  ) => {
    try {
      await updateEventAction(eventId, { published });
      await loadEvents();
    } catch (error) {
      console.error("Error updating event:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem editar eventos.");
      } else {
        alert("Erro ao atualizar evento. Tente novamente.");
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) {
      return;
    }

    try {
      await deleteEventAction(eventId);
      await loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      if (
        error instanceof Error &&
        error.message.includes("Apenas administradores")
      ) {
        alert("Acesso negado. Apenas administradores podem excluir eventos.");
      } else {
        alert("Erro ao excluir evento. Tente novamente.");
      }
    }
  };

  const handleDownloadReport = async (event: Event) => {
    try {
      setDownloadingId(event.id);
      const blob = await downloadEventAttendancePdfAction(event.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `confirmacoes-${event.slug}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Erro ao baixar relatório de confirmações.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (showCreateForm) {
    return (
      <CreatePostFormAdvanced
        onSubmit={handleCreateEvent}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (editingEvent) {
    return (
      <EditPostForm
        event={editingEvent}
        onComplete={() => {
          setEditingEvent(null);
          loadEvents();
        }}
        onCancel={() => setEditingEvent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#C2A537]">
            Gerenciar Eventos
          </h2>
          <p className="text-slate-400">
            Crie e atualize os eventos publicados no site
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#C2A537] text-black hover:bg-[#D4B547]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Evento
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-[#C2A537]"></div>
        </div>
      ) : (
        <div className="grid gap-6">
          {events.length === 0 ? (
            <Card className="border-slate-700/50 bg-slate-800/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-center text-slate-400">
                  Nenhum evento encontrado.
                  <br />
                  Clique em &quot;Novo Evento&quot; para cadastrar.
                </p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const attendance = attendanceByEvent[event.id];
              const hasAttendance = attendance && attendance.length > 0;
              const showAttendance = Boolean(attendance);

              return (
              <Card
                key={event.id}
                className="border-slate-700/50 bg-slate-800/30"
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="mb-2 text-lg text-white">
                        {event.title}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span>{event.published ? "Publicado" : "Rascunho"}</span>
                        <span>
                          {event.date.toLocaleDateString("pt-BR")}
                          {event.time ? ` às ${event.time}` : ""}
                        </span>
                        {event.location && !event.hideLocation && (
                          <span>{event.location}</span>
                        )}
                        <span>{event.views ?? 0} visualizacoes</span>
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleTogglePublished(event.id, !event.published)
                        }
                        className="border-[#C2A537] bg-[#C2A537] text-black hover:bg-[#D4B547]"
                      >
                        {event.published ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setEditingEvent(event)}
                        className="border-[#C2A537] bg-[#C2A537] text-black hover:bg-[#D4B547]"
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="border-red-600 bg-red-600 text-white hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadReport(event)}
                        disabled={downloadingId === event.id}
                        className="border-[#C2A537] text-[#C2A537] hover:bg-[#C2A537]/10"
                      >
                        {downloadingId === event.id ? "Baixando..." : "Relatório"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLoadAttendance(event.id)}
                        disabled={loadingAttendanceId === event.id}
                        className="border-slate-600 text-slate-200 hover:bg-slate-700"
                      >
                        {loadingAttendanceId === event.id
                          ? "Carregando..."
                          : "Ver confirmações"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-slate-300">
                    {event.summary || event.description}
                  </p>
                  {showAttendance && (
                    <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-white">
                          Confirmações ({attendance?.length ?? 0})
                        </h4>
                      </div>
                      {hasAttendance ? (
                        <div className="mt-2 space-y-2 text-sm text-slate-200">
                          {attendance!.map((a) => (
                            <div
                              key={a.id}
                              className="flex flex-col rounded border border-slate-800 bg-slate-900/60 px-3 py-2"
                            >
                              <span className="font-semibold">{a.name}</span>
                              {a.email && (
                                <span className="text-slate-400">{a.email}</span>
                              )}
                              <span className="text-xs text-slate-500">
                                Confirmado em:{" "}
                                {new Date(a.confirmedAt).toLocaleString("pt-BR")}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">
                          Nenhuma confirmação registrada.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
