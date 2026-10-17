"use client";

import * as React from "react";
import { CheckCircle2, XCircle, Clock, ShieldCheck, UserCheck, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/services/api";

interface PendingMember {
  id: string;
  email: string;
  full_name: string;
  department?: string;
  year?: string;
  approval_status: string;
  created_at?: string;
}

export default function ApprovalsPage() {
  const { addToast } = useToast();
  const [pendingMembers, setPendingMembers] = React.useState<PendingMember[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionId, setActionId] = React.useState<string | null>(null);

  const fetchPending = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<PendingMember[]>("/members/pending");
      setPendingMembers(res.data);
    } catch {
      setPendingMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setActionId(id);
    try {
      await apiClient.post(`/members/${id}/approve`);
      addToast({
        title: "Member Approved",
        description: `Approved ${name}'s student account registration.`,
        type: "success",
      });
      fetchPending();
    } catch (err: any) {
      addToast({
        title: "Approval Failed",
        description: err?.message || "Failed to approve member.",
        type: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setActionId(id);
    try {
      await apiClient.post(`/members/${id}/reject`);
      addToast({
        title: "Member Rejected",
        description: `Rejected ${name}'s student registration request.`,
        type: "neutral",
      });
      fetchPending();
    } catch (err: any) {
      addToast({
        title: "Action Failed",
        description: err?.message || "Failed to reject registration.",
        type: "error",
      });
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6 select-none pb-10">
      <PageHeader
        title="Approvals & Authorization"
        description="Review pending student registrations and authorization requests."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Approvals" }]}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
              <UserCheck className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Pending Student Registrations ({pendingMembers.length})</CardTitle>
              <CardDescription>
                Students waiting for Treasurer authorization before gaining platform access.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : pendingMembers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-800">All Approvals Caught Up!</p>
              <p className="text-xs text-slate-500 mt-1">There are no pending student registration requests waiting for review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    <th className="p-3">Student Name & Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Registration Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{member.full_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{member.department || "Computer Engineering"}</td>
                      <td className="p-3 text-slate-700 font-medium">{member.year || "Third Year"}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200/60">
                          <Clock className="h-3 w-3" />
                          Pending Treasurer Review
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          size="sm"
                          disabled={actionId === member.id}
                          onClick={() => handleApprove(member.id, member.full_name)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 text-xs gap-1 cursor-pointer"
                        >
                          {actionId === member.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={actionId === member.id}
                          onClick={() => handleReject(member.id, member.full_name)}
                          className="h-8 text-xs text-rose-600 hover:bg-rose-50 border-slate-200 cursor-pointer"
                        >
                          <XCircle className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
