"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Save, Plus, FileText, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useCreateExpenseReport,
  useUpdateExpenseReport,
} from "@/hooks/use-expense-report-mutations";
import { toast } from "@/components/ui/toast";

const reportFormSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  chapter: z.string().min(1, "Chapter is required"),
  event: z.string().optional(),
  description: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

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
  const createMutation = useCreateExpenseReport();
  const updateMutation = useUpdateExpenseReport();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      title: initialValues?.title || "",
      chapter: initialValues?.chapter || "AI Chapter",
      event: initialValues?.event || "RTMASS 2026",
      description: initialValues?.description || "",
    },
  });

  const onSubmit = async (values: ReportFormValues) => {
    try {
      if (mode === "create") {
        const payload = {
          organization_id: "00000000-0000-0000-0000-000000000001",
          member_id: "00000000-0000-0000-0000-000000000002",
          chapter_id: "00000000-0000-0000-0000-000000000003",
          title: values.title,
          description: values.description || null,
          status: "draft",
        };

        const res = await createMutation.mutateAsync(payload);
        toast({
          type: "success",
          title: "Report Created",
          description: "New expense report created successfully.",
        });
        router.push(res?.id ? `/expense-reports/${res.id}` : "/expense-reports");
      } else if (mode === "edit" && initialValues?.id) {
        const payload = {
          title: values.title,
          description: values.description || null,
        };

        await updateMutation.mutateAsync({
          reportId: initialValues.id,
          data: payload,
        });

        toast({
          type: "success",
          title: "Report Updated",
          description: "Expense report has been updated successfully.",
        });
        router.push(`/expense-reports/${initialValues.id}`);
      }
    } catch (err: any) {
      toast({
        type: "error",
        title: mode === "create" ? "Failed to Create Report" : "Failed to Update Report",
        description: err?.response?.data?.detail || err.message || "An unexpected error occurred.",
      });
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-xs">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-900">
                Report Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={isPending}
                {...register("title")}
                placeholder="e.g. Keynote Speaker Travel & Accommodation"
                className="h-10 w-full rounded-lg border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
              />
              {errors.title && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Chapter & Event Split */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Chapter <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={isPending}
                  {...register("chapter")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  <option value="AI Chapter">AI Chapter</option>
                  <option value="Coding Club">Coding Club</option>
                  <option value="Robotics Society">Robotics Society</option>
                  <option value="Mechanical Guild">Mechanical Guild</option>
                  <option value="Cultural Board">Cultural Board</option>
                  <option value="Physics Forum">Physics Forum</option>
                </select>
                {errors.chapter && (
                  <p className="text-[11px] text-rose-600 font-medium">{errors.chapter.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Associated Event <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  disabled={isPending}
                  {...register("event")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer disabled:opacity-50"
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
                disabled={isPending}
                {...register("description")}
                placeholder="Describe the purpose of this expense batch and details for Treasurer audit..."
                className="w-full rounded-lg border border-slate-200 p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => router.push("/expense-reports")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="gap-1.5"
              >
                {isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {mode === "create" ? "Create Expense Report" : "Update Report"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
