// prisma/seed.ts
import { PrismaClient, Role, Program, Grade, LessonType, StudentStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding HifzPro database...");

  // ── Institution ──
  const institution = await prisma.institution.upsert({
    where:  { slug: "al-noor-institute" },
    update: {},
    create: {
      name:      "Al-Noor Hifz Institute",
      nameArabic:"معهد النور للحفظ",
      slug:      "al-noor-institute",
      email:     "admin@alnoor.edu.pk",
      phone:     "+92 300 0000000",
      city:      "Karachi",
      country:   "Pakistan",
      mushaf:    "MADANI_15_LINE",
    },
  });
  console.log("✅ Institution:", institution.name);

  // ── Campus ──
  const campus = await prisma.campus.create({
    data: {
      institutionId: institution.id,
      name:  "Main Campus — Karachi",
      city:  "Karachi",
      phone: "+92 300 0000001",
    },
  });
  console.log("✅ Campus:", campus.name);

  // ── Admin ──
  const adminHash = await bcrypt.hash("Admin@123", 12);
  const adminUser = await prisma.user.upsert({
    where:  { email: "admin@alnoor.edu.pk" },
    update: {},
    create: {
      institutionId: institution.id,
      campusId:      campus.id,
      role:          Role.CAMPUS_ADMIN,
      name:          "Muhammad Atiq",
      email:         "admin@alnoor.edu.pk",
      phone:         "+923001000001",
      passwordHash:  adminHash,
    },
  });
  console.log("✅ Admin:", adminUser.name);

  // ── Ustadh ──
  const ustadhHash = await bcrypt.hash("Ustadh@123", 12);
  const ustadhUser = await prisma.user.upsert({
    where:  { email: "qari.saleem@alnoor.edu.pk" },
    update: {},
    create: {
      institutionId: institution.id,
      campusId:      campus.id,
      role:          Role.USTADH,
      name:          "Qari Muhammad Saleem",
      nameArabic:    "قاری محمد سلیم",
      email:         "qari.saleem@alnoor.edu.pk",
      phone:         "+923002000001",
      whatsapp:      "+923002000001",
      passwordHash:  ustadhHash,
    },
  });

  const ustadh = await prisma.ustadh.create({
    data: {
      userId:         ustadhUser.id,
      qualification:  "Hafiz ul Quran, Alim",
      specialization: "Hifz ul Quran",
    },
  });
  console.log("✅ Ustadh:", ustadhUser.name);

  // ── Batch ──
  const batch = await prisma.batch.create({
    data: {
      campusId:    campus.id,
      ustadhId:    ustadh.id,
      name:        "Halqa A — Morning",
      program:     Program.HIFZ,
      sessionTime: "Morning 7:00 - 9:00 AM",
      maxStudents: 15,
    },
  });
  console.log("✅ Batch:", batch.name);

  // ── Students ──
  const studentsData = [
    { name: "Ahmed Raza",      juz: 18, surah: 23, ayah: 45, page: 274 },
    { name: "Usman Farooq",    juz: 12, surah: 12, ayah: 30, page: 190 },
    { name: "Ibrahim Sheikh",  juz: 24, surah: 39, ayah: 10, page: 362 },
    { name: "Hamza Malik",     juz: 7,  surah: 6,  ayah: 110, page: 141 },
    { name: "Yusuf Ali",       juz: 5,  surah: 4,  ayah: 87,  page: 92  },
  ];

  for (const s of studentsData) {
    // Create student (no currentJuz here — that's in StudentProgress)
    const student = await prisma.student.create({
      data: {
        campusId:   campus.id,
        batchId:    batch.id,
        name:       s.name,
        program:    Program.HIFZ,
        status:     StudentStatus.ACTIVE,
        enrolledAt: new Date(),
      },
    });

    // Guardian
    await prisma.guardian.create({
      data: {
        studentId:      student.id,
        name:           `${s.name.split(" ")[0]}'s Father`,
        relation:       "Father",
        phone:          `+9230${Math.floor(10000000 + Math.random() * 89999999)}`,
        receiveUpdates: true,
      },
    });

    // Student Progress (currentJuz goes here)
    await prisma.studentProgress.create({
      data: {
        studentId:          student.id,
        currentJuz:         s.juz,
        currentSurah:       s.surah,
        currentAyah:        s.ayah,
        currentPage:        s.page,
        totalJuzMemorized:  s.juz - 1,
        percentComplete:    Math.round(((s.juz - 1) / 30) * 100),
        avgLinesPerDay:     Math.round((8 + Math.random() * 6) * 10) / 10,
      },
    });

    // Manzil Health Score
    await prisma.manzilHealth.create({
      data: {
        studentId: student.id,
        score:     Math.round((60 + Math.random() * 35) * 10) / 10,
      },
    });

    // Sample lesson entry
    await prisma.lessonEntry.create({
      data: {
        studentId:    student.id,
        ustadhId:     ustadh.id,
        lessonType:   LessonType.SABAQ,
        date:         new Date(),
        juzFrom:      s.juz,
        surahFrom:    s.surah,
        ayahFrom:     s.ayah,
        pageFrom:     s.page,
        juzTo:        s.juz,
        surahTo:      s.surah,
        ayahTo:       s.ayah + 15,
        pageTo:       s.page + 1,
        grade:        Grade.GOOD,
        durationMins: 20,
        mistakeCount: Math.floor(Math.random() * 5),
      },
    });

    console.log(`  ✅ ${s.name} — Juz ${s.juz}`);
  }

  // ── Surahs reference data ──
  const surahs = [
    { id: 1,   nameArabic: "الفاتحة",  nameEnglish: "Al-Fatiha",  nameUrdu: "الفاتحہ",  juzNumber: 1,  ayahCount: 7,   pageStart: 1   },
    { id: 2,   nameArabic: "البقرة",   nameEnglish: "Al-Baqarah", nameUrdu: "البقرہ",   juzNumber: 1,  ayahCount: 286, pageStart: 2   },
    { id: 3,   nameArabic: "آل عمران", nameEnglish: "Ali Imran",  nameUrdu: "آل عمران", juzNumber: 3,  ayahCount: 200, pageStart: 50  },
    { id: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas",  nameUrdu: "الاخلاص",  juzNumber: 30, ayahCount: 4,   pageStart: 604 },
    { id: 113, nameArabic: "الفلق",   nameEnglish: "Al-Falaq",   nameUrdu: "الفلق",    juzNumber: 30, ayahCount: 5,   pageStart: 604 },
    { id: 114, nameArabic: "الناس",   nameEnglish: "An-Nas",     nameUrdu: "الناس",    juzNumber: 30, ayahCount: 6,   pageStart: 604 },
  ];

  for (const surah of surahs) {
    await prisma.surah.upsert({
      where:  { id: surah.id },
      update: {},
      create: surah,
    });
  }
  console.log("✅ Surahs seeded");

  console.log("\n🎉 Seed complete!");
  console.log("\n📋 Login credentials:");
  console.log("   Admin:  admin@alnoor.edu.pk  /  Admin@123");
  console.log("   Ustadh: qari.saleem@alnoor.edu.pk  /  Ustadh@123");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
