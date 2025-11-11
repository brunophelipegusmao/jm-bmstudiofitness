"use client";

import { motion } from "framer-motion";
import { Clock, Heart, Send, Target, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getWaitlistPublicAction,
  joinWaitlistAction,
} from "@/actions/admin/waitlist-actions";

interface WaitlistEntry {
  id: string;
  fullName: string;
  position: number;
  createdAt: Date;
}

export default function WaitlistPage() {
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    preferredShift: "",
    goal: "",
    healthRestrictions: "",
  });

  useEffect(() => {
    loadWaitlist();
  }, []);

  async function loadWaitlist() {
    try {
      const result = await getWaitlistPublicAction();
      if (result.success && result.data) {
        setWaitlist(result.data);
      }
    } catch (error) {
      console.error("Erro ao carregar lista:", error);
    } finally {
      setLoading(false);
    }
  }

  function formatPhone(value: string) {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "");

    // Formata para (XX) XXXXX-XXXX
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const result = await joinWaitlistAction(formData);

      if (result.success) {
        setMessage({
          type: "success",
          text:
            result.message || "Cadastro realizado! Logo entraremos em contato.",
        });
        setFormData({
          fullName: "",
          email: "",
          whatsapp: "",
          preferredShift: "",
          goal: "",
          healthRestrictions: "",
        });
        loadWaitlist(); // Recarrega lista
      } else {
        setMessage({
          type: "error",
          text: result.error || "Erro ao realizar cadastro",
        });
      }
    } catch {
      setMessage({
        type: "error",
        text: "Erro ao realizar cadastro",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-black">
      {/* Hero Section */}
      <section className="relative px-4 py-24">
        <div className="absolute inset-0 bg-gradient-to-r from-[#C2A537]/10 to-[#D4B547]/10" />

        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#C2A537] to-[#D4B547] shadow-lg shadow-[#C2A537]/30">
              <Users className="h-10 w-10 text-black" />
            </div>

            <h1 className="mb-6 text-5xl font-bold text-[#C2A537] md:text-6xl">
              Lista de Espera
            </h1>
            <p className="mx-auto max-w-2xl text-xl font-medium text-white">
              Ainda dá tempo! Entre na lista de espera e garanta sua vaga.
              <br />
              <span className="text-slate-400">
                Logo abriremos novas turmas e entraremos em contato.
              </span>
            </p>
          </motion.div>

          {/* Formulário */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-16 max-w-2xl"
          >
            <div className="rounded-2xl border-2 border-[#C2A537]/30 bg-slate-900/50 p-8 shadow-xl shadow-[#C2A537]/10 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-[#C2A537]" />
                <h2 className="text-2xl font-bold text-[#C2A537]">
                  Cadastre-se na Lista
                </h2>
              </div>

              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 rounded-lg border-2 p-4 ${
                    message.type === "success"
                      ? "border-green-500/50 bg-green-500/10 text-green-400"
                      : "border-red-500/50 bg-red-500/10 text-red-400"
                  }`}
                >
                  {message.text}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    placeholder="Seu nome completo"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.whatsapp}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    className="w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    placeholder="(11) 99999-9999"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Turno Preferido *
                  </label>
                  <select
                    required
                    value={formData.preferredShift}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferredShift: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-white focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                  >
                    <option value="">Selecione um turno</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Target className="h-4 w-4" />
                    Objetivo *
                  </label>
                  <textarea
                    required
                    value={formData.goal}
                    onChange={(e) =>
                      setFormData({ ...formData, goal: e.target.value })
                    }
                    rows={3}
                    className="w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    placeholder="Descreva seu objetivo (ex: perder peso, ganhar massa, condicionamento físico...)"
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
                    <Heart className="h-4 w-4" />
                    Restrições de Saúde (Opcional)
                  </label>
                  <textarea
                    value={formData.healthRestrictions}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        healthRestrictions: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full rounded-lg border-2 border-slate-700 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-[#C2A537] focus:ring-2 focus:ring-[#C2A537] focus:outline-none"
                    placeholder="Alguma condição de saúde que devemos saber? (lesões, alergias, etc.)"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#C2A537] to-[#D4B547] py-4 font-bold text-black shadow-lg shadow-[#C2A537]/30 transition-all duration-200 hover:from-[#D4B547] hover:to-[#C2A537] hover:shadow-xl hover:shadow-[#C2A537]/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Entrar na Lista de Espera
                    </>
                  )}
                </button>
              </form>
            </div>
          </motion.div>

          {/* Lista de Espera Pública */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mx-auto max-w-4xl"
          >
            <div className="rounded-2xl border-2 border-[#C2A537]/30 bg-slate-900/50 p-8 shadow-xl shadow-[#C2A537]/10 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-3">
                <Clock className="h-6 w-6 text-[#C2A537]" />
                <h2 className="text-2xl font-bold text-[#C2A537]">
                  Fila de Espera
                </h2>
                <span className="ml-auto rounded-full border border-[#C2A537]/30 bg-[#C2A537]/20 px-3 py-1 text-sm font-bold text-[#C2A537]">
                  {waitlist.length} pessoas aguardando
                </span>
              </div>

              {loading ? (
                <div className="py-8 text-center text-slate-500">
                  Carregando...
                </div>
              ) : waitlist.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Seja o primeiro da lista!
                </div>
              ) : (
                <div className="space-y-3">
                  {waitlist.map((entry) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-4 rounded-lg border-2 border-slate-700/50 bg-slate-800/30 p-4 transition-all hover:border-[#C2A537]/50"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C2A537]/50 bg-gradient-to-br from-[#C2A537]/30 to-[#D4B547]/30">
                        <span className="text-lg font-bold text-[#C2A537]">
                          {entry.position}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {entry.fullName}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Posição na fila: {entry.position}º
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Voltar Home */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-medium text-slate-400 transition-colors hover:text-[#C2A537]"
            >
              ← Voltar para a página inicial
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
