"use client";

import * as React from "react";
import { FileCheck, FileText, FileSearch, FileX } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { EventAttachmentStats } from "@/constants/mock-events-data";

interface AttachmentSummaryProps {
  attachments: EventAttachmentStats;
}

export function AttachmentSummary({ attachments }: AttachmentSummaryProps) {
  const items = [
    {
      label: "Receipts Uploaded",
      count: attachments.receiptsUploaded,
      icon: FileText,
      color: "text-slate-900 bg-slate-100",
    },
    {
      label: "Verified Vouchers",
      count: attachments.verifiedCount,
      icon: FileCheck,
      color: "text-emerald-700 bg-emerald-50 border border-emerald-200/60",
    },
    {
      label: "OCR Pending",
      count: attachments.ocrPendingCount,
      icon: FileSearch,
      color: "text-amber-700 bg-amber-50 border border-amber-200/60",
    },
    {
      label: "Missing Receipts",
      count: attachments.missingReceiptsCount,
      icon: FileX,
      color: "text-rose-700 bg-rose-50 border border-rose-200/60",
    },
  ];

  return (
    <Card className="transition-all duration-200 hover:shadow-subtle">
      <CardHeader className="pb-3">
        <CardTitle>Attachments Summary</CardTitle>
        <CardDescription>
          Status of voucher uploads, physical bill scans, and receipt verification.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900 leading-tight">
                    {item.count}
                  </p>
                  <p className="text-[11px] font-medium text-slate-500">
                    {item.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
