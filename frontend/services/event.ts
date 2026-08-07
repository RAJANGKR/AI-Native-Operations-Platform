import apiClient from "@/services/api";
import { EventSummary, EventDetails } from "@/types/event";

/**
 * Fetch all events from FastAPI backend.
 * Endpoint: GET /api/v1/events/
 */
export async function getEvents(): Promise<EventSummary[]> {
  const response = await apiClient.get<EventSummary[]>("/events/");
  return response.data;
}

/**
 * Fetch detailed event by identifier from FastAPI backend.
 * Endpoint: GET /api/v1/events/{eventId}
 */
export async function getEventById(eventId: string): Promise<EventDetails> {
  const response = await apiClient.get<EventDetails>(`/events/${eventId}`);
  return response.data;
}
