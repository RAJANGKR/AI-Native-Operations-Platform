"use client";

import * as React from "react";
import { Bell, Calendar, Building2 } from "lucide-react";
import { SearchInput } from "@/components/ui/search-input";
import { DASHBOARD_USER } from "@/constants/mock-dashboard-data";
import { cn } from "@/lib/utils";

export function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
      {/* Decorative subtle ambient background gradient */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-slate-100/60 blur-3xl" />

      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left Side: Greeting & Organization Context */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700">
              <Building2 className="h-3.5 w-3.5 text-slate-500" />
              {DASHBOARD_USER.organization}
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {DASHBOARD_USER.todayDate}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Good Morning, {DASHBOARD_USER.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
            Here is your treasury overview. You have <strong className="text-slate-900 font-semibold">8 reports requiring review</strong> and <strong className="text-slate-900 font-semibold">6 active events</strong> running within allocated caps.
          </p>
        </div>

        {/* Right Side: Quick Search, Notifications & Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-full sm:w-64">
            <SearchInput placeholder="Search treasury (⌘K)..." />
          </div>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 active:scale-95"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
          </button>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 font-bold text-xs text-white shadow-xs select-none">
            RJ
          </div>
        </div>
      </div>
    </div>
  );
}
