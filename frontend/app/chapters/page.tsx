"use client";

import * as React from "react";
import { Plus, Layers, Edit3, Trash2, Loader2, Building } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/components/ui/toast";
import apiClient from "@/services/api";

interface ChapterItem {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  status: string;
}

interface ClubItem {
  id: string;
  name: string;
}

export default function ChaptersPage() {
  const { isTreasurerOrAdmin } = useAuth();
  const { addToast } = useToast();

  const [chapters, setChapters] = React.useState<ChapterItem[]>([]);
  const [clubs, setClubs] = React.useState<ClubItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [editChapter, setEditChapter] = React.useState<ChapterItem | null>(null);
  const [deleteChapterId, setDeleteChapterId] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [selectedClubId, setSelectedClubId] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [chapRes, clubRes] = await Promise.all([
        apiClient.get<ChapterItem[]>("/chapters"),
        apiClient.get<ClubItem[]>("/organizations"),
      ]);
      setChapters(chapRes.data);
      setClubs(clubRes.data);
      if (clubRes.data.length > 0) {
        setSelectedClubId(clubRes.data[0].id);
      }
    } catch {
      setChapters([]);
      setClubs([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSaveChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editChapter) {
        await apiClient.patch(`/chapters/${editChapter.id}`, { name, description });
        addToast({ title: "Chapter Updated", description: `Updated ${name} chapter.`, type: "success" });
      } else {
        await apiClient.post("/chapters", {
          organization_id: selectedClubId || (clubs[0]?.id ?? "00000000-0000-0000-0000-000000000001"),
          name,
          description,
        });
        addToast({ title: "Chapter Created", description: `Created new chapter '${name}'.`, type: "success" });
      }
      setCreateModalOpen(false);
      setEditChapter(null);
      setName("");
      setDescription("");
      fetchData();
    } catch (err: any) {
      addToast({ title: "Action Failed", description: err?.message || "Could not save chapter.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteChapter = async () => {
    if (!deleteChapterId) return;
    try {
      await apiClient.delete(`/chapters/${deleteChapterId}`);
      addToast({ title: "Chapter Deleted", description: "Chapter permanently removed.", type: "neutral" });
      setDeleteChapterId(null);
      fetchData();
    } catch (err: any) {
      addToast({ title: "Delete Failed", description: err?.message || "Failed to delete chapter.", type: "error" });
    }
  };

  return (
    <div className="space-y-6 select-none pb-10">
      <PageHeader
        title="Club Chapters & Wings"
        description="Organize specialized domain chapters, technical wings, and working groups."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Chapters" }]}
        actions={
          isTreasurerOrAdmin ? (
            <Button
              size="sm"
              onClick={() => {
                setEditChapter(null);
                setName("");
                setDescription("");
                setCreateModalOpen(true);
              }}
              className="gap-1.5 cursor-pointer bg-slate-900 text-white font-bold"
            >
              <Plus className="h-4 w-4" />
              Create Chapter
            </Button>
          ) : undefined
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : chapters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 space-y-3">
          <Layers className="h-10 w-10 text-slate-400" />
          <h3 className="text-base font-bold text-slate-900">No Chapters Created Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm">Create a chapter to organize events and allocate event budgets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {chapters.map((chap) => {
            const clubName = clubs.find((c) => c.id === chap.organization_id)?.name || "Apex College Club";
            return (
              <Card key={chap.id} className="group relative overflow-hidden transition-all duration-200 hover:shadow-subtle hover:border-slate-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                      <Building className="h-3 w-3 text-emerald-400" />
                      {clubName}
                    </span>
                    <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/60 uppercase">
                      Active
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-3">{chap.name}</CardTitle>
                  <CardDescription className="text-xs text-slate-500 line-clamp-2">{chap.description || "Student technical and operational working chapter."}</CardDescription>
                </CardHeader>
                <CardContent className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">Chapter Status: ACTIVE</span>
                  {isTreasurerOrAdmin && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditChapter(chap);
                          setName(chap.name);
                          setDescription(chap.description || "");
                          setCreateModalOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                        title="Edit Chapter"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteChapterId(chap.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Delete Chapter"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Chapter Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">{editChapter ? "Edit Chapter" : "Create New Chapter"}</h3>
            <form onSubmit={handleSaveChapter} className="space-y-4 text-xs">
              {!editChapter && clubs.length > 0 && (
                <div className="space-y-1">
                  <label className="block font-semibold text-slate-700">Parent Club</label>
                  <select
                    value={selectedClubId}
                    onChange={(e) => setSelectedClubId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                  >
                    {clubs.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Chapter Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. AI & Machine Learning Chapter"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-slate-700">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe scope, objectives, and domain of this chapter..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <Button type="button" variant="outline" size="sm" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-slate-900 text-white font-bold text-xs gap-1.5">
                  {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  <span>{editChapter ? "Update Chapter" : "Save Chapter"}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteChapterId)}
        onClose={() => setDeleteChapterId(null)}
        onConfirm={handleDeleteChapter}
        title="Delete Chapter?"
        description="Permanently remove this chapter from PostgreSQL database."
        confirmText="Delete Chapter"
        variant="danger"
      />
    </div>
  );
}
