"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, User, ChevronDown } from "lucide-react";
import { NAVIGATION_ITEMS } from "@/constants/navigation";
import { SearchInput } from "@/components/ui/search-input";
import { ProfileDropdown } from "@/components/shared/profile-dropdown";
import { cn } from "@/lib/utils";

import { NotificationDropdown } from "@/components/shared/notification-dropdown";
import { CommandMenu } from "@/components/shared/command-menu";

interface HeaderProps {
  onOpenMobileNav: () => void;
  className?: string;
}

export function Header({ onOpenMobileNav, className }: HeaderProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = React.useState(false);

  // Find active nav title
  const activeNav = NAVIGATION_ITEMS.find(
    (item) => item.href === pathname || (item.href !== "/" && pathname.startsWith(item.href))
  ) || NAVIGATION_ITEMS[0];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 backdrop-blur-xs select-none",
          className
        )}
      >
        {/* Left Region: Mobile Menu Trigger + Page Title & Breadcrumb */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileNav}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span>Organization</span>
              <span>/</span>
              <span className="font-medium text-slate-600">{activeNav.title}</span>
            </div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight sm:text-base">
              {activeNav.title}
            </h2>
          </div>
        </div>

        {/* Right Region: Search Bar + Notifications + Profile Dropdown */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block cursor-pointer" onClick={() => setSearchOpen(true)}>
            <SearchInput placeholder="Search system (⌘K)..." />
          </div>

          {/* Notifications Dropdown */}
          <NotificationDropdown />

          {/* User Profile Dropdown Trigger */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Global Command Menu Search Dialog */}
      <CommandMenu isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
