"use client";

import * as React from "react";
import { EventItem } from "@/constants/mock-events-data";
import { EventCard } from "./event-card";

interface EventGridProps {
  events: EventItem[];
}

export function EventGrid({ events }: EventGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
