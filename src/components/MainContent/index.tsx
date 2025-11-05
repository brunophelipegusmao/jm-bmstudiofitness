"use client";

import clsx from "clsx";
import { usePathname } from "next/navigation";

interface MainContentProps {
  children: React.ReactNode;
}

export function MainContent({ children }: MainContentProps) {
  const pathname = usePathname();

  // Verifica se estamos em páginas administrativas para ajustar o padding
  const isAdminPage =
    pathname.startsWith("/admin") && !pathname.includes("/login");
  const isCoachPage =
    pathname.startsWith("/coach") && !pathname.includes("/login");
  const isDashboardPage = isAdminPage || isCoachPage;

  return (
    <main
      className={clsx(
        "flex-1",
        isDashboardPage
          ? "pt-20 sm:pt-24" // Padding maior para dashboards com título
          : "pt-16 sm:pt-20", // Padding normal
      )}
    >
      {children}
    </main>
  );
}
