"use client";

import * as React from "react";
import { Calendar, Layers, DollarSign, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    id?: string;
    name: string;
    chapter: string;
    budget: string;
    startDate: string;
    endDate: string;
    description: string;
  };
}

export function CreateEventModal({ isOpen, onClose, initialData }: CreateEventModalProps) {
  const { addToast } = useToast();
  const isEditing = Boolean(initialData?.id);

  const [name, setName] = React.useState(initialData?.name || "");
  const [chapter, setChapter] = React.useState(initialData?.chapter || "Engineering");
  const [budget, setBudget] = React.useState(initialData?.budget || "25000");
  const [startDate, setStartDate] = React.useState(initialData?.startDate || "2026-09-01");
  const [endDate, setEndDate] = React.useState(initialData?.endDate || "2026-09-03");
  const [description, setDescription] = React.useState(initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setChapter(initialData.chapter);
      setBudget(initialData.budget);
      setStartDate(initialData.startDate);
      setEndDate(initialData.endDate);
      setDescription(initialData.description);
    }
  }, [initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 600));
      addToast({
        title: isEditing ? "Event Updated" : "Event Created",
        description: `Successfully ${isEditing ? "updated" : "created"} event '${name}'.`,
        type: "success",
      });
      onClose();
    } catch (err: any) {
      addToast({
        title: "Action Failed",
        description: err?.message || "Failed to save event details.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in select-none">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold">
              <Calendar className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? "Edit Event" : "Create New Event"}
              </h3>
              <p className="text-xs text-slate-500">Define operational parameters, dates, and budget allocation.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 rounded-lg p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Event Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Annual Tech Conference 2026"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Chapter Selector */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Chapter</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            {/* Allocated Budget */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Allocated Budget (₹)</label>
              <input
                type="number"
                required
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="25000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Start Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event purpose, agenda, or operational scope..."
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-1.5 text-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? "Update Event" : "Create Event"}</span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
