// app/api/admin/reports/followup/route.ts
// Printable "Follow-Up Action Report" — four actionable lists for admin staff to
// work through: At-Risk Students, Attendance Defaulters, Fee Overdue, and
// Progress Stagnation. Each row includes guardian contact info so it can be
// used directly as a physical calling sheet.
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { canAccessCampus } from "@/lib/tenant-guard";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function formatDate(d: Date, short = false): string {
  if (short) return d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
  return d.toLocaleDateString("en-PK", { weekday: "short", day: "numeric", month: "long", year: "numeric" });
}
function daysAgo(d: Date | null): number | null {
  if (!d) return null;
  return Math.floor((Date.now() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
}

export async function GET(req: NextRequest) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    const payload = verifyToken(token);
    if (!payload || !["CAMPUS_ADMIN", "SUPER_ADMIN"].includes(payload.role)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const campusId      = payload.campusId;
    const institutionId = !campusId ? payload.institutionId : null;
    if (!campusId && !institutionId) {
      return new NextResponse("Please view this report from within a specific institution.", { status: 400 });
    }
    const scope: any = campusId ? { campusId } : { campus: { institutionId } };

    const campus = campusId
      ? await prisma.campus.findUnique({ where: { id: campusId }, include: { institution: { select: { name: true } } } })
      : null;
    const institution = campus?.institution
      || (institutionId ? await prisma.institution.findUnique({ where: { id: institutionId }, select: { name: true } }) : null);

    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fourteenDaysAgo = new Date(); fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // ── Fetch every active student once, with everything all four reports need ──
    const students = await prisma.student.findMany({
      where: { ...scope, status: "ACTIVE" },
      include: {
        batch:        { select: { name: true } },
        guardians:    { where: { isEmergency: true }, take: 1 },
        progress:     true,
        manzilHealth: { orderBy: { calculatedAt: "desc" }, take: 2 },
        attendanceRecords: {
          where:  { session: { date: { gte: thirtyDaysAgo } } },
          select: { status: true },
        },
        lessonEntries: {
          where:   { lessonType: "SABAQ" },
          orderBy: { date: "desc" },
          take:    1,
          select:  { date: true },
        },
        feePayments: {
          where:   { status: { in: ["PENDING", "PARTIAL", "OVERDUE"] } },
          orderBy: [{ year: "asc" }, { month: "asc" }],
        },
        scholarships: { where: { isActive: true }, take: 1 },
      },
    });

    // ── 1. At-Risk Students: latest health score < 60, OR declining vs previous score ──
    const atRisk = students
      .filter(s => {
        const [latest, prev] = s.manzilHealth;
        if (!latest) return false;
        return latest.score < 60 || (prev && latest.score < prev.score - 10);
      })
      .map(s => {
        const [latest, prev] = s.manzilHealth;
        const trend = prev ? (latest.score < prev.score ? "declining" : latest.score > prev.score ? "improving" : "stable") : "—";
        return { student: s, score: latest.score, trend, prevScore: prev?.score ?? null };
      })
      .sort((a, b) => a.score - b.score);

    // ── 2. Attendance Defaulters: < 70% present over last 30 days (min 3 sessions to avoid noise) ──
    const attendanceDefaulters = students
      .map(s => {
        const total = s.attendanceRecords.length;
        const present = s.attendanceRecords.filter(r => r.status === "PRESENT" || r.status === "LATE").length;
        const pct = total > 0 ? Math.round((present / total) * 100) : null;
        return { student: s, pct, total, present, absent: total - present };
      })
      .filter(r => r.total >= 3 && r.pct !== null && r.pct < 70)
      .sort((a, b) => (a.pct ?? 0) - (b.pct ?? 0));

    // ── 3. Fee Overdue: same effective-due calculation as /api/admin/fees/outstanding, for consistency ──
    const feeOverdue = students
      .filter(s => s.feePayments.length > 0)
      .map(s => {
        const totalDue = s.feePayments.reduce((acc, p) => acc + p.amount - (p.paidAmount || 0), 0);
        const scholarship = s.scholarships[0];
        const effectiveDue = scholarship
          ? scholarship.type === "FULL" ? 0
          : scholarship.type === "PARTIAL_PERCENT" ? totalDue * (1 - (scholarship.percentage || 0) / 100)
          : Math.max(0, totalDue - (scholarship.fixedAmount || 0))
          : totalDue;
        const oldest = s.feePayments[0];
        return { student: s, due: Math.round(effectiveDue), monthsOverdue: s.feePayments.length, oldestMonth: oldest ? `${oldest.month}/${oldest.year}` : "—" };
      })
      .filter(r => r.due > 0)
      .sort((a, b) => b.due - a.due);

    // ── 4. Progress Stagnation: no new SABAQ lesson in 14+ days (or never) ──
    const stagnant = students
      .map(s => {
        const lastSabaq = s.lessonEntries[0]?.date || null;
        const gap = daysAgo(lastSabaq);
        return { student: s, lastSabaq, gap };
      })
      .filter(r => r.gap === null || r.gap >= 14)
      .sort((a, b) => (b.gap ?? 9999) - (a.gap ?? 9999));

    const today = new Date();
    const gregToday = formatDate(today, true);

    const guardianCell = (s: typeof students[number]) => {
      const g = s.guardians[0];
      return g ? `${escapeHtml(g.name)}<br/><span class="mono">${escapeHtml(g.phone)}</span>` : "—";
    };

    const section = (title: string, icon: string, subtitle: string, headers: string[], rows: string[], emptyMsg: string) => `
      <div class="report-section">
        <div class="section-header">
          <div class="section-title">${icon} ${title}</div>
          <div class="section-sub">${subtitle}</div>
        </div>
        <table>
          <thead><tr>${headers.map(h => `<th class="${h === "Student" || h === "Guardian Contact" ? "" : "c"}">${h}</th>`).join("")}<th class="c">Contacted</th><th>Notes</th></tr></thead>
          <tbody>
            ${rows.length ? rows.join("") : `<tr><td colspan="${headers.length + 2}" class="c" style="padding:16px;color:#9ca3af">${emptyMsg}</td></tr>`}
          </tbody>
        </table>
      </div>`;

    const atRiskRows = atRisk.map(r => `
      <tr>
        <td class="name">${escapeHtml(r.student.name)}<div class="small">${escapeHtml(r.student.batch?.name || "—")}</div></td>
        <td class="c"><span class="pill" style="color:${r.score<40?'#991b1b':'#b45309'};background:${r.score<40?'#fee2e2':'#fef3c7'}">${Math.round(r.score)}</span></td>
        <td class="c small">${r.prevScore !== null ? Math.round(r.prevScore) : "—"}</td>
        <td class="c small">${r.trend}</td>
        <td class="small">${guardianCell(r.student)}</td>
        <td class="c">☐</td><td></td>
      </tr>`);

    const attRows = attendanceDefaulters.map(r => `
      <tr>
        <td class="name">${escapeHtml(r.student.name)}<div class="small">${escapeHtml(r.student.batch?.name || "—")}</div></td>
        <td class="c"><span class="pill" style="color:#991b1b;background:#fee2e2">${r.pct}%</span></td>
        <td class="c small">${r.present}/${r.total}</td>
        <td class="c small">${r.absent}</td>
        <td class="small">${guardianCell(r.student)}</td>
        <td class="c">☐</td><td></td>
      </tr>`);

    const feeRows = feeOverdue.map(r => `
      <tr>
        <td class="name">${escapeHtml(r.student.name)}<div class="small">${escapeHtml(r.student.batch?.name || "—")}</div></td>
        <td class="c mono">Rs. ${r.due.toLocaleString()}</td>
        <td class="c small">${r.monthsOverdue} month${r.monthsOverdue===1?"":"s"}</td>
        <td class="c small">${r.oldestMonth}</td>
        <td class="small">${guardianCell(r.student)}</td>
        <td class="c">☐</td><td></td>
      </tr>`);

    const stagnantRows = stagnant.map(r => `
      <tr>
        <td class="name">${escapeHtml(r.student.name)}<div class="small">${escapeHtml(r.student.batch?.name || "—")}</div></td>
        <td class="c small">${r.student.progress ? `Juz ${r.student.progress.currentJuz}` : "—"}</td>
        <td class="c"><span class="pill" style="color:#991b1b;background:#fee2e2">${r.gap === null ? "No Sabaq yet" : `${r.gap} days`}</span></td>
        <td class="c small">${r.lastSabaq ? formatDate(r.lastSabaq, true) : "Never"}</td>
        <td class="small">${guardianCell(r.student)}</td>
        <td class="c">☐</td><td></td>
      </tr>`);

    const html = `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Follow-Up Report — ${escapeHtml(institution?.name || "HifzPro")}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:'Inter',sans-serif; background:#f0fdf4; color:#1a1a1a; }
  .page { width:210mm; min-height:297mm; margin:0 auto; background:white; }

  .print-bar { background:#0D5C3A; padding:12px 24px; display:flex; align-items:center; justify-content:space-between; position:sticky; top:0; z-index:100; }
  .print-bar span { color:white; font-size:14px; font-weight:600; }
  .print-btn { padding:8px 24px; background:#C4882A; color:white; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; font-family:'Inter',sans-serif; }

  .header { background:linear-gradient(135deg,#0D5C3A,#065f46); padding:20px 32px; }
  .header-inner { display:flex; justify-content:space-between; align-items:center; }
  .inst-name { font-family:'Cormorant Garamond',serif; font-size:22px; font-weight:700; color:white; }
  .inst-sub { font-size:10px; color:#C4882A; letter-spacing:1px; text-transform:uppercase; margin-top:2px; }
  .header-right { text-align:right; color:white; }
  .header-right .title { font-family:'Cormorant Garamond',serif; font-size:16px; font-weight:700; }
  .header-right .date { font-size:11px; opacity:0.85; margin-top:2px; }

  .summary-bar { display:flex; border-bottom:2px solid #0D5C3A; }
  .summary-item { flex:1; padding:10px 16px; border-right:1px solid #e5e7eb; text-align:center; }
  .summary-item:last-child { border-right:none; }
  .summary-item .val { font-family:'JetBrains Mono',monospace; font-size:18px; font-weight:700; color:#0D5C3A; }
  .summary-item .label { font-size:9px; color:#6b7280; text-transform:uppercase; letter-spacing:0.5px; margin-top:2px; }

  .report-section { padding:16px 24px; page-break-inside:auto; }
  .section-header { margin-bottom:8px; padding-bottom:6px; border-bottom:1.5px solid #0D5C3A; }
  .section-title { font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:700; color:#0D5C3A; }
  .section-sub { font-size:10px; color:#6b7280; margin-top:1px; }

  table { width:100%; border-collapse:collapse; font-size:10.5px; margin-bottom:4px; }
  thead th { background:#f0fdf4; color:#0D5C3A; font-size:8.5px; text-transform:uppercase; letter-spacing:0.4px; padding:5px 6px; text-align:left; border-bottom:1.5px solid #0D5C3A; }
  tbody td { padding:5px 6px; border-bottom:1px solid #e5e7eb; vertical-align:top; }
  tbody tr:nth-child(even) { background:#fafafa; }
  tr { page-break-inside:avoid; }
  .c { text-align:center; }
  .mono { font-family:'JetBrains Mono',monospace; font-size:9.5px; }
  .name { font-weight:600; }
  .small { font-size:9px; color:#6b7280; }
  .pill { padding:2px 7px; border-radius:9px; font-weight:700; font-family:'JetBrains Mono',monospace; font-size:9.5px; }

  .footer { padding:10px 24px; display:flex; justify-content:space-between; border-top:1px solid #e5e7eb; }
  .footer-text { font-size:8.5px; color:#9ca3af; letter-spacing:0.5px; }

  @media print {
    body { background:white; }
    .print-bar { display:none !important; }
    .page { margin:0; width:100%; }
    @page { margin:10mm; size:A4; }
    thead { display:table-header-group; }
  }
</style>
</head>
<body>

<div class="print-bar">
  <span>📄 Follow-Up Report — ${escapeHtml(institution?.name || "HifzPro")}</span>
  <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
</div>

<div class="page">

  <div class="header">
    <div class="header-inner">
      <div>
        <div class="inst-name">${escapeHtml(institution?.name || "HifzPro")}</div>
        <div class="inst-sub">${escapeHtml(campus?.name || "")}</div>
      </div>
      <div class="header-right">
        <div class="title">Student & Parent Follow-Up Report</div>
        <div class="date">${gregToday}</div>
      </div>
    </div>
  </div>

  <div class="summary-bar">
    <div class="summary-item"><div class="val">${atRisk.length}</div><div class="label">At-Risk Students</div></div>
    <div class="summary-item"><div class="val">${attendanceDefaulters.length}</div><div class="label">Attendance Defaulters</div></div>
    <div class="summary-item"><div class="val">${feeOverdue.length}</div><div class="label">Fee Overdue</div></div>
    <div class="summary-item"><div class="val">${stagnant.length}</div><div class="label">Progress Stagnant</div></div>
  </div>

  ${section("At-Risk Students", "⚠️", "Manzil Health score below 60, or dropped 10+ points since last calculation — recommend Ustadh check-in",
    ["Student", "Health Score", "Previous", "Trend", "Guardian Contact"], atRiskRows, "No at-risk students right now — good sign.")}

  ${section("Attendance Defaulters", "📅", "Below 70% attendance over the last 30 days (minimum 3 recorded sessions)",
    ["Student", "Attendance", "Present/Total", "Absences", "Guardian Contact"], attRows, "No attendance defaulters in the last 30 days.")}

  ${section("Fee Overdue", "💰", "Outstanding balance after any active scholarship discount is applied",
    ["Student", "Amount Due", "Months Overdue", "Oldest Month", "Guardian Contact"], feeRows, "No outstanding fee balances.")}

  ${section("Progress Stagnation", "📖", "No new Sabaq (forward memorization) lesson logged in 14+ days",
    ["Student", "Current Juz", "Days Since Sabaq", "Last Sabaq Date", "Guardian Contact"], stagnantRows, "Every student has recent Sabaq progress.")}

  <div class="footer">
    <div class="footer-text">GENERATED BY HIFZPRO · WWW.HIFZPRO.COM · ${gregToday.toUpperCase()}</div>
    <div class="footer-text">FOR INTERNAL FOLLOW-UP USE ONLY</div>
  </div>

</div>

</body>
</html>`;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" },
    });
  } catch (error) {
    console.error("[followup report]", error);
    return new NextResponse("Failed to generate report", { status: 500 });
  }
}
