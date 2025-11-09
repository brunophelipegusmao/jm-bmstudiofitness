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
    // Número do WhatsApp (substitua pelo número real do estúdio)
    const phoneNumber = "5521980995749"; // Formato: código do país + DDD + número
    const message = encodeURIComponent(
      "Olá! Gostaria de saber mais sobre o JM Fitness Studio.",
    );
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    window.open(whatsappURL, "_blank");
  };

  return (
    <div className="fixed right-6 bottom-6 z-50">
      {/* Efeito de pulsação de fundo */}
      <div className="absolute inset-0 animate-pulse rounded-full bg-green-500 opacity-30"></div>

      <button
        onClick={handleWhatsAppClick}
        className="group relative flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#1b1b1a] focus:outline-none md:h-14 md:w-14"
        aria-label="Enviar mensagem no WhatsApp"
        title="Fale conosco no WhatsApp"
      >
        <MessageCircle className="h-5 w-5 transition-transform group-hover:rotate-12 md:h-6 md:w-6" />

        {/* Badge de notificação */}
        <div className="absolute -top-1 -right-1 h-3 w-3 animate-ping rounded-full border-2 border-[#1b1b1a] bg-red-500"></div>
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-[#1b1b1a] bg-red-500"></div>
      </button>
    </div>
  );
}
