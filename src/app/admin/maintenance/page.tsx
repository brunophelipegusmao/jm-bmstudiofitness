import { Metadata } from "next";

import { MaintenanceControlPanel } from "@/components/Admin/MaintenanceControl";

export const metadata: Metadata = {
  title: "Controle de Manutenção | Admin",
  description: "Gerenciar modo manutenção e redirecionamentos do sistema",
};

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Controle de Manutenção</h1>
        <p className="text-muted-foreground mt-2">
          Ative ou desative o modo manutenção e configure redirecionamentos do
          sistema
        </p>
      </div>

      <MaintenanceControlPanel />
    </div>
  );
}
