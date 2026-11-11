// lib/receipt-number.ts
//
// FeePayment.receiptNumber carries a unique constraint, and its format
// embeds the year+month ("RCP-{yymm}-{seq}"), implying the sequence
// resets every month. The original generator computed its candidate from
// a plain platform-wide prisma.feePayment.count() — a non-atomic read
// miles away from the insert, so two concurrent payment submissions
// (two staff collecting fees at once, or a double-click) would compute
// the same count and one would lose to the unique-constraint violation,
// surfacing only as a bare "Internal server error" with the payment
// never saved. It also never actually reset month to month, since the
// count was a running total of every payment ever recorded, not just
// this month's.
//
// This follows the same fix already applied to enrollment numbers
// (lib/enrollment-number.ts): an indexed per-month lookup for the
// candidate (O(1), no loop), and the remaining rare race (two requests
// computing the same "next" number at the same instant) handled by
// retrying the whole creation with withReceiptNumberRetry() below.
import type { Prisma, PrismaClient } from "@prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

export async function generateReceiptNumber(db: TxClient): Promise<string> {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `RCP-${year}${month}-`;

  // receiptNumber is unique (indexed), and same-month numbers are fixed-
  // width zero-padded, so string-descending order matches numeric order.
  const last = await db.feePayment.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: "desc" },
    select: { receiptNumber: true },
  });

  const lastSeq = last?.receiptNumber
    ? parseInt(last.receiptNumber.slice(prefix.length), 10) || 0
    : 0;

  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
}

/**
 * Runs `fn` (which must call generateReceiptNumber() and then insert a
 * payment using the result) and retries it if the insert loses a race to
 * another concurrent request computing the same "next" number — the
 * read (find max) and write (insert) aren't atomic with each other.
 * Retrying re-reads the new max, which includes whichever request just
 * won, so the next attempt gets a fresh number.
 */
export async function withReceiptNumberRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 10
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isReceiptConflict =
        error?.code === "P2002" &&
        (!error?.meta?.target || String(error.meta.target).includes("receiptNumber"));
      if (!isReceiptConflict || attempt === maxAttempts) throw error;
    }
  }
  throw new Error("unreachable");
}
