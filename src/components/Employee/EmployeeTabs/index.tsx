"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  getAllStudentsFullDataAction,
  StudentFullData,
} from "@/actions/admin/get-students-full-data-action";
import { StudentsTab } from "@/components/Dashboard/StudentsTab";
import { EmployeeCheckInTab } from "@/components/Employee/EmployeeCheckInTab";
import { EmployeeManualReceiptTab } from "@/components/Employee/EmployeeManualReceiptTab";
import { EmployeePaymentsTab } from "@/components/Employee/EmployeePaymentsTab";
import { EmployeeSidebar } from "@/components/Employee/EmployeeSidebar";

interface EmployeeTabsProps {
  students: StudentFullData[];
}

export function EmployeeTabs({ students: initialStudents }: EmployeeTabsProps) {
  const searchParams = useSearchParams();
  const activeTab = searchParams?.get("tab") || "students";
  const [students, setStudents] = useState<StudentFullData[]>(initialStudents);

  // Função para recarregar dados dos alunos
  const loadStudents = async () => {
    try {
      const data = await getAllStudentsFullDataAction();
      setStudents(data);
    } catch (error) {
      console.error("Erro ao carregar alunos:", error);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  return (
    <div className="flex min-h-screen">
      <EmployeeSidebar activeTab={activeTab} />

      {/* Main Content */}
      <main className="flex-1 lg:ml-72">
        <div className="p-4 lg:p-8">
          {activeTab === "students" && <StudentsTab students={students} />}
          {activeTab === "checkin" && <EmployeeCheckInTab />}
          {activeTab === "payments" && <EmployeePaymentsTab />}
          {activeTab === "manual-receipt" && <EmployeeManualReceiptTab />}
        </div>
      </main>
    </div>
  );
}
