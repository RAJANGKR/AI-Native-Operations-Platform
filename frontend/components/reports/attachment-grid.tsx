"use client";

import * as React from "react";
import { Download, FileText, CheckCircle, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { ReportDetailData } from "@/constants/mock-reports-data";

interface AttachmentGridProps {
  attachments: ReportDetailData["attachments"];
}

export function AttachmentGrid({ attachments }: AttachmentGridProps) {
  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle>Uploaded Attachments & Receipts</CardTitle>
        <CardDescription>
          Voucher PDFs, digital invoices, and scanned store receipts.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {attachments.map((file) => (
            <div
              key={file.id}
              className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-all hover:bg-slate-100/80 hover:border-slate-300 select-none space-y-3"
            >
              {/* Thumbnail Placeholder */}
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

              {/* Status Badge & Download Action */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <StatusBadge
                  status={file.verificationStatus === "verified" ? "approved" : "in-review"}
                  label={file.verificationStatus === "verified" ? "Verified" : "Pending Audit"}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-[11px] gap-1 bg-white hover:bg-slate-100"
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
