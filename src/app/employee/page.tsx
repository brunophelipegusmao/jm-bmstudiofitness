"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

const EmployeePage = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/employee/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-lg text-[#C2A537]">Redirecionando para login...</div>
    </div>
  );
};

export default EmployeePage;
