"use client";

import * as React from "react";
import { Users, ShieldCheck, Mail, Building, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import apiClient from "@/services/api";

interface MemberItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  department?: string;
  year?: string;
  approval_status: string;
  is_active: boolean;
}

export default function MembersPage() {
  const [members, setMembers] = React.useState<MemberItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<MemberItem[]>("/members");
      setMembers(res.data);
    } catch {
      setMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  return (
    <div className="space-y-6 select-none pb-10">
      <PageHeader
        title="College Members Roster"
        description="View registered students, club treasurers, and faculty advisors."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Members" }]}
      />

      <Card className="border-slate-200/80 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-2xs">
              <Users className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Active Roster ({members.length})</CardTitle>
              <CardDescription>
                Authorized student members and club treasurers.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
              <Users className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm font-bold text-slate-800">No Members Found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                    <th className="p-3">Member Name & Email</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Approval Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3">
                        <p className="font-bold text-slate-900">{member.full_name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{member.email}</p>
                      </td>
                      <td className="p-3 text-slate-700 font-medium">{member.department || "Computer Engineering"}</td>
                      <td className="p-3 text-slate-700 font-medium">{member.year || "Third Year"}</td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                          {member.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <StatusBadge
                          status={member.approval_status === "APPROVED" ? "approved" : member.approval_status === "REJECTED" ? "rejected" : "in-review"}
                          label={member.approval_status || "APPROVED"}
                        />
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
