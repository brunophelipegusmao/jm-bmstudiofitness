import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Controle de Manutencao | Admin",
  description: "Gerenciar modo manutencao e redirecionamentos do sistema",
};

export default function MaintenancePage() {
  redirect("/admin/dashboard?tab=maintenance");
}
