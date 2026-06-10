// app/api/superadmin/dashboard/route.ts
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return unauthorizedResponse();
    const payload = verifyToken(token);
    if (!payload || payload.role !== "SUPER_ADMIN") return unauthorizedResponse();

    const now      = new Date();
    const month1   = new Date(now); month1.setDate(1); month1.setHours(0,0,0,0);
    const month2   = new Date(month1); month2.setMonth(month2.getMonth()-1);
    const month3   = new Date(month1); month3.setMonth(month3.getMonth()-2);
    const week1    = new Date(now); week1.setDate(week1.getDate()-7);
    const today    = new Date(now); today.setHours(0,0,0,0);

    // ── Core counts ──
    const [
      totalInstitutions, totalCampuses, totalStudents,
      totalAsatidha, totalParents, activeStudents,
    ] = await Promise.all([
      prisma.institution.count(),
      prisma.campus.count(),
      prisma.student.count(),
      prisma.ustadh.count(),
      prisma.parent.count(),
      prisma.student.count({ where: { status: "ACTIVE" } }),
    ]);

    // ── Activity metrics ──
    const [
      lessonsToday, lessonsThisMonth, lessonsLastMonth,
      testsThisMonth, whatsappThisMonth,
      newStudentsThisMonth, newStudentsLastMonth,
      newInstitutionsThisMonth, newInstitutionsLastMonth,
    ] = await Promise.all([
      prisma.lessonEntry.count({ where: { date: { gte: today } } }),
      prisma.lessonEntry.count({ where: { date: { gte: month1 } } }),
      prisma.lessonEntry.count({ where: { date: { gte: month2, lt: month1 } } }),
      prisma.testRecord.count({ where: { date: { gte: month1 } } }),
      prisma.notificationDelivery.count({ where: { channel: "WHATSAPP", status: "SENT", createdAt: { gte: month1 } } }),
      prisma.student.count({ where: { enrolledAt: { gte: month1 } } }),
      prisma.student.count({ where: { enrolledAt: { gte: month2, lt: month1 } } }),
      prisma.institution.count({ where: { createdAt: { gte: month1 } } }),
      prisma.institution.count({ where: { createdAt: { gte: month2, lt: month1 } } }),
    ]);

    // ── All institutions with full details ──
    const institutions = await prisma.institution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campuses: {
          include: {
            students: { select: { id: true, status: true } },
            users:    { where: { role: "USTADH" }, select: { id: true, isActive: true } },
            batches:  { select: { id: true, isActive: true } },
          },
        },
        subscriptions: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        users: {
          where: { role: "CAMPUS_ADMIN" },
          select: { id: true, name: true, email: true, lastLoginAt: true, createdAt: true },
        },
        _count: { select: { campuses: true } },
      },
    });

    // ── Per-institution health score + activity ──
    const institutionStats = await Promise.all(institutions.map(async inst => {
      const campusIds    = inst.campuses.map(c => c.id);
      const totalStuds   = inst.campuses.reduce((acc, c) => acc + c.students.length, 0);
      const activeStuds  = inst.campuses.reduce((acc, c) => acc + c.students.filter(s => s.status === "ACTIVE").length, 0);
      const totalUstadh  = inst.campuses.reduce((acc, c) => acc + c.users.length, 0);
      const totalBatches = inst.campuses.reduce((acc, c) => acc + c.batches.filter(b => b.isActive).length, 0);

      // Lessons in last 7 days
      const recentLessons = campusIds.length > 0
        ? await prisma.lessonEntry.count({ where: { student: { campusId: { in: campusIds } }, date: { gte: week1 } } }).catch(() => 0)
        : 0;

      // Last lesson date
      const lastLesson = campusIds.length > 0
        ? await prisma.lessonEntry.findFirst({
            where:   { student: { campusId: { in: campusIds } } },
            orderBy: { date: "desc" },
            select:  { date: true },
          }).catch(() => null)
        : null;

      const daysSinceActive = lastLesson
        ? Math.floor((Date.now() - new Date(lastLesson.date).getTime()) / (1000*60*60*24))
        : 999;

      // Health score 0-100
      let health = 100;
      if (daysSinceActive > 30) health -= 40;
      else if (daysSinceActive > 14) health -= 20;
      else if (daysSinceActive > 7)  health -= 10;
      if (totalStuds === 0) health -= 30;
      if (totalUstadh === 0) health -= 20;
      if (recentLessons === 0 && totalStuds > 0) health -= 10;
      health = Math.max(0, health);

      const sub = inst.subscriptions[0];
      const lastLogin = inst.users[0]?.lastLoginAt || null;
      const daysSinceLogin = lastLogin
        ? Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000*60*60*24))
        : null;

      return {
        id:              inst.id,
        name:            inst.name,
        email:           inst.email || inst.users[0]?.email,
        phone:           inst.phone,
        city:            inst.city,
        country:         inst.country,
        isActive:        inst.isActive,
        createdAt:       inst.createdAt,
        totalStudents:   totalStuds,
        activeStudents:  activeStuds,
        totalUstadh,
        totalBatches,
        totalCampuses:   inst._count.campuses,
        recentLessons,
        daysSinceActive,
        daysSinceLogin,
        healthScore:     health,
        adminName:       inst.users[0]?.name || null,
        subscription: sub ? {
          plan:       sub.plan,
          status:     sub.status,
          amount:     sub.amount,
          endDate:    sub.endDate,
          trialEndsAt:sub.trialEndsAt,
        } : null,
        churnRisk: health < 40 || daysSinceActive > 21,
      };
    }));

    // ── Subscription revenue ──
    const allSubs = await prisma.subscription.findMany({
      where: { status: { in: ["ACTIVE","TRIAL"] } },
    });
    const mrr = allSubs.filter(s => s.status === "ACTIVE" && s.billingCycle === "MONTHLY")
      .reduce((acc, s) => acc + s.amount, 0);
    const arr = mrr * 12;

    const planCounts: Record<string, number> = {};
    allSubs.forEach(s => { planCounts[s.plan] = (planCounts[s.plan] || 0) + 1; });

    // ── Monthly growth (last 6 months) ──
    const monthlyGrowth = await Promise.all(
      Array.from({length:6}, async (_, i) => {
        const start = new Date(now); start.setMonth(start.getMonth() - i); start.setDate(1); start.setHours(0,0,0,0);
        const end   = new Date(start); end.setMonth(end.getMonth() + 1);
        const [institutions, students, lessons] = await Promise.all([
          prisma.institution.count({ where: { createdAt: { gte: start, lt: end } } }),
          prisma.student.count({ where: { enrolledAt: { gte: start, lt: end } } }),
          prisma.lessonEntry.count({ where: { date: { gte: start, lt: end } } }),
        ]);
        return {
          month:        start.toLocaleDateString("en-PK", { month: "short", year: "2-digit" }),
          institutions, students, lessons,
        };
      })
    );

    // ── City distribution ──
    const cityMap: Record<string, number> = {};
    institutionStats.forEach(i => { if(i.city) cityMap[i.city] = (cityMap[i.city]||0) + 1; });
    const cityDistribution = Object.entries(cityMap).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([city,count])=>({city,count}));

    // ── Alerts ──
    const alerts = [
      ...institutionStats.filter(i => {
        const trial = i.subscription?.plan === "TRIAL" && i.subscription?.trialEndsAt;
        if (!trial) return false;
        const daysLeft = Math.floor((new Date(i.subscription!.trialEndsAt!).getTime() - Date.now()) / (1000*60*60*24));
        return daysLeft <= 3 && daysLeft >= 0;
      }).map(i => ({ type:"TRIAL_EXPIRING", institution: i.name, id: i.id, detail: "Trial expires in ≤3 days" })),
      ...institutionStats.filter(i => i.churnRisk && i.isActive && i.totalStudents > 0)
        .slice(0,5).map(i => ({ type:"CHURN_RISK", institution: i.name, id: i.id, detail: `Inactive ${i.daysSinceActive}d` })),
      ...institutionStats.filter(i => i.totalStudents > 0 && i.totalUstadh === 0)
        .map(i => ({ type:"NO_USTADH", institution: i.name, id: i.id, detail: "Has students but no Ustadh" })),
    ];

    return successResponse({
      snapshot: {
        totalInstitutions, totalCampuses, totalStudents, totalAsatidha,
        totalParents, activeStudents, lessonsToday, lessonsThisMonth,
        testsThisMonth, whatsappThisMonth,
        newStudentsThisMonth, newStudentsLastMonth,
        newInstitutionsThisMonth, newInstitutionsLastMonth,
        studentGrowthPct: newStudentsLastMonth > 0
          ? Math.round(((newStudentsThisMonth - newStudentsLastMonth) / newStudentsLastMonth) * 100)
          : null,
      },
      revenue: { mrr, arr, planCounts, activeSubs: allSubs.filter(s=>s.status==="ACTIVE").length, trialSubs: allSubs.filter(s=>s.status==="TRIAL").length },
      institutions: institutionStats,
      monthlyGrowth: monthlyGrowth.reverse(),
      cityDistribution,
      alerts,
    });
  } catch (error) {
    console.error("Super admin dashboard error:", error);
    return serverErrorResponse();
  }
}
