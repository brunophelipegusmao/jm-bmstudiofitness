import { DatabaseDiagnostic } from "@/components/Setup/DatabaseDiagnostic";

export const metadata = {
  title: "Diagnóstico de Banco de Dados - JM Studio Fitness",
  description:
    "Verifique a configuração e conexão com o banco de dados PostgreSQL",
};

export default function CheckDatabasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black px-4 py-12">
      <DatabaseDiagnostic />
    </div>
  );
}
