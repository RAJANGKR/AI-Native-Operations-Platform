"use client";

import * as React from "react";
import { Download, FileText, UploadCloud, Trash2, Loader2, Plus, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportDetailData } from "@/constants/mock-reports-data";
import { useUploadAttachment, useDeleteAttachment, useDownloadAttachment } from "@/hooks/use-attachment-mutations";
import { toast } from "@/components/ui/toast";

interface AttachmentGridProps {
  attachments: ReportDetailData["attachments"];
  expenseId?: string;
}

export function AttachmentGrid({ attachments: initialAttachments, expenseId = "00000000-0000-0000-0000-000000000005" }: AttachmentGridProps) {
  const [attachments, setAttachments] = React.useState(initialAttachments);
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = React.useState<any | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAttachment();
  const deleteMutation = useDeleteAttachment();
  const downloadMutation = useDownloadAttachment();

  React.useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowed = ["application/pdf", "image/png", "image/jpeg", "image/jpg", "image/heic"];
    const extAllowed = [".pdf", ".png", ".jpg", ".jpeg", ".heic"];
    const fileExt = "." + file.name.split(".").pop()?.toLowerCase();

    if (!allowed.includes(file.type.toLowerCase()) && !extAllowed.includes(fileExt)) {
      toast({
        type: "error",
        title: "Invalid File Type",
        description: "Only PDF, PNG, JPG, JPEG, and HEIC files are allowed.",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        type: "error",
        title: "File Exceeds Size Limit",
        description: "Maximum allowed file size is 10 MB.",
      });
      return;
    }

    setIsUploading(true);
    try {
      const res = await uploadMutation.mutateAsync({ expenseId, file });
      toast({
        type: "success",
        title: "Receipt Uploaded",
        description: `${file.name} uploaded successfully.`,
      });

      const newAttachment = {
        id: res.id,
        fileName: res.original_filename || file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
        verificationStatus: "verified" as const,
      };

      setAttachments((prev) => [newAttachment, ...prev]);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Upload Failed",
        description: err?.response?.data?.detail || err.message || "Failed to upload receipt.",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async (file: any) => {
    try {
      const res = await downloadMutation.mutateAsync(file.id);
      if (res?.download_url) {
        window.open(res.download_url, "_blank");
      }
    } catch (err: any) {
      toast({
        type: "error",
        title: "Download Failed",
        description: err?.response?.data?.detail || err.message || "Could not generate download link.",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteFile) return;
    setDeletingId(confirmDeleteFile.id);
    try {
      await deleteMutation.mutateAsync({ attachmentId: confirmDeleteFile.id, expenseId });
      toast({
        type: "success",
        title: "Attachment Deleted",
        description: `${confirmDeleteFile.fileName} deleted from storage and database.`,
      });
      setAttachments((prev) => prev.filter((a) => a.id !== confirmDeleteFile.id));
      setConfirmDeleteFile(null);
    } catch (err: any) {
      toast({
        type: "error",
        title: "Deletion Failed",
        description: err?.response?.data?.detail || err.message || "Could not delete attachment.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-subtle">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle>Uploaded Attachments & Receipts</CardTitle>
            <CardDescription>
              Voucher PDFs, digital invoices, and scanned store receipts.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelected}
              accept=".pdf,.png,.jpg,.jpeg,.heic"
              className="hidden"
            />
            <Button
              size="sm"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="gap-1.5 text-xs"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {isUploading ? "Uploading..." : "Upload Another Receipt"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-2">
          {attachments.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-10 text-center bg-slate-50/50">
              <UploadCloud className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Receipt Attachments Uploaded</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                Attach voucher receipts (PDF, PNG, JPG, HEIC up to 10MB) to verify expenses.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/80 hover:border-slate-300 select-none space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white font-bold shadow-2xs">
                      <FileText className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="truncate text-xs font-bold text-slate-900 group-hover:text-slate-950">
                        {file.fileName}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {file.fileSize} • Uploaded {file.uploadDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <StatusBadge
                      status={file.verificationStatus === "verified" ? "approved" : "in-review"}
                      label={file.verificationStatus === "verified" ? "Verified" : "Pending Audit"}
                    />
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        disabled={downloadMutation.isPending}
                        className="h-7 px-2 text-[11px] gap-1 bg-white hover:bg-slate-100"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </Button>
                      <button
                        onClick={() => setConfirmDeleteFile(file)}
                        disabled={deletingId === file.id}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {confirmDeleteFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Receipt File</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{confirmDeleteFile.fileName}"</span>? This will permanently delete the file from Supabase Storage and PostgreSQL database.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                disabled={deletingId === confirmDeleteFile.id}
                onClick={() => setConfirmDeleteFile(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={deletingId === confirmDeleteFile.id}
                onClick={handleDeleteConfirm}
                className="bg-rose-600 hover:bg-rose-700 text-white gap-1.5"
              >
                {deletingId === confirmDeleteFile.id && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
