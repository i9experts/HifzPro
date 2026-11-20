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
interface Reference { id: string; name: string; relationship: string; phone: string | null; email: string | null }
interface VerificationRequest {
  id: string; verificationTier: string; verificationStatus: string;
  applicationSubmittedAt: string | null; verificationRejectionReason: string | null;
  dateOfBirth: string | null; nationality: string | null;
  govIdType: string | null; govIdDocumentUrl: string | null;
  qualification: string | null; educationDocumentUrl: string | null;
  ijazahChain: string | null; ijazahIssuer: string | null; ijazahDocumentUrl: string | null;
  videoIntroUrl: string | null;
  references: Reference[];
  user: { name: string; email: string | null; phone: string | null };
}
interface Dispute {
  id: string; reason: string; status: "OPEN" | "RESOLVED" | "DISMISSED"; resolution: string | null; createdAt: string;
  raisedBy: { name: string; email: string | null; role: string };
  resolvedBy: { name: string } | null;
  booking: {
    id: string; inquiryId: string; dayOfWeek: number; startTime: string; endTime: string; status: string;
    teacher: { user: { name: string } }; parent: { user: { name: string } };
  };
}
interface Booking {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
  program: string | null; hourlyRate: number | null; currency: string; status: string; updatedAt: string;
  amountCharged: number | null; platformFeeAmount: number | null; stripePaymentIntentId: string | null;
  studentName: string | null; provisionedStudentId: string | null;
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
  REFUNDED:          { color: "#f59e0b", bg: "#431d00" },
};

function selectStyle(): React.CSSProperties {
  return { padding: "6px 8px", background: "#111827", border: "1px solid #1f2937", borderRadius: 6, fontSize: 11, fontFamily: fonts.heading, color: "#d1d5db", outline: "none" };
}

