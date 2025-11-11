"use client";

import { motion } from "framer-motion";

import PostListHome from "@/components/PostListHome";
import SectionFeatured from "@/components/SectionFeatured";
import SectionHistory from "@/components/SectionHistory";
import WaitlistModal from "@/components/WaitlistModal";

export default function HomePage() {
  return (
    <>
      <WaitlistModal />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center overflow-hidden"
      >
        <SectionFeatured />
        <SectionHistory />
        <PostListHome />
      </motion.div>
    </>
  );
}
