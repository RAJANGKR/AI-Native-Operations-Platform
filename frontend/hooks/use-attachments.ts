import { useQuery } from "@tanstack/react-query";
import {
  getExpenseAttachments,
  getAttachment,
  AttachmentResponseItem,
} from "@/services/attachment";

export const ATTACHMENTS_STALE_TIME = 5 * 60 * 1000;
export const ATTACHMENTS_REFETCH_INTERVAL = 5 * 60 * 1000;

export function useExpenseAttachments(expenseId: string) {
  return useQuery<AttachmentResponseItem[], Error>({
    queryKey: ["attachments", expenseId],
    queryFn: () => getExpenseAttachments(expenseId),
    enabled: Boolean(expenseId),
    staleTime: ATTACHMENTS_STALE_TIME,
    refetchInterval: ATTACHMENTS_REFETCH_INTERVAL,
  });
}

export function useAttachment(attachmentId: string) {
  return useQuery<AttachmentResponseItem, Error>({
    queryKey: ["attachment", attachmentId],
    queryFn: () => getAttachment(attachmentId),
    enabled: Boolean(attachmentId),
    staleTime: ATTACHMENTS_STALE_TIME,
    refetchInterval: ATTACHMENTS_REFETCH_INTERVAL,
  });
}
