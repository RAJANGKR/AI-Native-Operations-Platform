import * as React from "react";
import { notFound } from "next/navigation";
import { getEventDetails } from "@/constants/mock-events-data";
import { EventHeader } from "@/components/events/event-header";
import { EventSummaryKPIs } from "@/components/events/event-summary-kpis";
import { BudgetOverview } from "@/components/events/budget-overview";
import { EventReportsTable } from "@/components/events/event-reports-table";
import { EventExpensesTable } from "@/components/events/event-expenses-table";
import { EventTimeline } from "@/components/events/event-timeline";
import { AttachmentSummary } from "@/components/events/attachment-summary";
import { AIInsightsCard } from "@/components/dashboard/ai-insights-card";

interface EventDetailPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { eventId } = await params;
  const event = getEventDetails(eventId);

  if (!event) {
    notFound();
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
