import apiClient from "@/services/api";
import { ChapterSummary } from "@/types/event";

export interface ChapterCreatePayload {
  organization_id?: string;
  name: string;
  description?: string | null;
  status?: "active" | "archived";
}

export interface ChapterUpdatePayload {
  name?: string;
  description?: string | null;
  status?: "active" | "archived";
  is_active?: boolean;
}

/**
 * Fetch all chapters.
 * Endpoint: GET /api/v1/chapters/
 */
export async function getChapters(): Promise<ChapterSummary[]> {
  const response = await apiClient.get<ChapterSummary[]>("/chapters/");
  return response.data;
}

/**
 * Fetch a single chapter by identifier.
 * Endpoint: GET /api/v1/chapters/{chapterId}
 */
export async function getChapter(chapterId: string): Promise<ChapterSummary> {
  const response = await apiClient.get<ChapterSummary>(`/chapters/${chapterId}`);
  return response.data;
}

/**
 * Create a new chapter.
 * Endpoint: POST /api/v1/chapters/
 */
export async function createChapter(data: ChapterCreatePayload): Promise<ChapterSummary> {
  const payload = {
    organization_id: data.organization_id || "00000000-0000-0000-0000-000000000001",
    name: data.name,
    description: data.description || null,
    status: data.status || "active",
  };
  const response = await apiClient.post<ChapterSummary>("/chapters/", payload);
  return response.data;
}

/**
 * Update an existing chapter.
 * Endpoint: PATCH /api/v1/chapters/{chapterId}
 */
export async function updateChapter(
  chapterId: string,
  data: ChapterUpdatePayload
): Promise<ChapterSummary> {
  const response = await apiClient.patch<ChapterSummary>(`/chapters/${chapterId}`, data);
  return response.data;
}
