// app/api/donor/dashboard/route.ts
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { successResponse, unauthorizedResponse, serverErrorResponse } from "@/lib/api";

async function getDonorFromRequest(req: NextRequest) {
  const token = req.cookies.get("donor_token")?.value;
  if (!token) return null;
  try {
    const secret  = new TextEncoder().encode(process.env.JWT_SECRET || "hifzpro-secret");
    const { payload } = await jwtVerify(token, secret);
    if (payload.role !== "DONOR") return null;
    return payload as { donorId:string; institutionId:string; name:string; role:string };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  try {
    const donor = await getDonorFromRequest(req);
    if (!donor) return unauthorizedResponse();

    const now     = new Date();
    const monthAgo = new Date(now); monthAgo.setDate(monthAgo.getDate()-30);
    const weekAgo  = new Date(now); weekAgo.setDate(weekAgo.getDate()-7);

    // Get all active scholarships for this donor
    const scholarships = await prisma.scholarship.findMany({
      where: { donorId: donor.donorId, isActive: true },
      include: {
        student: {
          include: {
            progress:     true,
            manzilHealth: { orderBy:{ calculatedAt:"desc" }, take:1 },
            batch: { include:{ ustadh:{ include:{ user:{ select:{ name:true } } } } } },
            campus:{ include:{ institution:{ select:{ name:true, logo:true } } } },
            lessonEntries:{ where:{ date:{ gte:weekAgo } }, select:{ id:true, grade:true, date:true, lessonType:true } },
            testRecords:  { orderBy:{ date:"desc" }, take:3, select:{ id:true, testType:true, result:true, date:true, score:true } },
            sanads:       { orderBy:{ issuedAt:"desc" }, take:1 },
          },
        },
      },
    });

    // Per-student enriched data
    const studentsData = await Promise.all(scholarships.map(async sch => {
      const s = sch.student;
      const totalLessons = await prisma.lessonEntry.count({ where:{ studentId:s.id } }).catch(()=>0);
      const monthLessons = await prisma.lessonEntry.count({ where:{ studentId:s.id, date:{ gte:monthAgo } } }).catch(()=>0);

      // Milestone events
      const milestones = [];
      if (s.sanads.length > 0) milestones.push({ type:"KHATM", date:s.sanads[0].issuedAt, label:"Completed Hifz ul Quran 🏆" });
      if (s.progress && s.progress.totalJuzMemorized >= 15) milestones.push({ type:"HALF", date:s.enrolledAt, label:"Memorized 15 Juz — Half Quran" });
      if (s.progress && s.progress.totalJuzMemorized >= 1)  milestones.push({ type:"FIRST_JUZ", date:s.enrolledAt, label:"Completed First Juz" });
      const recentGrades: Record<string,number> = { EXCELLENT:0, GOOD:0, WEAK:0, REPEAT:0 };
      s.lessonEntries.forEach(l => { if(l.grade) recentGrades[l.grade]++; });

      const health = s.manzilHealth[0]?.score ?? null;

      return {
        scholarshipId:   sch.id,
        scholarshipName: sch.name,
        scholarshipType: sch.type,
        scholarshipAmount: sch.fixedAmount || (sch.percentage ? `${sch.percentage}%` : "Full"),
        startDate:       sch.startDate,
        student: {
          id:                s.id,
          name:              s.name,
          nameArabic:        s.nameArabic,
          photo:             s.photo,
          program:           s.program,
          enrolledAt:        s.enrolledAt,
          status:            s.status,
          enrollmentNumber:  s.enrollmentNumber,
          currentJuz:        s.progress?.currentJuz || 1,
          percentComplete:   s.progress?.percentComplete ? Math.round(s.progress.percentComplete) : 0,
          totalJuzMemorized: s.progress?.totalJuzMemorized || 0,
          manzilHealth:      health ? Math.round(health) : null,
          ustadhName:        s.batch?.ustadh?.user?.name || "—",
          institutionName:   s.campus?.institution?.name || "—",
          institutionLogo:   s.campus?.institution?.logo || null,
          weekLessons:       s.lessonEntries.length,
          monthLessons,
          totalLessons,
          recentGrades,
          recentTests:       s.testRecords,
          hasSanad:          s.sanads.length > 0,
          sanadNumber:       s.sanads[0]?.sanadNumber || null,
        },
        milestones,
      };
    }));

    // Total impact
    const totalStudents    = studentsData.length;
    const totalLessons     = studentsData.reduce((a,s)=>a+s.student.totalLessons,0);
    const completedStudents= studentsData.filter(s=>s.student.hasSanad).length;
    const avgProgress      = totalStudents>0 ? Math.round(studentsData.reduce((a,s)=>a+s.student.percentComplete,0)/totalStudents) : 0;
    const juzCompleted     = studentsData.reduce((a,s)=>a+s.student.totalJuzMemorized,0);

    // Institution info
    const institutionData = await prisma.institution.findUnique({
      where:  { id:donor.institutionId },
      select: { name:true, logo:true, city:true },
    });

    return successResponse({
      donor:   { name:donor.name, institutionId:donor.institutionId },
      institution: institutionData,
      students:    studentsData,
      impact: { totalStudents, totalLessons, completedStudents, avgProgress, juzCompleted },
    });
  } catch (error) {
    console.error("Donor dashboard error:", error);
    return serverErrorResponse();
  }
}
