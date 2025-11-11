"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  Dumbbell,
  Heart,
  Star,
  Target,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getPublicPlansAction,
  type PublicPlan,
} from "@/actions/public/get-plans-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const iconComponents: Record<string, React.ElementType> = {
  Dumbbell,
  Target,
  Zap,
  Heart,
  Users,
  Calendar,
  Clock,
};

export default function ServicesPage() {
  const [plans, setPlans] = useState<PublicPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getPublicPlansAction();
        if (result.success && result.data) {
          setPlans(result.data);
        }
      } catch (error) {
        console.error("Erro ao carregar planos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const handleWhatsAppClick = (plan: PublicPlan) => {
    const message = `Olá! Tenho interesse no plano *${plan.title}* (${plan.price}/mês). Gostaria de mais informações sobre:\n\n- Disponibilidade de horários\n- Forma de pagamento\n- Como iniciar\n\nAguardo retorno!`;

    const whatsappNumber = "5511999999999"; // Substituir pelo número real
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconComponents[iconName] || Dumbbell;
    return <IconComponent className="h-8 w-8" />;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1b1b1a] via-black to-[#1b1b1a] text-white">
        <p className="text-xl text-[#C2A537]">Carregando planos...</p>
      </div>
    );
  }
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-gradient-to-br from-[#1b1b1a] via-black to-[#1b1b1a] text-white"
    >
      {/* Background decorativo */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>

      <div className="relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="py-20 text-center"
        >
          <h1 className="mb-6 bg-gradient-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            Nossos Serviços
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300 md:text-xl">
            Descubra a variedade de serviços que oferecemos para transformar sua
            jornada fitness em uma experiência única e personalizada.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.4 + index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
                className="relative"
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                    className="absolute -top-3 right-4 z-10 flex items-center gap-1 rounded-full bg-gradient-to-r from-[#FFD700] to-[#C2A537] px-3 py-1 text-xs font-bold text-black"
                  >
                    <Star className="h-3 w-3 fill-current" />
                    Popular
                  </motion.div>
                )}

                {/* Background glow */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 1,
                    delay: 0.6 + index * 0.1,
                  }}
                  className="absolute -inset-4 animate-pulse rounded-3xl bg-gradient-to-r from-[#C2A537]/10 via-[#C2A537]/5 to-[#C2A537]/10 blur-xl"
                ></motion.div>

                <Card className="hover:shadow-3xl relative h-full border-2 border-[#C2A537]/30 bg-black/90 shadow-2xl shadow-[#C2A537]/10 backdrop-blur-lg transition-all duration-500 hover:border-[#C2A537]/50 hover:shadow-[#C2A537]/20">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className={`rounded-lg bg-gradient-to-r ${plan.gradient} p-3 text-black`}
                      >
                        {getIconComponent(plan.icon)}
                      </motion.div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#C2A537]">
                          {plan.price}
                        </div>
                        <div className="text-xs text-slate-400">por mês</div>
                      </div>
                    </div>
                    <CardTitle className="bg-gradient-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-xl font-bold text-transparent">
                      {plan.title}
                    </CardTitle>
                    <p className="text-sm text-slate-300">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Service Info */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="h-4 w-4 text-[#C2A537]" />
                        {plan.duration}
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="h-4 w-4 text-[#C2A537]" />
                        {plan.capacity}
                      </div>
                    </div>

                    {/* Features */}
                    <div>
                      <h4 className="mb-3 font-semibold text-[#C2A537]">
                        Benefícios Inclusos:
                      </h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.li
                            key={featureIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.4,
                              delay: 1 + index * 0.1 + featureIndex * 0.1,
                            }}
                            className="flex items-center gap-2 text-sm text-slate-300"
                          >
                            <div className="h-1.5 w-1.5 rounded-full bg-[#C2A537]"></div>
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button */}
                    <motion.button
                      onClick={() => handleWhatsAppClick(plan)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full transform rounded-lg bg-gradient-to-r from-[#C2A537] to-[#D4B547] py-3 font-semibold text-black transition-all duration-300 hover:from-[#D4B547] hover:to-[#E6C658] hover:shadow-lg hover:shadow-[#C2A537]/30"
                    >
                      Escolher Plano via WhatsApp
                    </motion.button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="bg-gradient-to-r from-[#C2A537]/10 via-transparent to-[#C2A537]/10 py-20"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold text-[#C2A537] md:text-4xl">
              Pronto para Começar?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-300">
              Não perca mais tempo! Escolha o serviço ideal para você e comece
              sua transformação hoje mesmo.
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg bg-gradient-to-r from-[#FFD700] to-[#C2A537] px-8 py-4 text-lg font-bold text-black transition-all duration-300 hover:from-[#C2A537] hover:to-[#B8941F] hover:shadow-xl hover:shadow-[#C2A537]/40"
              >
                Fale Conosco
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
