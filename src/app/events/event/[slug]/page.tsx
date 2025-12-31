import { ArrowLeft, CalendarClock, Eye, MapPin, User } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getPublishedEventBySlugAction,
  incrementEventViewsAction,
} from "@/actions/public/event-action";
import ShareButton from "@/components/ShareButton";
import { EventAttendanceForm } from "@/components/EventAttendanceForm";
import { Button } from "@/components/ui/button";

interface Props {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = params;
    const event = await getPublishedEventBySlugAction(slug);

    if (!event) {
      return {
        title: "Evento não encontrado | JM Fitness Studio",
      };
    }

    return {
      title: `${event.title} | JM Fitness Studio`,
      description: event.description || event.summary || undefined,
      openGraph: {
        title: event.title,
        description: event.description || event.summary || undefined,
        type: "article",
        locale: "pt_BR",
        images: event.imageUrl ? [event.imageUrl] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: event.title,
        description: event.description || event.summary || undefined,
        images: event.imageUrl ? [event.imageUrl] : [],
      },
    };
  } catch {
    return {
      title: "Evento não encontrado | JM Fitness Studio",
    };
  }
}

export default async function EventPage({ params }: Props) {
  try {
    const { slug } = params;
    const event = await getPublishedEventBySlugAction(slug);

    if (!event) {
      notFound();
    }

    await incrementEventViewsAction(event.id);

    const formattedDate = event.date.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return (
      <div className="min-h-screen bg-black text-white">
        <section className="border-b border-slate-800 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link href="/events">
              <Button className="bg-[#C2A537] text-black transition-all duration-300 hover:bg-[#D4B547] hover:text-black">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para eventos
              </Button>
            </Link>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8 lg:flex-row">
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                  {event.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    JM Fitness Studio
                  </span>
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" />
                    {formattedDate}
                    {event.time ? ` às ${event.time}` : ""}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    {(event.views ?? 0) + 1} visualizações
                  </span>
                </div>

                {!event.hideLocation && event.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-200">
                    <MapPin className="h-4 w-4 text-[#C2A537]" />
                    <span>{event.location}</span>
                  </div>
                )}

                <ShareButton
                  title={event.title}
                  excerpt={event.summary || event.description}
                />
              </div>

              {event.imageUrl && (
                <div className="overflow-hidden rounded-lg border border-slate-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-auto w-full object-cover"
                  />
                </div>
              )}

              <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-6 text-lg leading-relaxed text-slate-200">
                {event.description}
              </div>
            </div>

            <div className="w-full max-w-md space-y-6">
              {event.requireAttendance ? (
                <>
                  <EventAttendanceForm slug={event.slug} />
                  <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
                    <p>
                      Após confirmar, seu nome constará na lista de presença
                      deste evento.
                    </p>
                    <p className="mt-2">
                      Caso precise cancelar ou alterar, entre em contato com
                      nossa equipe.
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4 text-sm text-slate-300">
                  <p>
                    Este evento não requer confirmação de presença. Compareça
                    no horário informado e aproveite.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    );
  } catch (error) {
    console.error("Error loading event:", error);
    redirect("/events");
  }
}
