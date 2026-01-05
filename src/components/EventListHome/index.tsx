"use client";

import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { getEventsCalendarAction } from "@/actions/public/event-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BirthdayEntry, Event } from "@/types/events";

export default function EventListHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  useEffect(() => {
    async function loadCalendar() {
      try {
        const data = await getEventsCalendarAction();
        setEvents((data.events || []).slice(0, 6));
        setBirthdays(data.birthdays || []);
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    }

    void loadCalendar();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
    },
  };

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

  const renderCalendar = () => {
    const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    return (
      <div className="rounded-2xl border border-[#C2A537]/20 bg-black/40 p-4 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between text-white">
          <div className="text-lg font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, -1))}
              className="rounded border border-[#C2A537]/40 px-2 py-1 text-sm text-[#C2A537] hover:bg-[#C2A537]/10"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
              className="rounded border border-[#C2A537]/40 px-2 py-1 text-sm text-[#C2A537] hover:bg-[#C2A537]/10"
            >
              Próximo
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-400 sm:text-sm">
          {weekDays.map((day) => (
            <div key={day} className="pb-2 font-semibold uppercase tracking-wide">
              {day}
            </div>
          ))}
          {monthDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const hasEvent = eventsByDate.has(key);
            const hasBirthday = birthdaysByMonthDay.has(format(day, "MM-dd"));
            const isCurrentMonth = isSameMonth(day, currentMonth);
            return (
              <div
                key={key}
                className={`flex h-16 flex-col items-center justify-center rounded-lg border border-slate-700/50 bg-slate-900/40 text-white ${
                  isCurrentMonth ? "" : "opacity-50"
                }`}
              >
                <div className="text-sm font-semibold">{format(day, "d")}</div>
                <div className="mt-1 flex gap-1">
                  {hasEvent && <span className="h-2 w-2 rounded-full bg-[#C2A537]" />}
                  {hasBirthday && <span className="h-2 w-2 rounded-full bg-pink-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const eventsToShow = events.slice(0, 3);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
      className="relative w-full bg-black py-12 sm:py-16 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-8 text-center sm:mb-12 md:mb-16"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-3 text-3xl font-bold text-[#C2A537] sm:mb-4 sm:text-4xl"
          >
            Próximos Eventos
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-base text-gray-300 sm:text-lg"
          >
            Fique por dentro do que acontece no estúdio e garanta sua presença.
          </motion.p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div key={index} variants={cardVariants} className="group">
                <Card className="border-gray-700 bg-black/50 backdrop-blur-sm">
                  <CardHeader className="pb-3 sm:pb-4">
                    <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-700" />
                    <div className="h-6 w-3/4 animate-pulse rounded bg-gray-700" />
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="h-4 w-full animate-pulse rounded bg-gray-700" />
                      <div className="h-4 w-2/3 animate-pulse rounded bg-gray-700" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : eventsToShow.length === 0 ? (
          renderCalendar()
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3"
            >
              {eventsToShow.map((event) => (
                <motion.div
                  key={event.id}
                  variants={cardVariants}
                  transition={{
                    duration: 0.6,
                    ease: "easeOut",
                  }}
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
                    <Card className="cursor-pointer overflow-hidden border-gray-700 bg-black/50 backdrop-blur-sm transition-all duration-700 hover:border-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/20">
                      <div className="relative w-full">
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-black to-slate-800">
                          {event.imageUrl ? (
                            <Image
                              src={event.imageUrl}
                              alt={event.title}
                              fill
                              className="object-contain bg-black transition-transform duration-500 group-hover:scale-105"
                              sizes="(max-width: 768px) 100vw, 33vw"
                              priority={false}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                              Imagem do evento
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                        </div>
                        <div className="pointer-events-none absolute inset-0 border-b border-[#C2A537]/20" />
                      </div>

                      <CardHeader className="pb-3 sm:pb-4">
                        <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">
                          {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                          {event.time ? ` às ${event.time}` : ""}
                        </div>
                        <CardTitle className="text-xl font-bold text-white transition-colors duration-300 group-hover:text-[#C2A537]">
                          {event.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pt-0">
                        <CardDescription className="leading-relaxed text-gray-300 line-clamp-3">
                          {event.summary || event.description}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-8 text-center sm:mt-10 md:mt-12"
            >
              <Link href="/events">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="rounded-lg bg-[#C2A537] px-6 py-2.5 text-sm font-semibold text-black transition-all duration-300 hover:bg-[#D4B547] focus:ring-2 focus:ring-[#C2A537] focus:ring-offset-2 focus:ring-offset-black focus:outline-none sm:px-8 sm:py-3 sm:text-base"
                >
                  Ver todos os eventos
                </motion.button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </motion.section>
  );
}
