// app/api/setup/superadmin/route.ts
// ⚠️  ONE-TIME USE ONLY — DELETE THIS FILE AFTER RUNNING
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Safety check — only allow if no SUPER_ADMIN exists yet
    const existing = await prisma.user.findFirst({
      where: { role: "SUPER_ADMIN" },
    });

    if (existing) {
      return Response.json({
        success: false,
        message: "Super Admin already exists",
        email: existing.email,
      });
    }

    // Get or create a global institution for HifzPro itself
    let hifzproInstitution = await prisma.institution.findFirst({
      where: { slug: "hifzpro-global" },
    });

    if (!hifzproInstitution) {
      hifzproInstitution = await prisma.institution.create({
        data: {
          name:      "HifzPro Global",
          nameArabic:"هِفزپرو",
          slug:      "hifzpro-global",
          email:     "admin@hifzpro.com",
          country:   "Pakistan",
          isActive:  true,
        },
      });
    }

    // Hash the password
    const password       = "HifzPro@SuperAdmin2026";
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create Super Admin user
    const superAdmin = await prisma.user.create({
      data: {
        name:         "HifzPro Super Admin",
        email:        "superadmin@hifzpro.com",
        passwordHash: hashedPassword,
        role:         "SUPER_ADMIN",
        institutionId:hifzproInstitution.id,
        isActive:     true,
      },
    });

    return Response.json({
      success: true,
      message: "✅ Super Admin created successfully! DELETE THIS FILE NOW.",
      credentials: {
        url:      "https://www.hifzpro.com/signin",
        email:    "superadmin@hifzpro.com",
        password: "HifzPro@SuperAdmin2026",
        role:     "SUPER_ADMIN",
      },
      next: "1. Save these credentials. 2. Delete this file from GitHub. 3. Visit /superadmin",
    });
  } catch (error: any) {
    return Response.json({
      success: false,
      error:   error.message,
    });
  }
}
