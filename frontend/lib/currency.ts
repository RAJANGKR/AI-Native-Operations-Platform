/**
 * Centralized INR currency formatting utility.
 * Formats numbers into Indian numbering system with Rupee symbol (₹).
 * Example: 150000 -> ₹1,50,000
 */
export function formatCurrencyINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === "") {
    return "₹0";
  }
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(numericAmount);
}
