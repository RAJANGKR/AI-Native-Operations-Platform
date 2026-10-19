"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Check, Loader2, ScanLine, UploadCloud } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenseReports } from "@/hooks/use-expense-reports";
import { useCreateExpense } from "@/hooks/use-expense-mutations";
import { useUploadAttachment } from "@/hooks/use-attachment-mutations";
import { scanReceipt, ReceiptOCRResponse } from "@/services/receipt-ocr";
import { createExpenseAndUploadReceipt } from "@/services/receipt-expense-workflow";
import { useToast } from "@/components/ui/toast";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

function errorMessage(error: unknown): string {
  const value = error as {
    response?: { data?: { detail?: unknown; message?: unknown; errors?: unknown } };
    message?: string;
  };
  const response = value?.response?.data;
  const detail = response?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item) => {
        if (item && typeof item === "object" && "msg" in item) {
          return String(item.msg);
        }
        return typeof item === "string" ? item : "";
      })
      .filter(Boolean);
    if (messages.length) return messages.join("; ");
  }
  // The backend's HTTP exception handler returns { success, message, data, errors }.
  if (typeof response?.message === "string") return response.message;
  if (Array.isArray(response?.errors) && response.errors.length) {
    return response.errors.map(String).join("; ");
  }
  return value?.message || "The request could not be completed.";
}

