import { EventItem, EventDetailData } from "@/constants/mock-events-data";
import { ExpenseReportSummary } from "./expense-report";

export interface ChapterSummary {
  id: string;
  name: string;
}

export interface EventSummary {
  id: string;
  chapter_id?: string;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  status: string;
  budget?: number;
  spent?: number;
  remaining?: number;
  percentageUsed?: number;
  percentage_used?: number;
  reportsCount?: number;
  reports_count?: number;
  expensesCount?: number;
  expenses_count?: number;
  chapter?: ChapterSummary | string;
  startDate?: string;
  endDate?: string;
  formattedBudget?: string;
  formattedSpent?: string;
  formattedRemaining?: string;
}

export interface BudgetOverview {
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  percentage_used: number;
}

export interface EventKPIs {
  total_budget: number;
  total_spent: number;
  remaining_budget: number;
  reports_count: number;
  expenses_count: number;
  members_count: number;
}

export interface EventExpenseLineSummary {
  id: string;
  merchant?: string | null;
  category: string;
  amount: number | string;
  expense_date?: string;
  date?: string;
  status?: string;
  receiptStatus?: "verified" | "pending" | "missing";
}

export interface TimelineItem {
  id: string;
  title: string;
  description?: string | null;
  amount?: number | string;
  date?: string;
  category?: string;
  status?: "verified" | "pending" | "flagged";
}

export interface AttachmentSummary {
  receiptsUploaded: number;
  verifiedCount: number;
  ocrPendingCount: number;
  missingReceiptsCount: number;
}

export interface EventDetails extends EventSummary {
  membersCount?: number;
  members_count?: number;
  budget_overview?: BudgetOverview;
  kpis?: EventKPIs;
  reports?: ExpenseReportSummary[];
  expenses?: EventExpenseLineSummary[];
  timeline?: TimelineItem[];
  attachments?: AttachmentSummary;
}

export function formatEventItem(event: EventSummary): EventItem {
  const budget = event.budget ?? 0;
  const spent = event.spent ?? 0;
  const remaining = event.remaining ?? Math.max(0, budget - spent);
  const percentageUsed =
    event.percentage_used ??
    event.percentageUsed ??
    (budget > 0 ? Math.round((spent / budget) * 100) : 0);

  const chapterName =
    typeof event.chapter === "object" && event.chapter !== null
      ? event.chapter.name
      : typeof event.chapter === "string"
      ? event.chapter
      : "General Chapter";

  const startDate = event.start_date
    ? new Date(event.start_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : event.startDate || "TBD";

  const endDate = event.end_date
    ? new Date(event.end_date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      })
    : event.endDate || "TBD";

  return {
    id: event.id,
    name: event.name,
    chapter: chapterName,
    status: (event.status as any) || "running",
    budget,
    formattedBudget: event.formattedBudget || `₹${budget.toLocaleString("en-IN")}`,
    spent,
    formattedSpent: event.formattedSpent || `₹${spent.toLocaleString("en-IN")}`,
    remaining,
    formattedRemaining: event.formattedRemaining || `₹${remaining.toLocaleString("en-IN")}`,
    percentageUsed,
    reportsCount: event.reportsCount ?? event.reports_count ?? 0,
    expensesCount: event.expensesCount ?? event.expenses_count ?? 0,
    startDate,
    endDate,
    description: event.description || "No description provided.",
  };
}

export function formatEventDetailData(event: EventDetails): EventDetailData {
  const base = formatEventItem(event);

  const reports = (event.reports || []).map((r) => ({
    id: r.id,
    title: r.title,
    owner: r.owner || {
      name: r.member_name || "Member",
      avatarInitials: r.member_name
        ? r.member_name
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()
        : "M",
      role: "Member",
    },
    status: (r.status as any) || "in-review",
    amount:
      typeof r.amount === "number"
        ? `₹${r.amount.toLocaleString("en-IN")}`
        : String(r.amount),
    submittedDate: r.submitted_at
      ? new Date(r.submitted_at).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : r.submittedDate || "Aug 05, 2026",
  }));

  const expenses = (event.expenses || []).map((e) => ({
    id: e.id,
    merchant: e.merchant || "Vendor",
    category: e.category,
    amount:
      typeof e.amount === "number"
        ? `₹${e.amount.toLocaleString("en-IN")}`
        : String(e.amount),
    date: e.expense_date
      ? new Date(e.expense_date).toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
      : e.date || "Aug 05, 2026",
    receiptStatus: e.receiptStatus || "verified",
  }));

  const timeline = (event.timeline || []).map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description || "",
    amount:
      typeof t.amount === "number"
        ? `₹${t.amount.toLocaleString("en-IN")}`
        : t.amount || "₹0",
    date: t.date || "Aug 05, 2026",
    category: t.category || "General",
    status: t.status || "verified",
  }));

  const attachments = event.attachments || {
    receiptsUploaded: expenses.length,
    verifiedCount: expenses.filter((e) => e.receiptStatus === "verified").length,
    ocrPendingCount: expenses.filter((e) => e.receiptStatus === "pending").length,
    missingReceiptsCount: expenses.filter((e) => e.receiptStatus === "missing").length,
  };

  return {
    ...base,
    membersCount: event.members_count ?? event.membersCount ?? 8,
    reports,
    expenses,
    timeline,
    attachments,
  };
}
