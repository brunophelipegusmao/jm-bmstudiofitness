"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Image as ImageIcon, Play, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import {
  getPublicSettingsAction,
  type PublicSettings,
} from "@/actions/get-public-settings-action";

export function BannerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);
  const [settings, setSettings] = useState<PublicSettings | null>(null);

  useEffect(() => {
    void checkBannerStatus();
  }, []);

  const mediaType =
    settings?.promoBannerMediaType === "video" ? "video" : "image";

  const bannerUrl = settings?.promoBannerUrl ?? "";
  const bannerLink = settings?.promoBannerLink || bannerUrl;
  const title = settings?.promoBannerTitle || "Novidade para voc\u00ea!";
  const description =
    settings?.promoBannerDescription ||
    "Confira este destaque especial que preparamos.";

  const isMp4 = useMemo(
    () => bannerUrl.toLowerCase().trim().endsWith(".mp4"),
    [bannerUrl],
  );

  async function checkBannerStatus() {
    try {
      const result = await getPublicSettingsAction();
      if (result.success && result.data?.promoBannerEnabled && result.data.promoBannerUrl) {
        setSettings(result.data);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Erro ao verificar banner:", error);
    } finally {
      setHasChecked(true);
    }
  }

  function handleClose() {
    setIsOpen(false);
  }

  const renderMedia = () => {
    if (!bannerUrl) return null;

    if (mediaType === "video") {
      if (isMp4) {
        return (
          <video
            src={bannerUrl}
            className="h-full w-full rounded-xl object-cover"
            controls
            autoPlay
            loop
            muted
            playsInline
          />
        );
      }

      return (
        <div className="relative h-full w-full overflow-hidden rounded-xl">
          <iframe
            src={bannerUrl}
            title="Video banner"
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
        </div>
      );
    }

    return (
      <div className="relative h-full w-full overflow-hidden rounded-xl">
        <Image
          src={bannerUrl}
          alt={title}
          width={1200}
          height={640}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
      </div>
    );
  };

  if (!hasChecked) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={handleClose}
          />

          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.45 }}
              className="pointer-events-auto relative w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-[#C2A537]/30 bg-gradient-to-br from-black via-slate-900 to-black shadow-2xl shadow-[#C2A537]/25"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-slate-300 transition hover:bg-[#C2A537]/20 hover:text-[#C2A537]"
                aria-label="Fechar banner"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid gap-0 md:grid-cols-[1.1fr_0.9fr]">
                <div className="min-h-[240px] md:min-h-[320px]">{renderMedia()}</div>

                <div className="flex flex-col gap-4 p-6 text-white">
                  <div className="flex items-center gap-3 text-[#C2A537]">
                    {mediaType === "video" ? (
                      <Play className="h-5 w-5" />
                    ) : (
                      <ImageIcon className="h-5 w-5" />
                    )}
                    <span className="text-sm uppercase tracking-wide">
                      {mediaType === "video" ? "Video destaque" : "Imagem destaque"}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-[#C2A537]">
                    {title}
                  </h3>
                  <p className="text-sm text-slate-300">{description}</p>

                  {bannerUrl && (
                    <a
                  href={bannerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#C2A537] px-4 py-2 font-semibold text-black transition hover:bg-[#D4B547]"
                >
                      Ver conte\u00fado
                    </a>
                  )}

                  <button
                    onClick={handleClose}
                    className="text-sm text-slate-400 transition hover:text-[#C2A537]"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
