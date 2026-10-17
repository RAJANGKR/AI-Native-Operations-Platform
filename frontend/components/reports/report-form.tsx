"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, Plus, FileText, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  useCreateExpenseReport,
  useUpdateExpenseReport,
} from "@/hooks/use-expense-report-mutations";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import apiClient from "@/services/api";

const reportFormSchema = z.object({
  title: z.string().min(1, "Report title is required"),
  club_id: z.string().min(1, "Club selection is required"),
  chapter_id: z.string().min(1, "Chapter selection is required"),
  event_id: z.string().optional(),
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

interface ClubOption {
  id: string;
  name: string;
}

interface ChapterOption {
  id: string;
  organization_id: string;
  name: string;
}

interface EventOption {
  id: string;
  chapter_id: string;
  name: string;
}

export function ReportForm({ mode, initialValues }: ReportFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const createMutation = useCreateExpenseReport();
  const updateMutation = useUpdateExpenseReport();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const [clubs, setClubs] = React.useState<ClubOption[]>([]);
  const [chapters, setChapters] = React.useState<ChapterOption[]>([]);
  const [events, setEvents] = React.useState<EventOption[]>([]);

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
      club_id: "",
      chapter_id: "",
      event_id: "",
      description: initialValues?.description || "",
    },
  });

  const selectedClubId = watch("club_id");
  const selectedChapterId = watch("chapter_id");

  // 1. Load Clubs from backend DB
  React.useEffect(() => {
    async function loadClubs() {
      try {
        const res = await apiClient.get<ClubOption[]>("/organizations");
        setClubs(res.data);
        if (res.data.length > 0 && !selectedClubId) {
          setValue("club_id", res.data[0].id);
        }
      } catch {
        setClubs([]);
      }
    }
    loadClubs();
  }, []);

  // 2. Load Chapters dynamically when Club changes
  React.useEffect(() => {
    async function loadChapters() {
      try {
        const res = await apiClient.get<ChapterOption[]>("/chapters");
        const filtered = selectedClubId
          ? res.data.filter((c) => c.organization_id === selectedClubId)
          : res.data;
        setChapters(filtered.length > 0 ? filtered : res.data);
        if (filtered.length > 0) {
          setValue("chapter_id", filtered[0].id);
        } else if (res.data.length > 0) {
          setValue("chapter_id", res.data[0].id);
        }
      } catch {
        setChapters([]);
      }
    }
    loadChapters();
  }, [selectedClubId]);

  // 3. Load Events dynamically when Chapter changes
  React.useEffect(() => {
    async function loadEvents() {
      try {
        const res = await apiClient.get<EventOption[]>("/events");
        const filtered = selectedChapterId
          ? res.data.filter((e) => e.chapter_id === selectedChapterId)
          : res.data;
        setEvents(filtered.length > 0 ? filtered : res.data);
      } catch {
        setEvents([]);
      }
    }
    loadEvents();
  }, [selectedChapterId]);

  const onSubmit = async (values: ReportFormValues) => {
    try {
      if (mode === "create") {
        const payload = {
          organization_id: values.club_id || user?.organization_id || "00000000-0000-0000-0000-000000000001",
          member_id: user?.id || "00000000-0000-0000-0000-000000000002",
          chapter_id: values.chapter_id || "00000000-0000-0000-0000-000000000003",
          event_id: values.event_id || null,
          title: values.title,
          description: values.description || null,
          status: "draft",
        };

        const res = await createMutation.mutateAsync(payload);
        toast({
          type: "success",
          title: "Report Created",
          description: "Expense report batch created successfully. Add itemized expense lines now.",
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
      const errorDetail = err?.response?.data?.detail;
      const detailStr = typeof errorDetail === "string"
        ? errorDetail
        : Array.isArray(errorDetail)
        ? errorDetail.map((d: any) => `${d.loc?.join(".")}: ${d.msg}`).join("; ")
        : err?.message || "An unexpected error occurred.";

      toast({
        type: "error",
        title: mode === "create" ? "Failed to Create Report" : "Failed to Update Report",
        description: detailStr,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-10 select-none">
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
                Select College Club, Chapter wing, and associated Event to log student expense vouchers.
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
                placeholder="e.g. Workshop Guest Speaker Travel & Refreshments"
                className="h-10 w-full rounded-lg border border-slate-200 px-3.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-50"
              />
              {errors.title && (
                <p className="text-[11px] text-rose-600 font-medium">{errors.title.message}</p>
              )}
            </div>

            {/* Cascading Flow Dropdowns: Club -> Chapter -> Event */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* 1. Select Club */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Select Club <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={isPending || clubs.length === 0}
                  {...register("club_id")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer disabled:opacity-50 bg-white"
                >
                  {clubs.length === 0 ? (
                    <option value="">No clubs found in DB</option>
                  ) : (
                    clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* 2. Select Chapter */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Select Chapter <span className="text-rose-500">*</span>
                </label>
                <select
                  disabled={isPending || chapters.length === 0}
                  {...register("chapter_id")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer disabled:opacity-50 bg-white"
                >
                  {chapters.length === 0 ? (
                    <option value="">No chapters found</option>
                  ) : (
                    chapters.map((chap) => (
                      <option key={chap.id} value={chap.id}>{chap.name}</option>
                    ))
                  )}
                </select>
              </div>

              {/* 3. Select Event */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-900">
                  Select Event <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <select
                  disabled={isPending}
                  {...register("event_id")}
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-900 focus:border-slate-400 focus:outline-none cursor-pointer disabled:opacity-50 bg-white"
                >
                  <option value="">General Organizational Spend</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
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
                placeholder="Describe the purpose of this expense batch and voucher details for Treasurer audit..."
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
                className="gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold cursor-pointer"
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
