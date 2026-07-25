// lib/tenant-guard.ts
// Central helper to enforce multi-tenant data isolation on single-record routes.
//
// Role model:
//  - SUPER_ADMIN with institutionId === null  -> platform-level admin (i9 Experts), full access
//  - SUPER_ADMIN with institutionId set       -> institution owner, access to all campuses within that institution
//  - CAMPUS_ADMIN                             -> access only to their own campusId
//
// Usage:
//   const student = await prisma.student.findUnique({ where: { id }, include: { campus: true } });
//   if (!student) return notFoundResponse("Student not found");
//   if (!canAccessCampus(payload, student.campusId, student.campus.institutionId)) return notFoundResponse("Student not found");
//
// NOTE: we deliberately return "not found" rather than "forbidden" for cross-tenant access attempts,
// so we don't confirm to a malicious caller that a record with that ID exists in another tenant.

import type { TokenPayload } from "@/lib/auth";

export function canAccessCampus(
  payload: TokenPayload,
  targetCampusId: string | null | undefined,
  targetInstitutionId: string | null | undefined,
): boolean {
  // Platform-level super admin (i9 Experts staff) — unrestricted
  if (payload.role === "SUPER_ADMIN" && !payload.institutionId) return true;

  // Institution-level super admin (institute owner) — any campus within their institution
  if (payload.role === "SUPER_ADMIN" && payload.institutionId) {
    return !!targetInstitutionId && targetInstitutionId === payload.institutionId;
  }

  // Campus admin — only their own campus
  if (payload.role === "CAMPUS_ADMIN") {
    return !!targetCampusId && targetCampusId === payload.campusId;
  }

  return false;
}
