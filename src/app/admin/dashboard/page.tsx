"use client";

import { useEffect, useState } from "react";

import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import { AdminLayout } from "@/components/Admin/AdminLayout";
import {
  AdminTabs,
  DashboardHeader,
  LoadingSpinner,
} from "@/components/Dashboard";

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<StudentFullData[]>([]);
  const [loading, setLoading] = useState(true);

  // Função para carregar dados dos alunos
  const loadStudents = async () => {
    try {
      const data = await getAllStudentsFullDataAction();
      setStudents(data);
    } catch (error) {
      console.error("Erro ao carregar dados dos alunos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex min-h-screen items-center justify-center">
          <LoadingSpinner
            message="Carregando dashboard..."
            variant="gym"
            size="lg"
          />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen w-full p-2 lg:p-8 xl:p-12">
        <div className="mx-auto max-w-7xl space-y-8">
          {/* Cabeçalho */}
          <DashboardHeader
            title="🏋️ Dashboard Administrativo"
            description="Sistema completo de gestão da academia"
          />

          {/* Sistema de Abas */}
          <AdminTabs students={students} />
        </div>
      </div>
    </AdminLayout>
  );
}
