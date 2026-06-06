// app/api/superadmin/institutions/[id]/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, errorResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const { id } = await params;

    const institution = await prisma.institution.findUnique({
      where:   { id },
      include: {
        campuses:      { include: { batches: { select: { id:true, name:true, isActive:true, _count:{ select:{ students:true } } } }, students: { select:{ id:true, status:true, enrolledAt:true } }, users: { select:{ id:true, name:true, role:true, isActive:true, lastLoginAt:true } } } },
        subscriptions: { orderBy: { createdAt: "desc" }, take: 5 },
        users:         { where: { role: "CAMPUS_ADMIN" }, select: { id:true, name:true, email:true, phone:true, lastLoginAt:true, createdAt:true } },
      },
    });

    if (!institution) return errorResponse("Institution not found");

    // Activity stats
    const campusIds = institution.campuses.map(c => c.id);
    const [totalLessons, weekLessons, totalTests, totalNotifications] = await Promise.all([
      campusIds.length > 0 ? prisma.lessonEntry.count({ where: { student: { campusId: { in: campusIds } } } }).catch(()=>0) : Promise.resolve(0),
      campusIds.length > 0 ? prisma.lessonEntry.count({ where: { student: { campusId: { in: campusIds } }, date: { gte: new Date(Date.now()-7*86400000) } } }).catch(()=>0) : Promise.resolve(0),
      campusIds.length > 0 ? prisma.testRecord.count({ where: { student: { campusId: { in: campusIds } } } }).catch(()=>0) : Promise.resolve(0),
      campusIds.length > 0 ? prisma.notification.count({ where: { channel: "WHATSAPP", status: "SENT" } }).catch(()=>0) : Promise.resolve(0),
    ]);

    return successResponse({ institution, stats: { totalLessons, weekLessons, totalTests, totalNotifications } });
  } catch (error) {
    console.error("Get institution error:", error);
    return serverErrorResponse();
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const { id } = await params;
    const body   = await req.json();

    // Update institution
    if (body.action === "SUSPEND") {
      await prisma.institution.update({ where: { id }, data: { isActive: false } });
      await prisma.user.updateMany({ where: { institutionId: id }, data: { isActive: false } });
      return successResponse({ message: "Institution suspended" });
    }

    if (body.action === "ACTIVATE") {
      await prisma.institution.update({ where: { id }, data: { isActive: true } });
      await prisma.user.updateMany({ where: { institutionId: id }, data: { isActive: true } });
      return successResponse({ message: "Institution activated" });
    }

    if (body.action === "UPDATE_SUBSCRIPTION") {
      const sub = await prisma.subscription.upsert({
        where:  { institutionId: id },
        create: {
          institutionId: id,
          plan:          body.plan,
          status:        body.status || "ACTIVE",
          amount:        body.amount || 0,
          billingCycle:  body.billingCycle || "MONTHLY",
          endDate:       body.endDate ? new Date(body.endDate) : null,
          trialEndsAt:   body.trialEndsAt ? new Date(body.trialEndsAt) : null,
          notes:         body.notes || null,
        },
        update: {
          plan:        body.plan,
          status:      body.status,
          amount:      body.amount,
          endDate:     body.endDate ? new Date(body.endDate) : null,
          trialEndsAt: body.trialEndsAt ? new Date(body.trialEndsAt) : null,
          notes:       body.notes || null,
        },
      });
      return successResponse({ subscription: sub });
    }

    // General update
    const updated = await prisma.institution.update({
      where: { id },
      data:  { name: body.name, email: body.email, phone: body.phone, city: body.city, isActive: body.isActive },
    });

    return successResponse({ institution: updated });
  } catch (error) {
    console.error("Update institution error:", error);
    return serverErrorResponse();
  }
}
