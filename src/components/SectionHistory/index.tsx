"use client";

import { differenceInYears } from "date-fns";
import { motion } from "framer-motion";
import Image from "next/image";
import ReactMarkdown from "react-markdown";

import type { PublicSettings } from "@/actions/get-public-settings-action";

type SectionHistoryProps = {
  settings?: PublicSettings;
};

const DEFAULT_MARKDOWN = `Fundada em 2010, a JM Fitness Studio nasceu do sonho de proporcionar um espaço onde saúde, bem-estar e comunidade se encontram.

Ao longo dos anos, crescemos mantendo o compromisso com a excelência e a satisfação dos nossos alunos.

Nossa missão é inspirar e apoiar cada pessoa na jornada fitness, oferecendo um ambiente acolhedor, equipamentos de ponta e uma equipe dedicada.`;

const formatSupportLabel = (settings?: PublicSettings) => {
  if (!settings) return "Consulte horários";
  const days = [
    settings.mondayOpen && settings.mondayClose,
    settings.tuesdayOpen && settings.tuesdayClose,
    settings.wednesdayOpen && settings.wednesdayClose,
    settings.thursdayOpen && settings.thursdayClose,
    settings.fridayOpen && settings.fridayClose,
    settings.saturdayOpen && settings.saturdayClose,
    settings.sundayOpen && settings.sundayClose,
  ];
  const allDaysHaveSchedule = days.every(Boolean);
  const sameHoursWeekdays =
    settings.mondayOpen === settings.tuesdayOpen &&
    settings.mondayOpen === settings.wednesdayOpen &&
    settings.mondayOpen === settings.thursdayOpen &&
    settings.mondayOpen === settings.fridayOpen &&
    settings.mondayClose === settings.tuesdayClose &&
    settings.mondayClose === settings.wednesdayClose &&
    settings.mondayClose === settings.thursdayClose &&
    settings.mondayClose === settings.fridayClose;

  if (
    allDaysHaveSchedule &&
    settings.mondayOpen === "00:00" &&
    settings.mondayClose === "23:59" &&
    settings.saturdayOpen === "00:00" &&
    settings.saturdayClose === "23:59" &&
    settings.sundayOpen === "00:00" &&
    settings.sundayClose === "23:59"
  ) {
    return "Atendimento 24/7";
  }

  if (sameHoursWeekdays && settings.mondayOpen && settings.mondayClose) {
    return `Seg-Sex: ${settings.mondayOpen} às ${settings.mondayClose}`;
  }

  return "Consulte horários";
};

export default function SectionHistory({ settings }: SectionHistoryProps) {
  const historyMarkdown =
    settings?.homeHistoryMarkdown && settings.homeHistoryMarkdown.trim().length > 0
      ? settings.homeHistoryMarkdown
      : DEFAULT_MARKDOWN;

  const historyImage = settings?.homeHistoryImage || "/banner-01.png";

  const years =
    settings?.foundationDate && settings.foundationDate.trim() !== ""
      ? Math.max(
          0,
          differenceInYears(new Date(), new Date(settings.foundationDate)),
        )
      : 15;

  const totalUsers =
    typeof settings?.totalUsers === "number" && settings.totalUsers > 0
      ? settings.totalUsers
      : 500;

  const supportLabel = formatSupportLabel(settings);

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true, amount: 0.2 }}
      className="relative overflow-hidden py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.2 }}
        viewport={{ once: true }}
        className="absolute inset-0 bg-linear-to-b from-transparent via-[#C2A537]/5 to-transparent"
      ></motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 sm:gap-10 md:gap-12 lg:grid-cols-2 lg:gap-16">
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
            className="prose prose-invert max-w-none space-y-4 break-words text-base leading-relaxed text-gray-300 sm:space-y-6 sm:text-lg lg:text-xl"
            >
              <ReactMarkdown>{historyMarkdown}</ReactMarkdown>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-8 grid grid-cols-3 gap-3 sm:mt-10 sm:gap-4 md:mt-12 md:gap-6"
            >
              <StatCard value={`${years}+`} label="Anos de experiência" delay={0.9} />
              <StatCard value={`${totalUsers}+`} label="Alunos ativos" delay={1.0} />
              <StatCard value="Suporte" label={supportLabel} delay={1.1} />
            </motion.div>
          </motion.div>

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
                  src={historyImage}
                  alt="História da JM Fitness Studio"
                  width={600}
                  height={400}
                  className="h-full w-full object-cover"
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}

function StatCard({
  value,
  label,
  delay,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05 }}
      className="text-center"
    >
      <div className="text-2xl font-bold text-[#C2A537] sm:text-3xl lg:text-4xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-gray-400 sm:text-sm">{label}</div>
    </motion.div>
  );
}
