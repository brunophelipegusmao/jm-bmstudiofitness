"use client";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-linear-to-br from-black via-slate-900 to-black">
      <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
