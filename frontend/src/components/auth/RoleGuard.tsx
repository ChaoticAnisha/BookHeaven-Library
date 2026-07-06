"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";

export default function RoleGuard({
  allow,
  children,
}: {
  allow: string[];
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const notified = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!allow.includes(user.role)) {
      if (!notified.current) {
        notified.current = true;
        toast({
          title: "Access restricted",
          description: "You don't have permission to view that page.",
          variant: "destructive",
        });
      }
      router.push("/dashboard");
    }
  }, [user, isLoading, allow, router, toast]);

  if (isLoading || !user || !allow.includes(user.role)) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3B4FE8] dark:border-indigo-400"></div>
      </div>
    );
  }

  return <>{children}</>;
}
