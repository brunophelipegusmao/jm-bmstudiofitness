"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { StudentFullData } from "@/actions/admin/get-students-full-data-action";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";
import { AdministrativeTab } from "@/components/Dashboard/AdministrativeTab";
import { BlogTab } from "@/components/Dashboard/BlogTab";
import { FinancialTab } from "@/components/Dashboard/FinancialTab";
import { StudentsTab } from "@/components/Dashboard/StudentsTab";
import { UserManagementContainer } from "@/components/Dashboard/UserManagementContainer";

interface AdminTabsProps {
  students: StudentFullData[];
}

export function AdminTabs({ students }: AdminTabsProps) {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "administrative");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

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
              {activeTab === "users" && "Gerenciar Usuários"}
              {activeTab === "financial" && "Gestão Financeira"}
              {activeTab === "blog" && "Gerenciar Blog"}
            </h1>
            <p className="text-slate-400">
              {activeTab === "administrative" &&
                "Cadastre novos alunos e gerencie dados do estúdio"}
              {activeTab === "students" &&
                "Busque e visualize dados completos dos alunos"}
              {activeTab === "users" &&
                "Gerencie usuários e permissões do sistema"}
              {activeTab === "financial" &&
                "Acompanhe relatórios e gestão financeira"}
              {activeTab === "blog" && "Crie e gerencie posts do blog"}
            </p>
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500">
            {activeTab === "administrative" && <AdministrativeTab />}
            {activeTab === "students" && <StudentsTab students={students} />}
            {activeTab === "users" && <UserManagementContainer />}
            {activeTab === "financial" && <FinancialTab />}
            {activeTab === "blog" && <BlogTab />}
          </div>
        </div>
      </div>
    </div>
  );
}
