"use client";

import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createFirstAdmin } from "@/actions/setup/first-admin";
import { Modal } from "@/components/ui/Modal";

export function FirstAdminForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [modal, setModal] = useState<{
    isOpen: boolean;
    type: "success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (formData.password !== formData.confirmPassword) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Senhas não coincidem",
        message:
          "As senhas digitadas não são iguais. Por favor, verifique e tente novamente.",
      });
      return;
    }

    if (formData.password.length < 6) {
      setModal({
        isOpen: true,
        type: "error",
        title: "Senha muito curta",
        message:
          "A senha deve ter no mínimo 6 caracteres para garantir a segurança.",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log("📝 Criando administrador...");

      const result = await createFirstAdmin({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        cpf: formData.cpf,
        password: formData.password,
      });

      console.log("✅ Resultado:", result);

      if (result.success) {
        setModal({
          isOpen: true,
          type: "success",
          title: "Sucesso!",
          message:
            result.message ||
            "Administrador criado com sucesso! Você será redirecionado para a página de login.",
        });

        // Aguarda 3 segundos e redireciona
        setTimeout(() => {
          console.log("🔄 Redirecionando para login...");
          router.push("/admin/login");
          router.refresh();
        }, 3000);
      } else {
        setModal({
          isOpen: true,
          type: "error",
          title: "Erro ao criar administrador",
          message:
            result.error ||
            "Ocorreu um erro ao criar o administrador. Tente novamente.",
        });
      }
    } catch (error) {
      console.error("❌ Erro ao criar admin:", error);
      setModal({
        isOpen: true,
        type: "error",
        title: "Erro inesperado",
        message:
          "Ocorreu um erro inesperado. Verifique sua conexão e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={handleCloseModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-[#C2A537] to-[#D4B547]">
            <ShieldCheck className="h-8 w-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-[#C2A537]">
            Configuração Inicial
          </h1>
          <p className="text-slate-400">
            Crie o primeiro usuário administrador do sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-medium text-slate-300"
            >
              Nome Completo *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#C2A537]/20 bg-black/50 px-4 py-2 text-white placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
              placeholder="Digite seu nome completo"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-300"
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#C2A537]/20 bg-black/50 px-4 py-2 text-white placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-slate-300"
              >
                Telefone
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#C2A537]/20 bg-black/50 px-4 py-2 text-white placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="cpf"
                className="text-sm font-medium text-slate-300"
              >
                CPF
              </label>
              <input
                id="cpf"
                name="cpf"
                type="text"
                value={formData.cpf}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#C2A537]/20 bg-black/50 px-4 py-2 text-white placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
                placeholder="000.000.000-00"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300"
            >
              Senha *
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#C2A537]/20 bg-black/50 px-4 py-2 text-white placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-300"
            >
              Confirmar Senha *
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#C2A537]/20 bg-black/50 px-4 py-2 text-white placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537] focus:outline-none"
              placeholder="Repita a senha"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-linear-to-r from-[#C2A537] to-[#D4B547] px-4 py-3 font-semibold text-black transition-all hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Criando administrador...
              </span>
            ) : (
              "Criar Administrador"
            )}
          </button>
        </form>

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <p className="text-sm text-blue-300">
            <strong>⚠️ Atenção:</strong> Esta página só está disponível porque
            não existe nenhum administrador no sistema. Após criar o primeiro
            admin, esta página não estará mais acessível.
          </p>
        </div>
      </div>
    </>
  );
}
