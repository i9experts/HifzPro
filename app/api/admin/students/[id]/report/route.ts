// app/api/admin/students/[id]/report/route.ts
// Generates a print-ready HTML progress report for a student
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { toHijri, formatHijri, HIJRI_MONTHS } from "@/lib/hijri";

type Params = { params: Promise<{ id: string }> };

const GRADE_LABELS: Record<string, { label: string; color: string; ar: string }> = {
  EXCELLENT: { label: "Excellent",  color: "#166534", ar: "ممتاز" },
  GOOD:      { label: "Good",       color: "#1d4ed8", ar: "اچھا" },
  WEAK:      { label: "Weak",       color: "#b45309", ar: "کمزور" },
  REPEAT:    { label: "Repeat",     color: "#991b1b", ar: "دوبارہ" },
};
const LESSON_LABELS: Record<string, { label: string; ar: string }> = {
  SABAQ:   { label: "Sabaq",   ar: "سبق" },
  SABQI:   { label: "Sabqi",   ar: "سبقی" },
  MANZIL:  { label: "Manzil",  ar: "منزل" },
  GIRDAAN: { label: "Girdaan", ar: "گردان" },
};
const TEST_LABELS: Record<string, string> = {
  SABAQ_TEST:    "Sabaq Test",
  SABQI_TEST:    "Sabqi Test",
  PARA_TEST:     "Para Test",
  NUSS_TEST:     "Nuss Test (15 Para)",
  TARTEEB_TEST:  "Tarteeb Test",
  HIFZ_TEST:     "Hifz Test",
  KHATM_TEST:    "Khatm Test",
};
const RESULT_LABELS: Record<string, { label: string; color: string }> = {
  PASS:             { label: "Pass",             color: "#166534" },
  CONDITIONAL_PASS: { label: "Conditional Pass", color: "#b45309" },
  FAIL:             { label: "Fail",             color: "#991b1b" },
};
const PROGRAM_LABELS: Record<string, { label: string; ar: string }> = {
  HIFZ:    { label: "Hifz ul Quran",  ar: "حفظ القرآن" },
  NAZRA:   { label: "Nazrah",         ar: "ناظرہ" },
  TAJWEED: { label: "Tajweed/Qaida",  ar: "تجوید" },
  GIRDAAN: { label: "Girdaan",        ar: "گردان" },
};

