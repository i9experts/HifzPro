// lib/enrollment-number.ts
//
// Student.enrollmentNumber carries a DATABASE-WIDE unique constraint
// (`String? @unique` in schema.prisma — the "HP-" prefix is HifzPro the
// platform, not any one institution), but every enrollment-number
// generator in the app computed a candidate as institution-scoped
// `count + 1`. Every institution's first student therefore tried
// "HP-{yy}-0001", which only the very first institution to ever insert
// one could actually claim — every institution after that hit a
// unique-constraint violation on what looked like a completely ordinary
// first enrollment.
//
// generateEnrollmentNumber() looks up the current platform-wide highest
// number for the year (one indexed query) and returns the next one. A
// first attempt at fixing this walked candidates one at a time via
// repeated existence checks instead — correct, but O(n) DB round-trips
// inside a transaction, which blew past Prisma's transaction timeout
// once the low-number range had real production data in it. This is
// O(1). The remaining, much rarer race (two requests computing the same
// "next" number at the same instant) is handled by retrying the whole
// creation with withEnrollmentNumberRetry() below, not by looping here.
import type { Prisma, PrismaClient } from "@prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

export async function generateEnrollmentNumber(db: TxClient): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  const prefix = `HP-${year}-`;

  // enrollmentNumber is unique (indexed), and same-year numbers are fixed-
  // width zero-padded, so string-descending order matches numeric order.
  const last = await db.student.findFirst({
    where: { enrollmentNumber: { startsWith: prefix } },
    orderBy: { enrollmentNumber: "desc" },
    select: { enrollmentNumber: true },
  });

  const lastSeq = last?.enrollmentNumber
    ? parseInt(last.enrollmentNumber.slice(prefix.length), 10) || 0
    : 0;

  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
}

/**
 * Runs `fn` (which must call generateEnrollmentNumber() and then insert a
 * student using the result) and retries it if the insert loses a race to
 * another concurrent request computing the same "next" number — rare, but
 * possible since the read (find max) and write (insert) aren't atomic
 * with each other. Retrying re-reads the new max, which includes
 * whichever request just won, so the next attempt gets a fresh number.
 */
export async function withEnrollmentNumberRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 5
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isEnrollmentConflict =
        error?.code === "P2002" &&
        (!error?.meta?.target || String(error.meta.target).includes("enrollmentNumber"));
      if (!isEnrollmentConflict || attempt === maxAttempts) throw error;
    }
  }
  throw new Error("unreachable");
}
