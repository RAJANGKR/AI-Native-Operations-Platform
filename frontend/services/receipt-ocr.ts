import apiClient from "@/services/api";

export interface ReceiptOCRResponse {
  recognized_text: string;
  lines: { text: string; confidence: number | null }[];
  candidate_fields: {
    merchant: string | null;
    expense_date: string | null;
    amount: string | null;
    currency: string | null;
    amount_confidence: "candidate" | "ambiguous" | "missing" | string;
  };
  warnings: string[];
  ocr_engine: string;
  model_version: string;
}

export async function scanReceipt(file: File): Promise<ReceiptOCRResponse> {
  const body = new FormData();
  body.append("file", file);
  const response = await apiClient.post<ReceiptOCRResponse>("/receipt-ocr/scan", body, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  });
  return response.data;
}
