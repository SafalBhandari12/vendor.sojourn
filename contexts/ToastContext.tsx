"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import Toast from "@/components/Toast";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
  duration?: number;
}

interface ToastContextType {
  showToast: (
    message: string,
    type: ToastMessage["type"],
    duration?: number
  ) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (
    message: string,
    type: ToastMessage["type"],
    duration = 5000
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { id, message, type, duration };

    setToasts((prev) => [...prev, newToast]);
  };

  const showSuccess = (message: string, duration = 5000) => {
    showToast(message, "success", duration);
  };

  const showError = (message: string, duration = 5000) => {
    showToast(message, "error", duration);
  };

  const showInfo = (message: string, duration = 5000) => {
    showToast(message, "info", duration);
  };

  const showWarning = (message: string, duration = 5000) => {
    showToast(message, "warning", duration);
  };

  const value = {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className='fixed top-4 right-4 z-50 space-y-2'>
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
