"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Sparkles, Loader2 } from "lucide-react";

const PUBLIC_PATHS = ["/login", "/register"];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated && !isPublicPath) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, isPublicPath, router]);

  // If loading session, display clean SaaS full-page restoration view to prevent flickering
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white select-none">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 shadow-md mb-4 animate-pulse">
          <Sparkles className="h-6 w-6 text-emerald-400" />
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Restoring Authentication Session...</span>
        </div>
      </div>
    );
  }

  // If on login page, render children directly
  if (isPublicPath) {
    return <>{children}</>;
  }

  // If authenticated, render children
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  // Fallback while redirecting
  return null;
}
