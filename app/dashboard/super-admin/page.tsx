// app/dashboard/super-admin/page.tsx
"use client";
import { useEffect } from "react";

export default function OldSuperAdminRedirect() {
  useEffect(() => {
    window.location.href = "/superadmin";
  }, []);
  return null;
}