export default function AdminMarketplacePage() {
  const [tab, setTab] = useState<"teachers" | "bookings" | "verification" | "disputes">("teachers");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [verifRequests, setVerifRequests] = useState<VerificationRequest[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  const loadDisputes = useCallback(() => {
    fetch("/api/superadmin/marketplace/disputes").then(r => r.json()).then(d => { if (d.success) setDisputes(d.data.disputes); });
  }, []);
  useEffect(() => { if (tab === "disputes") loadDisputes(); }, [tab, loadDisputes]);

  const resolveDispute = async (id: string, action: "RESOLVE" | "DISMISS") => {
    const resolution = prompt(action === "RESOLVE" ? "How was this resolved?" : "Why is this being dismissed?");
    if (!resolution) return;
    const res = await fetch(`/api/superadmin/marketplace/disputes/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, resolution }),
    });
    const data = await res.json();
    if (!data.success) alert(data.error || "Failed to update dispute");
    loadDisputes();
  };

  const loadVerifRequests = useCallback(() => {
    fetch("/api/superadmin/marketplace/verification-requests").then(r => r.json()).then(d => { if (d.success) setVerifRequests(d.data.requests); });
  }, []);
  useEffect(() => { if (tab === "verification") loadVerifRequests(); }, [tab, loadVerifRequests]);

  const [tierPick, setTierPick] = useState<Record<string, string>>({});

  const reviewVerification = async (teacherId: string, action: "APPROVE" | "REJECT") => {
    let rejectionReason: string | undefined;
    let tier: string | undefined;
    if (action === "REJECT") {
      rejectionReason = prompt("Why is this application being rejected?") || undefined;
      if (!rejectionReason) return;
    } else {
      tier = tierPick[teacherId] || "ID_VERIFIED";
      if (!confirm(`Approve this application and grant "${TIER_LABELS[tier]}"?`)) return;
    }
    const res = await fetch(`/api/superadmin/marketplace/verification-requests/${teacherId}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, tier, rejectionReason }),
    });
    const data = await res.json();
    if (!data.success) alert(data.error || "Failed to review application");
    loadVerifRequests();
  };

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

  const confirmPayment = async (id: string, existingStudentName: string | null) => {
    if (!confirm("Confirm that payment for this booking has been collected?")) return;
    // The Stripe "Pay Now" path always collects this first; a manual
    // confirmation (wire transfer, etc.) needs it too before the booking
    // can be auto-provisioned into a tracked Student record.
    let studentName = existingStudentName;
    if (!studentName) {
      studentName = prompt("Student's name (needed to create their record) — leave blank to skip for now:");
    }
    await fetch(`/api/superadmin/marketplace/bookings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CONFIRM_PAYMENT", ...(studentName ? { studentName } : {}) }),
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

  const refundBooking = async (id: string, force = false) => {
    if (!confirm(force ? "This is past the 24h full-refund window — refund anyway as an admin override?" : "Refund this booking's payment?")) return;
    const res = await fetch(`/api/superadmin/marketplace/bookings/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "REFUND", force }),
    });
    const data = await res.json();
    if (!data.success && res.status === 409 && !force) {
      refundBooking(id, true);
      return;
    }
    if (!data.success) alert(data.error || "Refund failed");
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
          {(["teachers", "bookings", "verification", "disputes"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: fonts.heading, fontWeight: 700, fontSize: 12,
                background: tab === t ? colors.primary : "#111827", color: tab === t ? "white" : "#9ca3af" }}>
              {t === "teachers" ? `Teachers (${teachers.length})`
                : t === "bookings" ? `Bookings (${bookings.length})`
                : t === "verification" ? `Verification (${verifRequests.filter(r => r.verificationStatus === "PENDING").length})`
                : `Disputes (${disputes.filter(d => d.status === "OPEN").length})`}
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
                <option value="REFUNDED">Refunded</option>
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
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {b.program && <>{b.program} · </>}{DAYS[b.dayOfWeek]} {b.startTime}–{b.endTime} ({b.timezone})
                      {b.provisionedStudentId ? (
                        <div style={{ marginTop: 3 }}>
                          <Link href={`/dashboard/admin/students/${b.provisionedStudentId}`} style={{ color: "#60a5fa", fontSize: 10, textDecoration: "none" }}>
                            → {b.studentName || "Student"} record
                          </Link>
                        </div>
                      ) : b.studentName ? (
                        <div style={{ marginTop: 3, fontSize: 10, color: "#6b7280" }}>for {b.studentName}</div>
                      ) : null}
                    </div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>
                      {b.amountCharged != null
                        ? <>{b.currency} {b.amountCharged.toFixed(2)} paid{b.platformFeeAmount != null && <div style={{ fontSize: 9, color: "#6b7280" }}>fee {b.currency} {b.platformFeeAmount.toFixed(2)}</div>}</>
                        : b.hourlyRate != null ? `${b.currency} ${b.hourlyRate}/hr` : "—"}
                    </div>
                    <span style={{ background: st.bg, color: st.color, padding: "3px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: fonts.heading, width: "fit-content" }}>{b.status.replace("_", " ")}</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {b.status === "ACCEPTED" && (
                        <button onClick={() => confirmPayment(b.id, b.studentName)} style={{ padding: "4px 10px", borderRadius: 6, background: "#052e16", color: "#34d399", border: "none", fontSize: 10, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                          Mark paid
                        </button>
                      )}
                      {(b.status === "PROPOSED" || b.status === "ACCEPTED") && (
                        <button onClick={() => cancelBooking(b.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "#1f2937", color: "#9ca3af", border: "none", fontSize: 10, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                          Cancel
                        </button>
                      )}
                      {b.status === "PAYMENT_CONFIRMED" && (
                        <button onClick={() => refundBooking(b.id)} style={{ padding: "4px 10px", borderRadius: 6, background: "#431d00", color: "#f59e0b", border: "none", fontSize: 10, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                          Refund
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

        {!loading && tab === "verification" && (
          <div style={{ display: "grid", gap: 10 }}>
            {verifRequests.map(r => {
              const statusStyle = r.verificationStatus === "PENDING" ? { bg: "#431d00", color: "#d97706" }
                : r.verificationStatus === "APPROVED" ? { bg: "#052e16", color: "#34d399" }
                : { bg: "#7f1d1d", color: "#fca5a5" };
              return (
                <div key={r.id} style={{ background: "#111827", borderRadius: 12, border: "1px solid #1f2937", padding: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: "white" }}>{r.user.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "#4b5563", marginTop: 2 }}>{r.user.email || "—"} · {r.user.phone || "—"}</div>
                      <div style={{ fontSize: 10, color: "#4b5563", marginTop: 2 }}>Submitted {r.applicationSubmittedAt ? new Date(r.applicationSubmittedAt).toLocaleString() : "—"}</div>
                    </div>
                    <span style={{ padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: fonts.heading, background: statusStyle.bg, color: statusStyle.color }}>{r.verificationStatus}</span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, fontSize: 12 }}>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "#4b5563", marginBottom: 4 }}>IDENTITY</div>
                      <div style={{ color: "#d1d5db" }}>DOB: {r.dateOfBirth ? new Date(r.dateOfBirth).toLocaleDateString() : "—"}</div>
                      <div style={{ color: "#d1d5db" }}>Nationality: {r.nationality || "—"}</div>
                      <div style={{ color: "#d1d5db" }}>ID type: {r.govIdType || "—"}</div>
                      {r.govIdDocumentUrl && <a href={r.govIdDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>View ID document →</a>}
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "#4b5563", marginBottom: 4 }}>EDUCATION</div>
                      <div style={{ color: "#d1d5db" }}>{r.qualification || "—"}</div>
                      {r.educationDocumentUrl && <a href={r.educationDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>View certificate →</a>}
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "#4b5563", marginBottom: 4 }}>IJAZAH / SANAD</div>
                      <div style={{ color: "#d1d5db" }}>{r.ijazahChain || "—"}</div>
                      <div style={{ color: "#9ca3af" }}>Issued by: {r.ijazahIssuer || "—"}</div>
                      {r.ijazahDocumentUrl && <a href={r.ijazahDocumentUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none" }}>View ijazah document →</a>}
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: "#4b5563", marginBottom: 4 }}>REFERENCES</div>
                      {r.references.length === 0 && <div style={{ color: "#6b7280" }}>—</div>}
                      {r.references.map(ref => (
                        <div key={ref.id} style={{ color: "#d1d5db", marginBottom: 2 }}>{ref.name} ({ref.relationship}) — {ref.phone || ref.email}</div>
                      ))}
                      {r.videoIntroUrl && <a href={r.videoIntroUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa", textDecoration: "none", display: "block", marginTop: 4 }}>▶ View video introduction →</a>}
                    </div>
                  </div>

                  {r.verificationStatus === "REJECTED" && r.verificationRejectionReason && (
                    <div style={{ fontSize: 11, color: "#fca5a5", marginTop: 12, background: "#1f1210", padding: "8px 10px", borderRadius: 6 }}>Rejected: {r.verificationRejectionReason}</div>
                  )}

                  {r.verificationStatus === "PENDING" && (
                    <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
                      <select value={tierPick[r.id] || "ID_VERIFIED"} onChange={e => setTierPick(p => ({ ...p, [r.id]: e.target.value }))} style={selectStyle()}>
                        {Object.entries(TIER_LABELS).filter(([k]) => k !== "UNVERIFIED").map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                      <button onClick={() => reviewVerification(r.id, "APPROVE")} style={{ padding: "5px 14px", borderRadius: 6, background: "#052e16", color: "#34d399", border: "none", fontSize: 11, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                        Approve
                      </button>
                      <button onClick={() => reviewVerification(r.id, "REJECT")} style={{ padding: "5px 14px", borderRadius: 6, background: "#431d00", color: "#f59e0b", border: "none", fontSize: 11, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {verifRequests.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#6b7280", background: "#111827", borderRadius: 12, border: "1px solid #1f2937" }}>No applications submitted yet.</div>}
          </div>
        )}

        {!loading && tab === "disputes" && (
          <div style={{ display: "grid", gap: 10 }}>
            {disputes.map(d => (
              <div key={d.id} style={{ background: "#111827", borderRadius: 12, border: "1px solid #1f2937", padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: "white" }}>
                      {d.booking.teacher.user.name} ↔ {d.booking.parent.user.name}
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, color: "#4b5563", marginTop: 2 }}>
                      Raised by {d.raisedBy.name} ({d.raisedBy.role === "MARKETPLACE_TEACHER" ? "teacher" : "parent"}) · {new Date(d.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <span style={{
                    padding: "3px 9px", borderRadius: 5, fontSize: 9, fontWeight: 700, fontFamily: fonts.heading,
                    background: d.status === "OPEN" ? "#431d00" : d.status === "RESOLVED" ? "#052e16" : "#1f2937",
                    color: d.status === "OPEN" ? "#d97706" : d.status === "RESOLVED" ? "#34d399" : "#9ca3af",
                  }}>{d.status}</span>
                </div>
                <div style={{ fontSize: 13, color: "#d1d5db", marginTop: 10, background: "#0f172a", borderRadius: 8, padding: "10px 12px" }}>{d.reason}</div>
                {d.resolution && (
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                    <strong style={{ color: "#6b7280" }}>Resolution</strong> ({d.resolvedBy?.name}): {d.resolution}
                  </div>
                )}
                {d.status === "OPEN" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => resolveDispute(d.id, "RESOLVE")} style={{ padding: "5px 12px", borderRadius: 6, background: "#052e16", color: "#34d399", border: "none", fontSize: 11, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                      Mark resolved
                    </button>
                    <button onClick={() => resolveDispute(d.id, "DISMISS")} style={{ padding: "5px 12px", borderRadius: 6, background: "#1f2937", color: "#9ca3af", border: "none", fontSize: 11, fontWeight: 700, fontFamily: fonts.heading, cursor: "pointer" }}>
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            ))}
            {disputes.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#6b7280", background: "#111827", borderRadius: 12, border: "1px solid #1f2937" }}>No disputes raised yet.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
