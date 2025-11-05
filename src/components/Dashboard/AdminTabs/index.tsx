"use client";
import { Building, CreditCard, Shield, Users } from "lucide-react";
import { useState } from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { AdministrativeTab } from "@/components/Dashboard/AdministrativeTab";
import { FinancialTab } from "@/components/Dashboard/FinancialTab";
import { StudentsTab } from "@/components/Dashboard/StudentsTab";
import { UserManagementContainer } from "@/components/Dashboard/UserManagementContainer";

interface AdminTabsProps {
  students: StudentFullData[];
}

export function AdminTabs({ students }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState("administrative");

  const tabs = [
    {
      id: "administrative",
      label: "Administrativo",
      icon: Building,
      description: "Cadastrar novos alunos e gerenciar dados",
      color: "from-green-600 to-emerald-500",
    },
    {
      id: "students",
      label: "Alunos",
      icon: Users,
      description: "Buscar e visualizar dados completos dos alunos",
      color: "from-blue-600 to-cyan-500",
    },
    {
      id: "users",
      label: "Usuários",
      icon: Shield,
      description: "Gerenciar usuários do sistema e permissões",
      color: "from-purple-600 to-violet-500",
    },
    {
      id: "financial",
      label: "Financeiro",
      icon: CreditCard,
      description: "Relatórios e gestão financeira",
      color: "from-amber-600 to-yellow-500",
    },
  ];

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Navigation Tabs */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#C2A537]/5 to-transparent blur-xl" />
        <nav className="relative flex space-x-2 rounded-xl border border-slate-700/50 bg-slate-800/50 p-2 backdrop-blur-sm">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 ${
                  isActive
                    ? "bg-[#C2A537] text-black shadow-lg shadow-[#C2A537]/25"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                } animate-in fade-in-50 slide-in-from-bottom-2`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Active background gradient */}
                {isActive && (
                  <div
                    className={`absolute inset-0 rounded-lg bg-gradient-to-r ${tab.color} animate-pulse opacity-10`}
                  />
                )}

                <div
                  className={`relative transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-105"}`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="relative hidden font-semibold sm:inline">
                  {tab.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="animate-in slide-in-from-top-1 absolute -bottom-1 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-black" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Description */}
      <div className="animate-in fade-in-50 text-center duration-300">
        <p className="text-slate-400">
          {tabs.find((tab) => tab.id === activeTab)?.description}
        </p>
      </div>

      {/* Enhanced Tab Content */}
      <div className="relative min-h-[500px]">
        {activeTab === "students" && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <StudentsTab students={students} />
          </div>
        )}

        {activeTab === "administrative" && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <AdministrativeTab />
          </div>
        )}

        {activeTab === "users" && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <UserManagementContainer />
          </div>
        )}

        {activeTab === "financial" && (
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            <FinancialTab />
          </div>
        )}
      </div>
    </div>
  );
}
