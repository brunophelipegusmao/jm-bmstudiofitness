"use client";

import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  title: string;
  excerpt: string;
}

export default function ShareButton({ title, excerpt }: ShareButtonProps) {
  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title,
          text: excerpt,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert("Link copiado para a área de transferência!");
      }
    }
  };

  return (
    <Button
      variant="outline"
      className="border-slate-600 text-slate-300 hover:bg-slate-800"
      onClick={handleShare}
    >
      <Share2 className="mr-2 h-4 w-4" />
      Compartilhar
    </Button>
  );
}
