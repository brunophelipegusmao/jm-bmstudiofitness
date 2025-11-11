"use client";

import { useEffect, useState } from "react";

import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import { LoadingSpinner } from "@/components/Dashboard";
import { EmployeeTabs } from "@/components/Employee/EmployeeTabs";

export default function EmployeeDashboardPage() {
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
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-slate-900 to-black">
        <LoadingSpinner
          message="Carregando dashboard..."
          variant="gym"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-900 to-black">
      <EmployeeTabs students={students} />
    </div>
  );
}
