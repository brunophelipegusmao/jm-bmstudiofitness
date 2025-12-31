"use client";

import { CalendarCheck } from "lucide-react";

import { ManagePostForm } from "@/components/Admin/ManagePostForm";

export function EventsTab() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-800/30 p-3 text-sm text-slate-300">
        <CalendarCheck className="h-4 w-4 text-[#C2A537]" />
        <span>Gerencie os eventos publicados no site</span>
      </div>

      <div className="animate-in fade-in-50 slide-in-from-bottom-2">
        <ManagePostForm />
      </div>
    </div>
  );
}
