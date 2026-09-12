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
