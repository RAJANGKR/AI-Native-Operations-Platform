"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { MobileNav } from "./mobile-nav";
import { ProtectedRoute } from "@/components/auth/protected-route";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const pathname = usePathname();

  if (pathname === "/login") {
    return <ProtectedRoute>{children}</ProtectedRoute>;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans text-slate-900 antialiased">
        <div className="flex flex-1">
          {/* Desktop & Tablet Sidebar */}
          <div className="hidden lg:flex">
            <Sidebar
              collapsed={collapsed}
              onToggleCollapse={() => setCollapsed(!collapsed)}
            />
          </div>

          {/* Mobile Navigation Drawer */}
          <MobileNav
            open={mobileNavOpen}
            onClose={() => setMobileNavOpen(false)}
          />

          {/* Main Content Viewport */}
          <div className="flex flex-1 flex-col min-w-0">
            <Header onOpenMobileNav={() => setMobileNavOpen(true)} />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
