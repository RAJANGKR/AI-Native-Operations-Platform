"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  description?: string;
}

type Listener = (toasts: ToastMessage[]) => void;
let toasts: ToastMessage[] = [];
let listeners: Listener[] = [];

export function toast(options: { type?: "success" | "error" | "info" | "neutral"; title: string; description?: string }) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastMessage = {
    id,
    type: options.type === "error" ? "error" : options.type === "info" || options.type === "neutral" ? "info" : "success",
    title: options.title,
    description: options.description,
  };
  toasts = [...toasts, newToast];
  listeners.forEach((l) => l(toasts));

  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((l) => l(toasts));
  }, 4000);
}

export function useToast() {
  return {
    addToast: (options: { type?: "success" | "error" | "info" | "neutral"; title: string; description?: string }) => toast(options),
    toast: (options: { type?: "success" | "error" | "info" | "neutral"; title: string; description?: string }) => toast(options),
  };
}

export function ToastContainer() {
  const [activeToasts, setActiveToasts] = React.useState<ToastMessage[]>(toasts);

  React.useEffect(() => {
    listeners.push(setActiveToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setActiveToasts);
    };
  }, []);

  if (activeToasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {activeToasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-200 animate-in slide-in-from-bottom-5",
            t.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-950",
            t.type === "error" && "border-rose-200 bg-rose-50 text-rose-950",
            t.type === "info" && "border-slate-200 bg-slate-900 text-white"
          )}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          )}
          <div className="flex-1">
            <h4 className="text-xs font-bold">{t.title}</h4>
            {t.description && <p className="text-[11px] opacity-90 mt-0.5">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
