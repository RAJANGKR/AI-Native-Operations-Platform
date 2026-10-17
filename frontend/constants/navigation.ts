import {
  LayoutDashboard,
  Building,
  Layers,
  Calendar,
  FileText,
  CreditCard,
  Users,
  CheckSquare,
  Settings,
  ScanLine,
} from "lucide-react";
import React from "react";
import type { UserRole } from "@/services/auth";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  roles?: UserRole[];
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "College club treasury overview & summary",
  },
  {
    title: "Clubs",
    href: "/clubs",
    icon: Building,
    description: "Registered college clubs & societies",
  },
  {
    title: "Chapters",
    href: "/chapters",
    icon: Layers,
    description: "Club chapters & technical wings",
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
    description: "Chapter events & budget allocations",
  },
  {
    title: "Expense Reports",
    href: "/expense-reports",
    icon: FileText,
    description: "Submitted expense batches and vouchers",
  },
  {
    title: "My Expenses",
    href: "/expenses",
    icon: CreditCard,
    description: "Student transaction logs & receipts",
  },
  {
    title: "Scan Receipt",
    href: "/scan-receipt",
    icon: ScanLine,
    description: "Create an expense from a receipt image",
  },
  {
    title: "Members",
    href: "/members",
    icon: Users,
    description: "Student roster & club members",
  },
  {
    title: "Approvals",
    href: "/approvals",
    icon: CheckSquare,
    description: "Treasurer pending registration & report reviews",
    roles: ["ADMIN", "TREASURER", "SUPERADMIN"],
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Platform preferences & organization setup",
  },
];
