"use client";

import { GraduationCap, LogOut } from "lucide-react";

import { logoutAction } from "@/actions/auth/logout-action";
import { Button } from "@/components/ui/button";

export function CoachHeader() {
  return (
    <header className="border-b border-[#C2A537] bg-black/95 px-6 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-[#C2A537]" />
          <div>
            <h1 className="text-xl font-bold text-[#C2A537]">
              JM Studio Fitness
            </h1>
            <p className="text-sm text-slate-400">Área do Coach</p>
          </div>
        </div>

        <form action={logoutAction}>
          <Button
            type="submit"
            variant="outline"
            className="border-red-500 text-red-400 hover:bg-red-500/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </form>
      </div>
    </header>
  );
}
