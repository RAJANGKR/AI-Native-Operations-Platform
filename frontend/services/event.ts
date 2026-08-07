import apiClient from "@/services/api";
import { EventSummary, EventDetails } from "@/types/event";

export interface EventCreatePayload {
  chapter_id: string;
  title: string;
  name?: string;
  description?: string | null;
  budget?: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  created_by?: string | null;
}

export interface EventUpdatePayload {
  chapter_id?: string;
  title?: string;
  name?: string;
  description?: string | null;
  budget?: number;
  start_date?: string | null;
  end_date?: string | null;
  status?: string;
  created_by?: string | null;
}

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

/**
 * Create a new event.
 * Endpoint: POST /api/v1/events/
 */
export async function createEvent(data: EventCreatePayload): Promise<EventSummary> {
  const payload = {
    ...data,
    name: data.name || data.title,
  };
  const response = await apiClient.post<EventSummary>("/events/", payload);
  return response.data;
}

/**
 * Update an existing event.
 * Endpoint: PATCH /api/v1/events/{eventId}
 */
export async function updateEvent(
  eventId: string,
  data: EventUpdatePayload
): Promise<EventSummary> {
  const payload = {
    ...data,
    ...(data.title ? { name: data.name || data.title } : {}),
  };
  const response = await apiClient.patch<EventSummary>(`/events/${eventId}`, payload);
  return response.data;
}
