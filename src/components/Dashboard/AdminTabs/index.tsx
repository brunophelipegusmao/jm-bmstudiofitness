"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { AdminPlansTab } from "@/components/Admin/AdminPlansTab";
import { AdminSettingsTab } from "@/components/Admin/AdminSettingsTab";
import { MaintenanceControlPanel } from "@/components/Admin/MaintenanceControl";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";
import { AdministrativeTab } from "@/components/Dashboard/AdministrativeTab";
import { EventsTab } from "@/components/Dashboard/BlogTab";
import { EmployeeTab } from "@/components/Dashboard/EmployeeTab";
import { FinancialTab } from "@/components/Dashboard/FinancialTab";
import { StudentsTab } from "@/components/Dashboard/StudentsTab";
import { UserManagementContainer } from "@/components/Dashboard/UserManagementContainer";
import { useAuth } from "@/contexts/AuthContext";

interface AdminTabsProps {
  students: StudentFullData[];
  onStudentsChange?: () => void | Promise<void>;
}

export function AdminTabs({ students, onStudentsChange }: AdminTabsProps) {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const tabParam = searchParams.get("tab");
  const normalizedTab = tabParam === "blog" ? "events" : tabParam;
  const isMaster = user?.role === "master";
  const requestedTab = normalizedTab || "administrative";
  const activeTab =
    requestedTab === "maintenance" && !isMaster
      ? "administrative"
      : requestedTab;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar activeTab={activeTab} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        <div className="container mx-auto p-6">
          {/* Page Header */}
          <div className="animate-in fade-in-50 slide-in-from-top-4 mb-8">
            <h1 className="mb-2 text-3xl font-bold text-[#C2A537]">
              {activeTab === "administrative" && "Painel Administrativo"}
              {activeTab === "students" && "Consultar Alunos"}
              {activeTab === "users" && "Gerenciar Usuarios"}
              {activeTab === "employee" && "Funcionarios"}
              {activeTab === "financial" && "Gestao Financeira"}
              {activeTab === "events" && "Gerenciar Eventos"}
              {activeTab === "plans" && "Planos"}
              {activeTab === "settings" && "Configuracoes do Estudio"}
              {activeTab === "maintenance" && "Manutencao do Sistema"}
            </h1>
            <p className="text-slate-400">
              {activeTab === "administrative" &&
                "Cadastre novos alunos e gerencie dados do estudio"}
              {activeTab === "students" &&
                "Busque e visualize dados completos dos alunos"}
              {activeTab === "users" &&
                "Gerencie usuarios e permissoes do sistema"}
              {activeTab === "employee" &&
                "Gerencie funcionarios e seus dados"}
              {activeTab === "financial" &&
                "Acompanhe relatorios e gestao financeira"}
              {activeTab === "events" && "Crie e gerencie eventos"}
              {activeTab === "plans" &&
                "Gerencie os planos exibidos na pagina de planos"}
              {activeTab === "settings" &&
                "Configure lista de espera e outros ajustes do estudio"}
              {activeTab === "maintenance" &&
                "Apenas MASTER: controle de modo manutencao e rotas liberadas"}
            </p>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {activeTab === "administrative" && (
              <AdministrativeTab
                user={{ id: "", name: "", userRole: "" }}
                onStudentsChange={onStudentsChange}
              />
            )}
            {activeTab === "students" && (
              <StudentsTab
                students={students}
                onStudentsChange={onStudentsChange}
              />
            )}
            {activeTab === "users" && <UserManagementContainer />}
            {activeTab === "employee" && <EmployeeTab />}
            {activeTab === "financial" && <FinancialTab />}
            {activeTab === "events" && <EventsTab />}
            {activeTab === "plans" && <AdminPlansTab />}
            {activeTab === "settings" && <AdminSettingsTab />}
            {activeTab === "maintenance" &&
              (isMaster ? (
                <MaintenanceControlPanel />
              ) : (
                <div className="rounded-lg border border-orange-500/40 bg-orange-500/10 p-6 text-sm text-orange-300">
                  Acesso restrito ao perfil MASTER.
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
