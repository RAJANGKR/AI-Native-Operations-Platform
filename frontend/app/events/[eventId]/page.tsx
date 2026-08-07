"use client";

import * as React from "react";
import { useEvent } from "@/hooks/use-events";
import { formatEventDetailData } from "@/types/event";
import { EventHeader } from "@/components/events/event-header";
import { EventSummaryKPIs } from "@/components/events/event-summary-kpis";
import { BudgetOverview } from "@/components/events/budget-overview";
import { EventReportsTable } from "@/components/events/event-reports-table";
import { EventExpensesTable } from "@/components/events/event-expenses-table";
import { EventTimeline } from "@/components/events/event-timeline";
import { AttachmentSummary } from "@/components/events/attachment-summary";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";
import { CardSkeleton, TableSkeleton } from "@/components/ui/loading-skeleton";
import { ErrorState } from "@/components/ui/error-state";

interface EventDetailPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = React.use(params);
  const { data: rawEvent, isLoading, isError, error, refetch } = useEvent(eventId);

  const event = React.useMemo(() => {
    if (!rawEvent) return null;
    return formatEventDetailData(rawEvent);
  }, [rawEvent]);

  if (isLoading) {
    return (
      <div className="space-y-8 pb-10">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <TableSkeleton rows={5} />
        <TableSkeleton rows={5} />
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="py-12">
        <ErrorState
          title="Could not load event details"
          description={error?.message || "The requested event could not be found or loaded from the backend API."}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Header */}
      <EventHeader event={event} />

      {/* Summary KPI Row */}
      <EventSummaryKPIs event={event} />

      {/* Budget Overview */}
      <BudgetOverview event={event} />

      {/* Expense Reports & Recent Expenses */}
      <div className="space-y-8">
        <EventReportsTable reports={event.reports} />
        <EventExpensesTable expenses={event.expenses} />
      </div>

      {/* Timeline & Attachments Summary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EventTimeline timeline={event.timeline} />
        </div>
        <div className="lg:col-span-1">
          <AttachmentSummary attachments={event.attachments} />
        </div>
      </div>

      {/* AI Insights Placeholder */}
      <AIInsightsCard />
    </div>
  );
}
