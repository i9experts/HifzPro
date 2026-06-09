"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface OutstandingStudent {
  studentId:        string;
  name:             string;
  enrollmentNumber: string;
  batch:            string;
  guardian:         { name: string; phone: string; whatsapp: string } | null;
  totalDue:         number;
  monthsOverdue:    number;
  oldestMonth:      string;
  scholarship:      { name: string; type: string } | null;
  payments:         { id: string; amount: number; paidAmount: number; month: number; year: number; status: string }[];
}

interface Summary {
  totalStudents:    number;
  totalOutstanding: number;
  overdueCritical:  number;
}

function PKR(n: number) { return `PKR ${n.toLocaleString("en-PK")}`; }

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function OutstandingFeesPage() {
  const [students, setStudents] = useState<OutstandingStudent[]>([]);
  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [sending,  setSending]  = useState<string | null>(null);
  const [toast,    setToast]    = useState("");

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/fees/outstanding")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.data.students);
          setSummary(d.data.summary);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const sendReminder = async (student: OutstandingStudent) => {
    if (!student.guardian?.whatsapp && !student.guardian?.phone) {
      showToast("⚠️ No WhatsApp number for this student's guardian");
      return;
    }
    setSending(student.studentId);
    try {
      const res  = await fetch("/api/admin/fees/remind", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ studentId: student.studentId }),
      });
      const data = await res.json();
      if (data.success) showToast(`✅ Reminder sent to ${student.guardian?.name}`);
      else showToast(`❌ ${data.error}`);
    } catch { showToast("❌ Failed to send reminder"); }
    finally { setSending(null); }
  };

  const filtered = students.filter(s =>
    !search ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.enrollmentNumber?.toLowerCase().includes(search.toLowerCase()) ||
    s.batch.toLowerCase().includes(search.toLowerCase())
  );

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: colors.n800, color: "white", padding: "10px 20px", borderRadius: 10, fontFamily: fonts.heading, fontSize: 13, zIndex: 999, boxShadow: "0 4px 16px rgba(0,0,0,0.3)" }}>
          {toast}
        </div>
      )}

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin/fees" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", fontSize: 16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1 }}>Outstanding Fees</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, letterSpacing: 1 }}>باقی فیس</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/dashboard/admin/fees/payments/new" style={{ padding: "8px 18px", borderRadius: 8, background: colors.gold, color: "white", fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
            + Record Payment
          </Link>
          <button onClick={handleSignOut} style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.errorText, marginBottom: 6 }}>OUTSTANDING FEES · باقی فیس</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, margin: 0 }}>Outstanding Fees</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, marginTop: 4 }}>
            Students with pending, partial, or overdue fee payments
          </p>
        </div>

        {/* Summary cards */}
        {summary && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
            <div style={{ background: "linear-gradient(135deg,#7f1d1d,#991b1b)", borderRadius: 14, padding: "18px 20px", border: "1px solid #7f1d1d" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 1, marginBottom: 4 }}>TOTAL OUTSTANDING</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: "white" }}>{PKR(summary.totalOutstanding)}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Across {summary.totalStudents} students</div>
            </div>
            <div style={{ background: colors.warningBg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.warning}44` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.warningText, letterSpacing: 1, marginBottom: 4 }}>STUDENTS AFFECTED</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: colors.warningText }}>{summary.totalStudents}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.warningText, opacity: 0.7, marginTop: 2 }}>Have unpaid fees</div>
            </div>
            <div style={{ background: colors.errorBg, borderRadius: 14, padding: "18px 20px", border: `1px solid ${colors.error}44` }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.errorText, letterSpacing: 1, marginBottom: 4 }}>CRITICAL (3+ MONTHS)</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: colors.errorText }}>{summary.overdueCritical}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.errorText, opacity: 0.7, marginTop: 2 }}>Need immediate attention</div>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ marginBottom: 16, position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: colors.n400 }}>🔍</span>
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by student name, enrollment number or batch..."
            style={{ width: "100%", padding: "11px 14px 11px 40px", border: `1.5px solid ${colors.n200}`, borderRadius: 10, fontSize: 13, fontFamily: fonts.body, outline: "none", background: "white", color: colors.n800, boxSizing: "border-box" }}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: 48, textAlign: "center", color: colors.n400, fontFamily: fonts.body }}>Loading outstanding fees...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background: colors.successBg, borderRadius: 16, padding: 56, textAlign: "center", border: `1px solid ${colors.green200}` }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 20, fontWeight: 700, color: colors.successText, marginBottom: 6 }}>
              {search ? "No students match your search" : "No Outstanding Fees!"}
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.successText, opacity: 0.8 }}>
              {search ? "Try a different search term" : "All students are up to date. الحمد لله"}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(s => {
              const isCritical = s.monthsOverdue >= 3;
              const borderColor = isCritical ? colors.error : colors.warning;
              const bgColor     = isCritical ? "#fff5f5" : "#fffbeb";

              return (
                <div key={s.studentId} style={{ background: "white", borderRadius: 14, border: `1px solid ${colors.n200}`, borderLeft: `4px solid ${borderColor}`, overflow: "hidden" }}>
                  <div style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

                    {/* Avatar */}
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: bgColor, border: `1.5px solid ${borderColor}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: isCritical ? colors.errorText : colors.warningText }}>{s.name.charAt(0)}</span>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <Link href={`/dashboard/admin/students/${s.studentId}`} style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.primary, textDecoration: "none" }}>
                          {s.name}
                        </Link>
                        {isCritical && (
                          <span style={{ background: colors.errorBg, color: colors.errorText, padding: "2px 8px", borderRadius: 5, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700 }}>
                            CRITICAL
                          </span>
                        )}
                        {s.scholarship && (
                          <span style={{ background: "#f5f3ff", color: "#7c3aed", padding: "2px 8px", borderRadius: 5, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700 }}>
                            🎓 {s.scholarship.name}
                          </span>
                        )}
                      </div>
                      <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 2 }}>
                        {s.enrollmentNumber} · {s.batch} · Since {s.oldestMonth}
                        {s.guardian && ` · Guardian: ${s.guardian.name}`}
                      </div>
                    </div>

                    {/* Months overdue */}
                    <div style={{ textAlign: "center", minWidth: 80 }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 20, fontWeight: 700, color: isCritical ? colors.errorText : colors.warningText }}>
                        {s.monthsOverdue}
                      </div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400 }}>
                        month{s.monthsOverdue !== 1 ? "s" : ""} overdue
                      </div>
                    </div>

                    {/* Amount */}
                    <div style={{ textAlign: "right", minWidth: 130 }}>
                      <div style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 700, color: isCritical ? colors.errorText : colors.warningText }}>
                        {PKR(s.totalDue)}
                      </div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400 }}>total outstanding</div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      <button
                        onClick={() => sendReminder(s)}
                        disabled={sending === s.studentId}
                        style={{ padding: "7px 12px", borderRadius: 8, background: "#dcfce7", color: "#166534", border: "1px solid #86efac", fontSize: 11, fontWeight: 700, cursor: sending === s.studentId ? "not-allowed" : "pointer", fontFamily: fonts.heading, opacity: sending === s.studentId ? 0.6 : 1 }}>
                        {sending === s.studentId ? "..." : "💬 Remind"}
                      </button>
                      <Link
                        href={`/dashboard/admin/fees/payments/new?studentId=${s.studentId}`}
                        style={{ padding: "7px 14px", borderRadius: 8, background: colors.gold, color: "white", fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
                        💰 Collect
                      </Link>
                    </div>
                  </div>

                  {/* Month breakdown */}
                  {s.payments.length > 0 && (
                    <div style={{ borderTop: `1px solid ${colors.n100}`, padding: "8px 18px", background: colors.n50, display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {s.payments.map((p, i) => (
                        <span key={i} style={{
                          background: p.status === "PARTIAL" ? colors.warningBg : colors.errorBg,
                          color: p.status === "PARTIAL" ? colors.warningText : colors.errorText,
                          padding: "3px 9px", borderRadius: 20, fontSize: 10, fontFamily: fonts.mono, fontWeight: 700,
                          border: `1px solid ${p.status === "PARTIAL" ? colors.warning : colors.error}44`,
                        }}>
                          {MONTHS[p.month]} {p.year} · {PKR(p.amount - (p.paidAmount || 0))}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Total footer */}
        {filtered.length > 0 && summary && (
          <div style={{ background: colors.deep, borderRadius: 12, padding: "14px 20px", marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
              Showing {filtered.length} of {students.length} students with outstanding fees
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 16, fontWeight: 700, color: "#fca5a5" }}>
              Total: {PKR(filtered.reduce((a, s) => a + s.totalDue, 0))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
