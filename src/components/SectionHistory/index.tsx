"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SectionHistory() {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.2 }}
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32"
    >
      {/* Background decorativo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        viewport={{ once: true }}
        className="absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent"
      ></motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Conteúdo de texto */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="order-2 lg:order-1 lg:pr-8"
          >
            <motion.h2
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="mb-6 bg-linear-to-r from-[#FFD700] via-[#C2A537] to-[#B8941F] bg-clip-text text-3xl leading-tight font-bold text-transparent sm:mb-8 sm:text-4xl lg:text-5xl xl:text-6xl"
            >
              Nossa História
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
              className="space-y-4 text-base leading-relaxed text-gray-300 sm:space-y-6 sm:text-lg lg:text-xl"
            >
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                viewport={{ once: true }}
              >
                <span className="font-semibold text-[#C2A537]">
                  Fundada em 2010
                </span>
                , a JM Fitness Studio nasceu do sonho de proporcionar um espaço
                onde{" "}
                <span className="font-medium text-white">
                  saúde, bem-estar e comunidade
                </span>{" "}
                se encontram.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                viewport={{ once: true }}
              >
                Ao longo dos anos, temos crescido e evoluído, sempre mantendo
                nosso compromisso com a{" "}
                <span className="font-semibold text-[#C2A537]">excelência</span>{" "}
                e a satisfação dos nossos alunos.
              </motion.p>

              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
              >
                Nossa missão é{" "}
                <span className="font-medium text-white">
                  inspirar e apoiar
                </span>{" "}
                cada indivíduo em sua jornada fitness, oferecendo um ambiente
                acolhedor, equipamentos de ponta e uma equipe dedicada de
                profissionais.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                viewport={{ once: true }}
                className="pt-4"
              >
                <p className="text-xl font-semibold text-[#C2A537] italic lg:text-2xl">
                  &ldquo;Venha fazer parte da nossa história e transformar sua
                  vida conosco!&rdquo;
                </p>
              </motion.div>
            </motion.div>

            {/* Stats decorativos */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              viewport={{ once: true }}
              className="mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-4 md:mt-12 md:gap-6"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.8 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-[#C2A537] sm:text-3xl lg:text-4xl">
                  15+
                </div>
                <div className="mt-1 text-xs text-gray-400 sm:text-sm">
                  Anos de experiência
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 2.0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-[#C2A537] sm:text-3xl lg:text-4xl">
                  500+
                </div>
                <div className="mt-1 text-xs text-gray-400 sm:text-sm">
                  Alunos ativos
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 2.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-[#C2A537] sm:text-3xl lg:text-4xl">
                  24/7
                </div>
                <div className="mt-1 text-xs text-gray-400 sm:text-sm">
                  Suporte dedicado
                </div>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Imagem melhorada */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="order-1 lg:order-2 lg:pl-8"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.9 }}
                viewport={{ once: true }}
                className="absolute -inset-4 rounded-3xl bg-linear-to-r from-[#C2A537]/20 to-[#FFD700]/20 blur-xl transition-all duration-500 group-hover:blur-2xl"
              ></motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden rounded-2xl shadow-2xl shadow-[#C2A537]/25 lg:rounded-3xl"
              >
                <Image
                  src="/banner-01.png"
                  alt="Interior moderno da JM Fitness Studio"
                  width={600}
                  height={400}
                  className="h-auto w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Overlay com hover */}
                <div className="absolute inset-0 flex items-end bg-linear-to-t from-black/40 via-transparent to-transparent p-6 opacity-0 transition-all duration-500 group-hover:opacity-100 lg:p-8">
                  <div className="text-white">
                    <h3 className="mb-2 text-xl font-bold lg:text-2xl">
                      Ambiente Moderno
                    </h3>
                    <p className="text-sm opacity-90 lg:text-base">
                      Equipamentos de última geração em um espaço inspirador
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.3 }}
                viewport={{ once: true }}
                className="mt-6 text-center text-sm text-gray-400"
              >
                Interior do nosso moderno estúdio com equipamentos de ponta
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
