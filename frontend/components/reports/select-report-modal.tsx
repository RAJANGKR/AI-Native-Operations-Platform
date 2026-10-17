"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenseReports } from "@/hooks/use-expense-reports";

interface SelectReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectReport: (reportId: string) => void;
}

export function SelectReportModal({ isOpen, onClose, onSelectReport }: SelectReportModalProps) {
  const router = useRouter();
  const { data: reports, isLoading } = useExpenseReports();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <FileText className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Select Expense Report</h3>
              <p className="text-xs text-slate-500">Choose a report to log entry or create a new batch.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Action: Create New Report */}
        <Button
          onClick={() => {
            onClose();
            router.push("/expense-reports/new");
          }}
          className="w-full justify-between bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-xs font-bold h-10 px-4 rounded-xl"
        >
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-emerald-600" />
            <span>Create New Expense Report Batch</span>
          </div>
          <ArrowRight className="h-4 w-4 text-emerald-600" />
        </Button>

        <div className="relative flex items-center my-2">
          <div className="flex-grow border-t border-slate-200" />
          <span className="shrink-0 px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Or select existing report
          </span>
          <div className="flex-grow border-t border-slate-200" />
        </div>

        {/* Existing Reports List */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {isLoading ? (
            <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
              Loading expense reports...
            </div>
          ) : reports && reports.length > 0 ? (
            reports.map((rep) => (
              <div
                key={rep.id}
                onClick={() => {
                  onSelectReport(rep.id);
                  onClose();
                }}
                className="flex items-center justify-between rounded-xl border border-slate-200/80 p-3 hover:bg-slate-50 transition-colors cursor-pointer group"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                    {rep.title}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Status: {rep.status?.toUpperCase() || "SUBMITTED"} • Total: ₹{rep.total_amount?.toLocaleString() || "0"}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No existing expense reports found. Please create one above.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