function formatDate(d: Date | string | null, short = false): string {
  if (!d) return "—";
  const date = new Date(d);
  if (short) return date.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  return date.toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload) return new NextResponse("Unauthorized", { status: 401 });

    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        batch: {
          include: {
            ustadh: { include: { user: { select: { name: true } } } },
            campus: { include: { institution: { select: { name: true, nameArabic: true, logo: true, city: true } } } },
          },
        },
        guardians: { take: 1 },
        progress:  true,
        manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 6 },
        lessonEntries: {
          orderBy: { date: "desc" }, take: 20,
          include: { mistakes: { select: { surah: true, ayah: true, mistakeType: true } } },
        },
        attendanceRecords: {
          orderBy: { session: { date: "desc" } }, take: 90,
          include: { session: { select: { date: true } } },
        },
        testRecords: {
          orderBy: { date: "desc" }, take: 10,
          include: { examiner: { include: { user: { select: { name: true } } } } },
        },
        sanads: { orderBy: { issuedAt: "desc" }, take: 1 },
      },
    });

    if (!student) return new NextResponse("Student not found", { status: 404 });

    // ── Stats ──
    const totalSessions = student.attendanceRecords.length;
    const presentCount  = student.attendanceRecords.filter(r => r.status === "PRESENT").length;
    const absentCount   = student.attendanceRecords.filter(r => r.status === "ABSENT").length;
    const lateCount     = student.attendanceRecords.filter(r => r.status === "LATE").length;
    const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

    const today      = new Date();
    const hijriToday = toHijri(today);
    const hijriAr    = formatHijri(today, "ar");
    const hijriEn    = formatHijri(today, "en");
    const gregToday  = formatDate(today, true);

    const institution = student.batch?.campus?.institution;
    const ustadh      = student.batch?.ustadh?.user?.name || "—";
    const guardian    = student.guardians[0];
    const prog        = PROGRAM_LABELS[student.program] || { label: student.program, ar: "" };
    const health      = student.manzilHealth[0]?.score ?? null;
    const healthColor = health === null ? "#6b7280" : health >= 75 ? "#166534" : health >= 55 ? "#b45309" : "#991b1b";
    const healthBg    = health === null ? "#f9fafb" : health >= 75 ? "#dcfce7" : health >= 55 ? "#fef3c7" : "#fee2e2";

    const daysSinceEnrolled = Math.floor((Date.now() - new Date(student.enrolledAt).getTime()) / (1000 * 60 * 60 * 24));
    const monthsEnrolled    = Math.floor(daysSinceEnrolled / 30);

    const avgGrade = student.testRecords.filter(t => t.score !== null).length > 0
      ? Math.round(student.testRecords.filter(t => t.score !== null).reduce((a, t) => a + (t.score || 0), 0) / student.testRecords.filter(t => t.score !== null).length)
      : null;

    // ── HTML ──
    const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progress Report — ${student.name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Scheherazade+New:wght@400;700&display=swap');

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', sans-serif;
      background: #f0fdf4;
      color: #1a1a1a;
      padding: 0;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      background: white;
      padding: 0;
    }

    /* ── Print button (screen only) ── */
    .print-bar {
      background: #0D5C3A;
      padding: 12px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .print-bar span { color: white; font-size: 14px; font-weight: 600; }
    .print-btn {
      padding: 8px 24px;
      background: #C4882A;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
    }

    /* ── Header ── */
    .header {
      background: linear-gradient(135deg, #0D5C3A, #065f46);
      padding: 24px 32px;
      position: relative;
      overflow: hidden;
    }
    .header-pattern {
      position: absolute; right: -20px; top: -20px; opacity: 0.06;
    }
    .header-inner {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      position: relative;
    }
    .header-left {}
    .inst-name {
      font-family: 'Cormorant Garamond', serif;
      font-size: 22px;
      font-weight: 700;
      color: white;
    }
    .inst-subtitle {
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 2px;
      font-family: monospace;
      margin-top: 2px;
    }
    .report-title {
      font-family: 'Cormorant Garamond', serif;
      font-size: 28px;
      font-weight: 700;
      color: white;
      margin-top: 16px;
    }
    .report-title-ar {
      font-family: 'Scheherazade New', serif;
      font-size: 16px;
      color: #C4882A;
      opacity: 0.9;
      margin-top: 2px;
    }
    .header-right {
      text-align: right;
    }
    .date-hijri-ar {
      font-family: 'Scheherazade New', serif;
      font-size: 18px;
      color: #C4882A;
      direction: rtl;
    }
    .date-hijri-en {
      font-size: 11px;
      color: rgba(255,255,255,0.7);
      margin-top: 4px;
      font-family: monospace;
    }
    .date-greg {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      margin-top: 2px;
      font-family: monospace;
    }
    .report-id {
      font-size: 9px;
      color: rgba(255,255,255,0.3);
      margin-top: 8px;
      font-family: monospace;
      letter-spacing: 1px;
    }

    /* ── Body ── */
    .body { padding: 24px 32px; }

    /* ── Section ── */
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 3px;
      color: #0D5C3A;
      text-transform: uppercase;
      border-bottom: 2px solid #0D5C3A;
      padding-bottom: 4px;
      margin-bottom: 12px;
    }

    /* ── Student profile ── */
    .profile-grid {
      display: grid;
      grid-template-columns: 80px 1fr 1fr;
      gap: 16px;
      align-items: start;
    }
    .photo-box {
      width: 80px;
      height: 80px;
      border-radius: 12px;
      background: #dcfce7;
      border: 2px solid #0D5C3A;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .photo-initial {
      font-family: 'Cormorant Garamond', serif;
      font-size: 32px;
      font-weight: 700;
      color: #0D5C3A;
    }
    .field-row {
      margin-bottom: 6px;
    }
    .field-label {
      font-size: 9px;
      color: #6b7280;
      font-family: monospace;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .field-value {
      font-size: 13px;
      font-weight: 600;
      color: #1a1a1a;
      margin-top: 1px;
    }
    .field-value-ar {
      font-family: 'Scheherazade New', serif;
      font-size: 12px;
      color: #0D5C3A;
      direction: rtl;
      text-align: left;
    }
    .enrollment-badge {
      display: inline-block;
      background: #dcfce7;
      color: #166534;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-family: monospace;
      font-weight: 700;
      border: 1px solid #86efac;
    }
    .program-badge {
      display: inline-block;
      background: #f0fdf4;
      color: #0D5C3A;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      border: 1px solid #86efac;
    }

    /* ── Stats grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .stat-card {
      background: #f0fdf4;
      border-radius: 10px;
      padding: 12px 10px;
      text-align: center;
      border: 1px solid #bbf7d0;
    }
    .stat-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 20px;
      font-weight: 700;
      color: #0D5C3A;
    }
    .stat-label {
      font-size: 9px;
      color: #6b7280;
      margin-top: 2px;
      font-family: monospace;
      letter-spacing: 0.5px;
    }

    /* ── Progress bar ── */
    .progress-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .progress-card {
      background: linear-gradient(135deg, #052e16, #065f46);
      border-radius: 12px;
      padding: 16px;
    }
    .progress-card-light {
      background: #f0fdf4;
      border-radius: 12px;
      padding: 16px;
      border: 1px solid #bbf7d0;
    }
    .progress-label {
      font-size: 9px;
      color: rgba(255,255,255,0.5);
      letter-spacing: 2px;
      font-family: monospace;
    }
    .progress-juz {
      font-family: 'Cormorant Garamond', serif;
      font-size: 36px;
      font-weight: 700;
      color: white;
      line-height: 1;
      margin: 6px 0;
    }
    .progress-sub {
      font-size: 11px;
      color: rgba(255,255,255,0.6);
    }
    .bar-track {
      height: 8px;
      background: rgba(255,255,255,0.1);
      border-radius: 4px;
      margin-top: 10px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      background: linear-gradient(90deg, #10B981, #34d399);
      border-radius: 4px;
    }
    .bar-pct {
      font-family: monospace;
      font-size: 10px;
      color: rgba(255,255,255,0.5);
      margin-top: 4px;
      text-align: right;
    }
    .health-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 28px;
      font-weight: 700;
    }
    .health-label {
      font-size: 9px;
      color: #6b7280;
      font-family: monospace;
      letter-spacing: 1px;
    }

    /* ── Table ── */
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
    }
    th {
      background: #0D5C3A;
      color: white;
      padding: 7px 10px;
      text-align: left;
      font-family: monospace;
      font-size: 9px;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    td {
      padding: 7px 10px;
      border-bottom: 1px solid #f0fdf4;
      font-size: 11px;
      vertical-align: middle;
    }
    tr:nth-child(even) td { background: #f8fffe; }
    .badge {
      display: inline-block;
      padding: 2px 7px;
      border-radius: 4px;
      font-size: 9px;
      font-weight: 700;
      font-family: monospace;
    }

    /* ── Attendance visual ── */
    .att-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    .att-card {
      border-radius: 8px;
      padding: 10px 12px;
      text-align: center;
    }
    .att-val {
      font-family: 'JetBrains Mono', monospace;
      font-size: 22px;
      font-weight: 700;
    }
    .att-label { font-size: 10px; margin-top: 2px; }
    .att-bar-row {
      display: flex;
      height: 10px;
      border-radius: 5px;
      overflow: hidden;
      margin-top: 8px;
    }

    /* ── Remarks ── */
    .remarks-box {
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 12px;
      min-height: 60px;
    }
    .dotted-line {
      border-bottom: 1px dashed #d1d5db;
      margin: 8px 0;
    }

    /* ── Signature ── */
    .sig-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
      margin-top: 12px;
    }
    .sig-box {
      border-top: 1.5px solid #374151;
      padding-top: 6px;
      text-align: center;
    }
    .sig-label {
      font-size: 10px;
      color: #6b7280;
      font-family: monospace;
      letter-spacing: 1px;
    }

    /* ── Footer ── */
    .footer {
      background: #0D5C3A;
      padding: 10px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
    }
    .footer-text {
      font-size: 9px;
      color: rgba(255,255,255,0.4);
      font-family: monospace;
      letter-spacing: 1px;
    }
    .footer-ar {
      font-family: 'Scheherazade New', serif;
      font-size: 12px;
      color: #C4882A;
      opacity: 0.7;
    }

    /* ── Print styles ── */
    @media print {
      body { background: white; }
      .print-bar { display: none !important; }
      .page { margin: 0; width: 100%; }
      @page { margin: 0; size: A4; }
    }
  </style>
</head>
<body>

<!-- Print bar (screen only) -->
<div class="print-bar">
  <span>📄 Student Progress Report — ${student.name}</span>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>

<div class="page">

  <!-- Header -->
  <div class="header">
    <svg class="header-pattern" width="200" height="200" viewBox="0 0 80 80">
      ${[0,1,2,3].map(i=>`<polygon points="24,${4+i*5} ${56-i*5},4 76,${24+i*5} ${76-i*5},${56} ${56},${76-i*5} 24,${76-i*5} 4,${56-i*5} ${4+i*5},24" fill="none" stroke="white" stroke-width="0.5"/>`).join("")}
    </svg>
    <div class="header-inner">
      <div class="header-left">
        <div class="inst-name">${institution?.name || "HifzPro Institute"}</div>
        ${institution?.nameArabic ? `<div style="font-family:'Scheherazade New',serif;font-size:14px;color:#C4882A;opacity:0.8;margin-top:2px">${institution.nameArabic}</div>` : ""}
        <div class="inst-subtitle">STUDENT PROGRESS REPORT</div>
        <div class="report-title">${student.name}</div>
        ${student.nameArabic ? `<div class="report-title-ar">${student.nameArabic}</div>` : ""}
      </div>
      <div class="header-right">
        <div class="date-hijri-ar">${hijriAr}</div>
        <div class="date-hijri-en">${hijriEn}</div>
        <div class="date-greg">${gregToday}</div>
        <div class="report-id">REF: RPT-${student.enrollmentNumber}-${today.getFullYear()}</div>
      </div>
    </div>
  </div>

  <div class="body">

    <!-- Student Profile -->
    <div class="section">
      <div class="section-title">Student Profile · طالب علم کی تفصیل</div>
      <div class="profile-grid">
        <div class="photo-box">
          ${student.photo
            ? `<img src="${student.photo}" style="width:100%;height:100%;object-fit:cover;" />`
            : `<div class="photo-initial">${student.name.charAt(0)}</div>`}
        </div>
        <div>
          <div class="field-row">
            <div class="field-label">Enrollment No.</div>
            <div><span class="enrollment-badge">${student.enrollmentNumber}</span></div>
          </div>
          <div class="field-row">
            <div class="field-label">Program</div>
            <div><span class="program-badge">${prog.label}</span> <span style="font-family:'Scheherazade New',serif;font-size:12px;color:#0D5C3A">${prog.ar}</span></div>
          </div>
          <div class="field-row">
            <div class="field-label">Batch / Halqa</div>
            <div class="field-value">${student.batch?.name || "—"}</div>
          </div>
          <div class="field-row">
            <div class="field-label">Ustadh</div>
            <div class="field-value">${ustadh}</div>
          </div>
        </div>
        <div>
          <div class="field-row">
            <div class="field-label">Date of Birth</div>
            <div class="field-value">${student.dateOfBirth ? formatDate(student.dateOfBirth, true) : "—"}</div>
          </div>
          <div class="field-row">
            <div class="field-label">Enrolled On</div>
            <div class="field-value">${formatDate(student.enrolledAt, true)}</div>
          </div>
          <div class="field-row">
            <div class="field-label">Duration</div>
            <div class="field-value">${monthsEnrolled} months (${daysSinceEnrolled} days)</div>
          </div>
          <div class="field-row">
            <div class="field-label">Guardian</div>
            <div class="field-value">${guardian?.name || "—"} ${guardian?.phone ? `· ${guardian.phone}` : ""}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="section">
      <div class="section-title">Summary Statistics · خلاصہ</div>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-val">${student.lessonEntries.length}</div>
          <div class="stat-label">Total Lessons</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${student.testRecords.length}</div>
          <div class="stat-label">Tests Taken</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${attendancePct}%</div>
          <div class="stat-label">Attendance</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${avgGrade !== null ? avgGrade + "%" : "—"}</div>
          <div class="stat-label">Avg Test Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-val">${student.sanads.length > 0 ? "✓" : "—"}</div>
          <div class="stat-label">Sanad Issued</div>
        </div>
      </div>
    </div>

    <!-- Progress -->
    <div class="section">
      <div class="section-title">Memorization Progress · حفظ کی ترقی</div>
      <div class="progress-section">
        <div class="progress-card">
          <div class="progress-label">CURRENT POSITION</div>
          <div class="progress-juz">Juz ${student.progress?.currentJuz || "—"}</div>
          <div class="progress-sub">
            ${student.progress?.currentSurah ? `Surah ${student.progress.currentSurah}` : ""}
            ${student.progress?.currentAyah ? ` · Ayah ${student.progress.currentAyah}` : ""}
            ${student.progress?.currentPage ? ` · Page ${student.progress.currentPage}` : ""}
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.round(student.progress?.percentComplete || 0)}%"></div>
          </div>
          <div class="bar-pct">${Math.round(student.progress?.percentComplete || 0)}% Complete</div>
        </div>
        <div class="progress-card-light">
          <div style="margin-bottom:10px">
            <div class="health-label">MANZIL HEALTH SCORE</div>
            <div class="health-val" style="color:${healthColor}">${health !== null ? health + "%" : "N/A"}</div>
            <div style="height:6px;background:#e5e7eb;border-radius:3px;margin-top:6px;overflow:hidden">
              ${health !== null ? `<div style="height:100%;width:${health}%;background:${healthColor};border-radius:3px"></div>` : ""}
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px">
            <div>
              <div class="health-label">PAGES MEMORIZED</div>
              <div style="font-family:monospace;font-size:16px;font-weight:700;color:#0D5C3A;margin-top:2px">${student.progress?.totalPagesMemorized || 0}</div>
            </div>
            <div>
              <div class="health-label">JUZ COMPLETED</div>
              <div style="font-family:monospace;font-size:16px;font-weight:700;color:#0D5C3A;margin-top:2px">${student.progress?.totalJuzMemorized || 0}</div>
            </div>
            <div>
              <div class="health-label">AVG LINES/DAY</div>
              <div style="font-family:monospace;font-size:16px;font-weight:700;color:#0D5C3A;margin-top:2px">${student.progress?.avgLinesPerDay?.toFixed(1) || "—"}</div>
            </div>
            <div>
              <div class="health-label">PROJECTED KHATM</div>
              <div style="font-size:11px;font-weight:600;color:#0D5C3A;margin-top:2px">${student.progress?.projectedKhatmDate ? formatDate(student.progress.projectedKhatmDate, true) : "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Attendance -->
    <div class="section">
      <div class="section-title">Attendance Record · حاضری کا ریکارڈ (Last ${totalSessions} Sessions)</div>
      <div class="att-grid">
        <div class="att-card" style="background:#dcfce7;border:1px solid #86efac">
          <div class="att-val" style="color:#166534">${presentCount}</div>
          <div class="att-label" style="color:#166534">Present · حاضر</div>
        </div>
        <div class="att-card" style="background:#fee2e2;border:1px solid #fca5a5">
          <div class="att-val" style="color:#991b1b">${absentCount}</div>
          <div class="att-label" style="color:#991b1b">Absent · غیر حاضر</div>
        </div>
        <div class="att-card" style="background:#fef3c7;border:1px solid #fde68a">
          <div class="att-val" style="color:#92400e">${lateCount}</div>
          <div class="att-label" style="color:#92400e">Late · دیر سے</div>
        </div>
      </div>
      <div class="att-bar-row">
        ${presentCount > 0 ? `<div style="width:${Math.round(presentCount/totalSessions*100)}%;background:#10B981"></div>` : ""}
        ${lateCount > 0 ? `<div style="width:${Math.round(lateCount/totalSessions*100)}%;background:#F59E0B"></div>` : ""}
        ${absentCount > 0 ? `<div style="width:${Math.round(absentCount/totalSessions*100)}%;background:#EF4444"></div>` : ""}
      </div>
    </div>

    <!-- Lesson Entries -->
    ${student.lessonEntries.length > 0 ? `
    <div class="section">
      <div class="section-title">Recent Lesson Diary · حالیہ اسباق (Last ${Math.min(student.lessonEntries.length, 10)})</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Type</th>
            <th>From</th>
            <th>To</th>
            <th>Grade</th>
            <th>Mistakes</th>
          </tr>
        </thead>
        <tbody>
          ${student.lessonEntries.slice(0, 10).map(l => {
            const g = l.grade ? GRADE_LABELS[l.grade as string] : null;
            const lt = LESSON_LABELS[l.lessonType as string] || { label: l.lessonType, ar: "" };
            return `
          <tr>
            <td style="font-family:monospace;font-size:10px">${formatDate(l.date, true)}</td>
            <td>
              <span style="font-size:10px;font-weight:600">${lt.label}</span>
              <span style="font-family:'Scheherazade New',serif;font-size:10px;color:#0D5C3A;margin-left:4px">${lt.ar}</span>
            </td>
            <td style="font-family:monospace;font-size:10px">${l.juzFrom ? `Juz ${l.juzFrom}` : ""} ${l.pageFrom ? `P.${l.pageFrom}` : ""}</td>
            <td style="font-family:monospace;font-size:10px">${l.juzTo ? `Juz ${l.juzTo}` : ""} ${l.pageTo ? `P.${l.pageTo}` : ""}</td>
            <td>${g ? `<span class="badge" style="background:${g.color}22;color:${g.color};border:1px solid ${g.color}44">${g.label}</span>` : "—"}</td>
            <td style="font-family:monospace;font-size:11px;color:${l.mistakes.length > 3 ? "#991b1b" : "#374151"}">${l.mistakes.length}</td>
          </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>` : ""}

    <!-- Tests -->
    ${student.testRecords.length > 0 ? `
    <div class="section">
      <div class="section-title">Test Records · امتحانات</div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Test Type</th>
            <th>Juz Range</th>
            <th>Score</th>
            <th>Result</th>
            <th>Examiner</th>
          </tr>
        </thead>
        <tbody>
          ${student.testRecords.map(t => {
            const res = t.result ? RESULT_LABELS[t.result as string] : null;
            return `
          <tr>
            <td style="font-family:monospace;font-size:10px">${formatDate(t.date, true)}</td>
            <td style="font-size:11px;font-weight:600">${TEST_LABELS[t.testType as string] || t.testType}</td>
            <td style="font-family:monospace;font-size:10px">${t.juzFrom ? `${t.juzFrom}–${t.juzTo || t.juzFrom}` : "—"}</td>
            <td style="font-family:monospace;font-size:12px;font-weight:700;color:#0D5C3A">${t.score !== null ? t.score + "%" : "—"}</td>
            <td>${res ? `<span class="badge" style="background:${res.color}22;color:${res.color};border:1px solid ${res.color}44">${res.label}</span>` : "—"}</td>
            <td style="font-size:10px;color:#6b7280">${t.examiner?.user?.name || "—"}</td>
          </tr>`;
          }).join("")}
        </tbody>
      </table>
    </div>` : ""}

    <!-- Ustadh Remarks -->
    <div class="section">
      <div class="section-title">Ustadh Remarks · استاذ کے تبصرے</div>
      <div class="remarks-box">
        <div class="dotted-line"></div>
        <div class="dotted-line"></div>
        <div class="dotted-line"></div>
        <div class="dotted-line"></div>
      </div>
    </div>

    <!-- Signatures -->
    <div class="section">
      <div class="section-title">Signatures · دستخط</div>
      <div class="sig-grid">
        <div class="sig-box">
          <div class="sig-label">USTADH · استاذ</div>
          <div style="margin-top:4px;font-size:11px;color:#374151">${ustadh}</div>
        </div>
        <div class="sig-box">
          <div class="sig-label">PRINCIPAL / ADMIN</div>
        </div>
        <div class="sig-box">
          <div class="sig-label">PARENT / GUARDIAN · والدین</div>
          <div style="margin-top:4px;font-size:11px;color:#374151">${guardian?.name || ""}</div>
        </div>
      </div>
    </div>

  </div>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-text">GENERATED BY HIFZPRO · WWW.HIFZPRO.COM · ${gregToday.toUpperCase()}</div>
    <div class="footer-ar">وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ</div>
    <div class="footer-text">${student.enrollmentNumber} · PAGE 1 OF 1</div>
  </div>

</div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[student report]", error);
    return new NextResponse("Failed to generate report", { status: 500 });
  }
}
