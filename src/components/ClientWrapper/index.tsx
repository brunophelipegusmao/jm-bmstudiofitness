"use client";

import { ConfigurationProvider } from "@/contexts/ConfigurationContext";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <ConfigurationProvider>{children}</ConfigurationProvider>;
}
