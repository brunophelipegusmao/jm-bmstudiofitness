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
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Cake,
  CalendarClock,
  MapPin,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getEventsCalendarAction } from "@/actions/public/event-action";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BirthdayEntry, Event } from "@/types/events";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() =>
    startOfDay(new Date()),
  );
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await getEventsCalendarAction();
        setEvents(data.events);
        setBirthdays(data.birthdays);
        if (data.events.length > 0) {
          const firstEventDate = startOfDay(data.events[0].date);
          setSelectedDate(firstEventDate);
          setCurrentMonth(firstEventDate);
        }
      } catch (error) {
        console.error("Erro ao carregar eventos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCalendar();
  }, []);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const key = format(startOfDay(event.date), "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, event]);
    });
    return map;
  }, [events]);

  const birthdaysByMonthDay = useMemo(() => {
    const map = new Map<string, BirthdayEntry[]>();
    birthdays.forEach((birthday) => {
      const key = format(birthday.birthDate, "MM-dd");
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, birthday]);
    });
    return map;
  }, [birthdays]);

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(startOfDay(selectedDate), "yyyy-MM-dd");
    return eventsByDate.get(key) ?? [];
  }, [eventsByDate, selectedDate]);

  const selectedBirthdays = useMemo(() => {
    if (!selectedDate) return [];
    const key = format(selectedDate, "MM-dd");
    return birthdaysByMonthDay.get(key) ?? [];
  }, [birthdaysByMonthDay, selectedDate]);

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

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <motion.section
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-linear-to-b from-black via-slate-900 to-black py-20"
      >
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8"
          >
            <Link href="/">
              <Button
                variant="outline"
                className="border-[#C2A537]/30 bg-black/50 text-[#C2A537] backdrop-blur-sm hover:border-[#C2A537] hover:bg-[#C2A537]/10"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para Home
              </Button>
            </Link>
          </motion.div>

          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mb-6 text-4xl font-bold md:text-6xl"
            >
              <span className="text-[#C2A537]">Eventos</span> JM Fitness Studio
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mx-auto max-w-3xl text-xl text-slate-300"
            >
              Confira nossa agenda e os aniversários da comunidade. Toque rápido
              em um evento para abrir os detalhes.
            </motion.p>
          </div>
        </div>
      </motion.section>

      <section className="relative w-full bg-black py-12 sm:py-16 md:py-20">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent" />
        <div className="relative z-10 mx-auto max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="lg:col-span-2"
            >
              <Card className="border-[#C2A537]/30 bg-linear-to-br from-black/70 via-slate-900/60 to-black/60 shadow-2xl shadow-[#C2A537]/10 backdrop-blur-lg">
                <CardHeader className="pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-lg text-[#C2A537]">
                      Calendário interativo
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Toque rápido em um dia marcado para ver eventos ou
                      aniversários.
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="h-[360px] w-full animate-pulse rounded-xl border border-dashed border-[#C2A537]/30 bg-slate-900/40" />
                  ) : (
                    <div className="w-full rounded-xl border border-[#C2A537]/30 bg-gradient-to-br from-slate-900/70 via-black/80 to-slate-950/70 p-4 text-white shadow-xl shadow-[#C2A537]/10">
                      <div className="mb-4 flex items-center justify-between rounded-lg bg-black/30 px-3 py-2 ring-1 ring-[#C2A537]/20">
                        <div className="text-base font-semibold text-[#C2A537]">
                          {format(currentMonth, "LLLL yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setCurrentMonth(
                                startOfMonth(addMonths(currentMonth, -1)),
                              )
                            }
                            className="h-9 w-9 rounded-lg border border-[#C2A537]/30 bg-[#C2A537]/10 text-[#C2A537] transition hover:-translate-y-0.5 hover:border-[#C2A537] hover:bg-[#C2A537]/20"
                            aria-label="Mês anterior"
                          >
                            ‹
                          </button>
                          <button
                            onClick={() =>
                              setCurrentMonth(
                                startOfMonth(addMonths(currentMonth, 1)),
                              )
                            }
                            className="h-9 w-9 rounded-lg border border-[#C2A537]/30 bg-[#C2A537]/10 text-[#C2A537] transition hover:-translate-y-0.5 hover:border-[#C2A537] hover:bg-[#C2A537]/20"
                            aria-label="Próximo mês"
                          >
                            ›
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 gap-2 px-1 text-center text-xs font-semibold uppercase tracking-wide text-[#C2A537]/80">
                        {weekDays.map((day) => (
                          <div key={day}>{day}</div>
                        ))}
                      </div>

                      <div className="mt-3 grid grid-cols-7 gap-2 px-1">
                        {monthDays.map((day) => {
                          const key = format(startOfDay(day), "yyyy-MM-dd");
                          const monthDayKey = format(day, "MM-dd");
                          const dayEvents = eventsByDate.get(key) ?? [];
                          const dayBirthdays =
                            birthdaysByMonthDay.get(monthDayKey) ?? [];
                          const selected =
                            selectedDate && isSameDay(selectedDate, day);
                          const isCurrent = isSameMonth(day, currentMonth);

                          return (
                            <button
                              key={key}
                              onClick={() => {
                                const normalized = startOfDay(day);
                                setSelectedDate(normalized);
                                if (!isSameMonth(day, currentMonth)) {
                                  setCurrentMonth(startOfMonth(day));
                                }
                              }}
                              className={`group relative flex h-16 w-full flex-col items-center justify-center rounded-xl transition-all duration-200 ${
                                selected
                                  ? "border border-[#C2A537] bg-[#C2A537]/15 shadow-[0_0_12px_rgba(194,165,55,0.35)]"
                                  : "border border-transparent bg-slate-900/60 hover:-translate-y-1 hover:border-[#C2A537]/40 hover:bg-[#C2A537]/10"
                              } ${isCurrent ? "text-slate-100" : "text-slate-500"}`}
                            >
                              <span className="text-sm font-semibold">
                                {format(day, "d", { locale: ptBR })}
                              </span>
                              <div className="mt-1 flex items-center gap-1">
                                {dayEvents.length > 0 && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#C2A537] shadow-[0_0_6px_rgba(194,165,55,0.8)]" />
                                )}
                                {dayBirthdays.length > 0 && (
                                  <span className="h-1.5 w-1.5 rounded-full bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#C2A537]/20 pt-3 text-sm text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#C2A537] shadow-[0_0_6px_rgba(194,165,55,0.8)]" />
                      <span>Eventos publicados</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-pink-400 shadow-[0_0_6px_rgba(244,114,182,0.8)]" />
                      <span>Aniversários dos usuários</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs">
                        Clique no evento para abrir
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            >
              <Card className="border-[#C2A537]/30 bg-linear-to-b from-black/80 via-slate-900/70 to-black/80 shadow-lg shadow-[#C2A537]/10 backdrop-blur-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg text-[#C2A537]">
                    <CalendarClock className="h-5 w-5" />
                    Detalhes do dia
                  </CardTitle>
                  <CardDescription className="text-slate-300">
                    {selectedDate
                      ? format(selectedDate, "EEEE, dd 'de' MMMM", {
                          locale: ptBR,
                        })
                      : "Selecione uma data no calendário"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading ? (
                    <div className="space-y-3">
                      <div className="h-4 w-2/3 animate-pulse rounded bg-slate-800" />
                      <div className="h-20 animate-pulse rounded-xl bg-slate-900/60" />
                      <div className="h-16 animate-pulse rounded-xl bg-slate-900/60" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <PartyPopper className="h-4 w-4 text-[#C2A537]" />
                          Eventos do dia
                        </div>
                        {selectedEvents.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            Nenhum evento para esta data. Escolha outro dia no
                            calendário.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {selectedEvents.map((event, index) => (
                              <Link
                                key={event.id}
                                href={`/events/event/${event.slug}`}
                              >
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{
                                    duration: 0.2,
                                    delay: 0.05 * index,
                                  }}
                                  whileHover={{ scale: 1.01, y: -2 }}
                                  whileTap={{ scale: 0.99 }}
                                  className="group rounded-xl border border-slate-800 bg-black/40 p-3 transition-all duration-200 hover:border-[#C2A537] hover:bg-[#C2A537]/5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <h4 className="text-base font-semibold text-white group-hover:text-[#C2A537]">
                                      {event.title}
                                    </h4>
                                    <Badge className="bg-[#C2A537]/15 text-[#C2A537]">
                                      Detalhes
                                    </Badge>
                                  </div>
                                  <p className="mt-1 text-sm text-slate-300 line-clamp-2">
                                    {event.summary || event.description}
                                  </p>
                                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                      <CalendarClock className="h-4 w-4 text-[#C2A537]" />
                                      {format(event.date, "dd/MM/yyyy", {
                                        locale: ptBR,
                                      })}
                                      {event.time ? ` às ${event.time}` : ""}
                                    </span>
                                    {!event.hideLocation && event.location && (
                                      <span className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4 text-[#C2A537]" />
                                        {event.location}
                                      </span>
                                    )}
                                  </div>
                                </motion.div>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 border-t border-[#C2A537]/20 pt-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Cake className="h-4 w-4 text-pink-300" />
                          Aniversários
                        </div>
                        {selectedBirthdays.length === 0 ? (
                          <p className="text-sm text-slate-400">
                            Nenhum aniversariante nesta data.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {selectedBirthdays.map((birthday, index) => (
                              <motion.div
                                key={birthday.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                  duration: 0.2,
                                  delay: 0.05 * index,
                                }}
                                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/40 px-3 py-2"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    {birthday.name}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {format(birthday.birthDate, "dd/MM", {
                                      locale: ptBR,
                                    })}
                                  </p>
                                </div>
                                <Badge className="bg-pink-500/15 text-pink-200">
                                  Parabéns
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={containerVariants}
          >
            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    className="rounded-xl border border-slate-800 bg-black/40 p-4 backdrop-blur-sm"
                  >
                    <div className="mb-4 h-4 w-24 animate-pulse rounded bg-slate-700" />
                    <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-slate-700" />
                    <div className="h-16 w-full animate-pulse rounded bg-slate-800" />
                  </motion.div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="py-16 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="mb-4 text-2xl font-bold text-slate-400">
                    Nenhum evento encontrado
                  </h2>
                  <p className="mb-6 text-slate-500">
                    Assim que novos eventos forem publicados, eles aparecerão
                    aqui.
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
                {events.map((event) => (
                  <motion.div
                    key={event.id}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    whileHover={{
                      scale: 1.02,
                      y: -5,
                      transition: { duration: 0.3 },
                    }}
                    whileTap={{
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                    className="group"
                  >
                    <Link href={`/events/event/${event.slug}`}>
                      <Card className="h-full cursor-pointer border-gray-700 bg-black/50 backdrop-blur-sm transition-all duration-700 hover:border-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/20">
                        <CardHeader className="pb-3 sm:pb-4">
                          <div className="mb-2 flex items-center justify-between text-sm text-slate-300">
                            <span className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-[#C2A537]" />
                              {format(event.date, "dd 'de' MMMM", {
                                locale: ptBR,
                              })}
                              {event.time ? ` às ${event.time}` : ""}
                            </span>
                          </div>

                          <CardTitle className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#C2A537]">
                            {event.title}
                          </CardTitle>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          <CardDescription className="leading-relaxed text-gray-300 line-clamp-3">
                            {event.summary || event.description}
                          </CardDescription>

                          {!event.hideLocation && event.location && (
                            <div className="flex items-center gap-2 text-sm text-slate-300">
                              <MapPin className="h-4 w-4 text-[#C2A537]" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
