"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Edit3, Archive, Download, Calendar, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { EventDetailData } from "@/constants/mock-events-data";
import { useAuth } from "@/hooks/use-auth";
import { CreateEventModal } from "@/components/events/create-event-modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useToast } from "@/components/ui/toast";

interface EventHeaderProps {
  event: EventDetailData;
}

export function EventHeader({ event }: EventHeaderProps) {
  const { isTreasurerOrAdmin, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [editModalOpen, setEditModalOpen] = React.useState(false);
  const [archiveDialogOpen, setArchiveDialogOpen] = React.useState(false);

  const getStatusVariant = (status: EventDetailData["status"]) => {
    switch (status) {
      case "running":
        return { type: "info" as const, label: "Running" };
      case "completed":
        return { type: "approved" as const, label: "Completed" };
      case "upcoming":
        return { type: "neutral" as const, label: "Upcoming" };
      case "archived":
        return { type: "draft" as const, label: "Archived" };
      default:
        return { type: "neutral" as const, label: status };
    }
  };

  const statusConfig = getStatusVariant(event.status);

  const handleArchiveConfirm = async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    addToast({
      title: "Event Archived",
      description: `Event '${event.name}' has been moved to archived status.`,
      type: "neutral",
    });
  };

  const handleExportStatement = () => {
    addToast({
      title: "Exporting Financial Statement",
      description: `Generating CSV/PDF audit summary for ${event.name}...`,
      type: "info",
    });
  };

  return (
    <>
      <div className="space-y-4 pb-6 border-b border-slate-200/80">
        {/* Breadcrumb back navigation */}
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Events List
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title, Chapter, Status, Date */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white">
                <Layers className="h-3.5 w-3.5 text-emerald-400" />
                {event.chapter}
              </span>
              <StatusBadge status={statusConfig.type} label={statusConfig.label} />
              <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {event.startDate} — {event.endDate}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {event.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            {isTreasurerOrAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Event
              </Button>
            )}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setArchiveDialogOpen(true)}
                className="gap-1.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </Button>
            )}
            <Button size="sm" onClick={handleExportStatement} className="gap-1.5 text-xs cursor-pointer">
              <Download className="h-3.5 w-3.5" />
              Export Statement
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Event Modal */}
      <CreateEventModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        initialData={{
          id: event.id,
          name: event.name,
          chapter: event.chapter,
          budget: event.budget.toString(),
          startDate: event.startDate,
          endDate: event.endDate,
          description: event.description,
        }}
      />

      {/* Archive Event Confirmation Dialog */}
      <ConfirmDialog
        isOpen={archiveDialogOpen}
        onClose={() => setArchiveDialogOpen(false)}
        onConfirm={handleArchiveConfirm}
        title={`Archive "${event.name}"?`}
        description="Archiving this event will prevent any new expense line items from being attached. Existing audit data will remain preserved."
        confirmText="Archive Event"
        variant="danger"
      />
    </>
  );
}
