"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FilePlus, CreditCard, BarChart3, UploadCloud, ScanLine } from "lucide-react";
import { SelectReportModal } from "@/components/reports/select-report-modal";
import { AddExpenseModal } from "@/components/reports/add-expense-modal";
import { UploadReceiptModal } from "@/components/reports/upload-receipt-modal";
import { cn } from "@/lib/utils";

interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: "default" | "outline" | "secondary";
}

const QUICK_ACTIONS: QuickActionItem[] = [
  {
    id: "new-report",
    label: "New Expense Report",
    description: "Submit multi-item batch",
    icon: FilePlus,
    variant: "default",
  },
  {
    id: "add-expense",
    label: "Add Expense",
    description: "Log transaction entry",
    icon: CreditCard,
    variant: "outline",
  },
  {
    id: "view-analytics",
    label: "View Analytics",
    description: "Treasury spend breakdown",
    icon: BarChart3,
    variant: "outline",
  },
  {
    id: "upload-receipt",
    label: "Upload Receipt",
    description: "Parse voucher document",
    icon: UploadCloud,
    variant: "secondary",
  },
  {
    id: "scan-receipt",
    label: "Scan Receipt",
    description: "Read locally and create an expense",
    icon: ScanLine,
    variant: "outline",
  },
];

export function QuickActions() {
  const router = useRouter();
  const [selectReportOpen, setSelectReportOpen] = React.useState(false);
  const [addExpenseOpen, setAddExpenseOpen] = React.useState(false);
  const [uploadReceiptOpen, setUploadReceiptOpen] = React.useState(false);
  const [selectedReportId, setSelectedReportId] = React.useState<string>("");

  const handleActionClick = (actionId: string) => {
    switch (actionId) {
      case "new-report":
        router.push("/expense-reports/new");
        break;
      case "add-expense":
        setSelectReportOpen(true);
        break;
      case "view-analytics":
        router.push("/analytics");
        break;
      case "upload-receipt":
        setUploadReceiptOpen(true);
        break;
      case "scan-receipt":
        router.push("/scan-receipt");
        break;
    }
  };

  const handleReportSelected = (reportId: string) => {
    setSelectedReportId(reportId);
    setAddExpenseOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              onClick={() => handleActionClick(action.id)}
              className={cn(
                "group relative flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 text-left shadow-xs transition-all duration-200 hover:scale-[1.01] hover:border-slate-300 hover:shadow-subtle active:scale-[0.99] select-none cursor-pointer"
              )}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                    action.variant === "default"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700 group-hover:bg-slate-900 group-hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-slate-950">
                    {action.label}
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal">
                    {action.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Select Report Modal */}
      <SelectReportModal
        isOpen={selectReportOpen}
        onClose={() => setSelectReportOpen(false)}
        onSelectReport={handleReportSelected}
      />

      {/* Add Expense Modal */}
      {selectedReportId && (
        <AddExpenseModal
          isOpen={addExpenseOpen}
          onClose={() => setAddExpenseOpen(false)}
          reportId={selectedReportId}
        />
      )}

      {/* Upload Receipt Modal */}
      <UploadReceiptModal
        isOpen={uploadReceiptOpen}
        onClose={() => setUploadReceiptOpen(false)}
      />
    </>
  );
}
