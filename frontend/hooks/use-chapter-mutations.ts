import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createChapter,
  updateChapter,
  ChapterCreatePayload,
  ChapterUpdatePayload,
} from "@/services/chapter";
import { ChapterSummary } from "@/types/event";

export function useCreateChapter() {
  const queryClient = useQueryClient();
  return useMutation<ChapterSummary, Error, ChapterCreatePayload>({
    mutationFn: (data) => createChapter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUpdateChapter() {
  const queryClient = useQueryClient();
  return useMutation<
    ChapterSummary,
    Error,
    { chapterId: string; data: ChapterUpdatePayload }
  >({
    mutationFn: ({ chapterId, data }) => updateChapter(chapterId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({
        queryKey: ["chapter", variables.chapterId],
      });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useArchiveChapter() {
  const queryClient = useQueryClient();
  return useMutation<ChapterSummary, Error, string>({
    mutationFn: (chapterId) =>
      updateChapter(chapterId, { status: "archived", is_active: false }),
    onSuccess: (_, chapterId) => {
      queryClient.invalidateQueries({ queryKey: ["chapters"] });
      queryClient.invalidateQueries({ queryKey: ["chapter", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
