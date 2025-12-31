"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarPlus,
  Clock,
  Globe,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getEventsCalendarAction } from "@/actions/public/event-action";
import {
  createPersonalEventAction,
  type CreatePersonalEventInput,
} from "@/actions/user/create-personal-event-action";
import {
  getPersonalEventsAction,
  type PersonalEvent,
} from "@/actions/user/get-personal-events-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BirthdayEntry, Event } from "@/types/events";

interface CombinedEvent extends Event {
  source: "public" | "personal";
  approvalStatus?: string;
  isPublic?: boolean;
}

export default function UserEventsPage() {
  const [publicEvents, setPublicEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [personalEvents, setPersonalEvents] = useState<CombinedEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(() => startOfDay(new Date()));
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CreatePersonalEventInput>({
    title: "",
    description: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "",
    location: "",
    hideLocation: false,
    requestPublic: false,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const calendar = await getEventsCalendarAction();
        setPublicEvents(calendar.events);
        setBirthdays(calendar.birthdays);

        const personal = await getPersonalEventsAction();
        const mapped = personal.map((p: PersonalEvent) => ({
          ...p,
          source: "personal" as const,
        }));
        setPersonalEvents(mapped);
      } catch (err) {
        console.error(err);
        setError("Erro ao carregar calendario");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const combinedEvents = useMemo(() => {
    return [
      ...publicEvents.map((e) => ({ ...e, source: "public" as const })),
      ...personalEvents,
    ];
  }, [publicEvents, personalEvents]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CombinedEvent[]>();
    combinedEvents.forEach((event) => {
      const key = format(startOfDay(event.date), "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, event]);
    });
    return map;
  }, [combinedEvents]);

  const birthdaysByMonthDay = useMemo(() => {
    const map = new Map<string, BirthdayEntry[]>();
    birthdays.forEach((birthday) => {
      const key = format(birthday.birthDate, "MM-dd");
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, birthday]);
    });
    return map;
  }, [birthdays]);

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 });
    const end = endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 });
    const days: Date[] = [];
    let cursor = start;
    while (cursor <= end) {
      days.push(cursor);
      cursor = addDays(cursor, 1);
    }
    return days;
  }, [currentMonth]);

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

  const selectedEvents = useMemo(() => {
    const key = format(startOfDay(selectedDate), "yyyy-MM-dd");
    return eventsByDate.get(key) ?? [];
  }, [eventsByDate, selectedDate]);

  const selectedBirthdays = useMemo(() => {
    const key = format(selectedDate, "MM-dd");
    return birthdaysByMonthDay.get(key) ?? [];
  }, [birthdaysByMonthDay, selectedDate]);

  const handleMonthChange = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => addMonths(prev, direction === "next" ? 1 : -1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    const payload = {
      ...form,
      time: form.time || undefined,
      location: form.location || undefined,
    };
    const result = await createPersonalEventAction(payload);
    if (result.success) {
      setMessage("Evento registrado. Aprovacao necessaria para torna-lo publico.");
      const personal = await getPersonalEventsAction();
      setPersonalEvents(
        personal.map((p) => ({ ...p, source: "personal" as const })),
      );
      setForm({ ...form, title: "", description: "", location: "", time: "", requestPublic: false });
    } else {
      setError(result.error || "Erro ao salvar evento");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-[#C2A537]">Carregando calendario...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/user/dashboard">
              <Button variant="ghost" className="text-[#C2A537]">
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#C2A537]">Meu Calendario</h1>
              <p className="text-sm text-slate-400">
                Eventos publicos e pessoais. Eventos pessoais podem ser tornados publicos apos aprovacao.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1.2fr]">
          <Card className="border-[#C2A537]/30 bg-slate-900/40">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg text-[#C2A537]">Calendario</CardTitle>
                <CardDescription className="text-slate-300">
                  Clique em um dia para ver eventos e aniversarios.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => handleMonthChange("prev")}>
                  &lt;
                </Button>
                <div className="text-sm font-semibold text-white">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </div>
                <Button variant="outline" size="icon" onClick={() => handleMonthChange("next")}>
                  &gt;
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-2 text-center text-xs uppercase tracking-wide text-slate-400">
                {weekDays.map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {monthDays.map((day) => {
                  const key = format(day, "yyyy-MM-dd");
                  const hasEvent = (eventsByDate.get(key) ?? []).length > 0;
                  const hasBirthday = birthdaysByMonthDay.has(format(day, "MM-dd"));
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = isSameDay(day, selectedDate);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedDate(startOfDay(day))}
                      className={`rounded-lg border p-3 text-left text-sm transition ${
                        isSelected
                          ? "border-[#C2A537] bg-[#C2A537]/10"
                          : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
                      } ${!isCurrentMonth ? "opacity-50" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{format(day, "d")}</span>
                        <div className="flex gap-1">
                          {hasEvent && <span className="h-2 w-2 rounded-full bg-[#C2A537]"></span>}
                          {hasBirthday && <span className="h-2 w-2 rounded-full bg-pink-400"></span>}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#C2A537]/30 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-lg text-[#C2A537]">Detalhes do dia</CardTitle>
              <CardDescription className="text-slate-300">
                {format(selectedDate, "eeee, d 'de' MMMM", { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedEvents.length === 0 && selectedBirthdays.length === 0 ? (
                <p className="text-slate-400">Nenhum evento ou aniversario neste dia.</p>
              ) : (
                <div className="space-y-4">
                  {selectedEvents.map((event) => (
                    <div
                      key={`${event.source}-${event.id}`}
                      className="rounded-lg border border-slate-800 bg-slate-900/60 p-3"
                    >
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        {event.source === "public" ? <Globe className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                        <span className="font-semibold text-white">{event.title}</span>
                        {event.source === "personal" && (
                          <Badge variant="outline" className="text-xs">
                            {event.approvalStatus || "privado"}
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-slate-400">{event.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        {event.time && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {event.time}
                          </span>
                        )}
                        {event.location && !event.hideLocation && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {event.location}
                          </span>
                        )}
                      </div>
                      {event.source === "public" && event.slug && (
                        <Link
                          className="mt-2 inline-flex text-xs text-[#C2A537] hover:underline"
                          href={`/events/event/${event.slug}`}
                        >
                          Ver detalhes
                        </Link>
                      )}
                    </div>
                  ))}

                  {selectedBirthdays.length > 0 && (
                    <div className="rounded-lg border border-pink-500/40 bg-pink-500/10 p-3">
                      <p className="font-semibold text-pink-200">Aniversarios</p>
                      <ul className="mt-2 space-y-1 text-sm text-pink-100">
                        {selectedBirthdays.map((b) => (
                          <li key={b.id}>{b.name}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Card className="border-[#C2A537]/30 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#C2A537]">
                <CalendarPlus className="h-5 w-5" /> Novo evento pessoal
              </CardTitle>
              <CardDescription className="text-slate-300">
                Registre eventos exclusivos; solicite publicacao para que aparecam para todos apos aprovacao.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {message && (
                <div className="mb-3 rounded-md border border-green-600 bg-green-900/40 p-2 text-sm text-green-200">
                  {message}
                </div>
              )}
              {error && (
                <div className="mb-3 rounded-md border border-red-600 bg-red-900/40 p-2 text-sm text-red-200">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Titulo</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="mt-1 bg-slate-900/60 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descricao</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    required
                    className="mt-1 bg-slate-900/60 text-white"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label>Data</Label>
                    <Input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      required
                      className="mt-1 bg-slate-900/60 text-white"
                    />
                  </div>
                  <div>
                    <Label>Hora</Label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      className="mt-1 bg-slate-900/60 text-white"
                    />
                  </div>
                  <div>
                    <Label>Local</Label>
                    <Input
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      placeholder="Opcional"
                      className="mt-1 bg-slate-900/60 text-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.hideLocation}
                      onChange={(e) => setForm({ ...form, hideLocation: e.target.checked })}
                    />
                    Ocultar local
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.requestPublic}
                      onChange={(e) => setForm({ ...form, requestPublic: e.target.checked })}
                    />
                    Solicitar que seja publico (precisa de aprovacao)
                  </label>
                </div>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-[#C2A537] font-semibold text-black hover:bg-[#d4b644]"
                >
                  {saving ? "Enviando..." : "Salvar evento"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-[#C2A537]/30 bg-slate-900/40">
            <CardHeader>
              <CardTitle className="text-[#C2A537]">Legenda</CardTitle>
              <CardDescription className="text-slate-300">
                Como os eventos aparecem no calendario.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#C2A537]"></span>
                <span>Eventos publicos / aprovados</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-pink-400"></span>
                <span>Aniversarios de usuarios</span>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                <p className="font-semibold text-white">Status dos meus eventos</p>
                <ul className="mt-2 space-y-1">
                  <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Privado (somente voce)</li>
                  <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> Pendente de aprovacao</li>
                  <li className="flex items-center gap-2"><Globe className="h-4 w-4" /> Publico (aprovado)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

