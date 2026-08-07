import { useQuery } from "@tanstack/react-query";
import { getEvents, getEventById } from "@/services/event";
import { EventSummary, EventDetails } from "@/types/event";

/**
 * Centralized query caching & refresh parameters for events (5 minutes).
 */
export const EVENTS_STALE_TIME = 5 * 60 * 1000;
export const EVENTS_REFETCH_INTERVAL = 5 * 60 * 1000;

/**
 * Hook for fetching list of all events.
 * Query key: ["events"]
 */
export function useEvents() {
  return useQuery<EventSummary[], Error>({
    queryKey: ["events"],
    queryFn: getEvents,
    staleTime: EVENTS_STALE_TIME,
    refetchInterval: EVENTS_REFETCH_INTERVAL,
  });
}

/**
 * Hook for fetching single event details by identifier.
 * Query key: ["event", eventId]
 */
export function useEvent(eventId: string) {
  return useQuery<EventDetails, Error>({
    queryKey: ["event", eventId],
    queryFn: () => getEventById(eventId),
    enabled: Boolean(eventId),
    staleTime: EVENTS_STALE_TIME,
    refetchInterval: EVENTS_REFETCH_INTERVAL,
  });
}
