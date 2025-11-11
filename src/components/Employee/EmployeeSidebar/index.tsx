"use client";

import {
  CreditCard,
  FileText,
  LogOut,
  Menu,
  Shield,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { logoutAction } from "@/actions/auth/logout-action";
import { Button } from "@/components/ui/button";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ElementType;
  href: string;
  description: string;
}

const menuItems: SidebarItem[] = [
  {
    id: "students",
    label: "Consultar Alunos",
    icon: Users,
    href: "/employee/dashboard?tab=students",
    description: "Buscar e cadastrar alunos",
  },
  {
    id: "checkin",
    label: "Check-in",
    icon: UserCheck,
    href: "/employee/dashboard?tab=checkin",
    description: "Realizar check-in para alunos",
  },
  {
    id: "payments",
    label: "Mensalidades",
    icon: CreditCard,
    href: "/employee/dashboard?tab=payments",
    description: "Gerenciar pagamentos",
  },
  {
    id: "manual-receipt",
    label: "Recibos Manuais",
    icon: FileText,
    href: "/employee/dashboard?tab=manual-receipt",
    description: "Gerar recibos personalizados",
  },
];

interface EmployeeSidebarProps {
  activeTab?: string;
}

export function EmployeeSidebar({
  activeTab = "students",
}: EmployeeSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
      router.push("/");
    });
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-50 flex items-center justify-center rounded-lg border border-[#C2A537]/50 bg-black/90 p-2 text-[#C2A537] backdrop-blur-sm transition-all hover:bg-[#C2A537]/10 lg:hidden"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-[#C2A537]/20 bg-linear-to-b from-black via-slate-900 to-black transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Header */}
        <div className="border-b border-[#C2A537]/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-[#C2A537] to-[#D4B547]">
              <span className="text-xl font-bold text-black">JM</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#C2A537]">Funcionário</h2>
              <p className="text-xs text-slate-400">Gestão de Alunos</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                  isActive
                    ? "bg-[#C2A537] text-black shadow-lg shadow-[#C2A537]/25"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-[#C2A537]"
                }`}
              >
                <Icon
                  className={`h-5 w-5 transition-transform duration-200 ${
                    isActive ? "scale-110" : "group-hover:scale-105"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">{item.label}</div>
                  <div
                    className={`text-xs ${
                      isActive
                        ? "text-black/70"
                        : "text-slate-500 group-hover:text-slate-400"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {isActive && (
                  <div className="h-2 w-2 animate-pulse rounded-full bg-black" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-[#C2A537]/20 p-4">
          <div className="mb-3 rounded-lg bg-slate-800/50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C2A537]/20 text-[#C2A537]">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">
                  Funcionário
                </div>
                <div className="text-xs text-slate-400">Acesso Limitado</div>
              </div>
            </div>
          </div>

          <Button
            onClick={handleLogout}
            disabled={isPending}
            className="w-full justify-start gap-2 bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300"
          >
            {isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                Saindo...
              </>
            ) : (
              <>
                <LogOut className="h-4 w-4" />
                Sair
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
