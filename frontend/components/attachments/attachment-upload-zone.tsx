"use client";

import * as React from "react";
import { UploadCloud, FileText, X, RotateCcw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadAttachment } from "@/hooks/use-attachment-mutations";
import { toast } from "@/components/ui/toast";

interface AttachmentUploadZoneProps {
  expenseId: string;
  reportId?: string;
  onUploadSuccess?: () => void;
}

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  status: "idle" | "uploading" | "success" | "error";
  errorMessage?: string;
  controller?: AbortController;
}

const ALLOWED_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".heic"];
const REJECTED_EXTENSIONS = [".zip", ".rar", ".exe", ".js", ".bat", ".dll"];
const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/heic",
  "image/heif",
];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function AttachmentUploadZone({
  expenseId,
  reportId,
  onUploadSuccess,
}: AttachmentUploadZoneProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [tasks, setTasks] = React.useState<UploadTask[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadAttachment();

  const validateFile = (file: File): string | null => {
    const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
    if (REJECTED_EXTENSIONS.includes(ext)) {
      return `File type '${ext}' is strictly forbidden for security reasons.`;
    }
    if (
      !ALLOWED_EXTENSIONS.includes(ext) &&
      !ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())
    ) {
      return `Invalid file type '${ext || file.type}'. Allowed: PDF, PNG, JPG, JPEG, HEIC.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds 10 MB limit.`;
    }
    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const newTasks: UploadTask[] = [];

    Array.from(files).forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast({
          type: "error",
          title: "Upload Failed",
          description: `${file.name}: ${error}`,
        });
        return;
      }

      newTasks.push({
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        file,
        progress: 0,
        status: "idle",
      });
    });

    if (newTasks.length > 0) {
      setTasks((prev) => [...prev, ...newTasks]);
      newTasks.forEach((task) => startUpload(task));
    }
  };

  const startUpload = async (task: UploadTask) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: "uploading", progress: 5 } : t
      )
    );

    try {
      await uploadMutation.mutateAsync({
        expenseId,
        reportId,
        file: task.file,
        onProgress: (percent) => {
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, progress: percent } : t))
          );
        },
      });

      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "success", progress: 100 } : t
        )
      );

      toast({
        type: "success",
        title: "Attachment Uploaded",
        description: `${task.file.name} uploaded successfully.`,
      });

      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail || err.message || "Failed to upload file to storage.";
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: "error", errorMessage: msg } : t
        )
      );

      toast({
        type: "error",
        title: "Upload Failed",
        description: `${task.file.name}: ${msg}`,
      });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    toast({
      type: "info",
      title: "Upload Cancelled",
      description: "File upload was cancelled.",
    });
  };

  const retryTask = (task: UploadTask) => {
    startUpload(task);
  };

  const removeTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all cursor-pointer select-none ${
          isDragOver
            ? "border-emerald-500 bg-emerald-50/50 shadow-md scale-[1.01]"
            : "border-slate-300 hover:border-slate-400 bg-slate-50/50 hover:bg-slate-100/60"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.heic"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs border border-slate-200 mb-3">
          <UploadCloud className={`h-6 w-6 ${isDragOver ? "text-emerald-600" : "text-slate-500"}`} />
        </div>

        <p className="text-xs font-semibold text-slate-800">
          <span className="text-slate-900 font-bold underline decoration-slate-300 underline-offset-2">
            Click to browse
          </span>{" "}
          or drag and drop receipt files here
        </p>

        <p className="text-[11px] text-slate-400 mt-1">
          Supports PDF, PNG, JPG, JPEG, HEIC (Max 10 MB per file)
        </p>
      </div>

      {/* Upload Tasks List */}
      {tasks.length > 0 && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-2xs"
            >
              <div className="flex items-center gap-3 overflow-hidden pr-2">
                <FileText className="h-5 w-5 shrink-0 text-slate-400" />
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-900">
                    {task.file.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {(task.file.size / (1024 * 1024)).toFixed(2)} MB
                    {task.status === "uploading" && ` • Uploading ${task.progress}%`}
                    {task.status === "error" && ` • ${task.errorMessage || "Failed"}`}
                  </p>

                  {/* Progress Bar */}
                  {task.status === "uploading" && (
                    <div className="mt-1.5 h-1.5 w-36 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-200"
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {task.status === "uploading" && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelTask(task.id);
                      }}
                      className="h-7 px-2 text-[11px] text-slate-500 hover:text-slate-800"
                    >
                      Cancel
                    </Button>
                  </>
                )}

                {task.status === "success" && (
                  <div className="flex items-center gap-1 text-emerald-600 text-xs font-semibold">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Uploaded</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTask(task.id);
                      }}
                      className="ml-1 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {task.status === "error" && (
                  <div className="flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4 text-rose-500" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        retryTask(task);
                      }}
                      className="h-7 px-2 text-[11px] gap-1 text-slate-700 hover:bg-slate-100"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Retry
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeTask(task.id);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
