import "./globals.css";

import clsx from "clsx";
import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono, Oswald } from "next/font/google";

import { ClientWrapper } from "@/components/ClientWrapper";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MainContent } from "@/components/MainContent";
import { SecurityManager } from "@/components/SecurityManager";
import { SessionManager } from "@/components/SessionManager";
import { ToastProvider } from "@/components/ToastProvider";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import { AuthProvider } from "@/contexts/AuthContext";

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
    default: "JM Fitness Studio | Estúdio de Saúde e Bem-Estar",
    template: "%s | JM Fitness Studio",
  },
  description:
    "JM Fitness Studio em Duque de Caxias - RJ. Estúdio especializado em saúde, bem-estar e qualidade de vida. Treinos personalizados, acompanhamento profissional e ambiente acolhedor. Cuide da sua saúde conosco!",
  keywords: [
    "estúdio fitness",
    "saúde e bem-estar",
    "treino personalizado",
    "fitness",
    "Duque de Caxias",
    "RJ",
    "JM Fitness Studio",
    "qualidade de vida",
    "saúde",
    "bem-estar",
    "exercícios personalizados",
    "estúdio 25 de agosto",
    "personal trainer",
    "acompanhamento fitness",
  ],
  authors: [{ name: "JM Fitness Studio" }],
  creator: "JM Fitness Studio",
  publisher: "JM Fitness Studio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "JM Fitness Studio | Estúdio de Saúde e Bem-Estar",
    description:
      "JM Fitness Studio em Duque de Caxias - RJ. Estúdio especializado em saúde, bem-estar e qualidade de vida. Treinos personalizados e acompanhamento profissional.",
    url: "https://jmfitnessstudio.com.br",
    siteName: "JM Fitness Studio",
    images: [
      {
        url: "/favicon.svg",
        width: 500,
        height: 500,
        alt: "JM Fitness Studio Logo",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "JM Fitness Studio | Estúdio de Saúde e Bem-Estar",
    description:
      "JM Fitness Studio em Duque de Caxias - RJ. Estúdio especializado em saúde, bem-estar e qualidade de vida. Treinos personalizados e acompanhamento profissional.",
    images: ["/favicon.svg"],
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
    google: "verification_token", // Substituir pelo token real após verificar no Google Search Console
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
      <body
        suppressHydrationWarning
        className={clsx(
          `${geistSans.variable} ${geistMono.variable} ${oswald.variable} ${anton.variable} antialiased`,
          "bg-[#1b1b1a] text-slate-200",
          "m-0 flex h-full flex-col p-0", // Remove margens e padding padrão, adiciona flexbox
        )}
      >
        <AuthProvider>
          <ClientWrapper>
            <SecurityManager />
            <SessionManager />
            <Header />
            <MainContent>{children}</MainContent>
            <Footer />
            <WhatsAppFloat />
            <ToastProvider />
          </ClientWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
