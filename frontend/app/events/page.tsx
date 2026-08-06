"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/events/filter-bar";
import { EventGrid } from "@/components/events/event-grid";
import { EmptyEvents } from "@/components/events/empty-events";
import { MOCK_EVENTS } from "@/constants/mock-events-data";

export default function EventsListPage() {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState("all");
  const [selectedChapter, setSelectedChapter] = React.useState("all");

  const filteredEvents = React.useMemo(() => {
    return MOCK_EVENTS.filter((event) => {
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
  }, [searchQuery, selectedStatus, selectedChapter]);

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
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
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

      {/* Event Grid or Empty State */}
      {filteredEvents.length > 0 ? (
        <EventGrid events={filteredEvents} />
      ) : (
        <EmptyEvents onResetFilters={handleResetFilters} />
      )}
    </div>
  );
}
