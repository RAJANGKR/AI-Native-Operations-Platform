import { ReportItem, ReportDetailData } from "@/constants/mock-reports-data";

export interface ExpenseItem {
  id: string;
  report_id?: string;
  budget_id?: string | null;
  merchant?: string | null;
  category: string;
  amount: number | string;
  numericAmount?: number;
  expense_date?: string;
  date?: string;
  notes?: string | null;
  status?: string;
  receiptName?: string;
  receiptStatus?: "verified" | "pending" | "missing";
}

export interface AttachmentItem {
  id: string;
  expense_id?: string;
  file_path?: string;
  file_name?: string;
  fileName?: string;
  file_size_bytes?: number;
  fileSize?: string;
  mime_type?: string;
  created_at?: string;
  uploadDate?: string;
  verification_status?: string;
  verificationStatus?: "verified" | "pending" | "missing";
  downloadUrl?: string;
}

export interface ReportTotals {
  subtotal: number | string;
  tax: number | string;
  grandTotal: number | string;
  receiptsUploadedCount?: number;
  pendingReceiptsCount?: number;
}

export interface ActivityItem {
  id: string;
  title: string;
  actor: string;
  date: string;
  type: "expense_added" | "receipt_uploaded" | "report_edited" | "report_submitted" | string;
}

export interface ExpenseReportSummary {
  id: string;
  organization_id?: string;
  member_id?: string;
  member_name?: string | null;
  chapter_id?: string;
  event_id?: string | null;
  title: string;
  description?: string | null;
  status: string;
  submitted_at?: string | null;
  approved_at?: string | null;
  created_at?: string;
  event?: string;
  chapter?: string;
  owner?: {
    name: string;
    avatarInitials: string;
    role: string;
    email?: string;
  };
  amount?: number | string;
  totalAmount?: string;
  total_amount?: number | string;
  expensesCount?: number;
  expenses_count?: number;
  createdDate?: string;
  submittedDate?: string;
}

export interface ExpenseReportDetails extends ExpenseReportSummary {
  expenses?: ExpenseItem[];
  attachments?: AttachmentItem[];
  totals?: ReportTotals;
  subtotal?: string;
  tax?: string;
  grandTotal?: string;
  receiptsUploadedCount?: number;
  pendingReceiptsCount?: number;
  activityTimeline?: ActivityItem[];
}

export function formatReportItem(report: ExpenseReportSummary): ReportItem {
  const statusMap: Record<string, ReportItem["status"]> = {
    draft: "draft",
    submitted: "submitted",
    approved: "approved",
    rejected: "rejected",
    paid: "approved",
    "in-review": "pending",
    pending: "pending",
  };

  const formattedStatus = statusMap[(report.status || "").toLowerCase()] || "pending";

  const totalAmt = report.totalAmount
    ? report.totalAmount
    : report.total_amount !== undefined
    ? `₹${Number(report.total_amount).toLocaleString("en-IN")}`
    : "₹0";

  const createdDate = report.createdDate
    ? report.createdDate
    : report.created_at
    ? new Date(report.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : "Aug 05, 2026";

  return {
    id: report.id,
    title: report.title,
    event: report.event || "General Event",
    chapter: report.chapter || "Operations Chapter",
    owner: {
      name: report.owner?.name || "Team Member",
      avatarInitials: report.owner?.avatarInitials || "TM",
      role: report.owner?.role || "Member",
      email: report.owner?.email || "member@college.edu",
    },
    status: formattedStatus,
    totalAmount: totalAmt,
    expensesCount: report.expensesCount ?? report.expenses_count ?? 0,
    createdDate,
    description: report.description || "No description provided.",
  };
}

export function formatReportDetailData(
  report: ExpenseReportDetails
): ReportDetailData {
  const base = formatReportItem(report);

  const expenses = (report.expenses || []).map((e) => {
    const numAmt =
      typeof e.amount === "number" ? e.amount : e.numericAmount || 0;
    const formattedAmt =
      typeof e.amount === "string"
        ? e.amount
        : `₹${numAmt.toLocaleString("en-IN")}`;
    const dateStr =
      e.date ||
      (e.expense_date
        ? new Date(e.expense_date).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "Aug 05, 2026");

    return {
      id: e.id,
      merchant: e.merchant || "Vendor",
      category: e.category.charAt(0).toUpperCase() + e.category.slice(1),
      amount: formattedAmt,
      numericAmount: numAmt,
      date: dateStr,
      receiptName: e.receiptName || "receipt.pdf",
      receiptStatus: e.receiptStatus || ("verified" as const),
    };
  });

  const attachments = (report.attachments || []).map((att, idx) => ({
    id: att.id || `att-${idx}`,
    fileName: att.fileName || att.file_name || `document_${idx + 1}.pdf`,
    fileSize:
      att.fileSize ||
      (att.file_size_bytes
        ? `${(att.file_size_bytes / (1024 * 1024)).toFixed(1)} MB`
        : "1.0 MB"),
    uploadDate:
      att.uploadDate ||
      (att.created_at
        ? new Date(att.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })
        : "Aug 05, 2026"),
    verificationStatus: att.verificationStatus || ("verified" as const),
  }));

  const calcSubtotal = expenses.reduce((acc, curr) => acc + curr.numericAmount, 0);

  return {
    ...base,
    expenses,
    attachments,
    subtotal: report.subtotal || `₹${calcSubtotal.toLocaleString("en-IN")}`,
    tax:
      report.tax ||
      `₹${Math.round(calcSubtotal * 0.1).toLocaleString("en-IN")}`,
    grandTotal:
      report.grandTotal ||
      base.totalAmount ||
      `₹${calcSubtotal.toLocaleString("en-IN")}`,
    receiptsUploadedCount: report.receiptsUploadedCount ?? attachments.length,
    pendingReceiptsCount:
      report.pendingReceiptsCount ??
      attachments.filter((a) => a.verificationStatus === "pending").length,
    activityTimeline: (report.activityTimeline || []).map((act) => ({
      id: act.id,
      title: act.title,
      actor: act.actor,
      date: act.date,
      type: (act.type as any) || "report_edited",
    })),
  };
}
