"use client";

import { Bell, CalendarCheck, CheckCircle,Clock } from "lucide-react";
import { useEffect, useState } from "react";

import { approvePersonalEventAction } from "@/actions/admin/approve-personal-event-action";
import { getPendingPersonalEventsAction } from "@/actions/admin/get-pending-personal-events-action";
import { ManagePostForm } from "@/components/Admin/ManagePostForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PendingEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  eventTime?: string | null;
  userName?: string | null;
  approvalStatus?: string | null;
}

export function EventsTab() {
  const [pendingEvents, setPendingEvents] = useState<PendingEvent[]>([]);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    const loadPending = async () => {
      const events = await getPendingPersonalEventsAction();
      setPendingEvents(events);
    };
    loadPending();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 text-sm text-slate-300">
        <CalendarCheck className="h-4 w-4 text-[#C2A537]" />
        <span>Gerencie os eventos publicados no site</span>
      </div>

      <Card className="border-yellow-600/40 bg-yellow-900/10">
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
          <Bell className="h-5 w-5 text-yellow-300" />
          <div>
            <CardTitle className="text-lg text-yellow-300">
              Eventos de alunos aguardando revisão
            </CardTitle>
            <p className="text-sm text-white/70">
              Inclui eventos pessoais pendentes ou privados solicitando
              publicação.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {pendingEvents.length === 0 ? (
            <p className="text-sm text-white/70">
              Nenhuma solicitação pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className="space-y-2 rounded-lg border border-yellow-700/60 bg-yellow-900/15 p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {event.title}
                      </p>
                      {event.userName && (
                        <p className="text-xs text-white/70">
                          Aluno: {event.userName}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="border-yellow-500 text-yellow-300"
                      >
                        {new Date(event.eventDate).toLocaleDateString("pt-BR")}
                      </Badge>
                      {event.eventTime && (
                        <span className="flex items-center gap-1 text-xs text-white/70">
                          <Clock className="h-3 w-3" /> {event.eventTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs text-white/70">
                    {event.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-yellow-600 text-black">
                      {event.approvalStatus ? event.approvalStatus : "Pendente"}
                    </Badge>
                    <Button
                      size="sm"
                      className="bg-green-600 text-white hover:bg-green-500"
                      disabled={approvingId === event.id}
                      onClick={async () => {
                        setApprovingId(event.id);
                        const result = await approvePersonalEventAction(
                          event.id,
                        );
                        if (result.success) {
                          const events = await getPendingPersonalEventsAction();
                          setPendingEvents(events);
                        }
                        setApprovingId(null);
                      }}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Aprovar e publicar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="animate-in fade-in-50 slide-in-from-bottom-2">
        <ManagePostForm />
      </div>
    </div>
  );
}
