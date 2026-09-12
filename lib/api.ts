// lib/api.ts
// Standardized API response helpers

import { NextResponse } from "next/server";

export function successResponse(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}

// Email addresses are unique across the ENTIRE platform (every institution
// shares one `users` table, and sign-in looks a user up by email alone with
// no institution selector). A rejection here is very often confusing to an
// admin who is certain this email is new — it usually means some other,
// unrelated institution already registered it. Spell that out rather than
// leaving them to assume it's a bug.
export const EMAIL_ALREADY_REGISTERED_MESSAGE =
  "This email is already registered on HifzPro. Email addresses must be unique across the whole platform, even across different institutions — so this may belong to an account at another school. Please use a different email, or contact HifzPro support if this person is moving from another institution.";

// Same platform-wide uniqueness constraint as email (see above), but on
// phone number — e.g. a teacher whose personal number already matches an
// existing parent or staff account, possibly at a different institution.
export const PHONE_ALREADY_REGISTERED_MESSAGE =
  "This phone number is already registered on HifzPro. Phone numbers must be unique across the whole platform, even across different institutions — so this may belong to another account (a parent, staff member, or account at another school). Please use a different number, or contact HifzPro support if this is a genuine conflict.";

/**
 * Given a caught error, returns the right user-facing message if it's a
 * unique-constraint violation (Prisma P2002) on email or phone — the two
 * fields that are unique platform-wide — or null if it's something else
 * (the caller should fall back to a generic error in that case).
 */
export function uniqueConstraintMessage(error: any): string | null {
  if (error?.code !== "P2002") return null;
  const target = String(error?.meta?.target ?? "");
  if (target.includes("email")) return EMAIL_ALREADY_REGISTERED_MESSAGE;
  if (target.includes("phone")) return PHONE_ALREADY_REGISTERED_MESSAGE;
  return "This value is already registered on HifzPro. Please use a different one.";
}
