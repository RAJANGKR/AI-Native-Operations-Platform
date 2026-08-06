"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save, Plus, FileText } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ReportFormProps {
  mode: "create" | "edit";
  initialValues?: {
    id?: string;
    title?: string;
    chapter?: string;
    event?: string;
    description?: string;
  };
}

export function ReportForm({ mode, initialValues }: ReportFormProps) {
  const router = useRouter();
  const [title, setTitle] = React.useState(initialValues?.title || "");
  const [chapter, setChapter] = React.useState(initialValues?.chapter || "AI Chapter");
  const [event, setEvent] = React.useState(initialValues?.event || "RTMASS 2026");
  const [description, setDescription] = React.useState(initialValues?.description || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/expense-reports");
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10">
      {/* Back Link */}
      <Link
        href="/expense-reports"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Expense Reports
      </Link>

      <Card className="shadow-xs border-slate-200/80">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
              <FileText className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">
                {mode === "create" ? "Create New Expense Report" : `Edit Expense Report (${initialValues?.id})`}
              </CardTitle>
              <CardDescription>
                Provide report details, select associated chapter event, and add voucher description.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900">
                Report Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Keynote Speaker Travel & Accommodation"
                className="h-10 w-full rounded-lg border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Chapter & Event Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Chapter <span className="text-rose-500">*</span>
                </label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer"
                >
                  <option value="AI Chapter">AI Chapter</option>
                  <option value="Coding Club">Coding Club</option>
                  <option value="Robotics Society">Robotics Society</option>
                  <option value="Mechanical Guild">Mechanical Guild</option>
                  <option value="Cultural Board">Cultural Board</option>
                  <option value="Physics Forum">Physics Forum</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Associated Event <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  value={event}
                  onChange={(e) => setEvent(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer"
                >
                  <option value="RTMASS 2026">RTMASS 2026</option>
                  <option value="Hackathon 2026">Hackathon 2026</option>
                  <option value="Workshop Series">Workshop Series</option>
                  <option value="Industrial Visit">Industrial Visit</option>
                  <option value="Annual Cultural Fest">Annual Cultural Fest</option>
                  <option value="General Organizational Spend">General Organizational Spend</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900">Description / Purpose</label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this expense batch and details for Treasurer audit..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/expense-reports")}
              >
                Cancel
              </Button>
              <Button type="button" variant="secondary" onClick={() => router.push("/expense-reports")}>
                <Save className="h-4 w-4 mr-1.5" />
                Save Draft
              </Button>
              <Button type="submit" className="gap-1.5">
                <Plus className="h-4 w-4" />
                {mode === "create" ? "Create Expense Report" : "Update Report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
