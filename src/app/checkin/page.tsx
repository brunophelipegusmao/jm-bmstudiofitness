"use client";

import Link from "next/link";

import QuickCheckInCard from "@/components/QuickCheckIn";

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-900 to-black px-4 py-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="flex w-full items-center justify-between text-sm text-[#C2A537]">
          <Link
            href="/"
            className="rounded-lg border border-[#C2A537]/30 px-3 py-2 text-[#C2A537] transition hover:bg-[#C2A537]/10"
          >
            ← Voltar
          </Link>
          <span className="font-semibold">Check-in rápido</span>
        </div>
        <div className="w-full max-w-2xl">
          <QuickCheckInCard />
        </div>
      </div>
    </div>
  );
}
