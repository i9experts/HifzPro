// app/api/public/[slug]/route.ts
// Public endpoint — no auth required
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

type Params = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params;

    const institution = await prisma.institution.findUnique({
      where: { slug, isActive: true },
      include: {
        campuses: {
          where: { isActive: true },
          select: {
            id:         true,
            name:       true,
            nameArabic: true,
            city:       true,
            address:    true,
            phone:      true,
            // Students live under Campus
            students: {
              where:  { status: "ACTIVE" },
              select: {
                id:      true,
                program: true,
                // Sanads live under Student
                sanads: { select: { id: true } },
              },
            },
          },
        },
        users: {
          where:  { role: "USTADH", isActive: true },
          select: { id: true },
        },
      },
    });

    if (!institution) {
      return NextResponse.json({ success: false, error: "Institution not found" }, { status: 404 });
    }

    // Flatten students and sanads from campus relation chain
    const allStudents = institution.campuses.flatMap(c => c.students);
    const sanadsCount = allStudents.reduce((acc, s) => acc + (s.sanads?.length || 0), 0);

    // Count programs
    const programCounts: Record<string, number> = {};
    allStudents.forEach(s => {
      programCounts[s.program] = (programCounts[s.program] || 0) + 1;
    });

    // Parse stored programs or derive from active students
    const storedPrograms = (institution as any).programs
      ? (institution as any).programs.split(",").filter(Boolean)
      : Object.keys(programCounts);

    // Strip students from campus data before returning (keep only display fields)
    const campusesPublic = institution.campuses.map(({ students: _s, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      data: {
        id:          institution.id,
        name:        institution.name,
        nameArabic:  institution.nameArabic,
        slug:        institution.slug,
        logo:        institution.logo,
        city:        institution.city,
        country:     institution.country,
        address:     institution.address,
        phone:       institution.phone,
        email:       institution.email,
        website:     institution.website,
        whatsapp:    (institution as any).whatsapp    || null,
        about:       (institution as any).about       || null,
        established: (institution as any).established || null,
        programs:    storedPrograms,
        campuses:    campusesPublic,
        stats: {
          activeStudents: allStudents.length,
          asatidha:       institution.users.length,
          campuses:       institution.campuses.length,
          sanadsIssued:   sanadsCount,
          programCounts,
        },
        createdAt: institution.createdAt,
      },
    });
  } catch (error) {
    console.error("[public/slug]", error);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}
