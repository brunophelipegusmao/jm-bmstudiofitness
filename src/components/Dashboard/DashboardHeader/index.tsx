import { LogOut, Sparkles } from "lucide-react";
import { ReactNode } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DashboardHeaderProps {
  title: string;
  description: string;
  showLogout?: boolean;
  children?: ReactNode;
}

export function DashboardHeader({
  title,
  description,
  showLogout = true,
  children,
}: DashboardHeaderProps) {
  return (
    <div className="relative mb-8 overflow-hidden lg:mb-12">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#C2A537]/20 via-black/95 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#D4B547]/15 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-[#C2A537]/10 via-transparent to-transparent" />

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 animate-bounce rounded-full bg-[#C2A537]/30"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + (i % 2) * 40}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`,
            }}
          />
        ))}
      </div>

      <Card className="animate-in fade-in-50 slide-in-from-top-4 relative border-[#C2A537]/40 bg-black/90 shadow-2xl shadow-[#C2A537]/10 backdrop-blur-sm transition-all duration-500 hover:border-[#C2A537]/60 hover:shadow-2xl hover:shadow-[#C2A537]/20">
        <CardHeader className="relative p-6 lg:p-8">
          {/* Enhanced shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C2A537]/10 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100" />

          <div className="relative flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="text-center lg:text-left">
              <CardTitle className="group animate-in slide-in-from-left-5 relative bg-linear-to-r from-[#C2A537] via-[#D4B547] to-[#C2A537] bg-clip-text text-3xl font-bold text-transparent transition-all duration-500 hover:scale-105 lg:text-4xl xl:text-5xl">
                <span className="inline-flex items-center gap-2 transition-transform duration-300 group-hover:-translate-y-0.5">
                  <Sparkles className="h-8 w-8 animate-pulse text-[#C2A537]" />
                  {title}
                </span>

                {/* Glowing underline */}
                <div className="absolute -bottom-2 left-0 h-1 w-0 bg-linear-to-r from-[#C2A537] to-[#D4B547] transition-all duration-500 group-hover:w-full" />
              </CardTitle>

              <CardDescription
                className="animate-in slide-in-from-left-5 mt-4 text-base text-slate-300 transition-all duration-300 hover:text-slate-200 lg:text-lg xl:text-xl"
                style={{ animationDelay: "200ms" }}
              >
                {description}
              </CardDescription>
            </div>

            <div
              className="animate-in slide-in-from-right-5 flex items-center gap-4 lg:gap-6"
              style={{ animationDelay: "400ms" }}
            >
              {children}

              {showLogout && (
                <form
                  action={logoutAction}
                  className="transition-transform duration-300 hover:scale-110"
                >
                  <Button
                    type="submit"
                    variant="outline"
                    className="group relative overflow-hidden border-[#C2A537]/50 bg-black/80 px-6 py-3 text-[#C2A537] backdrop-blur-sm transition-all duration-300 hover:border-[#C2A537] hover:bg-[#C2A537]/10 hover:text-[#D4B547] hover:shadow-xl hover:shadow-[#C2A537]/30"
                  >
                    {/* Enhanced hover glow */}
                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-[#C2A537]/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <LogOut className="relative mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="relative">Sair</span>
                  </Button>
                </form>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
