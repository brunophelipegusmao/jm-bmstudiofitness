"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import {
  getPublicSettingsAction,
  type PublicSettings,
} from "@/actions/get-public-settings-action";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactCard {
  icon: React.ReactNode;
  title: string;
  info: string[];
  color: string;
}

export default function ContactPage() {
  const [settings, setSettings] = useState<PublicSettings>({});
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  useEffect(() => {
    const loadSettings = async () => {
      const result = await getPublicSettingsAction();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    };

    void loadSettings();
  }, []);

  const contactCards: ContactCard[] = useMemo(() => {
    const addressParts = [
      settings.address,
      settings.city,
      settings.state,
      settings.zipCode,
    ]
      .filter(Boolean)
      .join(", ");

    const weekday =
      settings.mondayOpen && settings.mondayClose
        ? `Seg-Sex: ${settings.mondayOpen} - ${settings.mondayClose}`
        : null;
    const weekend =
      settings.saturdayOpen && settings.saturdayClose
        ? `Sab-Dom: ${settings.saturdayOpen} - ${settings.saturdayClose}`
        : null;

    return [
      {
        icon: <Phone className="h-6 w-6" />,
        title: "Telefone",
        info: settings.phone ? [settings.phone] : ["(21) 98099-5749"],
        color: "from-[#FFD700] to-[#C2A537]",
      },
      {
        icon: <Mail className="h-6 w-6" />,
        title: "E-mail",
        info: settings.email ? [settings.email] : ["contato@jmfitness.com"],
        color: "from-[#C2A537] to-[#D4B547]",
      },
      {
        icon: <MapPin className="h-6 w-6" />,
        title: "Endereco",
        info:
          addressParts.length > 0
            ? [addressParts]
            : ["Rua das Flores, 123, Rio de Janeiro - RJ"],
        color: "from-[#D4B547] to-[#E6C658]",
      },
      {
        icon: <Clock className="h-6 w-6" />,
        title: "Horario",
        info: [weekday, weekend].filter(Boolean) as string[],
        color: "from-[#E6C658] to-[#FFD700]",
      },
    ];
  }, [settings]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="bg-linear-to-br from-[#1b1b1a] via-black to-[#1b1b1a] py-20 text-white"
    >
      <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-black/30 via-transparent to-black/50"></div>

      <div className="relative z-10 container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-16 text-center"
        >
          <h1 className="mb-6 bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-4xl font-bold text-transparent md:text-6xl">
            Fale Conosco
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-300">
            Entre em contato conosco e tire todas as suas duvidas sobre nossos servicos e planos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4"
        >
          {contactCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.8 + index * 0.1 }}
                className="absolute -inset-2 animate-pulse rounded-2xl bg-linear-to-r from-[#C2A537]/10 via-[#C2A537]/5 to-[#C2A537]/10 blur-lg"
              ></motion.div>

              <Card className="relative h-full border-2 border-[#C2A537]/30 bg-black/90 backdrop-blur-lg transition-all duration-300 hover:border-[#C2A537]/50 hover:shadow-lg hover:shadow-[#C2A537]/20">
                <CardContent className="p-6 text-center">
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className={`mx-auto mb-4 w-fit rounded-lg bg-linear-to-r ${card.color} p-3 text-black`}
                  >
                    {card.icon}
                  </motion.div>
                  <h3 className="mb-3 text-lg font-semibold text-[#C2A537]">
                    {card.title}
                  </h3>
                  <div className="space-y-1">
                    {card.info.map((info) => (
                      <p key={info} className="text-sm text-slate-300">
                        {info}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid gap-12 lg:grid-cols-3 lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="lg:col-span-2"
          >
            <div className="relative h-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="absolute -inset-4 animate-pulse rounded-3xl bg-linear-to-r from-[#C2A537]/15 via-[#C2A537]/5 to-[#C2A537]/15 blur-xl"
              ></motion.div>

              <Card className="relative flex h-full flex-col border-2 border-[#C2A537]/50 bg-black/95 shadow-2xl shadow-[#C2A537]/20 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle className="bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-2xl font-bold text-transparent">
                    Envie uma Mensagem
                  </CardTitle>
                  <p className="text-slate-300">
                    Preencha o formulario abaixo e entraremos em contato em
                    breve.
                  </p>
                </CardHeader>

                <CardContent className="flex flex-1 flex-col">
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-1 flex-col space-y-6"
                  >
                    <div className="grid gap-4 md:grid-cols-2">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.2 }}
                        className="grid gap-2"
                      >
                        <Label htmlFor="name" className="text-[#C2A537]">
                          Nome Completo *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Seu nome completo"
                          className="border-[#C2A537]/30 bg-slate-900/50 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]/20"
                        />
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 1.3 }}
                        className="grid gap-2"
                      >
                        <Label htmlFor="phone" className="text-[#C2A537]">
                          Telefone
                        </Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="(11) 99999-9999"
                          className="border-[#C2A537]/30 bg-slate-900/50 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]/20"
                        />
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.4 }}
                      className="grid gap-2"
                    >
                      <Label htmlFor="email" className="text-[#C2A537]">
                        E-mail *
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="seu@email.com"
                        className="border-[#C2A537]/30 bg-slate-900/50 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-[#C2A537]/20"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.5 }}
                      className="grid gap-2"
                    >
                      <Label htmlFor="message" className="text-[#C2A537]">
                        Mensagem *
                      </Label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Digite sua mensagem aqui..."
                        rows={5}
                        className="w-full rounded-md border border-[#C2A537]/30 bg-slate-900/50 px-3 py-2 text-white transition-all duration-300 placeholder:text-slate-500 focus:border-[#C2A537] focus:ring-1 focus:ring-[#C2A537]/20 focus:outline-none"
                      />
                    </motion.div>

                    <div className="flex-1"></div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 1.6 }}
                      className="mt-auto"
                    >
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full transform rounded-lg bg-linear-to-r from-[#C2A537] to-[#D4B547] py-3 font-semibold text-black transition-all duration-300 hover:from-[#D4B547] hover:to-[#E6C658] hover:shadow-xl hover:shadow-[#C2A537]/30"
                      >
                        <span className="flex items-center justify-center gap-2">
                          <Send className="h-4 w-4" />
                          Enviar Mensagem
                        </span>
                      </motion.button>
                    </motion.div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-6"
          >
            <Card className="border-2 border-[#C2A537]/30 bg-black/90 backdrop-blur-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#C2A537]">
                  Redes Sociais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <motion.a
                  href="https://instagram.com/jmfitnesstudio"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg border border-[#C2A537]/30 bg-black/50 p-2 text-sm text-slate-300 transition-all duration-300 hover:border-[#C2A537]/70 hover:bg-[#C2A537]/10 hover:text-[#C2A537]"
                >
                  <Instagram className="h-4 w-4" />
                  <span>@jmfitnesstudio</span>
                </motion.a>

                <motion.a
                  href={`https://wa.me/${settings.phone?.replace(/\D/g, "") || "5521980995749"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 rounded-lg border border-[#C2A537]/30 bg-black/50 p-2 text-sm text-slate-300 transition-all duration-300 hover:border-[#C2A537]/70 hover:bg-[#C2A537]/10 hover:text-[#C2A537]"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>{settings.phone || "(21) 98099-5749"}</span>
                </motion.a>
              </CardContent>
            </Card>

            <Card className="border-2 border-[#C2A537]/50 bg-black/95 shadow-2xl shadow-[#C2A537]/20 backdrop-blur-lg">
              <CardHeader className="pb-3">
                <CardTitle className="bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-lg font-bold text-transparent">
                  Nossa Localizacao
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-48 w-full overflow-hidden rounded-b-lg">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.0123456789!2d-43.31234567890123!3d-22.78123456789012!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x997e58a085b6ef%3A0x1234567890abcdef!2sRua%20General%20C%C3%A2mara%2C%2018%20-%2025%20de%20Agosto%2C%20Duque%20de%20Caxias%20-%20RJ!5e0!3m2!1spt-BR!2sbr!4v1699123456789!5m2!1spt-BR!2sbr"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: "brightness(0.8) contrast(1.2)",
                    }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Localizacao"
                    className="rounded-b-lg"
                  ></iframe>

                  <div className="pointer-events-none absolute inset-0 rounded-b-lg bg-linear-to-t from-black/20 to-transparent"></div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}








