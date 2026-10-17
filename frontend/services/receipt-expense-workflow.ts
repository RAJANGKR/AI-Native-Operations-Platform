export interface ReceiptWorkflowResult {
  expenseId: string;
  attachmentError?: unknown;
}

/** Create the expense once, then attach the receipt using that expense ID. */
export async function createExpenseAndUploadReceipt(
  existingExpenseId: string,
  createExpense: (() => Promise<{ id: string }>) | undefined,
  uploadReceipt: (expenseId: string) => Promise<unknown>,
  onExpenseCreated?: (expenseId: string) => void,
): Promise<ReceiptWorkflowResult> {
  if (!existingExpenseId && !createExpense) throw new Error("Expense creation is required.");
  const expenseId = existingExpenseId || (await createExpense!()).id;
  if (!existingExpenseId) onExpenseCreated?.(expenseId);
  try {
    await uploadReceipt(expenseId);
    return { expenseId };
  } catch (attachmentError) {
    return { expenseId, attachmentError };
  }
}
