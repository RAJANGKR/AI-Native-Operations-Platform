export type ExpenseCategory = "travel" | "food" | "office" | "software" | "other" | string;
export type ExpenseStatus = "pending" | "approved" | "rejected" | string;

export interface AttachmentReference {
  id: string;
  expense_id?: string;
  file_path?: string;
  file_name?: string;
  fileName?: string;
  file_size_bytes?: number;
  fileSize?: string;
  mime_type?: string;
  created_at?: string;
}

export interface ExpenseSummary {
  id: string;
  report_id: string;
  budget_id?: string | null;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  merchant?: string | null;
  status: ExpenseStatus;
}

export interface ExpenseDetail extends ExpenseSummary {
  notes?: string | null;
  attachments?: AttachmentReference[];
  created_at?: string;
  updated_at?: string;
}

export interface ExpenseCreate {
  report_id: string;
  budget_id?: string | null;
  amount: number;
  category: ExpenseCategory;
  expense_date: string;
  merchant?: string | null;
  notes?: string | null;
  status?: ExpenseStatus;
}

export interface ExpenseUpdate {
  report_id?: string;
  budget_id?: string | null;
  amount?: number;
  category?: ExpenseCategory;
  expense_date?: string;
  merchant?: string | null;
  notes?: string | null;
  status?: ExpenseStatus;
}
