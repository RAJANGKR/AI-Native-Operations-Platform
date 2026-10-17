"use client";

import * as React from "react";
import { Plus, Building, Edit3, Trash2, Archive, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/services/api";

interface ClubItem {
  id: string;
  name: string;
  industry?: string;
  currency: string;
  created_at?: string;
}

export default function ClubsPage() {
  const { isTreasurerOrAdmin } = useAuth();
  const { addToast } = useToast();

  const [clubs, setClubs] = React.useState<ClubItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editClub, setEditClub] = React.useState<ClubItem | null>(null);
  const [deleteClubId, setDeleteClubId] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState("Technical & Innovation");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchClubs = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get<ClubItem[]>("/organizations");
      setClubs(res.data);
    } catch {
      setClubs([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClubs();
  }, []);

  const handleSaveClub = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editClub) {
        await apiClient.patch(`/organizations/${editClub.id}`, { name, industry: category });
        addToast({ title: "Club Updated", description: `Updated ${name} details.`, type: "success" });
      } else {
        await apiClient.post("/organizations", { name, industry: category, currency: "INR" });
        addToast({ title: "Club Created", description: `Created new club '${name}'.`, type: "success" });
      }
      setCreateModalOpen(false);
      setEditClub(null);
      setName("");
      fetchClubs();
    } catch (err: any) {
      addToast({ title: "Action Failed", description: err?.message || "Could not save club.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClub = async () => {
    if (!deleteClubId) return;
    try {
      await apiClient.delete(`/organizations/${deleteClubId}`);
      addToast({ title: "Club Deleted", description: "Club permanently removed.", type: "neutral" });
      setDeleteClubId(null);
      fetchClubs();
    } catch (err: any) {
      addToast({ title: "Delete Failed", description: err?.message || "Failed to delete club.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 select-none pb-10">
      <PageHeader
        title="College Clubs & Societies"
        description="Manage official student organizations, tech chapters, and budget allocations."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Clubs" }]}
        actions={
          isTreasurerOrAdmin ? (
            <Button
              size="sm"
              onClick={() => {
                setEditClub(null);
                setName("");
                setCreateModalOpen(true);
              }}
              className="gap-1.5 cursor-pointer bg-slate-900 text-white font-bold"
            >
              <Plus className="h-4 w-4" />
              Create Club
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : clubs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 space-y-3">
          <Building className="h-10 w-10 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No Clubs Registered Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">Create the first college club to begin managing chapters and event budgets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {clubs.map((club) => (
            <Card key={club.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-subtle hover:border-slate-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-emerald-400 font-bold shadow-2xs">
                    <Building className="h-5 w-5" />
                  </div>
                  <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60 uppercase">
                    Active Club
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-slate-900 mt-2">{club.name}</CardTitle>
                <CardDescription className="text-xs text-slate-500 font-medium">{club.industry || "Technical & Student Activity Wing"}</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-slate-400">Currency: INR (₹)</span>
                {isTreasurerOrAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => {
                        setEditClub(club);
                        setName(club.name);
                        setCategory(club.industry || "Technical & Innovation");
                        setCreateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                      title="Edit Club"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteClubId(club.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Club"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Club Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{editClub ? "Edit Club" : "Create New College Club"}</h3>
            <form onSubmit={handleSaveClub} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Club Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Coding Club"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Category / Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Technical & Innovation">Technical & Innovation</option>
                  <option value="Cultural & Arts">Cultural & Arts</option>
                  <option value="Sports & Athletics">Sports & Athletics</option>
                  <option value="Robotics & Hardware">Robotics & Hardware</option>
                  <option value="Social & Community">Social & Community</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-slate-900 text-white font-bold text-xs gap-1.5">
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{editClub ? "Update Club" : "Save Club"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteClubId)}
        onClose={() => setDeleteClubId(null)}
        onConfirm={handleDeleteClub}
        title="Delete College Club?"
        description="Permanently remove this club and its linked chapter budgets from PostgreSQL DB."
        confirmText="Delete Club"
        variant="danger"
      />
    </div>
  );
}
