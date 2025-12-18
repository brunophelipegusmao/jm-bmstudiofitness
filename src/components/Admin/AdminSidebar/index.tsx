"use client";

import {
  AlertTriangle,
  Building,
  CreditCard,
  FileText,
  Layers,
  LogOut,
  Menu,
  Settings,
  Shield,
  ShieldPlus,
  UserCog,
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
    id: "administrative",
    label: "Administrativo",
    icon: Building,
    href: "/admin/dashboard?tab=administrative",
    description: "Cadastrar novos alunos",
  },
  {
    id: "students",
    label: "Consultar Alunos",
    icon: Users,
    href: "/admin/dashboard?tab=students",
    description: "Buscar alunos",
  },
  {
    id: "users",
    label: "Usuários",
    icon: Shield,
    href: "/admin/dashboard?tab=users",
    description: "Gerenciar usuários",
  },
  {
    id: "employee",
    label: "Funcionários",
    icon: UserCog,
    href: "/admin/dashboard?tab=employee",
    description: "Gerenciar funcionários",
  },
  {
    id: "financial",
    label: "Financeiro",
    icon: CreditCard,
    href: "/admin/dashboard?tab=financial",
    description: "Gestão financeira",
  },
  {
    id: "blog",
    label: "Blog",
    icon: FileText,
    href: "/admin/dashboard?tab=blog",
    description: "Gerenciar posts",
  },
  {
    id: "plans",
    label: "Planos",
    icon: Layers,
    href: "/admin/dashboard?tab=plans",
    description: "Gerenciar planos",
  },
  {
    id: "settings",
    label: "Configurações",
    icon: Settings,
    href: "/admin/dashboard?tab=settings",
    description: "Configurações do estúdio",
  },
  {
    id: "maintenance",
    label: "Manutenção",
    icon: AlertTriangle,
    href: "/admin/maintenance",
    description: "Controle de manutenção",
  },
];

interface AdminSidebarProps {
  activeTab?: string;
}

export function AdminSidebar({
  activeTab = "administrative",
}: AdminSidebarProps) {
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
        className={`fixed top-0 left-0 z-40 flex h-screen w-72 flex-col border-r border-[#C2A537]/20 bg-gradient-to-b from-black via-slate-900 to-black transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo/Header */}
        <div className="border-b border-[#C2A537]/20 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#C2A537] to-[#D4B547]">
              <span className="text-xl font-bold text-black">JM</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#C2A537]">Admin Panel</h2>
              <p className="text-xs text-slate-400">Gestão Completa</p>
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

          {/* Botão especial para criar admin */}
          <div className="pt-4">
            <div className="mb-2 px-4 text-xs font-semibold tracking-wider text-slate-500 uppercase">
              Sistema
            </div>
            <Link
              href="/admin/create-admin"
              onClick={() => setIsOpen(false)}
              className="group flex items-center gap-3 rounded-lg border-2 border-[#C2A537]/30 bg-[#C2A537]/10 px-4 py-3 text-slate-300 transition-all duration-200 hover:border-[#C2A537] hover:bg-[#C2A537]/20 hover:text-[#C2A537]"
            >
              <ShieldPlus className="h-5 w-5 transition-transform duration-200 group-hover:scale-105" />
              <div className="flex-1">
                <div className="font-medium">Criar Admin</div>
                <div className="text-xs text-slate-500 group-hover:text-slate-400">
                  Novo administrador
                </div>
              </div>
            </Link>
          </div>
        </nav>

        {/* User Info & Logout */}
        <div className="border-t border-[#C2A537]/20 p-4">
          <div className="mb-3 rounded-lg bg-slate-800/50 p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#C2A537]/20 text-[#C2A537]">
                <Shield className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Admin</div>
                <div className="text-xs text-slate-400">Acesso Total</div>
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
