"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Teacher {
  id: string; gender: string; residenceCountry: string; qiraat: string | null;
  yearsExperience: number | null; verificationTier: string; isListed: boolean; isActive: boolean;
  avgRating: number | null; totalReviews: number; createdAt: string;
  user: { id: string; name: string; email: string | null; phone: string | null };
}
interface Booking {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
  program: string | null; hourlyRate: number | null; currency: string; status: string; updatedAt: string;
  teacher: { user: { name: string; email: string | null } };
  parent: { user: { name: string; email: string | null } };
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIER_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified", ID_VERIFIED: "ID Verified", CREDENTIAL_VERIFIED: "Credential Verified", BACKGROUND_CHECKED: "Background Checked",
};
const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  PROPOSED:          { color: "#d97706", bg: "#431d00" },
  ACCEPTED:          { color: "#60a5fa", bg: "#1e3a5f" },
  PAYMENT_CONFIRMED: { color: "#34d399", bg: "#052e16" },
  DECLINED:          { color: "#9ca3af", bg: "#1f2937" },
  CANCELLED:         { color: "#9ca3af", bg: "#1f2937" },
};

function selectStyle(): React.CSSProperties {
  return { padding: "6px 8px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, fontSize: 11, fontFamily: fonts.heading, color: "#d1d5db", outline: "none" };
}

export default function AdminMarketplacePage() {
  const [tab, setTab] = useState<"teachers" | "bookings">("teachers");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadTeachers = useCallback(() => {
    fetch("/api/superadmin/marketplace/teachers").then(r => r.json()).then(d => { if (d.success) setTeachers(d.data.teachers); });
  }, []);
  const loadBookings = useCallback(() => {
    const qs = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/superadmin/marketplace/bookings${qs}`).then(r => r.json()).then(d => { if (d.success) setBookings(d.data.bookings); });
  }, [statusFilter]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/superadmin/marketplace/teachers").then(r => r.json()),
      fetch("/api/superadmin/marketplace/bookings").then(r => r.json()),
    ]).then(([t, b]) => {
      if (t.success) setTeachers(t.data.teachers);
      if (b.success) setBookings(b.data.bookings);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { if (tab === "bookings") loadBookings(); }, [statusFilter, tab, loadBookings]);

  const updateTeacher = async (id: string, patch: Partial<Pick<Teacher, "verificationTier" | "isListed" | "isActive">>) => {
    await fetch(`/api/superadmin/marketplace/teachers/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
    });
    loadTeachers();
  };

  const confirmPayment = async (id: string) => {
    if (!confirm("Confirm that payment for this booking has been collected?")) return;
    await fetch(`/api/superadmin/marketplace/bookings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "CONFIRM_PAYMENT" }),
    });
    loadBookings();
  };

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking arrangement?")) return;
    await fetch(`/api/superadmin/marketplace/bookings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "CANCEL" }),
    });
    loadBookings();
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1a" }}>
      <nav style={{ background: "#111827", borderBottom: "1px solid #1f2937", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Link href="/superadmin" style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none" }}>
            <HifzMark size={36} primary="#10B981" gold={colors.gold} />
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 18, fontWeight: 700, color: "white", lineHeight: 1 }}>HifzPro</div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "#10B981", letterSpacing: 2, marginTop: 1 }}>MARKETPLACE OVERSIGHT</div>
            </div>
          </Link>
        </div>
        <Link href="/superadmin" style={{ padding: "6px 14px", borderRadius: 7, background: "#1f2937", border: "1px solid #374151", color: "#9ca3af", fontSize: 11, textDecoration: "none", fontFamily: fonts.heading }}>← Back to SaaS Control</Link>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["teachers", "bookings"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: fonts.heading, fontWeight: 700, fontSize: 12,
                background: tab === t ? colors.primary : "#111827", color: tab === t ? "white" : "#9ca3af" }}>
              {t === "teachers" ? `Teachers (${teachers.length})` : `Bookings (${bookings.length})`}
            </button>
          ))}
        </div>

        {loading && <div style={{ color: "#6b7280", textAlign: "center", padding: 40 }}>Loading…</div>}

        {!loading && tab === "teachers" && (
          <div style={{ background: "#111827", borderRadius: 12, overflow: "hidden", border: "1px solid #1f2937" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 80px 80px", gap: 0, padding: "10px 16px", background: "#0f172a", borderBottom: "1px solid #1f2937" }}>
              {["Teacher", "Country", "Verification", "Status", "Listed", "Rating"].map((h, i) => (
                <div key={i} style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "#4b5563" }}>{h}</div>
              ))}
            </div>
            {teachers.map((t, idx) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 80px 80px", gap: 0, padding: "13px 16px", borderBottom: idx < teachers.length - 1 ? "1px solid #1f2937" : "none", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: "white" }}>{t.user.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "#4b5563", marginTop: 1 }}>{t.user.email || "—"} · {t.gender === "FEMALE" ? "Mu'allimah" : "Qari"}</div>
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>{t.residenceCountry}</div>
                <select value={t.verificationTier} onChange={e => updateTeacher(t.id, { verificationTier: e.target.value as any })} style={selectStyle()}>
                  {Object.entries(TIER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => updateTeacher(t.id, { isActive: !t.isActive })}
                    style={{ padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer", border: "none", background: t.isActive ? "#052e16" : "#7f1d1d", color: t.isActive ? "#34d399" : "#fca5a5" }}>
                    {t.isActive ? "ACTIVE" : "SUSPENDED"}
                  </button>
                </div>
                <button onClick={() => updateTeacher(t.id, { isListed: !t.isListed })}
                  style={{ padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer", border: "none", background: t.isListed ? "#1e3a5f" : "#1f2937", color: t.isListed ? "#60a5fa" : "#6b7280" }}>
                  {t.isListed ? "LISTED" : "UNLISTED"}
                </button>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{t.avgRating != null ? `⭐ ${t.avgRating.toFixed(1)}` : "—"}</div>
              </div>
            ))}
            {teachers.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>No teachers have signed up yet.</div>}
          </div>
        )}

        {!loading && tab === "bookings" && (
          <div>
            <div style={{ marginBottom: 14 }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle()}>
                <option value="">All statuses</option>
                <option value="PROPOSED">Proposed</option>
                <option value="ACCEPTED">Accepted (awaiting payment)</option>
                <option value="PAYMENT_CONFIRMED">Payment confirmed</option>
                <option value="DECLINED">Declined</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div style={{ background: "#111827", borderRadius: 12, overflow: "hidden", border: "1px solid #1f2937" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 90px 110px 160px", gap: 0, padding: "10px 16px", background: "#0f172a", borderBottom: "1px solid #1f2937" }}>
                {["Teacher", "Parent", "Schedule", "Rate", "Status", "Actions"].map((h, i) => (
                  <div key={i} style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "#4b5563" }}>{h}</div>
                ))}
              </div>
              {bookings.map((b, idx) => {
                const st = STATUS_COLOR[b.status] || STATUS_COLOR.CANCELLED;
                return (
                  <div key={b.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.2fr 90px 110px 160px", gap: 0, padding: "13px 16px", borderBottom: idx < bookings.length - 1 ? "1px solid #1f2937" : "none", alignItems: "center" }}>
                    <div style={{ fontSize: 12, color: "white" }}>{b.teacher.user.name}</div>
                    <div style={{ fontSize: 12, color: "white" }}>{b.parent.user.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{b.program && <>{b.program} · </>}{DAYS[b.dayOfWeek]} {b.startTime}–{b.endTime} ({b.timezone})</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{b.hourlyRate != null ? `${b.currency} ${b.hourlyRate}/hr` : "—"}</div>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: fonts.heading, width: "fit-content" }}>{b.status.replace("_", " ")}</span>
                    <div style={{ display: "flex", gap: 6 }}>
                      {b.status === "ACCEPTED" && (
                        <button onClick={() => confirmPayment(b.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "#052e16", color: "#34d399", border: "none", fontSize: 10, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                          Mark paid
                        </button>
                      )}
                      {(b.status === "PROPOSED" || b.status === "ACCEPTED") && (
                        <button onClick={() => cancelBooking(b.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "#1f2937", color: "#9ca3af", border: "none", fontSize: 10, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {bookings.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#6b7280" }}>No bookings yet.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
