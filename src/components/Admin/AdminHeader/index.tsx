import clsx from "clsx";
import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import banner from "./logo.svg";

export function AdminHeader() {
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
          alt="Logo JM Fitness Studio"
          width={150}
          height={400}
          priority
          className="px-2"
        />
      </Link>
      <nav className="flex items-center gap-4">
        {/* Menu de navegação para desktop */}
        <ul className="hidden items-center space-x-8 md:flex">
          <li>
            <Link
              href="/admin/dashboard"
              className="text-[#C2A537] transition-colors hover:text-[#D4B547]"
            >
              Início
            </Link>
          </li>
        </ul>

        {/* Ícone de menu para tablets e mobile */}
        <MenuIcon className="text-[#C2A537] md:hidden" />
      </nav>
    </header>
  );
}
