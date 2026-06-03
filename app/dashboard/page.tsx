// app/dashboard/page.tsx
// Main dashboard redirect — sends user to their role-specific dashboard

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/signin");

  switch (user.role) {
    case "SUPER_ADMIN":  redirect("/dashboard/super-admin");
    case "CAMPUS_ADMIN": redirect("/dashboard/admin");
    case "USTADH":       redirect("/dashboard/ustadh");
    case "PARENT":       redirect("/dashboard/parent");
    case "EXAMINER":     redirect("/dashboard/examiner");
    default:             redirect("/signin");
  }
}
