import apiClient from "@/services/api";

export interface AttachmentResponseItem {
  id: string;
  expense_id: string;
  type: string;
  attachment_type?: string;
  storage_path: string;
  original_filename?: string;
  mime_type: string;
  size_bytes?: number;
  sha256_hash?: string;
  uploaded_by?: string;
  ocr_status: string;
  ocr_text?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DownloadUrlResponse {
  download_url: string;
  expires_in: number;
}

/**
 * Upload a receipt file to FastAPI backend.
 * Endpoint: POST /api/v1/attachments/upload
 */
export async function uploadAttachment(
  expenseId: string,
  file: File,
  onProgress?: (progressPercent: number) => void
): Promise<AttachmentResponseItem> {
  const formData = new FormData();
  formData.append("expense_id", expenseId);
  formData.append("file", file);

  const response = await apiClient.post<AttachmentResponseItem>(
    "/attachments/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    }
  );
  return response.data;
}

/**
 * Fetch attachment metadata.
 * Endpoint: GET /api/v1/attachments/{attachmentId}
 */
export async function getAttachment(
  attachmentId: string
): Promise<AttachmentResponseItem> {
  const response = await apiClient.get<AttachmentResponseItem>(
    `/attachments/${attachmentId}`
  );
  return response.data;
}

/**
 * Delete an attachment from storage and DB.
 * Endpoint: DELETE /api/v1/attachments/{attachmentId}
 */
export async function deleteAttachment(attachmentId: string): Promise<void> {
  await apiClient.delete(`/attachments/${attachmentId}`);
}

/**
 * Fetch a temporary signed download URL (5 min validity).
 * Endpoint: GET /api/v1/attachments/{attachmentId}/download
 */
export async function getDownloadUrl(
  attachmentId: string
): Promise<DownloadUrlResponse> {
  const response = await apiClient.get<DownloadUrlResponse>(
    `/attachments/${attachmentId}/download`
  );
  return response.data;
}

/**
 * Fetch all attachments for an expense.
 * Endpoint: GET /api/v1/expenses/{expenseId}/attachments
 */
export async function getExpenseAttachments(
  expenseId: string
): Promise<AttachmentResponseItem[]> {
  const response = await apiClient.get<AttachmentResponseItem[]>(
    `/expenses/${expenseId}/attachments`
  );
  return response.data;
}
