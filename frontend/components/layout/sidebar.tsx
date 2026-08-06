"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  LogOut,
} from "lucide-react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { cn } from "@/lib/utils";

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export function Sidebar({ collapsed, onToggleCollapse, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 ease-in-out select-none",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold shadow-xs">
            <Sparkles className="h-4 w-4 text-emerald-400" />
          </div>
          {!collapsed && (
            <div className="flex flex-col whitespace-nowrap">
              <span className="text-sm font-bold tracking-tight text-slate-900">
                ApexExpense
              </span>
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                AI Native OS
              </span>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
        {NAVIGATION_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.title : undefined}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-900"
                )}
              />
              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}
              {collapsed && isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-emerald-500 rounded-r-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse Toggle when in Collapsed State */}
      {collapsed && (
        <div className="p-2 border-t border-slate-100 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-100/80 cursor-pointer",
            collapsed && "justify-center p-1.5"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 font-semibold text-xs text-white">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-xs font-semibold text-slate-900">
                Jordan Davies
              </p>
              <p className="truncate text-[11px] text-slate-500">
                Finance Director
              </p>
            </div>
          )}
          {!collapsed && (
            <LogOut className="h-4 w-4 shrink-0 text-slate-400 hover:text-slate-600 transition-colors" />
          )}
        </div>
      </div>
    </aside>
  );
}
