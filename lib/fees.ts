// lib/fees.ts
// Shared fee-payment math. A payment can be settled by cash collected
// (paidAmount) and/or a discount/scholarship applied directly on the
// record (discountAmount) — both reduce what's still owed, so every
// place that decides "is this paid?" or "how much is left?" must count
// both, not just paidAmount. Pure functions — safe to import from both
// client components and server routes.

export type FeePaymentStatus = "PAID" | "PARTIAL" | "PENDING";

export function computeFeePaymentStatus(amount: number, paidAmount: number, discountAmount: number): FeePaymentStatus {
  const effectivePaid = paidAmount + discountAmount;
  if (effectivePaid >= amount) return "PAID";
  if (effectivePaid > 0) return "PARTIAL";
  return "PENDING";
}

export function computeFeeBalance(amount: number, paidAmount: number, discountAmount: number): number {
  return Math.max(0, amount - paidAmount - discountAmount);
}
