import { Dumbbell } from "lucide-react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UserDashboardHeaderProps {
  userName: string;
}

export function UserDashboardHeader({ userName }: UserDashboardHeaderProps) {
  return (
    <div className="relative mb-6 overflow-hidden lg:mb-8">
      {/* Background animado com múltiplas camadas */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#C2A537]/30 via-black/95 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#D4B547]/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#C2A537]/10 via-transparent to-transparent" />

      {/* Efeito de partículas flutuantes */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute top-1/4 left-1/4 h-2 w-2 animate-bounce rounded-full bg-[#C2A537]"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="absolute top-3/4 right-1/3 h-1 w-1 animate-bounce rounded-full bg-[#D4B547]"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-1/2 right-1/4 h-1.5 w-1.5 animate-bounce rounded-full bg-[#C2A537]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Card className="hover:shadow-3xl relative border-[#C2A537]/50 bg-black/80 shadow-2xl shadow-[#C2A537]/20 backdrop-blur-md transition-all duration-700 hover:border-[#C2A537]/70 hover:shadow-[#C2A537]/30">
        <CardHeader className="relative p-6 lg:p-8">
          {/* Efeito de brilho interno */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C2A537]/8 to-transparent opacity-0 transition-opacity duration-700 hover:opacity-100" />

          <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
            {/* Seção principal com ícone e texto */}
            <div className="flex items-center gap-4 text-center lg:text-left">
              {/* Ícone do haltere animado */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-full bg-[#C2A537]/30 blur-md transition-all duration-500 group-hover:bg-[#D4B547]/40 group-hover:blur-lg" />
                <div className="relative rounded-full bg-gradient-to-br from-[#C2A537] to-[#D4B547] p-3 transition-all duration-500 hover:scale-110 hover:rotate-12 lg:p-4">
                  <Dumbbell className="h-6 w-6 text-black transition-transform duration-300 group-hover:rotate-180 lg:h-8 lg:w-8" />
                </div>
              </div>

              <div className="space-y-2">
                <CardTitle className="group relative">
                  {/* Texto principal com gradiente animado */}
                  <span className="bg-gradient-to-r from-[#C2A537] via-[#D4B547] to-[#C2A537] bg-clip-text text-2xl font-bold text-transparent transition-all duration-500 hover:scale-105 lg:text-3xl xl:text-4xl">
                    <span className="inline-block transition-transform duration-300 group-hover:translate-y-[-2px]">
                      🏋️ Bem-vindo, {userName}!
                    </span>
                  </span>

                  {/* Underline animado */}
                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r from-[#C2A537] to-[#D4B547] transition-all duration-500 group-hover:w-full" />
                </CardTitle>

                <CardDescription className="text-sm text-slate-300 transition-all duration-300 hover:text-slate-200 lg:text-base xl:text-lg">
                  <span className="relative">
                    Sua área pessoal do
                    <span className="mx-1 font-semibold text-[#C2A537]">
                      JM Fitness Studio
                    </span>
                    {/* Efeito de destaque */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C2A537]/20 to-transparent opacity-0 transition-opacity duration-300 hover:opacity-100" />
                  </span>
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
