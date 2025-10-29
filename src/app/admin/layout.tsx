import clsx from "clsx";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AdminHeader } from "@/components/Admin/AdminHeader";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JM - Studio Fitness",
  description:
    "Transforme sua vida no JM Studio Fitness. Ambiente acolhedor e profissional dedicado à sua saúde, bem-estar e conquista dos seus objetivos fitness. Venha fazer parte da nossa família fitness!",
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={clsx(
          `${geistSans.variable} ${geistMono.variable} antialiased`,
          "bg-[#1b1b1a] text-slate-200",
          "m-0 p-0", // Remove margens e padding padrão
        )}
      >
        <AdminHeader />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
