import {
  LayoutDashboard,
  Calendar,
  FileText,
  CreditCard,
  BarChart3,
  Settings,
} from "lucide-react";
import React from "react";

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    description: "Overview of company spend & activities",
  },
  {
    title: "Events",
    href: "/events",
    icon: Calendar,
    description: "Event-based budget allocations & trips",
  },
  {
    title: "Expense Reports",
    href: "/expense-reports",
    icon: FileText,
    description: "Submitted reports and approval queues",
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: CreditCard,
    description: "Individual transaction logs & receipts",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    description: "Financial metrics & spend analysis",
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Platform preferences & organization setup",
  },
];
