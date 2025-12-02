import "./globals.css";

import clsx from "clsx";
import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono, Oswald } from "next/font/google";

import { ClientWrapper } from "@/components/ClientWrapper";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MainContent } from "@/components/MainContent";
import { SecurityManager } from "@/components/SecurityManager";
import { StructuredData } from "@/components/StructuredData";
import { ToastProvider } from "@/components/ToastProvider";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://jmfitnessstudio.com.br"),
  title: {
    default: "JM Fitness Studio | Academia de Musculação e Treinamento Funcional",
    template: "%s | JM Fitness Studio",
  },
  description:
    "Transforme sua vida no JM Fitness Studio. Academia completa com musculação, treinamento funcional e acompanhamento personalizado. Ambiente profissional dedicado à sua saúde, bem-estar e conquista dos seus objetivos fitness. Venha fazer parte da nossa família fitness!",
  keywords: [
    "academia",
    "fitness",
    "musculação",
    "treinamento funcional",
    "personal trainer",
    "JM Fitness Studio",
    "academia perto de mim",
    "treino",
    "saúde",
    "bem-estar",
    "emagrecimento",
    "hipertrofia",
  ],
  authors: [{ name: "JM Fitness Studio" }],
  creator: "JM Fitness Studio",
  publisher: "JM Fitness Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://jmfitnessstudio.com.br",
    siteName: "JM Fitness Studio",
    title: "JM Fitness Studio | Academia de Musculação e Treinamento Funcional",
    description:
      "Transforme sua vida no JM Fitness Studio. Academia completa com musculação, treinamento funcional e acompanhamento personalizado.",
    images: [
      {
        url: "/banner-01.png",
        width: 1200,
        height: 630,
        alt: "JM Fitness Studio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JM Fitness Studio | Academia de Musculação e Treinamento Funcional",
    description:
      "Transforme sua vida no JM Fitness Studio. Academia completa com musculação, treinamento funcional e acompanhamento personalizado.",
    images: ["/banner-01.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "seu-codigo-de-verificacao-aqui", // Adicione após verificar no Google Search Console
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <head>
        <meta name="theme-color" content="#1b1b1a" />
        <link rel="canonical" href="https://jmfitnessstudio.com.br" />
        <StructuredData />
      </head>
      <body
        className={clsx(
          `${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${anton.variable} antialiased`,
          "bg-[#1b1b1a] text-slate-200",
          "m-0 flex h-full flex-col p-0", // Remove margens e padding padrão, adiciona flexbox
        )}
      >
        <ClientWrapper>
          <SecurityManager />
          <Header />
          <MainContent>{children}</MainContent>
          <Footer />
          <WhatsAppFloat />
          <ToastProvider />
        </ClientWrapper>
      </body>
    </html>
  );
}
