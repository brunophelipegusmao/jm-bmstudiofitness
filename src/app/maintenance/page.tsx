"use client";

import { motion } from "framer-motion";
import { Construction, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function MaintenancePage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/waitlist");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#1b1b1a] to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="mb-8 flex justify-center">
          <Construction className="h-24 w-24 text-[#C2A537]" />
        </div>

        <h1 className="mb-4 text-4xl font-bold text-white md:text-6xl">
          Em Manutenção
        </h1>

        <p className="mb-8 text-lg text-slate-300 md:text-xl">
          Estamos trabalhando para melhorar sua experiência.
          <br />
          Voltaremos em breve!
        </p>

        <div className="mb-12 rounded-lg bg-slate-800/50 p-6 backdrop-blur-sm">
          <p className="mb-4 text-slate-300">
            Interessado em fazer parte da nossa academia?
          </p>
          <Link
            href="/waitlist"
            className="inline-flex items-center gap-2 rounded-md bg-[#C2A537] px-6 py-3 font-semibold text-black transition-colors hover:bg-[#C2A537]/90"
          >
            <Mail className="h-5 w-5" />
            Entre na Lista de Espera
          </Link>
          <p className="mt-4 text-sm text-slate-400">
            Redirecionando automaticamente em {countdown} segundo{countdown !== 1 ? "s" : ""}...
          </p>
        </div>

        <div className="text-sm text-slate-400">
          <p>JM Fitness Studio</p>
          <p className="mt-1">
            Em caso de dúvidas:{" "}
            <a
              href="mailto:contato@jmfitnessstudio.com.br"
              className="text-[#C2A537] hover:underline"
            >
              contato@jmfitnessstudio.com.br
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
