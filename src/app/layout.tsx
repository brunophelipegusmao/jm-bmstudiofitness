import "./globals.css";

import clsx from "clsx";
import type { Metadata } from "next";
import { Anton, Geist, Geist_Mono, Oswald } from "next/font/google";

import { ClientWrapper } from "@/components/ClientWrapper";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { MainContent } from "@/components/MainContent";
import { SecurityManager } from "@/components/SecurityManager";
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
  title: "JM Fitness Studio",
  description:
    "Transforme sua vida no JM Fitness Studio. Ambiente acolhedor e profissional dedicado à sua saúde, bem-estar e conquista dos seus objetivos fitness. Venha fazer parte da nossa família fitness!",
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
    <html lang="en" className="h-full">
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
