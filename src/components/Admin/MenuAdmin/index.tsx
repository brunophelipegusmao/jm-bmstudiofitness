"use client";

import { logoutAction } from "@/actions/login/logout-action";
import clsx from "clsx";
import {
  CircleXIcon,
  FilePlus2Icon,
  FileTextIcon,
  HomeIcon,
  HourglassIcon,
  LogOutIcon,
  MenuIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

export function MenuAdmin() {
  const [isOpen, setIsOpen] = useState(false);
  const pathName = usePathname();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setIsOpen(false);
  }, [pathName]);

  const navClasses = clsx(
    "mb-8 rounded-lg bg-[#C2A537] font-bold text-black/90",
    "flex flex-col",
    "sm:flex-row sm:flex-wrap",
    !isOpen && "h-10",
    !isOpen && "overflow-hidden",
    "sm:h-auto sm:overflow-visible",
  );
  const linkClasses = clsx(
    "px-4 [&>svg]:h-[16px] [&>svg]:w-[16px]",
    "flex cursor-pointer items-center justify-start gap-2",
    "rounded-lg transition hover:bg-[#d0b863]",
    "h-10",
    "shrink-0",
  );

  const openCloseButtomClasses = clsx(
    linkClasses,
    "italic text-blue-200",
    "sm:hidden",
  );

  function handleLogout(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();

    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <nav className={navClasses}>
      <button
        onClick={() => setIsOpen((s) => !s)}
        className={openCloseButtomClasses}
      >
        {!isOpen && (
          <>
            <MenuIcon />
            Menu
          </>
        )}

        {isOpen && (
          <>
            <CircleXIcon />
            Fechar
          </>
        )}
      </button>

      <a className={linkClasses} href="/" target="_blank">
        <HomeIcon />
        Home
      </a>

      <Link className={linkClasses} href="/admin/post">
        <FileTextIcon />
        Posts
      </Link>

      <Link className={linkClasses} href="/admin/post/new">
        <FilePlus2Icon />
        Criar Post
      </Link>

      <a onClick={handleLogout} href="#" className={linkClasses}>
        {isPending && (
          <>
            <HourglassIcon />
            Saindo...
          </>
        )}

        {!isPending && (
          <>
            <LogOutIcon />
            Sair
          </>
        )}
      </a>
    </nav>
  );
}
