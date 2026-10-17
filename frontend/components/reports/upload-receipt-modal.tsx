"use client";

import * as React from "react";
import { UploadCloud, FileText, Loader2, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExpenseReports } from "@/hooks/use-expense-reports";
import { useToast } from "@/components/ui/toast";
import { uploadAttachment } from "@/services/attachment";

interface UploadReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportId?: string;
  expenseId?: string;
}

export function UploadReceiptModal({
  isOpen,
  onClose,
  reportId: initialReportId,
  expenseId: initialExpenseId,
}: UploadReceiptModalProps) {
  const { data: reports } = useExpenseReports();
  const { addToast } = useToast();

  const [selectedReportId, setSelectedReportId] = React.useState(initialReportId || "");
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);

  React.useEffect(() => {
    if (initialReportId) setSelectedReportId(initialReportId);
    else if (reports && reports.length > 0) setSelectedReportId(reports[0].id);
  }, [initialReportId, reports]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) {
      addToast({ title: "Report Required", description: "Please select a target expense report.", type: "error" });
      return;
    }
    if (!selectedFile) {
      addToast({ title: "File Required", description: "Please select a receipt document or image.", type: "error" });
      return;
    }

    setIsUploading(true);
    try {
      await uploadAttachment(selectedReportId, selectedFile);
      addToast({
        title: "Receipt Uploaded",
        description: `Successfully attached ${selectedFile.name} to report.`,
        type: "success",
      });
      setSelectedFile(null);
      onClose();
    } catch (err: any) {
      addToast({
        title: "Upload Failed",
        description: err?.response?.data?.detail || err?.message || "Failed to upload receipt.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <UploadCloud className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Upload Receipt Document</h3>
              <p className="text-xs text-slate-500">Attach voucher image or PDF invoice to expense entry.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* Target Expense Report Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Target Expense Report</label>
            <select
              value={selectedReportId}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              required
            >
              <option value="" disabled>Select an Expense Report</option>
              {reports?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Drag & Drop File Selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Receipt Image or PDF</label>
            <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center hover:bg-slate-100/50 transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <p className="text-xs font-bold text-slate-900">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type || "Document"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <UploadCloud className="h-8 w-8 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">Click or Drag & Drop file here</p>
                  <p className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP, PDF up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isUploading}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isUploading || !selectedFile}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold gap-1.5"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload Attachment</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
