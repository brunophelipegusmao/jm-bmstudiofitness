"use client";

import "react-toastify/dist/ReactToastify.css";

import { toast, ToastContainer } from "react-toastify";

// Configurações personalizadas para os toasts
export const showSuccessToast = (message: string) => {
  toast.success(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className:
      "!bg-gradient-to-r !from-[#C2A537] !to-[#D4B547] !text-black !font-medium",
    progressClassName: "!bg-black/20",
  });
};

export const showErrorToast = (message: string) => {
  toast.error(message, {
    position: "top-right",
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className:
      "!bg-gradient-to-r !from-red-600 !to-red-700 !text-white !font-medium",
    progressClassName: "!bg-white/20",
  });
};

export const showInfoToast = (message: string) => {
  toast.info(message, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className:
      "!bg-gradient-to-r !from-blue-600 !to-blue-700 !text-white !font-medium",
    progressClassName: "!bg-white/20",
  });
};

// Componente do container de toasts
export function ToastProvider() {
  return (
    <ToastContainer
      position="top-right"
      autoClose={3000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
      toastClassName="!rounded-xl !shadow-2xl"
    />
  );
}
