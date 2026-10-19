"use client";

import * as React from "react";
import { Download, FileText, Trash2, Loader2, AlertTriangle, Hash, Calendar, HardDrive, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { AttachmentUploadZone } from "@/components/attachments/attachment-upload-zone";
import { AttachmentPreviewModal } from "@/components/attachments/attachment-preview-modal";
import { useDeleteAttachment, useDownloadAttachment } from "@/hooks/use-attachment-mutations";
import { AttachmentResponseItem } from "@/services/attachment";
import { useQueries } from "@tanstack/react-query";
import { getExpenseAttachments } from "@/services/attachment";
import { toast } from "@/components/ui/toast";

interface AttachmentGridProps {
  expenseIds: string[];
  reportId?: string;
}

export function AttachmentGrid({
  expenseIds,
  reportId,
}: AttachmentGridProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [confirmDeleteFile, setConfirmDeleteFile] = React.useState<AttachmentResponseItem | any | null>(null);
  const [previewFile, setPreviewFile] = React.useState<(AttachmentResponseItem & { previewUrl?: string }) | null>(null);
  const [previewLoading, setPreviewLoading] = React.useState(false);
  const [previewError, setPreviewError] = React.useState("");

  const attachmentQueries = useQueries({
    queries: expenseIds.map((id) => ({
      queryKey: ["attachments", id],
      queryFn: () => getExpenseAttachments(id),
      enabled: Boolean(id),
      staleTime: 5 * 60 * 1000,
      refetchInterval: 5 * 60 * 1000,
    })),
  });
  const deleteMutation = useDeleteAttachment();
  const downloadMutation = useDownloadAttachment();
  const attachmentsLoading = attachmentQueries.some((query) => query.isLoading);
  const attachmentsError = attachmentQueries.find((query) => query.isError)?.error;
  const refetch = () => Promise.all(attachmentQueries.map((query) => query.refetch()));
  const itemsList: AttachmentResponseItem[] = attachmentQueries.flatMap((query) => query.data ?? []);
  const [uploadExpenseId, setUploadExpenseId] = React.useState(expenseIds[0] || "");

  React.useEffect(() => {
    if (!expenseIds.includes(uploadExpenseId)) setUploadExpenseId(expenseIds[0] || "");
  }, [expenseIds, uploadExpenseId]);

  const handleDownload = async (attachment: AttachmentResponseItem) => {
    // Open synchronously during the click gesture so browsers do not block
    // the tab after the authenticated signed-URL request resolves.
    const downloadWindow = window.open("about:blank", "_blank");
    if (downloadWindow) downloadWindow.opener = null;
    if (!downloadWindow) {
      toast({ type: "error", title: "Download Blocked", description: "Allow pop-ups for this site to download attachments." });
      return;
    }
    try {
      const res = await downloadMutation.mutateAsync(attachment.id);
      if (res?.download_url) {
        downloadWindow.location.replace(res.download_url);
        toast({
          type: "success",
          title: "Download Started",
          description: `Generating secure 5-minute signed URL for ${attachment.original_filename || "receipt"}.`,
        });
      }
    } catch (err: any) {
      downloadWindow.close();
      toast({
        type: "error",
        title: "Download Failed",
        description: err?.response?.data?.detail || err.message || "Could not generate download link.",
      });
    }
  };

  const handlePreview = async (attachment: AttachmentResponseItem) => {
    setPreviewFile(attachment);
    setPreviewError("");
    setPreviewLoading(true);
    try {
      const res = await downloadMutation.mutateAsync(attachment.id);
      setPreviewFile({ ...attachment, previewUrl: res.download_url });
    } catch (err: any) {
      setPreviewError(err?.response?.data?.detail || err.message || "Could not create an authorized preview link.");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteFile) return;
    setDeletingId(confirmDeleteFile.id);
    try {
      await deleteMutation.mutateAsync({
        attachmentId: confirmDeleteFile.id,
        expenseId: confirmDeleteFile.expense_id,
        reportId,
      });

      toast({
        type: "success",
        title: "Attachment Deleted",
        description: `${confirmDeleteFile.original_filename || "File"} permanently removed from storage and database.`,
      });

      setConfirmDeleteFile(null);
      refetch();
    } catch (err: any) {
      toast({
        type: "error",
        title: "Upload/Delete Error",
        description: err?.response?.data?.detail || err.message || "Failed to delete attachment object.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "0 KB";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (isoString?: string): string => {
    if (!isoString) return new Date().toLocaleDateString();
    try {
      return new Date(isoString).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <>
      <Card className="transition-all duration-200 hover:shadow-subtle">
        <CardHeader className="pb-3">
          <CardTitle>Receipt Upload & Attachment Management</CardTitle>
          <CardDescription>
            Upload voucher receipts, store invoices, and supporting proof documents. All files are securely routed to private Supabase Storage via FastAPI backend.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 1. Drag & Drop Upload Zone */}
          {expenseIds.length > 0 ? (
            <div className="space-y-3">
              {expenseIds.length > 1 && (
                <label className="block text-xs font-semibold text-slate-700">
                  Attach to expense
                  <select value={uploadExpenseId} onChange={(event) => setUploadExpenseId(event.target.value)} className="mt-1 h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm">
                    {expenseIds.map((id, index) => <option key={id} value={id}>Expense {index + 1} · {id.slice(0, 8)}</option>)}
                  </select>
                </label>
              )}
              <AttachmentUploadZone
                expenseId={uploadExpenseId}
                reportId={reportId}
                onUploadSuccess={() => void refetch()}
              />
            </div>
          ) : (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">Create an expense in this report before uploading its receipt.</p>
          )}

          {/* 2. Attachment Cards Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Attached Documents ({itemsList.length})
            </h4>

            {attachmentsLoading ? (
              <p className="rounded-xl border border-slate-200 py-8 text-center text-xs text-slate-500">Loading attachments…</p>
            ) : attachmentsError ? (
              <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800">Could not load attachments. Check your connection and try again.</div>
            ) : itemsList.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 py-8 text-center bg-slate-50/30">
                <p className="text-xs font-medium text-slate-500">No attachments linked to this expense line item.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {itemsList.map((file) => (
                  <div
                    key={file.id}
                    className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-4 transition-all hover:bg-slate-50/80 hover:border-slate-300 shadow-2xs space-y-3"
                  >
                    {/* Header: Icon & Filename */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-emerald-400 font-bold shadow-2xs">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900 group-hover:text-slate-950">
                          {file.original_filename || "receipt_attachment.pdf"}
                        </p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                          <span className="inline-flex items-center gap-1">
                            <HardDrive className="h-3 w-3 text-slate-400" />
                            {formatFileSize(file.size_bytes)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-slate-400" />
                            {formatDate(file.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Details: Type, OCR status, SHA256 checksum */}
                    <div className="rounded-md bg-slate-50 p-2.5 space-y-1.5 text-[10px] text-slate-600 border border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500">Type:</span>
                        <span className="font-mono bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-800 uppercase font-bold text-[9px]">
                          {file.attachment_type || file.type || "RECEIPT"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-500">OCR Status:</span>
                        <StatusBadge
                          status={file.ocr_status === "COMPLETED" ? "approved" : "in-review"}
                          label={file.ocr_status || "PENDING"}
                        />
                      </div>

                      {file.sha256_hash && (
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200/50">
                          <span className="font-semibold text-slate-500 flex items-center gap-1">
                            <Hash className="h-3 w-3 text-slate-400" /> SHA-256:
                          </span>
                          <span
                            className="font-mono text-[9px] text-slate-500 truncate max-w-[120px]"
                            title={file.sha256_hash}
                          >
                            {file.sha256_hash.substring(0, 12)}...
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Footer Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => void handlePreview(file)}
                          className="h-7 px-2 text-[11px] gap-1 bg-white hover:bg-slate-100 border-slate-200"
                        >
                          <Eye className="h-3 w-3" />
                          Preview
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(file)}
                          disabled={downloadMutation.isPending}
                          className="h-7 px-2 text-[11px] gap-1 bg-white hover:bg-slate-100 border-slate-200"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setConfirmDeleteFile(file)}
                        disabled={deletingId === file.id}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors disabled:opacity-50"
                        title="Delete Attachment"
                      >
                        {deletingId === file.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Modal */}
      <AttachmentPreviewModal
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        attachment={
          previewFile
            ? {
                id: previewFile.id,
                file_name: previewFile.original_filename || "receipt.pdf",
                preview_url: previewFile.previewUrl,
                mime_type: previewFile.mime_type,
                file_size_bytes: previewFile.size_bytes,
              }
            : null
        }
        onDelete={() => setConfirmDeleteFile(previewFile)}
        onDownload={() => previewFile && void handleDownload(previewFile)}
        isPreviewLoading={previewLoading}
        previewError={previewError}
      />

      {/* Confirmation Modal Dialog */}
      {confirmDeleteFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Delete Receipt Attachment</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-900">
                "{confirmDeleteFile.original_filename || confirmDeleteFile.fileName || "this file"}"
              </span>
              ? This action will permanently remove the file from Supabase Storage and clear metadata from PostgreSQL.
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
