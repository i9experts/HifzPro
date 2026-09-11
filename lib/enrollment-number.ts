// lib/enrollment-number.ts
//
// Student.enrollmentNumber carries a DATABASE-WIDE unique constraint
// (`String? @unique` in schema.prisma — there is no per-institution
// scoping), but every enrollment-number generator in the app computed a
// candidate as institution-scoped `count + 1`. Every institution's first
// student therefore tried "HP-{yy}-0001", which only the very first
// institution to ever insert one could actually claim — every institution
// after that hit a unique-constraint violation on what looked like a
// completely ordinary first enrollment.
//
// This generates the same human-readable, per-institution-sequential
// format, but verifies each candidate is actually free (globally) before
// handing it back, walking forward past any numbers already taken by
// other institutions.
import type { Prisma, PrismaClient } from "@prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

/**
 * Call this with the same client (or transaction) you're about to use for
 * the student insert, so the existence check and the insert see a
 * consistent view within one transaction.
 */
export async function generateEnrollmentNumber(
  db: TxClient,
  institutionId: string
): Promise<string> {
  const year = new Date().getFullYear().toString().slice(-2);
  let seq =
    (await db.student.count({ where: { campus: { institutionId } } })) + 1;

  const MAX_ATTEMPTS = 1000;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const candidate = `HP-${year}-${String(seq).padStart(4, "0")}`;
    const taken = await db.student.findUnique({
      where: { enrollmentNumber: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
    seq++;
  }
  throw new Error(
    `Could not find a free enrollment number after ${MAX_ATTEMPTS} attempts`
  );
}
