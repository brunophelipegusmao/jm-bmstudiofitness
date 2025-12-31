import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nossos Planos",
  description:
    "Conheca os planos do JM Fitness Studio: treinos personalizados, acompanhamento profissional e muito mais. Escolha o melhor plano para sua saude e bem-estar!",
  openGraph: {
    title: "Nossos Planos | JM Fitness Studio",
    description:
      "Descubra a variedade de planos que oferecemos para transformar sua jornada de saude e bem-estar em uma experiencia unica e personalizada.",
  },
};

export default function ServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
