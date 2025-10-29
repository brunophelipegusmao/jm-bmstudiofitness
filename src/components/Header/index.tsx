import clsx from "clsx";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import banner from "./logo.svg";

export function Header() {
  return (
    <header
      className={clsx(
        "flex w-full min-w-full items-center justify-between",
        "px-6 py-4",
        "border-b border-[#C2A537] bg-black/95 backdrop-blur-sm",
        "fixed top-0 right-0 left-0 z-50", // Fixa no topo e garante que ocupe toda a largura
      )}
    >
      <Link href="/">
        <Image
          src={banner}
          alt="Logo JM Studio Fitness"
          width={150}
          height={400}
          priority
          className="px-2"
        />
      </Link>
      <nav>
        {/* Ícone de menu para tablets e mobile */}
        <MenuIcon className="text-[#C2A537] md:hidden" />

        {/* Menu de navegação para desktop */}
        <ul className="hidden items-center space-x-8 md:flex">
          <li>
            <Link
              href="/"
              className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
            >
              Início
            </Link>
          </li>
          <li>
            <Link
              href="/user/login"
              className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
            >
              Área do Aluno
            </Link>
          </li>
          <li>
            <Link
              href="/coach/login"
              className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
            >
              Área do Coach
            </Link>
          </li>
          <li>
            <Link
              href="/services"
              className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
            >
              Serviços
            </Link>
          </li>
          <li>
            <Link
              href="/contact"
              className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
            >
              Contato
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
