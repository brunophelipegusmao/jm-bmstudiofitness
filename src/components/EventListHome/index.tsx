"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

import { getPublishedEventsAction } from "@/actions/public/event-action";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Event } from "@/types/events";

export default function EventListHome() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const fetchedEvents = await getPublishedEventsAction();
        setEvents(fetchedEvents.slice(0, 6));
      } catch (error) {
        console.error("Error loading events:", error);
      } finally {
        setLoading(false);
      }
    }

    loadEvents();
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

        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 md:gap-8 lg:grid-cols-3"
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, index) => (
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
            ))
          ) : events.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-gray-400">Nenhum evento disponível no momento</p>
            </div>
          ) : (
            events.map((event) => (
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
                  <Card className="cursor-pointer border-gray-700 bg-black/50 backdrop-blur-sm transition-all duration-700 hover:border-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/20">
                    <CardHeader className="pb-3 sm:pb-4">
                      <div className="mb-2 text-xs uppercase tracking-wide text-gray-400">
                        {format(event.date, "dd/MM/yyyy", { locale: ptBR })}
                        {event.time ? ` • ${event.time}` : ""}
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
            ))
          )}
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
      </div>
    </motion.section>
  );
}
