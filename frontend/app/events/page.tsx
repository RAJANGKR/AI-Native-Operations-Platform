"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { useEvents } from "@/hooks/use-events";
import { formatEventItem } from "@/types/event";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/events/filter-bar";
import { EventGrid } from "@/components/events/event-grid";
import { EmptyEvents } from "@/components/events/empty-events";
import { CardSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useAuth } from "@/hooks/use-auth";

export default function EventsListPage() {
  const { data: rawEvents, isLoading, isError, error, refetch } = useEvents();
  const { isTreasurerOrAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedChapter, setSelectedChapter] = React.useState("all");

  const formattedEvents = React.useMemo(() => {
    if (!rawEvents) return [];
    return rawEvents.map(formatEventItem);
  }, [rawEvents]);

  const filteredEvents = React.useMemo(() => {
    return formattedEvents.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.chapter.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        selectedStatus === "all" || event.status === selectedStatus;

      const matchesChapter =
        selectedChapter === "all" || event.chapter === selectedChapter;

      return matchesSearch && matchesStatus && matchesChapter;
    });
  }, [formattedEvents, searchQuery, selectedStatus, selectedChapter]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedStatus("all");
    setSelectedChapter("all");
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Top Header */}
      <PageHeader
        title="Events"
        description="Track budgets, reports and expenses across all events."
        breadcrumbs={[{ label: "Overview", href: "/" }, { label: "Events" }]}
        actions={
          isTreasurerOrAdmin ? (
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              New Event
            </Button>
          ) : undefined
        }
      />

      {/* Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        selectedChapter={selectedChapter}
        onChapterChange={setSelectedChapter}
        onReset={handleResetFilters}
      />

      {/* Error State */}
      {isError && (
        <ErrorState
          title="Unable to load events"
          description={error?.message || "Failed to fetch event data from server."}
          onRetry={() => refetch()}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Event Grid or Empty State */}
      {!isLoading && !isError && (
        filteredEvents.length > 0 ? (
          <EventGrid events={filteredEvents} />
        ) : (
          <EmptyEvents onResetFilters={handleResetFilters} />
        )
      )}
    </div>
  );
}
