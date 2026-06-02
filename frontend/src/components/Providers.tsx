"use client";

import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider, ToastViewport } from "@radix-ui/react-toast";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ToastProvider>
        {children}
        <ToastViewport className="fixed bottom-0 right-0 p-6 flex flex-col gap-2 w-full max-w-sm m-0 z-50 outline-none" />
      </ToastProvider>
    </AuthProvider>
  );
};
