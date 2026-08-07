"use client";

import * as React from "react";
import { LogOut, ShieldCheck, ChevronDown, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function ProfileDropdown() {
  const { user, logout } = useAuth();
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-slate-200 animate-pulse" />
      </div>
    );
  }

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role?.toUpperCase()) {
      case "ADMIN":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "TREASURER":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
    }
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 rounded-xl p-1.5 text-left text-xs hover:bg-slate-100/80 transition-colors border border-transparent hover:border-slate-200"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-emerald-400 shadow-2xs">
          {getInitials(user.full_name)}
        </div>
        <div className="hidden md:flex flex-col">
          <span className="font-bold text-slate-900 truncate max-w-[120px]">
            {user.full_name}
          </span>
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {user.role}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-white p-2 shadow-xl border border-slate-200/80 animate-in fade-in zoom-in-95 space-y-1">
          {/* User Info Header */}
          <div className="p-2.5 border-b border-slate-100 space-y-1 bg-slate-50/50 rounded-lg">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900 truncate">{user.full_name}</p>
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold border uppercase font-mono ${getRoleBadgeStyle(user.role)}`}>
                {user.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono truncate">{user.email}</p>
          </div>

          {/* Quick Actions */}
          <div className="py-1">
            <div className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 rounded-md hover:bg-slate-50 cursor-pointer">
              <ShieldCheck className="h-4 w-4 text-slate-400" />
              <span>Role: {user.role}</span>
            </div>
          </div>

          {/* Logout Action Button */}
          <div className="pt-1 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
