"use client";

import * as React from "react";
import { Bell, Check, Trash2, CheckCheck, FileText, AlertCircle, DollarSign } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: "approval" | "system" | "expense";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "Expense Report Approved",
    description: "Report 'Q3 Marketing Campaign Receipts' ($12,450) was approved by Sarah Jenkins.",
    timestamp: "10m ago",
    read: false,
    type: "approval",
  },
  {
    id: "notif-2",
    title: "New Attachment Uploaded",
    description: "Invoice-2026-08.pdf was added to AWS Infrastructure report.",
    timestamp: "1h ago",
    read: false,
    type: "expense",
  },
  {
    id: "notif-3",
    title: "Budget Threshold Warning",
    description: "Engineering Chapter has utilized 82% of its quarterly budget.",
    timestamp: "3h ago",
    read: true,
    type: "system",
  },
];

export function NotificationDropdown() {
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { addToast } = useToast();

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast({ title: "Notifications Updated", description: "All notifications marked as read.", type: "success" });
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearAll = () => {
    setNotifications([]);
    addToast({ title: "Cleared", description: "Notification queue cleared.", type: "neutral" });
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "approval":
        return <Check className="h-4 w-4 text-emerald-500" />;
      case "expense":
        return <FileText className="h-4 w-4 text-blue-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  return (
    <div className="relative inline-block text-left select-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200/80 text-slate-600 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 sm:w-96 origin-top-right rounded-2xl bg-white p-3 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 space-y-2">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>Read all</span>
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={clearAll}
                  className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  title="Clear all notifications"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto space-y-1">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`flex items-start gap-3 rounded-xl p-2.5 transition-colors cursor-pointer ${
                    item.read ? "bg-white hover:bg-slate-50" : "bg-slate-50 hover:bg-slate-100/80"
                  }`}
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs ${item.read ? "font-semibold text-slate-700" : "font-bold text-slate-900"}`}>
                        {item.title}
                      </p>
                      <span className="text-[10px] text-slate-400">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No notifications right now.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
