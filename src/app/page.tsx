"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { getPublicSettingsAction } from "@/actions/get-public-settings-action";
import { BannerModal } from "@/components/BannerModal";
import EventListHome from "@/components/EventListHome";
import SectionFeatured from "@/components/SectionFeatured";
import SectionHistory from "@/components/SectionHistory";
import WaitlistModal from "@/components/WaitlistModal";

export default function HomePage() {
  const [settings, setSettings] = useState<Awaited<
    ReturnType<typeof getPublicSettingsAction>
  >["data"]>();

  useEffect(() => {
    const loadSettings = async () => {
      const result = await getPublicSettingsAction();
      if (result.success) {
        setSettings(result.data);
      }
    };
    void loadSettings();
  }, []);

  return (
    <>
      <BannerModal />
      <WaitlistModal />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center overflow-hidden"
      >
        <SectionFeatured settings={settings} />
        <SectionHistory settings={settings} />
        <EventListHome />
      </motion.div>
    </>
  );
}
