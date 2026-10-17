import assert from "node:assert/strict";
import test from "node:test";
import { createExpenseAndUploadReceipt } from "./receipt-expense-workflow.ts";

test("creates expense before uploading receipt and uses the returned expense ID", async () => {
  const calls = [];
  const result = await createExpenseAndUploadReceipt(
    "",
    async () => {
      calls.push("create");
      return { id: "expense-123" };
    },
    async (expenseId) => {
      calls.push(`upload:${expenseId}`);
    },
  );

  assert.deepEqual(calls, ["create", "upload:expense-123"]);
  assert.deepEqual(result, { expenseId: "expense-123" });
});

test("preserves the expense ID after upload failure and retries without creating another expense", async () => {
  let createCount = 0;
  const uploadIds = [];
  const createExpense = async () => {
    createCount += 1;
    return { id: "expense-456" };
  };
  const first = await createExpenseAndUploadReceipt("", createExpense, async (id) => {
    uploadIds.push(id);
    throw new Error("simulated upload failure");
  });

  assert.equal(first.expenseId, "expense-456");
  assert.ok(first.attachmentError instanceof Error);

  const retry = await createExpenseAndUploadReceipt(first.expenseId, createExpense, async (id) => {
    uploadIds.push(id);
  });

  assert.deepEqual(uploadIds, ["expense-456", "expense-456"]);
  assert.equal(createCount, 1);
  assert.deepEqual(retry, { expenseId: "expense-456" });
});

test("does not attempt attachment upload when expense creation fails", async () => {
  let uploadCalled = false;
  await assert.rejects(
    createExpenseAndUploadReceipt(
      "",
      async () => { throw new Error("unauthorized report"); },
      async () => { uploadCalled = true; },
    ),
    /unauthorized report/,
  );
  assert.equal(uploadCalled, false);
});
