"use client";

import * as React from "react";
import { Send, Save, ShieldCheck, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ReportDetailData } from "@/constants/mock-reports-data";
import { useSubmitExpenseReport } from "@/hooks/use-expense-report-mutations";
import { toast } from "@/components/ui/toast";

interface SubmitCardProps {
  report: ReportDetailData;
}

export function SubmitCard({ report }: SubmitCardProps) {
  const submitMutation = useSubmitExpenseReport();
  const submitted = report.status === "submitted" || report.status === "approved";

  const handleSubmit = async () => {
    try {
      await submitMutation.mutateAsync(report.id);
      toast({
        type: "success",
        title: "Report Submitted",
        description: `Expense report ${report.id} has been submitted for Treasurer audit.`,
      });
    } catch (err: any) {
      toast({
        type: "error",
        title: "Submission Failed",
        description: err?.response?.data?.detail || err.message || "Failed to submit expense report.",
      });
    }
  };

  return (
    <Card className="relative overflow-hidden border border-slate-200/80 bg-white shadow-card">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">Submission Workflow Status</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
              {submitted ? "Report Submitted for Treasurer Review" : "Ready for Treasurer Submission"}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              {submitted
                ? "This report is currently queued for multi-level Treasurer audit and ledger reconciliation."
                : "Verify that all receipt vouchers match your line items before submitting to your chapter Treasurer."}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {!submitted && (
              <Button variant="outline" size="sm" disabled={submitMutation.isPending}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Draft
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={submitMutation.isPending}
              className={submitted ? "bg-emerald-700 hover:bg-emerald-800 gap-1.5" : "gap-1.5"}
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {submitted ? "Resubmit Report" : "Submit Report"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
