"use client";

import React from "react";
import { Toaster, toast } from "sonner";
export { toast };

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      theme="dark"
      toastOptions={{
        style: {
          background: "#1A130B",
          border: "1px solid rgba(201, 154, 69, 0.4)",
          color: "#F5EDE0",
          fontFamily: "var(--font-montserrat), sans-serif",
          borderRadius: "1rem",
          boxShadow: "0 10px 30px rgba(0,0,0,0.8), 0 0 15px rgba(201,154,69,0.2)",
        },
        className: "luxury-toast",
      }}
    />
  );
}

export const showToast = {
  success: (message: string, description?: string) =>
    toast.success(message, {
      description,
      style: {
        borderColor: "rgba(95, 175, 122, 0.5)",
      },
    }),
  error: (message: string, description?: string) =>
    toast.error(message, {
      description,
      style: {
        borderColor: "rgba(212, 96, 79, 0.5)",
      },
    }),
  info: (message: string, description?: string) =>
    toast.info(message, {
      description,
      style: {
        borderColor: "rgba(201, 154, 69, 0.5)",
      },
    }),
  warning: (message: string, description?: string) =>
    toast.warning(message, {
      description,
      style: {
        borderColor: "rgba(224, 169, 59, 0.5)",
      },
    }),
  gold: (message: string, description?: string) =>
    toast(message, {
      description,
      icon: "✨",
      style: {
        borderColor: "#E8C77A",
      },
    }),
};
