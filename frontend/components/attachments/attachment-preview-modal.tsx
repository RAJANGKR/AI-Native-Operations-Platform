"use client";

import * as React from "react";
import { Download, Trash2, X, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: {
    id: string;
    file_name: string;
    preview_url?: string;
    mime_type?: string;
    file_size_bytes?: number;
  } | null;
  onDelete?: (id: string) => void;
  onDownload?: () => void;
  isPreviewLoading?: boolean;
  previewError?: string;
}

export function AttachmentPreviewModal({
  isOpen,
  onClose,
  attachment,
  onDelete,
  onDownload,
  isPreviewLoading = false,
  previewError,
}: AttachmentPreviewModalProps) {
  if (!isOpen || !attachment) return null;

  const isImage =
    attachment.mime_type?.startsWith("image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(attachment.file_name);

  const isPdf =
    attachment.mime_type === "application/pdf" ||
    /\.pdf$/i.test(attachment.file_name);

  const handleDownload = () => {
    onDownload?.();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(attachment.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-4 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 font-bold">
              {isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 truncate">{attachment.file_name}</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {attachment.file_size_bytes
                  ? `${(attachment.file_size_bytes / 1024).toFixed(1)} KB`
                  : "Receipt Attachment"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5 text-xs">
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </Button>
            )}
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Viewer Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-900 flex items-center justify-center min-h-[350px]">
          {isPreviewLoading ? (
            <p className="text-sm text-slate-300">Preparing secure preview…</p>
          ) : previewError ? (
            <p role="alert" className="text-sm text-rose-300">{previewError}</p>
          ) : isImage && attachment.preview_url ? (
            /* Image Preview */
            <div className="relative max-h-[60vh] overflow-hidden rounded-lg shadow-lg border border-slate-800">
              <img
                src={attachment.preview_url}
                alt={attachment.file_name}
                className="max-h-[60vh] object-contain"
              />
            </div>
          ) : isPdf ? (
            /* PDF Document Placeholder Frame */
            <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800 border border-slate-700 shadow-xl">
                <FileText className="h-8 w-8 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold">{attachment.file_name}</h4>
                <p className="text-xs text-slate-400 mt-1">PDF Document Receipt Attachment</p>
              </div>
              <Button onClick={handleDownload} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs gap-2">
                <ExternalLink className="h-4 w-4" />
                Open PDF Document Viewer
              </Button>
            </div>
          ) : (
            /* Generic Document Viewer */
            <div className="flex flex-col items-center justify-center p-8 text-center text-white space-y-3">
              <FileText className="h-12 w-12 text-slate-500" />
              <p className="text-xs text-slate-300 font-medium">Document preview unavailable for this format.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
