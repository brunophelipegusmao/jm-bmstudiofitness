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
import { UserAvatar } from "@/components/UserAvatar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

import banner from "./logo.svg";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, loading } = useCurrentUser();

  // Verifica se estamos na homepage
  const isHomePage = pathname === "/";

  // Verifica se estamos em páginas administrativas
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.includes("/login");
  const isCoachPage =
    pathname.startsWith("/coach") && !pathname.includes("/login");
  // isDashboardPage removed (not used) - keep individual flags
  const isEventsPage = pathname?.startsWith("/events");
  const isPlansPage = pathname?.startsWith("/services");
  const isContactPage = pathname?.startsWith("/contact");
  const isStudentPage = pathname?.startsWith("/user");

  // Define título e descrição baseado na página
  const getDashboardInfo = () => {
    if (isAdminPage) {
      return {
        title: "🏋️ Dashboard Administrativo",
        description: "Sistema completo de gestão do estúdio",
      };
    }
    if (isCoachPage) {
      return {
        title: "💪 Dashboard do Coach",
        description: "Gerencie seus alunos e treinos",
      };
    }
    return null;
  };

  const dashboardInfo = getDashboardInfo();

  const buttonClasses =
    "px-5 md:px-6 lg:px-7 py-2.5 md:py-3 font-medium tracking-wide transition-all duration-300 ease-out transform-gpu relative focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#C2A537]/50";

  const primaryButton = `${buttonClasses} rounded-xl 
    bg-gradient-to-br from-[#FFE17D] via-[#D4B547] to-[#B8941F]
    text-black/90
    border border-[#C2A537]/20
    shadow-[0_8px_16px_-2px_rgba(194,165,55,0.2),inset_0_-4px_8px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.1)]
    hover:shadow-[0_16px_32px_-4px_rgba(194,165,55,0.3),inset_0_-4px_8px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.1)]
    hover:-translate-y-1 active:translate-y-0.5
    hover:scale-[1.02] active:scale-[0.98]
    backdrop-blur-sm
    ring-offset-2`;

  const secondaryButton = `${buttonClasses} rounded-lg 
    bg-gradient-to-br from-black/5 via-black/10 to-black/20
    text-[#E6D9A7] hover:text-[#FFE17D]
    border border-[#C2A537]/10
    shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2),inset_0_-2px_4px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.05)]
    hover:shadow-[0_8px_24px_-4px_rgba(194,165,55,0.15),inset_0_-2px_4px_rgba(0,0,0,0.2),inset_0_1px_2px_rgba(255,255,255,0.1)]
    hover:-translate-y-0.5 active:translate-y-0
    hover:scale-[1.01] active:scale-[0.99]
    hover:bg-gradient-to-br hover:from-black/10 hover:via-black/15 hover:to-black/25
    backdrop-blur-md`;

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={clsx(
        "flex w-full min-w-full items-center justify-between",
        "px-4 py-3 sm:px-6 sm:py-4",
        "bg-linear-to-br from-black/95 via-black/85 to-black/75",
        "border-b border-[#C2A537]/10",
        "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.1)]",
        "backdrop-blur-xl backdrop-saturate-150",
        "fixed top-0 right-0 left-0 z-50",
        dashboardInfo ? "h-20 sm:h-24" : "h-16 sm:h-20",
      )}
    >
      {/* Logo */}
      <motion.div
        whileHover={{
          scale: 1.05,
          rotate: [0, -2, 2, 0],
          transition: { duration: 0.4, ease: "easeInOut" },
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="cursor-pointer"
      >
        <Link href="/">
          <motion.div
            className="relative flex items-center justify-center px-2"
            animate={{
              y: [0, -6, 0, 4, 0],
              rotate: [0, -2, 2, 0],
              scale: [1, 1.02, 1, 0.99, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            whileHover={{ scale: 1.06, rotate: -2 }}
          >
            {/* Subtle animated glow behind logo */}
            <motion.span
              aria-hidden
              className="absolute -z-10 h-[110%] w-[110%] rounded-full blur-3xl"
              style={{
                background:
                  "linear-gradient(90deg, rgba(194,165,55,0.14), rgba(212,181,71,0.08))",
              }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative z-10">
              <Image
                src={banner}
                alt="Logo JM Fitness Studio"
                width={120}
                height={300}
                priority
                className="drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
              />
            </div>
          </motion.div>
        </Link>
      </motion.div>

      {/* Título do Dashboard - aparece entre logo e navegação */}
      {dashboardInfo && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mx-8 hidden flex-1 flex-col items-center justify-center lg:flex"
        >
          <h1 className="mb-1 text-xl font-bold text-[#C2A537] xl:text-2xl">
            {dashboardInfo.title}
          </h1>
          <p className="text-center text-sm text-gray-400">
            {dashboardInfo.description}
          </p>
        </motion.div>
      )}

      <nav className="relative">
        {/* Botão de menu mobile */}
        {/* Menu mobile */}
        <motion.button
          whileHover={{
            scale: 1.05,
            y: -2,
          }}
          whileTap={{
            scale: 0.95,
            y: 1,
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="rounded-xl border border-[#C2A537]/20 bg-linear-to-br from-[#C2A537]/10 via-[#C2A537]/5 to-[#C2A537]/10 p-3 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_8px_24px_-4px_rgba(194,165,55,0.2),inset_0_1px_2px_rgba(255,255,255,0.2)] md:hidden"
          aria-label="Menu"
        >
          <motion.div
            animate={{
              rotate: isMenuOpen ? 45 : 0,
              scale: isMenuOpen ? 1.1 : 1,
            }}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
              type: "spring",
              stiffness: 200,
              damping: 15,
            }}
            className="relative flex h-6 w-6 flex-col items-center justify-center"
          >
            {/* Ícone de Halter Premium */}
            <svg
              width="26"
              height="26"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-300"
            >
              <defs>
                <linearGradient
                  id="metalGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#E5E7EB" />
                  <stop offset="50%" stopColor="#9CA3AF" />
                  <stop offset="100%" stopColor="#6B7280" />
                </linearGradient>
                <linearGradient
                  id="goldGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#FDE68A" />
                  <stop offset="50%" stopColor="#C2A537" />
                  <stop offset="100%" stopColor="#92400E" />
                </linearGradient>
                <radialGradient id="highlight" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              <motion.g
                animate={{
                  fill: isMenuOpen
                    ? "url(#goldGradient)"
                    : "url(#metalGradient)",
                }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                {/* Barra central com detalhes */}
                <rect
                  x="10"
                  y="15"
                  width="12"
                  height="2.5"
                  rx="1.25"
                  fill="currentColor"
                />
                <rect
                  x="10.5"
                  y="15.3"
                  width="11"
                  height="0.8"
                  rx="0.4"
                  fill="url(#highlight)"
                  opacity="0.7"
                />

                {/* Conectores (grips) */}
                <rect
                  x="9"
                  y="14.5"
                  width="2"
                  height="3.5"
                  rx="1"
                  fill="currentColor"
                />
                <rect
                  x="21"
                  y="14.5"
                  width="2"
                  height="3.5"
                  rx="1"
                  fill="currentColor"
                />

                {/* Peso esquerdo - disco principal */}
                <ellipse
                  cx="7"
                  cy="16.25"
                  rx="4"
                  ry="5.5"
                  fill="currentColor"
                />
                <ellipse
                  cx="7"
                  cy="16.25"
                  rx="3.2"
                  ry="4.7"
                  fill="url(#highlight)"
                  opacity="0.3"
                />
                <circle
                  cx="7"
                  cy="16.25"
                  r="1.8"
                  fill="none"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.3"
                />

                {/* Peso esquerdo - disco externo */}
                <ellipse
                  cx="4.5"
                  cy="16.25"
                  rx="2.5"
                  ry="4"
                  fill="currentColor"
                />
                <ellipse
                  cx="4.5"
                  cy="16.25"
                  rx="2"
                  ry="3.3"
                  fill="url(#highlight)"
                  opacity="0.4"
                />

                {/* Peso direito - disco principal */}
                <ellipse
                  cx="25"
                  cy="16.25"
                  rx="4"
                  ry="5.5"
                  fill="currentColor"
                />
                <ellipse
                  cx="25"
                  cy="16.25"
                  rx="3.2"
                  ry="4.7"
                  fill="url(#highlight)"
                  opacity="0.3"
                />
                <circle
                  cx="25"
                  cy="16.25"
                  r="1.8"
                  fill="none"
                  stroke="rgba(0,0,0,0.2)"
                  strokeWidth="0.3"
                />

                {/* Peso direito - disco externo */}
                <ellipse
                  cx="27.5"
                  cy="16.25"
                  rx="2.5"
                  ry="4"
                  fill="currentColor"
                />
                <ellipse
                  cx="27.5"
                  cy="16.25"
                  rx="2"
                  ry="3.3"
                  fill="url(#highlight)"
                  opacity="0.4"
                />
              </motion.g>

              {/* Efeitos de brilho quando ativo */}
              <motion.g
                animate={{
                  opacity: isMenuOpen ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
              >
                <circle cx="7" cy="14" r="1" fill="#FCD34D" opacity="0.6">
                  <animate
                    attributeName="r"
                    values="0.5;1.5;0.5"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="25" cy="18.5" r="0.8" fill="#FCD34D" opacity="0.5">
                  <animate
                    attributeName="r"
                    values="0.3;1.2;0.3"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              </motion.g>
            </svg>
          </motion.div>
        </motion.button>

        {/* Menu desktop */}
        <motion.ul
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            delay: 0.4,
            ease: "easeOut",
            staggerChildren: 0.15,
          }}
          className="hidden items-center space-x-3 md:flex lg:space-x-4"
        >
          {/* Só mostra o link Início se não estivermos na homepage */}
          {!isHomePage && (
            <motion.li
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.5,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                y: -2,
                transition: { duration: 0.2 },
              }}
            >
              <Link
                href="/"
                className={isHomePage ? primaryButton : secondaryButton}
                aria-current={isHomePage ? "page" : undefined}
              >
                Início
              </Link>
            </motion.li>
          )}

          {/* Links específicos para usuários não-admin ou não logados */}
          {(!user || user.role !== "admin") && (
            <>
              <motion.li
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.65,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  scale: [1, 1.08, 1.02],
                  rotate: [0, 5, -2, 0],
                  transition: {
                    duration: 0.5,
                    ease: "easeInOut",
                  },
                }}
              >
                <StudentLink
                  className={isStudentPage ? primaryButton : secondaryButton}
                >
                  Área do Aluno
                </StudentLink>
              </motion.li>
              <motion.li
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.6,
                  delay: 0.8,
                  ease: "easeOut",
                  type: "spring",
                  stiffness: 100,
                }}
                whileHover={{
                  y: -2,
                  transition: { duration: 0.2 },
                }}
              >
                <CoachLink
                  className={isCoachPage ? primaryButton : secondaryButton}
                >
                  Área do Coach
                </CoachLink>
              </motion.li>
            </>
          )}

          {/* Links para admin logado */}
          {user && user.role === "admin" && (
            <motion.li
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.65,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                scale: [1, 1.08, 1.02],
                rotate: [0, 5, -2, 0],
                transition: {
                  duration: 0.5,
                  ease: "easeInOut",
                },
              }}
            >
              <Link
                href="/admin/dashboard"
                className={isAdminPage ? primaryButton : secondaryButton}
                aria-current={isAdminPage ? "page" : undefined}
              >
                Dashboard Admin
              </Link>
            </motion.li>
          )}

          <motion.li
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.95,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2 },
            }}
          >
            <Link
              href="/services"
              className={isPlansPage ? primaryButton : secondaryButton}
              aria-current={isPlansPage ? "page" : undefined}
            >
              Planos
            </Link>
          </motion.li>
          {/* Botão para Eventos */}
          <motion.li
            initial={{ opacity: 0, y: -20, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.0,
              ease: "easeOut",
              type: "spring",
              stiffness: 90,
            }}
            whileHover={{
              scale: 1.03,
            }}
          >
            <Link
              href="/events"
              aria-label="Ir para eventos"
              aria-current={isEventsPage ? "page" : undefined}
              className={
                isEventsPage
                  ? `${primaryButton} px-6 py-3 text-sm md:text-base`
                  : `${secondaryButton} px-6 py-3 text-sm md:text-base`
              }
            >
              Eventos
            </Link>
          </motion.li>
          <motion.li
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 1.1,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            whileHover={{
              y: -2,
              transition: { duration: 0.2 },
            }}
          >
            <Link
              href="/contact"
              className={isContactPage ? primaryButton : secondaryButton}
              aria-current={isContactPage ? "page" : undefined}
            >
              Contato
            </Link>
          </motion.li>

          {/* Avatar e Logout - apenas se usuário estiver logado */}
          {!loading && user && (
            <motion.li
              initial={{ opacity: 0, y: -20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: 1.25,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
              }}
              className="ml-4 flex items-center"
            >
              <LogoutButton />
            </motion.li>
          )}
        </motion.ul>

        {/* Menu mobile dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{
                opacity: 0,
                y: -30,
                scale: 0.9,
                rotateX: -15,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
                rotateX: 0,
              }}
              exit={{
                opacity: 0,
                y: -30,
                scale: 0.9,
                rotateX: -15,
              }}
              transition={{
                duration: 0.4,
                ease: "easeOut",
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="absolute top-16 right-0 min-w-[220px] rounded-2xl border-2 border-[#C2A537]/40 bg-black/98 p-6 shadow-2xl shadow-[#C2A537]/30 backdrop-blur-xl md:hidden"
            >
              <motion.ul
                initial="closed"
                animate="open"
                exit="closed"
                variants={{
                  open: {
                    transition: {
                      staggerChildren: 0.12,
                      delayChildren: 0.15,
                      ease: "easeOut",
                    },
                  },
                  closed: {
                    transition: {
                      staggerChildren: 0.06,
                      staggerDirection: -1,
                      ease: "easeIn",
                    },
                  },
                }}
                className="space-y-4"
              >
                {/* Título do Dashboard no mobile */}
                {dashboardInfo && (
                  <motion.li
                    variants={{
                      open: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotateY: 0,
                      },
                      closed: {
                        opacity: 0,
                        x: -25,
                        scale: 0.8,
                        rotateY: -15,
                      },
                    }}
                    className="mb-4 border-b border-[#C2A537]/30 pb-4"
                  >
                    <div className="text-center">
                      <h2 className="mb-1 text-lg font-bold text-[#C2A537]">
                        {dashboardInfo.title}
                      </h2>
                      <p className="text-xs text-gray-400">
                        {dashboardInfo.description}
                      </p>
                    </div>
                  </motion.li>
                )}

                {/* Só mostra o link Início se não estivermos na homepage */}
                {!isHomePage && (
                  <motion.li
                    variants={{
                      open: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotateY: 0,
                      },
                      closed: {
                        opacity: 0,
                        x: -25,
                        scale: 0.8,
                        rotateY: -15,
                      },
                    }}
                    whileHover={{
                      scale: 1.02,
                      x: 3,
                      transition: { duration: 0.2 },
                    }}
                  >
                    <Link
                      href="/"
                      className={
                        isHomePage
                          ? `${primaryButton} block w-full text-center`
                          : `${secondaryButton} block w-full text-center`
                      }
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isHomePage ? "page" : undefined}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                        </svg>
                        <span>Início</span>
                      </div>
                    </Link>
                  </motion.li>
                )}

                {/* Links específicos para usuários não-admin ou não logados */}
                {(!user || user.role !== "admin") && (
                  <>
                    <motion.li
                      variants={{
                        open: {
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          rotateY: 0,
                        },
                        closed: {
                          opacity: 0,
                          x: -25,
                          scale: 0.8,
                          rotateY: -15,
                        },
                      }}
                      whileHover={{
                        scale: [1, 1.08, 1.02],
                        rotate: [0, 3, -1, 0],
                        x: [0, 8, 5],
                        transition: {
                          duration: 0.6,
                          ease: "easeInOut",
                        },
                      }}
                    >
                      <StudentLink
                        className={
                          isStudentPage
                            ? `${primaryButton} block w-full text-center`
                            : `${secondaryButton} block w-full text-center`
                        }
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V2H9V4L3 7V9H5V20H19V9H21ZM7 9H17V18H7V9Z" />
                          </svg>
                          <span>Área do Aluno</span>
                        </div>
                      </StudentLink>
                    </motion.li>
                    <motion.li
                      variants={{
                        open: {
                          opacity: 1,
                          x: 0,
                          scale: 1,
                          rotateY: 0,
                        },
                        closed: {
                          opacity: 0,
                          x: -25,
                          scale: 0.8,
                          rotateY: -15,
                        },
                      }}
                      whileHover={{
                        scale: 1.02,
                        x: 3,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <CoachLink
                        className={
                          isCoachPage
                            ? `${primaryButton} block w-full text-center`
                            : `${secondaryButton} block w-full text-center`
                        }
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          <svg
                            className="h-4 w-4"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 12.75c1.63 0 3.07.39 4.24.9c1.08.48 1.76 1.56 1.76 2.73V18H6v-1.61c0-1.18.68-2.26 1.76-2.73c1.17-.52 2.61-.91 4.24-.91zM4 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm1.13 1.1c-.37-.06-.74-.1-1.13-.1c-.99 0-1.93.21-2.78.58C.48 14.9 0 15.62 0 16.43V18h4.5v-1.61c0-.83.23-1.61.63-2.29zM20 13c1.1 0 2-.9 2-2c0-1.1-.9-2-2-2s-2 .9-2 2c0 1.1.9 2 2 2zm4 3.43c0-.81-.48-1.53-1.22-1.85C21.93 14.21 20.99 14 20 14c-.39 0-.76.04-1.13.1c.4.68.63 1.46.63 2.29V18H24v-1.57zM12 6c1.66 0 3 1.34 3 3c0 1.66-1.34 3-3 3s-3-1.34-3-3c0-1.66 1.34-3 3-3z" />
                          </svg>
                          <span>Área do Coach</span>
                        </div>
                      </CoachLink>
                    </motion.li>
                  </>
                )}

                {/* Links para admin logado */}
                {user && user.role === "admin" && (
                  <motion.li
                    variants={{
                      open: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotateY: 0,
                      },
                      closed: {
                        opacity: 0,
                        x: -25,
                        scale: 0.8,
                        rotateY: -15,
                      },
                    }}
                    whileHover={{
                      scale: [1, 1.08, 1.02],
                      rotate: [0, 3, -1, 0],
                      x: [0, 8, 5],
                      transition: {
                        duration: 0.6,
                        ease: "easeInOut",
                      },
                    }}
                  >
                    <Link
                      href="/admin/dashboard"
                      className={
                        isAdminPage
                          ? `${primaryButton} block w-full text-center`
                          : `${secondaryButton} block w-full text-center`
                      }
                      onClick={() => setIsMenuOpen(false)}
                      aria-current={isAdminPage ? "page" : undefined}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
                        </svg>
                        <span>Dashboard Admin</span>
                      </div>
                    </Link>
                  </motion.li>
                )}

                <motion.li
                  variants={{
                    open: {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      rotateY: 0,
                    },
                    closed: {
                      opacity: 0,
                      x: -25,
                      scale: 0.8,
                      rotateY: -15,
                    },
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 3,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Link
                    href="/services"
                    className={
                      isPlansPage
                        ? `${primaryButton} block w-full text-center`
                        : `${secondaryButton} block w-full text-center`
                    }
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={isPlansPage ? "page" : undefined}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <span>Planos</span>
                    </div>
                  </Link>
                </motion.li>
                <motion.li
                  variants={{
                    open: {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      rotateY: 0,
                    },
                    closed: {
                      opacity: 0,
                      x: -25,
                      scale: 0.8,
                      rotateY: -15,
                    },
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 3,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Link
                    href="/events"
                    className={
                      isEventsPage
                        ? `${primaryButton} block w-full text-center`
                        : `${secondaryButton} block w-full text-center`
                    }
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Ir para eventos"
                    aria-current={isEventsPage ? "page" : undefined}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M4 4h16v2H4zM4 9h10v2H4zM4 14h16v2H4z" />
                      </svg>
                      <span>Eventos</span>
                    </div>
                  </Link>
                </motion.li>
                <motion.li
                  variants={{
                    open: {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      rotateY: 0,
                    },
                    closed: {
                      opacity: 0,
                      x: -25,
                      scale: 0.8,
                      rotateY: -15,
                    },
                  }}
                  whileHover={{
                    scale: 1.02,
                    x: 3,
                    transition: { duration: 0.2 },
                  }}
                >
                  <Link
                    href="/contact"
                    className={`${secondaryButton} block w-full text-center`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                      </svg>
                      <span>Contato</span>
                    </div>
                  </Link>
                </motion.li>

                {/* Avatar e Logout no menu mobile - apenas se usuário estiver logado */}
                {!loading && user && (
                  <motion.li
                    variants={{
                      open: {
                        opacity: 1,
                        x: 0,
                        scale: 1,
                        rotateY: 0,
                      },
                      closed: {
                        opacity: 0,
                        x: -25,
                        scale: 0.8,
                        rotateY: -15,
                      },
                    }}
                    whileHover={{
                      scale: 1.02,
                      x: 3,
                      transition: { duration: 0.2 },
                    }}
                    className="mt-3 border-t border-[#C2A537]/30 pt-3"
                  >
                    <div className="flex flex-col items-center space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserAvatar name={user.name} size="sm" />
                        <div className="text-sm text-[#C2A537]">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-[#C2A537]/70">
                            {user.role === "admin"
                              ? "Administrador"
                              : user.role === "professor"
                                ? "Professor"
                                : user.role === "funcionario"
                                  ? "Funcionário"
                                  : user.role}
                          </div>
                        </div>
                      </div>
                      <LogoutButton />
                    </div>
                  </motion.li>
                )}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
