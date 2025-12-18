import Link from "next/link";
import { redirect } from "next/navigation";

import { hasAdminUser } from "@/actions/setup/first-admin";
import { FirstAdminForm } from "@/components/Setup/FirstAdminForm";

export const metadata = {
  title: "Setup Inicial | JM Fitness Studio",
  description: "Configuração inicial do sistema",
};

export default async function SetupPage() {
  // Verifica se já existe um admin
  const adminExists = await hasAdminUser();

  // Se já existe admin, redireciona para a página de login
  if (adminExists) {
    redirect("/admin/login");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-black via-slate-900 to-black p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Link para diagnóstico */}
        <div className="text-center">
          <Link
            href="/setup/check-database"
            className="inline-flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-[#C2A537]"
          >
            🔧 Problemas de conexão? Clique aqui para diagnóstico
          </Link>
        </div>

        <FirstAdminForm />
      </div>
    </div>
  );
}
