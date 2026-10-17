"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Calendar, FileText, DollarSign, Users, Layers, ArrowRight, X } from "lucide-react";

interface SearchItem {
  id: string;
  category: "Events" | "Reports" | "Expenses" | "Members" | "Chapters";
  title: string;
  subtitle: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "evt-1",
    category: "Events",
    title: "Annual Tech Conference 2026",
    subtitle: "Engineering Chapter • $45,000 Budget",
    href: "/events",
    icon: Calendar,
  },
  {
    id: "evt-2",
    category: "Events",
    title: "Q3 Hackathon",
    subtitle: "Product Chapter • $12,500 Budget",
    href: "/events",
    icon: Calendar,
  },
  {
    id: "rep-1",
    category: "Reports",
    title: "Q3 Marketing Campaign Receipts",
    subtitle: "Submitted by Sarah Jenkins • $12,450.00",
    href: "/expense-reports",
    icon: FileText,
  },
  {
    id: "rep-2",
    category: "Reports",
    title: "Cloud Infrastructure Renewals",
    subtitle: "Draft Report • $8,200.00",
    href: "/expense-reports",
    icon: FileText,
  },
  {
    id: "exp-1",
    category: "Expenses",
    title: "AWS Production Hosting",
    subtitle: "Technology Category • $3,450.00",
    href: "/expenses",
    icon: DollarSign,
  },
  {
    id: "exp-2",
    category: "Expenses",
    title: "Google Workspace Subscriptions",
    subtitle: "Software Category • $1,200.00",
    href: "/expenses",
    icon: DollarSign,
  },
  {
    id: "mem-1",
    category: "Members",
    title: "Jordan Davies",
    subtitle: "Finance Director • Treasurer",
    href: "/settings",
    icon: Users,
  },
  {
    id: "mem-2",
    category: "Members",
    title: "Alex Morgan",
    subtitle: "Operations Manager • Member",
    href: "/settings",
    icon: Users,
  },
  {
    id: "ch-1",
    category: "Chapters",
    title: "Engineering Chapter",
    subtitle: "14 Active Members • $120,000 Annual Budget",
    href: "/events",
    icon: Layers,
  },
];

interface CommandMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandMenu({ isOpen, onClose }: CommandMenuProps) {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open trigger handled by parent or state toggle
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredItems = SEARCH_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    onClose();
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 backdrop-blur-xs pt-20 px-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 bg-slate-50/50">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search events, reports, expenses, members..."
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-400">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 sm:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.href)}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left hover:bg-slate-100 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No results found for &quot;{query}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
