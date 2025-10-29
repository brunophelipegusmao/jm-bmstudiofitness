"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";

export function WhatsAppFloat() {
  const pathname = usePathname();

  // Não mostrar o botão nas rotas admin e coach
  const shouldHide =
    pathname.startsWith("/admin") || pathname.startsWith("/coach");

  if (shouldHide) {
    return null;
  }

  const handleWhatsAppClick = () => {
    // Número do WhatsApp (substitua pelo número real da academia)
    const phoneNumber = "5511999999999"; // Formato: código do país + DDD + número
    const message = encodeURIComponent(
      "Olá! Gostaria de saber mais sobre o JM Studio Fitness.",
    );
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappURL, "_blank");
  };

  return (
    <button
      onClick={handleWhatsAppClick}
      className="group fixed right-6 bottom-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1b1b1a] focus:outline-none md:h-14 md:w-14"
      aria-label="Enviar mensagem no WhatsApp"
      title="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-5 w-5 transition-transform group-hover:rotate-12 md:h-6 md:w-6" />
    </button>
  );
}
