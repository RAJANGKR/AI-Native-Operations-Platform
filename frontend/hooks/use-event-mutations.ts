import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createEvent,
  updateEvent,
  EventCreatePayload,
  EventUpdatePayload,
} from "@/services/event";
import { EventSummary } from "@/types/event";

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation<EventSummary, Error, EventCreatePayload>({
    mutationFn: (data) => createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation<
    EventSummary,
    Error,
    { eventId: string; data: EventUpdatePayload }
  >({
    mutationFn: ({ eventId, data }) => updateEvent(eventId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", variables.eventId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}

export function useArchiveEvent() {
  const queryClient = useQueryClient();
  return useMutation<EventSummary, Error, string>({
    mutationFn: (eventId) => updateEvent(eventId, { status: "archived" }),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["event", eventId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
    },
  });
}
