"use client";

import { AdminMenu } from "@/components/Admin/AdminMenu";
import { Card } from "@/components/ui/card";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <>
      <div className="min-h-screen px-2 py-4 sm:px-4 sm:py-8">
        <div className="mx-auto max-w-screen-2xl">
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-4 lg:gap-8">
            {/* Menu lateral */}
            <div className="lg:col-span-1">
              <Card className="border-[#C2A537] bg-black/95 p-3 sm:p-4 lg:p-6">
                <AdminMenu />
              </Card>
            </div>

            {/* Conteúdo principal */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}
