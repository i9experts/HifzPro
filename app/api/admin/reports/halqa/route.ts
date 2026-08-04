// app/api/admin/reports/halqa/route.ts
// Generates a print-ready HTML report of all halqas (batches) with full student
// rosters — built for institution administration: taking to a Muhtamim meeting,
// printing for a staff-room binder, or a quick institution-wide health check.
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { formatHijri } from "@/lib/hijri";
import { canAccessCampus } from "@/lib/tenant-guard";

const PROGRAM_LABELS: Record<string, string> = {
  HIFZ: "Hifz ul Quran", NAZRA: "Nazrah", TAJWEED: "Tajweed/Qaida", GIRDAAN: "Girdaan",
};

function formatDate(d: Date, short = false): string {
  if (short) return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  return d.toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}

function healthColor(score: number | null): { fg: string; bg: string } {
  if (score === null) return { fg: "#6b7280", bg: "#f9fafb" };
  if (score >= 75) return { fg: "#166534", bg: "#dcfce7" };
  if (score >= 55) return { fg: "#b45309", bg: "#fef3c7" };
  return { fg: "#991b1b", bg: "#fee2e2" };
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const singleBatchId = searchParams.get("batchId"); // optional — print just one halqa

    // ── TENANT SCOPING (same hierarchy as everywhere else) ──
    const campusId       = payload.campusId;
    const institutionId  = !campusId ? payload.institutionId : null;
    const batchScope: any = campusId ? { campusId } : institutionId ? { campus: { institutionId } } : {};
    if (!campusId && !institutionId) {
      // A platform super admin hitting this without ever selecting an institution
      // would otherwise print the ENTIRE platform's roster — block that explicitly.
      return new NextResponse("Please view this report from within a specific institution.", { status: 400 });
    }

    const batchWhere: any = { ...batchScope, isActive: true };
    if (singleBatchId) batchWhere.id = singleBatchId;

    const batches = await prisma.batch.findMany({
      where: batchWhere,
      orderBy: { name: "asc" },
      include: {
        campus: { include: { institution: { select: { name: true, nameArabic: true, logo: true, city: true } } } },
        ustadh: { include: { user: { select: { name: true, phone: true } } } },
        students: {
          where: { status: "ACTIVE" },
          orderBy: { name: "asc" },
          include: {
            progress:     true,
            manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 1 },
            guardians:    { where: { isEmergency: true }, take: 1 },
          },
        },
      },
    });

    if (singleBatchId && batches.length === 0) {
      return new NextResponse("Halqa not found", { status: 404 });
    }

    // ── Attendance %, last 30 days, per student (single query for everyone at once) ──
    const allStudentIds = batches.flatMap(b => b.students.map(s => s.id));
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const attendanceRows = allStudentIds.length
      ? await prisma.attendanceRecord.findMany({
          where: { studentId: { in: allStudentIds }, session: { date: { gte: thirtyDaysAgo } } },
          select: { studentId: true, status: true },
        })
      : [];
    const attendanceByStudent = new Map<string, { present: number; total: number }>();
    for (const rec of attendanceRows) {
      const cur = attendanceByStudent.get(rec.studentId) || { present: 0, total: 0 };
      cur.total += 1;
      if (rec.status === "PRESENT" || rec.status === "LATE") cur.present += 1;
      attendanceByStudent.set(rec.studentId, cur);
    }

    const institution = batches[0]?.campus?.institution;
    const campusName  = batches[0]?.campus?.name || "";
    const today       = new Date();
    const gregToday   = formatDate(today, true);
    const hijriAr     = formatHijri(today, "ar");

    const totalStudents = batches.reduce((sum, b) => sum + b.students.length, 0);

    // ── Per-halqa section HTML ──
    const halqaSections = batches.map((batch, bIdx) => {
      const rows = batch.students.map((s, i) => {
        const health   = s.manzilHealth[0]?.score ?? null;
        const hc       = healthColor(health);
        const att      = attendanceByStudent.get(s.id);
        const attPct   = att && att.total > 0 ? Math.round((att.present / att.total) * 100) : null;
        const guardian = s.guardians[0];
        const progress = s.progress;
        return `
          <tr>
            <td class="c">${i + 1}</td>
            <td class="name">${escapeHtml(s.name)}</td>
            <td class="mono c">${escapeHtml(s.enrollmentNumber || "—")}</td>
            <td class="c">${PROGRAM_LABELS[s.program] || s.program}</td>
            <td class="c mono">${progress ? `Juz ${progress.currentJuz}` : "—"}</td>
            <td class="c mono">${progress ? `${progress.percentComplete}%` : "—"}</td>
            <td class="c"><span class="pill" style="color:${hc.fg};background:${hc.bg}">${health === null ? "—" : health}</span></td>
            <td class="c mono">${attPct === null ? "—" : `${attPct}%`}</td>
            <td class="small">${guardian ? `${escapeHtml(guardian.name)}<br/><span class="mono">${escapeHtml(guardian.phone)}</span>` : "—"}</td>
          </tr>`;
      }).join("");

      const withHealth   = batch.students.filter(s => s.manzilHealth[0]?.score != null);
      const avgHealth    = withHealth.length ? Math.round(withHealth.reduce((a, s) => a + (s.manzilHealth[0]!.score), 0) / withHealth.length) : null;
      const withProgress = batch.students.filter(s => s.progress);
      const avgProgress  = withProgress.length ? Math.round(withProgress.reduce((a, s) => a + (s.progress!.percentComplete), 0) / withProgress.length) : null;
      const atRiskCount  = batch.students.filter(s => (s.manzilHealth[0]?.score ?? 100) < 60).length;

      return `
      <div class="halqa-section" ${bIdx > 0 ? 'style="page-break-before: always;"' : ""}>
        <div class="halqa-header">
          <div>
            <div class="halqa-name">${escapeHtml(batch.name)}</div>
            <div class="halqa-meta">
              ${PROGRAM_LABELS[batch.program] || batch.program}
              ${batch.sessionTime ? ` · ${escapeHtml(batch.sessionTime)}` : ""}
              · Ustadh: ${escapeHtml(batch.ustadh?.user?.name || "Not assigned")}
              ${batch.ustadh?.user?.phone ? ` (${escapeHtml(batch.ustadh.user.phone)})` : ""}
            </div>
          </div>
          <div class="halqa-stats">
            <div class="stat"><div class="stat-val">${batch.students.length}</div><div class="stat-label">Students</div></div>
            <div class="stat"><div class="stat-val">${avgProgress === null ? "—" : avgProgress + "%"}</div><div class="stat-label">Avg Progress</div></div>
            <div class="stat"><div class="stat-val">${avgHealth === null ? "—" : avgHealth}</div><div class="stat-label">Avg Health</div></div>
            <div class="stat" style="${atRiskCount > 0 ? 'color:#991b1b' : ''}"><div class="stat-val">${atRiskCount}</div><div class="stat-label">At Risk</div></div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th class="c">#</th><th>Student</th><th class="c">Enrollment #</th><th class="c">Program</th>
              <th class="c">Current Juz</th><th class="c">Progress</th><th class="c">Health</th>
              <th class="c">Attendance (30d)</th><th>Guardian Contact</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="9" class="c" style="padding:20px;color:#9ca3af">No active students in this halqa</td></tr>`}
          </tbody>
        </table>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Halqa Report — ${escapeHtml(campusName)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Scheherazade+New:wght@400;700&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#f0fdf4; color:#1a1a1a; }
  .page { width:297mm; min-height:210mm; margin:0 auto; background:white; }

  .print-bar { background:#0D5C3A; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; }
  .print-bar span { color:white; font-size:14px; font-weight:600; }
  .print-btn { padding:8px 24px; background:#C4882A; color:white; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; }

  .header { background:linear-gradient(135deg,#0D5C3A,#065f46); padding:20px 32px; }
  .header-inner { display:flex; justify-content:space-between; align-items:center; }
  .inst-name { font-family:'Cormorant Garamond',serif; font-size:24px; font-weight:700; color:white; }
  .inst-sub { font-size:11px; color:#C4882A; letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
  .header-right { text-align:right; color:white; }
  .header-right .title { font-family:'Cormorant Garamond',serif; font-size:18px; font-weight:700; }
  .header-right .date { font-size:11px; opacity:0.85; margin-top:2px; }
  .header-right .hijri { font-family:'Scheherazade New',serif; font-size:14px; color:#C4882A; margin-top:2px; }

  .summary-bar { display:flex; gap:0; border-bottom:2px solid #0D5C3A; }
  .summary-item { flex:1; padding:12px 24px; border-right:1px solid #e5e7eb; text-align:center; }
  .summary-item:last-child { border-right:none; }
  .summary-item .val { font-family:'JetBrains Mono',monospace; font-size:20px; font-weight:700; color:#0D5C3A; }
  .summary-item .label { font-size:10px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }

  .halqa-section { padding:20px 24px; }
  .halqa-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; padding-bottom:10px; border-bottom:1.5px solid #0D5C3A; }
  .halqa-name { font-family:'Cormorant Garamond',serif; font-size:20px; font-weight:700; color:#0D5C3A; }
  .halqa-meta { font-size:11px; color:#6b7280; margin-top:2px; }
  .halqa-stats { display:flex; gap:20px; }
  .stat { text-align:center; }
  .stat-val { font-family:'JetBrains Mono',monospace; font-size:16px; font-weight:700; color:#0D5C3A; }
  .stat-label { font-size:9px; color:#9ca3af; text-transform:uppercase; }

  table { width:100%; border-collapse:collapse; font-size:11px; }
  thead th { background:#f0fdf4; color:#0D5C3A; font-size:9px; text-transform:uppercase; letter-spacing:0.5px; padding:6px 8px; text-align:left; border-bottom:1.5px solid #0D5C3A; }
  tbody td { padding:6px 8px; border-bottom:1px solid #e5e7eb; vertical-align:top; }
  tbody tr:nth-child(even) { background:#fafafa; }
  .c { text-align:center; }
  .mono { font-family:'JetBrains Mono',monospace; font-size:10px; }
  .name { font-weight:600; }
  .small { font-size:10px; color:#374151; }
  .pill { padding:2px 8px; border-radius:10px; font-weight:700; font-family:'JetBrains Mono',monospace; font-size:10px; }

  .footer { padding:12px 24px; display:flex; justify-content:space-between; border-top:1px solid #e5e7eb; }
  .footer-text { font-size:9px; color:#9ca3af; letter-spacing:0.5px; }

  @media print {
    body { background:white; }
    .print-bar { display:none !important; }
    .page { margin:0; width:100%; }
    @page { margin:10mm; size:A4 landscape; }
    .halqa-section { page-break-inside:auto; }
    table { page-break-inside:auto; }
    tr { page-break-inside:avoid; }
    thead { display:table-header-group; }
  }
</style>
</head>
<body>

<div class="print-bar">
  <span>📄 Halqa Report — ${escapeHtml(campusName)} (${batches.length} halqa${batches.length === 1 ? "" : "s"}, ${totalStudents} students)</span>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>

<div class="page">

  <div class="header">
    <div class="header-inner">
      <div>
        <div class="inst-name">${escapeHtml(institution?.name || "HifzPro")}</div>
        <div class="inst-sub">${escapeHtml(campusName)}</div>
      </div>
      <div class="header-right">
        <div class="title">Halqa-wise Student Report</div>
        <div class="date">${gregToday}</div>
        <div class="hijri">${hijriAr}</div>
      </div>
    </div>
  </div>

  <div class="summary-bar">
    <div class="summary-item"><div class="val">${batches.length}</div><div class="label">Total Halqas</div></div>
    <div class="summary-item"><div class="val">${totalStudents}</div><div class="label">Total Students</div></div>
    <div class="summary-item"><div class="val">${batches.filter(b => b.ustadh).length}</div><div class="label">Assigned Ustadhs</div></div>
    <div class="summary-item"><div class="val">${batches.reduce((sum, b) => sum + b.students.filter(s => (s.manzilHealth[0]?.score ?? 100) < 60).length, 0)}</div><div class="label">At-Risk Students</div></div>
  </div>

  ${halqaSections}

  <div class="footer">
    <div class="footer-text">GENERATED BY HIFZPRO · WWW.HIFZPRO.COM · ${gregToday.toUpperCase()}</div>
    <div class="footer-text">${batches.length} HALQA${batches.length === 1 ? "" : "S"} · ${totalStudents} STUDENTS</div>
  </div>

</div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("[halqa report]", error);
    return new NextResponse("Failed to generate report", { status: 500 });
  }
}