export default function ScanReceiptPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const { data: reports = [], isLoading: reportsLoading } = useExpenseReports();
  const createExpense = useCreateExpense();
  const uploadAttachment = useUploadAttachment();
  const [file, setFile] = React.useState<File | null>(null);
  const [reportId, setReportId] = React.useState("");
  const [ocr, setOcr] = React.useState<ReceiptOCRResponse | null>(null);
  const [merchant, setMerchant] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [expenseDate, setExpenseDate] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [notes, setNotes] = React.useState("");
  const [scanError, setScanError] = React.useState("");
  const [createdExpenseId, setCreatedExpenseId] = React.useState("");
  const [createdReportId, setCreatedReportId] = React.useState("");
  const [attachmentFailed, setAttachmentFailed] = React.useState(false);
  const [isScanning, setIsScanning] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);
  const imageUrl = React.useMemo(() => file ? URL.createObjectURL(file) : "", [file]);

  React.useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  const draftReports = reports.filter((report) => report.status?.toLowerCase() === "draft");
  React.useEffect(() => {
    if (!reportId && draftReports.length > 0) setReportId(draftReports[0].id);
  }, [reportId, draftReports]);

  const selectFile = async (selected: File | undefined) => {
    if (!selected) return;
    setOcr(null);
    setScanError("");
    setCreatedExpenseId("");
    setAttachmentFailed(false);
    setConfirmed(false);
    setFile(selected);
    setMerchant("");
    setAmount("");
    setExpenseDate("");
    if (!ACCEPTED_TYPES.includes(selected.type)) {
      setScanError("Choose a PNG, JPG, or WEBP image.");
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setScanError("Receipt images must be 10 MB or smaller.");
      return;
    }
    setIsScanning(true);
    try {
      const result = await scanReceipt(selected);
      setOcr(result);
      setMerchant(result.candidate_fields.merchant || "");
      setAmount(result.candidate_fields.amount || "");
      setExpenseDate(result.candidate_fields.expense_date || "");
    } catch (error) {
      setScanError(errorMessage(error));
    } finally {
      setIsScanning(false);
    }
  };

  const saveReviewedExpense = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file || !reportId || !merchant.trim() || !expenseDate || Number(amount) <= 0) return;
    setIsSaving(true);
    try {
      const result = await createExpenseAndUploadReceipt(
        createdExpenseId,
        () => createExpense.mutateAsync({
          report_id: reportId,
          merchant: merchant.trim(),
          amount: Number(amount),
          expense_date: expenseDate,
          category,
          notes: notes.trim() || null,
          status: "pending",
        }),
        (expenseId) => uploadAttachment.mutateAsync({ expenseId, reportId, file }),
        (expenseId) => {
          setCreatedExpenseId(expenseId);
          setCreatedReportId(reportId);
          setConfirmed(true);
        },
      );
      if (result.attachmentError) {
        setCreatedExpenseId(result.expenseId);
        setCreatedReportId(reportId);
        setConfirmed(true);
        setAttachmentFailed(true);
        addToast({ title: "Expense saved; receipt upload failed", description: errorMessage(result.attachmentError), type: "error" });
      } else {
        addToast({ title: "Expense and receipt saved", description: "The receipt is attached to the new expense.", type: "success" });
        router.push(`/expense-reports/${reportId}`);
      }
    } catch (error) {
      addToast({ title: "Expense could not be saved", description: errorMessage(error), type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const retryAttachment = async () => {
    if (!file || !createdExpenseId || !createdReportId) return;
    setIsSaving(true);
    try {
      const result = await createExpenseAndUploadReceipt(
        createdExpenseId,
        undefined,
        (expenseId) => uploadAttachment.mutateAsync({ expenseId, reportId: createdReportId, file }),
      );
      if (result.attachmentError) {
        addToast({ title: "Receipt upload failed", description: errorMessage(result.attachmentError), type: "error" });
      } else {
        setAttachmentFailed(false);
        addToast({ title: "Receipt attached", description: "The saved expense now has its receipt.", type: "success" });
        router.push(`/expense-reports/${createdReportId}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-10">
      <PageHeader title="Scan Receipt" description="Read a receipt locally, review the suggested values, then save the expense and attach its image." breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Scan Receipt" }]} />
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><ScanLine className="h-4 w-4" />Receipt image</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center hover:border-slate-400">
              <UploadCloud className="mb-2 h-7 w-7 text-slate-500" />
              <span className="text-sm font-semibold text-slate-800">Choose a receipt image</span>
              <span className="mt-1 text-xs text-slate-500">PNG, JPG, or WEBP · up to 10 MB</span>
              <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" disabled={isScanning || isSaving || confirmed} onChange={(event) => void selectFile(event.target.files?.[0])} />
            </label>
            {file && <p className="break-all text-xs text-slate-600">{file.name} · {(file.size / 1024).toFixed(0)} KB</p>}
            {imageUrl && file && ACCEPTED_TYPES.includes(file.type) && <img src={imageUrl} alt="Selected receipt preview" className="max-h-72 w-full rounded-lg border border-slate-200 object-contain" />}
            {isScanning && <p className="flex items-center gap-2 text-sm text-slate-600"><Loader2 className="h-4 w-4 animate-spin" />Running local OCR… first use may take longer while the model is prepared.</p>}
            {scanError && <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><span className="flex items-start gap-2"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{scanError}</span><p className="mt-2 text-xs">You can still enter the expense values manually below.</p></div>}
            {ocr && <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">Processed locally with {ocr.ocr_engine} · {ocr.model_version}</div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Review before saving</CardTitle></CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={saveReviewedExpense}>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Draft expense report</label>
                <select required value={reportId} onChange={(event) => setReportId(event.target.value)} disabled={reportsLoading || confirmed} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm">
                  <option value="">{reportsLoading ? "Loading reports…" : "Select a draft report"}</option>
                  {draftReports.map((report) => <option key={report.id} value={report.id}>{report.title}</option>)}
                </select>
                {!reportsLoading && draftReports.length === 0 && <p className="mt-1 text-xs text-amber-700">Create a draft expense report first, then return to scan its receipt.</p>}
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-700">Merchant candidate · verify</label>
                <input required maxLength={255} value={merchant} onChange={(event) => setMerchant(event.target.value)} disabled={confirmed} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Enter merchant name" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-semibold text-slate-700">Amount candidate · verify (INR)</label><input required type="number" min="0.01" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={confirmed} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="0.00" /></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-700">Date candidate · verify</label><input required type="date" value={expenseDate} onChange={(event) => setExpenseDate(event.target.value)} disabled={confirmed} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="mb-1 block text-xs font-semibold text-slate-700">Category</label><select value={category} onChange={(event) => setCategory(event.target.value)} disabled={confirmed} className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"><option value="travel">Travel</option><option value="food">Food</option><option value="office">Office</option><option value="software">Software</option><option value="other">Other</option></select></div>
                <div><label className="mb-1 block text-xs font-semibold text-slate-700">Notes (optional)</label><input maxLength={2000} value={notes} onChange={(event) => setNotes(event.target.value)} disabled={confirmed} className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm" placeholder="Optional context" /></div>
              </div>
              {ocr?.warnings.map((warning) => <p key={warning} className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">{warning}</p>)}
              {ocr?.candidate_fields.currency && <p className="text-xs text-slate-600">Currency candidate: {ocr.candidate_fields.currency}</p>}
              {ocr && <details className="rounded-lg border border-slate-200 p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-700">Recognized text (review against receipt)</summary><div className="mt-3 max-h-48 space-y-1 overflow-auto">{ocr.lines.length ? ocr.lines.map((line, index) => <p key={`${index}-${line.text}`} className="flex justify-between gap-3 text-xs leading-relaxed text-slate-600"><span>{line.text}</span><span className="shrink-0 text-slate-400">{line.confidence == null ? "confidence unavailable" : `${line.confidence.toFixed(0)}%`}</span></p>) : <p className="text-xs text-slate-600">No text recognized.</p>}</div><pre className="sr-only">{ocr.recognized_text}</pre></details>}
              {attachmentFailed && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">The expense has been created, but its receipt did not upload. Retry the attachment here; this will not create another expense. <Link className="underline" href={`/expense-reports/${createdReportId}`}>Open expense report</Link></div>}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4">
                <Link href="/expenses" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900"><ArrowLeft className="h-4 w-4" />Expenses</Link>
                {attachmentFailed ? <Button type="button" disabled={isSaving} onClick={() => void retryAttachment()}>{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry receipt upload"}</Button> : <Button type="submit" disabled={isScanning || isSaving || !file || !ACCEPTED_TYPES.includes(file.type) || !reportId || draftReports.length === 0 || confirmed} className="gap-2">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{confirmed ? "Expense created" : "Confirm & save expense"}</Button>}
              </div>
              {confirmed && !attachmentFailed && <p className="text-xs text-emerald-700">Expense and receipt saved.</p>}
              <p className="text-[11px] text-slate-500">OCR suggestions are unverified. Check every value before confirming; the image stays in this browser until you save.</p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
