"use client";

import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { LogoutButton } from "@/components/Admin/LogoutButton";
import { CoachLink } from "@/components/CoachLink";
import { StudentLink } from "@/components/StudentLink";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import banner from "./logo.svg";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useCurrentUser();

  const isHomePage = pathname === "/";
  const isAdminPage = pathname.startsWith("/admin");
  const isCoachPage = pathname.startsWith("/coach");
  const isStudentPage = pathname.startsWith("/user");
  const isEventsPage = pathname.startsWith("/events");
  const isPlansPage = pathname.startsWith("/services");
  const isContactPage = pathname.startsWith("/contact");

  const linkClass = (active: boolean) =>
    clsx(
      "px-5 py-2 rounded-lg border transition-colors duration-200 text-sm md:text-base",
      active
        ? "bg-[#C2A537] text-black border-[#C2A537]"
        : "bg-black/30 text-[#E6D9A7] border-[#C2A537]/40 hover:bg-[#C2A537]/10",
    );

  const menuItems = [
    { href: "/", label: "Inicio", active: isHomePage },
    { href: "/services", label: "Planos", active: isPlansPage },
    { href: "/events", label: "Eventos", active: isEventsPage },
    { href: "/contact", label: "Contato", active: isContactPage },
  ];

  return (
    <motion.header
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-[#C2A537]/15 bg-black/90 px-4 py-3 backdrop-blur-xl"
    >
      <Link href="/" className="flex items-center gap-2">
        <Image
          src={banner}
          alt="JM Fitness Studio"
          width={110}
          height={40}
          priority
        />
      </Link>

      {/* Desktop nav */}
      <div className="hidden items-center gap-3 md:flex">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(item.active)}
          >
            {item.label}
          </Link>
        ))}

        {!loading && user && (
          <>
            {!isAdminPage && (
              <>
                <StudentLink className={linkClass(isStudentPage)}>
                  Area do Aluno
                </StudentLink>
                <CoachLink className={linkClass(isCoachPage)}>
                  Area do Coach
                </CoachLink>
              </>
            )}
            {isAdminPage && (
              <Link
                href="/admin/dashboard"
                className={linkClass(isAdminPage)}
                aria-current={isAdminPage ? "page" : undefined}
              >
                Dashboard Admin
              </Link>
            )}
            <LogoutButton />
          </>
        )}
      </div>

      {/* Mobile toggle */}
      <button
      className="rounded-lg border border-[#C2A537]/40 p-2 text-[#E6D9A7] md:hidden"
      onClick={() => setIsMenuOpen((v) => !v)}
      aria-label="Abrir menu"
    >
        Menu
      </button>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute left-4 right-4 top-[72px] rounded-2xl border border-[#C2A537]/30 bg-black/95 p-4 shadow-xl md:hidden"
          >
            <div className="flex flex-col gap-3">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={linkClass(item.active)}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {!loading && user && (
                <>
                  {!isAdminPage && (
                    <>
                      <StudentLink
                        className={linkClass(isStudentPage)}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Area do Aluno
                      </StudentLink>
                      <CoachLink
                        className={linkClass(isCoachPage)}
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Area do Coach
                      </CoachLink>
                    </>
                  )}
                  {isAdminPage && (
                    <Link
                      href="/admin/dashboard"
                      className={linkClass(isAdminPage)}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  )}
                  <div className="flex justify-start">
                    <LogoutButton />
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}


