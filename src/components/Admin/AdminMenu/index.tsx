import {
  ClipboardCheck,
  DollarSign,
  LayoutDashboard,
  Loader2,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

import { logoutAction } from "@/actions/auth/logout-action";

interface AdminMenuProps {
  className?: string;
}

export function AdminMenu({ className = "" }: AdminMenuProps) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  // Função para lidar com o logout
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const menuItems = [
    {
      href: "/admin/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      description: "Visão geral e dados dos alunos",
    },
    {
      href: "/admin/checkins",
      label: "Check-ins",
      icon: ClipboardCheck,
      description: "Relatórios de presença",
    },
    {
      href: "/admin/financeiro",
      label: "Financeiro",
      icon: DollarSign,
      description: "Controle financeiro",
    },
    {
      href: "/cadastro",
      label: "Novo Aluno",
      icon: Users,
      description: "Cadastrar novo aluno",
    },
  ];

  return (
    <nav className={`h-max-screen space-y-2 ${className}`}>
      <div className="mb-3 sm:mb-4">
        <h2 className="text-base font-semibold text-[#C2A537] sm:text-lg">
          🏋️ <span className="xs:inline hidden">Painel</span> Admin
        </h2>
        <p className="hidden text-xs text-slate-400 sm:block sm:text-sm">
          Área restrita - Acesso total
        </p>
      </div>

      {menuItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-2 rounded-lg p-2 transition-colors sm:gap-3 sm:p-3 ${
              isActive
                ? "bg-[#C2A537] text-black"
                : "text-slate-300 hover:bg-[#C2A537]/20 hover:text-[#C2A537]"
            }`}
          >
            <item.icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium sm:text-base">
                {item.label}
              </p>
              <p
                className={`hidden text-xs sm:block ${
                  isActive ? "text-black/70" : "text-slate-500"
                }`}
              >
                {item.description}
              </p>
            </div>
          </Link>
        );
      })}

      <div className="mt-6 space-y-2 border-t border-slate-700 pt-3 sm:mt-8 sm:pt-4">
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-lg p-2 text-slate-300 transition-colors hover:bg-slate-800 hover:text-white sm:gap-3 sm:p-3"
        >
          <Settings className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium sm:text-base">
              <span className="sm:hidden">Config</span>
              <span className="hidden sm:inline">Configurações</span>
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              Configurações do sistema
            </p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          disabled={isPending}
          className="flex w-full items-center gap-2 rounded-lg p-2 text-slate-300 transition-colors hover:bg-red-900/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50 sm:gap-3 sm:p-3"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin sm:h-5 sm:w-5" />
          ) : (
            <LogOut className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
          )}
          <div className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium sm:text-base">
              {isPending ? "Saindo..." : "Sair"}
            </p>
            <p className="hidden text-xs text-slate-500 sm:block">
              {isPending ? "Encerrando sessão..." : "Encerrar sessão"}
            </p>
          </div>
        </button>
      </div>
    </nav>
  );
}
