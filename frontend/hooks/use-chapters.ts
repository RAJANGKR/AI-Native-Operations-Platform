import { useQuery } from "@tanstack/react-query";
import { getChapters, getChapter } from "@/services/chapter";
import { ChapterSummary } from "@/types/event";

export const CHAPTERS_STALE_TIME = 5 * 60 * 1000;
export const CHAPTERS_REFETCH_INTERVAL = 5 * 60 * 1000;

export function useChapters() {
  return useQuery<ChapterSummary[], Error>({
    queryKey: ["chapters"],
    queryFn: getChapters,
    staleTime: CHAPTERS_STALE_TIME,
    refetchInterval: CHAPTERS_REFETCH_INTERVAL,
  });
}

export function useChapter(chapterId: string) {
  return useQuery<ChapterSummary, Error>({
    queryKey: ["chapter", chapterId],
    queryFn: () => getChapter(chapterId),
    enabled: Boolean(chapterId),
    staleTime: CHAPTERS_STALE_TIME,
    refetchInterval: CHAPTERS_REFETCH_INTERVAL,
  });
}
