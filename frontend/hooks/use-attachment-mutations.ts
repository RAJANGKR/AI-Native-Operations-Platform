import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  uploadAttachment,
  deleteAttachment,
  getDownloadUrl,
  AttachmentResponseItem,
  DownloadUrlResponse,
} from "@/services/attachment";

export function useUploadAttachment() {
  const queryClient = useQueryClient();
  return useMutation<
    AttachmentResponseItem,
    Error,
    { expenseId: string; file: File }
  >({
    mutationFn: ({ expenseId, file }) => uploadAttachment(expenseId, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["attachments", variables.expenseId],
      });
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({ queryKey: ["expense-report"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteAttachment() {
  const queryClient = useQueryClient();
  return useMutation<
    void,
    Error,
    { attachmentId: string; expenseId?: string }
  >({
    mutationFn: ({ attachmentId }) => deleteAttachment(attachmentId),
    onSuccess: (_, variables) => {
      if (variables.expenseId) {
        queryClient.invalidateQueries({
          queryKey: ["attachments", variables.expenseId],
        });
      }
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
      queryClient.invalidateQueries({ queryKey: ["expense-reports"] });
      queryClient.invalidateQueries({ queryKey: ["expense-report"] });
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDownloadAttachment() {
  return useMutation<DownloadUrlResponse, Error, string>({
    mutationFn: (attachmentId) => getDownloadUrl(attachmentId),
  });
}
