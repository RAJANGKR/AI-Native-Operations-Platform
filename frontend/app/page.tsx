"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, Clock, CheckCircle2, XCircle, Plus, FileText, ArrowRight, ShieldCheck, Building, Calendar, Users, CheckSquare } from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/welcome-banner";
import { ReportsTable } from "@/components/dashboard/reports-table";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useDashboard } from "@/hooks/use-dashboard";
import { useExpenseReports } from "@/hooks/use-expense-reports";
import { formatCurrencyINR } from "@/lib/currency";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isTreasurerOrAdmin } = useAuth();
  const { data: dashboardData, isLoading } = useDashboard();
  const { data: rawReports } = useExpenseReports();

  const reports = rawReports || [];
  const pendingCount = reports.filter((r) => r.status?.toLowerCase() === "draft" || r.status?.toLowerCase() === "submitted" || r.status?.toLowerCase() === "in-review").length;
  const approvedCount = reports.filter((r) => r.status?.toLowerCase() === "approved" || r.status?.toLowerCase() === "paid").length;
  const rejectedCount = reports.filter((r) => r.status?.toLowerCase() === "rejected").length;

  const totalSpend = reports.reduce((acc, curr) => acc + Number(curr.total_amount || 0), 0);

  // ----------------------------------------------------
  // TREASURER DASHBOARD VIEW
  // ----------------------------------------------------
  if (isTreasurerOrAdmin) {
    return (
      <div className="space-y-6 pb-10 select-none">
        {/* Treasurer Header Banner */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-emerald-400 font-bold shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900">Treasurer Audit & Control Hub</h1>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 uppercase">
                  {user?.role || "TREASURER"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit student claims, allocate club event budgets, and authorize member registrations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => router.push("/approvals")}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs w-full sm:w-auto"
            >
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              <span>Pending Approvals ({pendingCount})</span>
            </Button>
          </div>
        </div>

        {/* Treasurer KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Treasury Budget</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                <Building className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {formatCurrencyINR(dashboardData?.kpis?.total_budget || 250000)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Allocated college club funds</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Spent</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                <CreditCard className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {formatCurrencyINR(dashboardData?.kpis?.total_spending || totalSpend)}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Disbursed member vouchers</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Claims</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-900 font-mono tracking-tight">
                {pendingCount}
              </h3>
              <p className="text-[11px] text-amber-700/80 mt-0.5">Awaiting Treasurer audit</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Events</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
                <Calendar className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
                {dashboardData?.kpis?.active_events || 6}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Running chapter initiatives</p>
            </div>
          </div>
        </div>

        {/* Treasurer Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card onClick={() => router.push("/clubs")} className="cursor-pointer hover:border-slate-300 transition-all">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Manage Clubs</CardTitle>
                <CardDescription className="text-xs">Create & edit college clubs</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card onClick={() => router.push("/chapters")} className="cursor-pointer hover:border-slate-300 transition-all">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Manage Chapters</CardTitle>
                <CardDescription className="text-xs">Domain wings & tech chapters</CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card onClick={() => router.push("/events")} className="cursor-pointer hover:border-slate-300 transition-all">
            <CardHeader className="p-4 flex flex-row items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold">Set Event Budgets</CardTitle>
                <CardDescription className="text-xs">Allocate cap per initiative</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Submitted Claims Audit Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">All Submitted Member Claims</h3>
            <Link href="/expense-reports" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
              <span>View Full Queue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <ReportsTable data={dashboardData?.recent_reports} />
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // STUDENT DASHBOARD VIEW
  // ----------------------------------------------------
  return (
    <div className="space-y-6 pb-10 select-none">
      {/* Student Welcome Banner */}
      <WelcomeBanner />

      {/* Primary Student Metrics: My Expenses, Pending, Approved, Rejected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: My Total Expenses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">My Total Expenses</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <CreditCard className="h-4 w-4 text-emerald-400" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tight">
              {formatCurrencyINR(totalSpend)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{reports.length} claims submitted</p>
          </div>
        </div>

        {/* Metric 2: Pending Claims */}
        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Pending Claims</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white font-bold">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-amber-900 font-mono tracking-tight">
              {pendingCount}
            </h3>
            <p className="text-[11px] text-amber-700/80 mt-0.5">Awaiting Treasurer review</p>
          </div>
        </div>

        {/* Metric 3: Approved Claims */}
        <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Approved Claims</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-emerald-950 font-mono tracking-tight">
              {approvedCount}
            </h3>
            <p className="text-[11px] text-emerald-700/80 mt-0.5">Authorized for reimbursement</p>
          </div>
        </div>

        {/* Metric 4: Rejected Claims */}
        <div className="rounded-2xl border border-rose-200/80 bg-rose-50/40 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Rejected Claims</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white font-bold">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-rose-950 font-mono tracking-tight">
              {rejectedCount}
            </h3>
            <p className="text-[11px] text-rose-700/80 mt-0.5">Requires receipt correction</p>
          </div>
        </div>
      </div>

      {/* Quick Action Bar: + Submit Reimbursement Claim */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Need reimbursement for event vouchers?</h4>
          <p className="text-xs text-slate-500">Log expenses against assigned chapter events and attach receipt proof.</p>
        </div>
        <Button
          onClick={() => router.push("/expense-reports/new")}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>+ Submit Reimbursement Claim</span>
        </Button>
      </div>

      {/* Student Claims Submission History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">My Submitted Reimbursement Claims</h3>
          <Link href="/expense-reports" className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1">
            <span>View All My Claims</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <ReportsTable data={dashboardData?.recent_reports} />
      </div>
    </div>
  );
}
