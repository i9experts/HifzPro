"use client";
import { useState, useEffect, useCallback } from "react";
import { colors, fonts } from "@/lib/tokens";

interface Booking {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
  program: string | null; hourlyRate: number | null; currency: string; notes: string | null;
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "PAYMENT_CONFIRMED" | "CANCELLED" | "REFUNDED";
  proposedById: string;
  amountCharged: number | null;
  review: { id: string; rating: number; comment: string | null } | null;
  disputes: { id: string; reason: string; createdAt: string }[];
}
interface AvailabilitySlot {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const PROGRAMS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];

function inputStyle(): React.CSSProperties {
  return { padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, fontSize: 13, fontFamily: fonts.body };
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} onClick={() => onChange(n)} style={{ fontSize: 24, cursor: "pointer", color: n <= value ? colors.gold : colors.n200 }}>★</span>
      ))}
    </div>
  );
}

export default function BookingPanel({ inquiryId, myUserId, role }: { inquiryId: string; myUserId: string; role: "parent" | "teacher" }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [customTime, setCustomTime] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ dayOfWeek: 0, startTime: "16:00", endTime: "17:00", timezone: "Asia/Karachi", program: "HIFZ", hourlyRate: "", currency: "USD", notes: "" });
  const [sessions, setSessions] = useState(4);
  const [studentName, setStudentName] = useState("");
  const [paying, setPaying] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const load = useCallback(() => {
    fetch(`/api/marketplace/inquiries/${inquiryId}/bookings`)
      .then(r => r.json())
      .then(d => { if (d.success) { setBookings(d.data.bookings); setAvailability(d.data.availabilitySlots || []); } })
      .finally(() => setLoading(false));
  }, [inquiryId]);

  useEffect(load, [load]);

  const pickSlot = (slot: AvailabilitySlot) => {
    setForm(f => ({ ...f, dayOfWeek: slot.dayOfWeek, startTime: slot.startTime, endTime: slot.endTime, timezone: slot.timezone }));
  };

  const propose = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/inquiries/${inquiryId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : undefined }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to propose booking"); return; }
      setShowForm(false);
      load();
    } catch {
      setError("Failed to propose booking");
    } finally {
      setSaving(false);
    }
  };

  const respond = async (bookingId: string, action: "ACCEPT" | "DECLINE") => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to respond"); return; }
      load();
    } catch {
      setError("Failed to respond");
    } finally {
      setSaving(false);
    }
  };

  const pay = async (bookingId: string) => {
    if (!studentName.trim()) { setError("Enter the student's name before paying"); return; }
    setPaying(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessions, studentName: studentName.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to start payment"); return; }
      window.location.href = data.data.url;
    } catch {
      setError("Failed to start payment");
    } finally {
      setPaying(false);
    }
  };

  const submitReview = async (bookingId: string) => {
    setSubmittingReview(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: reviewComment.trim() || undefined }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to submit review"); return; }
      load();
    } catch {
      setError("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const submitDispute = async (bookingId: string) => {
    setSubmittingDispute(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/inquiries/${inquiryId}/bookings/${bookingId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: disputeReason.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to submit"); return; }
      setShowDisputeForm(false);
      setDisputeReason("");
      load();
    } catch {
      setError("Failed to submit dispute");
    } finally {
      setSubmittingDispute(false);
    }
  };

  if (loading) return null;

  const latest = bookings[0];
  const canProposeNew = !latest || ["DECLINED", "CANCELLED", "REFUNDED"].includes(latest.status);
  const slotsByDay: AvailabilitySlot[][] = Array.from({ length: 7 }, (_, d) => availability.filter(s => s.dayOfWeek === d));
  const hasAvailability = availability.length > 0;

  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
      <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>Lesson arrangement</div>

      {error && <div style={{ color: colors.errorText, fontSize: 13, marginBottom: 8 }}>{error}</div>}

      {latest && (
        <div style={{ background: colors.n50, borderRadius: 10, padding: 12, marginBottom: showForm ? 12 : 0 }}>
          <div style={{ fontSize: 13, color: colors.n800 }}>
            {latest.program && <strong>{latest.program}</strong>}{latest.program && " · "}
            {DAYS[latest.dayOfWeek]} {latest.startTime}–{latest.endTime} ({latest.timezone})
            {latest.hourlyRate != null && <> · {latest.currency} {latest.hourlyRate}/hr</>}
          </div>
          {latest.notes && <div style={{ fontSize: 12, color: colors.n600, marginTop: 4 }}>{latest.notes}</div>}

          {latest.status === "PROPOSED" && latest.proposedById === myUserId && (
            <div style={{ fontSize: 12, color: colors.warningText, marginTop: 8, fontWeight: 600 }}>Waiting for the other side to respond…</div>
          )}
          {latest.status === "PROPOSED" && latest.proposedById !== myUserId && (
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button disabled={saving} onClick={() => respond(latest.id, "ACCEPT")}
                style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Accept
              </button>
              <button disabled={saving} onClick={() => respond(latest.id, "DECLINE")}
                style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, background: colors.white, color: colors.n700, fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                Decline
              </button>
            </div>
          )}
          {latest.status === "ACCEPTED" && role === "parent" && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, color: colors.successText, fontWeight: 600, marginBottom: 8 }}>
                ✅ Both sides agreed — pay now to confirm the arrangement.
              </div>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontSize: 12, color: colors.n600, display: "block", marginBottom: 4 }}>Student's name</label>
                <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Who are these lessons for?" style={{ ...inputStyle(), width: "100%" }} />
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ fontSize: 12, color: colors.n600 }}>Pay for</label>
                <input type="number" min={1} max={52} value={sessions} onChange={e => setSessions(Math.max(1, Number(e.target.value) || 1))} style={{ ...inputStyle(), width: 60 }} />
                <label style={{ fontSize: 12, color: colors.n600 }}>lesson(s)</label>
                {latest.hourlyRate != null && (
                  <span style={{ fontSize: 12, color: colors.n500 }}>— {latest.currency} {(latest.hourlyRate * sessions).toFixed(2)} total</span>
                )}
              </div>
              <button disabled={paying || !studentName.trim()} onClick={() => pay(latest.id)}
                style={{ marginTop: 8, padding: "8px 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700, fontSize: 13, cursor: paying || !studentName.trim() ? "not-allowed" : "pointer" }}>
                {paying ? "Redirecting to payment…" : "Pay Now"}
              </button>
            </div>
          )}
          {latest.status === "ACCEPTED" && role === "teacher" && (
            <div style={{ fontSize: 12, color: colors.successText, marginTop: 8, fontWeight: 600 }}>
              ✅ Both sides agreed — waiting for the parent to complete payment.
            </div>
          )}
          {latest.status === "PAYMENT_CONFIRMED" && (
            <div style={{ fontSize: 12, color: colors.successText, marginTop: 8, fontWeight: 600 }}>
              ✅ Payment confirmed{latest.amountCharged != null && <> ({latest.currency} {latest.amountCharged.toFixed(2)})</>} — this arrangement is active.
            </div>
          )}
          {latest.status === "PAYMENT_CONFIRMED" && role === "parent" && (
            latest.review ? (
              <div style={{ marginTop: 10, fontSize: 12, color: colors.n600 }}>
                You rated this teacher: <span style={{ color: colors.gold }}>{"★".repeat(latest.review.rating)}{"☆".repeat(5 - latest.review.rating)}</span>
                {latest.review.comment && <div style={{ marginTop: 4, fontStyle: "italic" }}>"{latest.review.comment}"</div>}
              </div>
            ) : (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${colors.n200}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.n700, marginBottom: 6 }}>How are lessons going? Rate this teacher</div>
                <StarPicker value={rating} onChange={setRating} />
                <textarea value={reviewComment} onChange={e => setReviewComment(e.target.value)} rows={2} placeholder="Optional comment for other parents…"
                  style={{ width: "100%", marginTop: 8, padding: 8, borderRadius: 8, border: `1.5px solid ${colors.n200}`, fontSize: 13, fontFamily: fonts.body }} />
                <button disabled={submittingReview} onClick={() => submitReview(latest.id)}
                  style={{ marginTop: 8, padding: "7px 16px", borderRadius: 8, border: "none", background: colors.gold, color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                  {submittingReview ? "Submitting…" : "Submit review"}
                </button>
              </div>
            )
          )}
          {(latest.status === "ACCEPTED" || latest.status === "PAYMENT_CONFIRMED") && (
            latest.disputes.length > 0 ? (
              <div style={{ marginTop: 10, fontSize: 12, color: colors.warningText, fontWeight: 600 }}>
                ⏳ A problem was reported on this booking and is under review by HifzPro support.
              </div>
            ) : showDisputeForm ? (
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${colors.n200}` }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.n700, marginBottom: 6 }}>What went wrong?</div>
                <textarea value={disputeReason} onChange={e => setDisputeReason(e.target.value)} rows={3} placeholder="Describe the problem — HifzPro support will review it and follow up."
                  style={{ width: "100%", padding: 8, borderRadius: 8, border: `1.5px solid ${colors.n200}`, fontSize: 13, fontFamily: fonts.body }} />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button disabled={submittingDispute || disputeReason.trim().length < 10} onClick={() => submitDispute(latest.id)}
                    style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: colors.errorText, color: "white", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
                    {submittingDispute ? "Submitting…" : "Submit report"}
                  </button>
                  <button onClick={() => setShowDisputeForm(false)} style={{ padding: "7px 16px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, background: colors.white, color: colors.n700, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowDisputeForm(true)} style={{ marginTop: 10, border: "none", background: "none", color: colors.n500, fontSize: 11, cursor: "pointer", textDecoration: "underline" }}>
                ⚠️ Report a problem
              </button>
            )
          )}
          {latest.status === "REFUNDED" && (
            <div style={{ fontSize: 12, color: colors.n500, marginTop: 8, fontWeight: 600 }}>This booking's payment was refunded.</div>
          )}
          {latest.status === "DECLINED" && (
            <div style={{ fontSize: 12, color: colors.errorText, marginTop: 8, fontWeight: 600 }}>This proposal was declined.</div>
          )}
          {latest.status === "CANCELLED" && (
            <div style={{ fontSize: 12, color: colors.n500, marginTop: 8, fontWeight: 600 }}>This arrangement was cancelled.</div>
          )}
        </div>
      )}

      {canProposeNew && !showForm && (
        <button onClick={() => setShowForm(true)} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
          Propose a lesson time
        </button>
      )}

      {canProposeNew && showForm && (
        <div style={{ display: "grid", gap: 10, minWidth: 0 }}>
          {hasAvailability && !customTime ? (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: colors.n700, marginBottom: 8 }}>Pick from the teacher's weekly availability</div>
              <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, minWidth: 0 }}>
                {DAYS_SHORT.map((d, i) => (
                  <div key={d} style={{ minWidth: 86, flexShrink: 0 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: colors.n500, textAlign: "center", marginBottom: 4 }}>{d}</div>
                    <div style={{ display: "grid", gap: 4 }}>
                      {slotsByDay[i].length === 0 && <div style={{ fontSize: 10, color: colors.n300, textAlign: "center" }}>—</div>}
                      {slotsByDay[i].map(s => {
                        const active = form.dayOfWeek === s.dayOfWeek && form.startTime === s.startTime && form.endTime === s.endTime;
                        return (
                          <div key={s.id} onClick={() => pickSlot(s)}
                            style={{
                              fontSize: 11, textAlign: "center", padding: "6px 4px", borderRadius: 8, cursor: "pointer",
                              border: `1.5px solid ${active ? colors.primary : colors.n200}`,
                              background: active ? colors.green50 : colors.white,
                              color: active ? colors.primary : colors.n600,
                              fontWeight: active ? 700 : 500,
                            }}>
                            {s.startTime}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => setCustomTime(true)} style={{ marginTop: 8, border: "none", background: "none", color: colors.primary, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                Propose a different time instead
              </button>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))} style={{ ...inputStyle(), width: 130 }}>
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={{ ...inputStyle(), width: 100 }} />
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={{ ...inputStyle(), width: 100 }} />
                <input value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} placeholder="Timezone" style={{ ...inputStyle(), width: 130 }} />
              </div>
              {hasAvailability && (
                <button onClick={() => setCustomTime(false)} style={{ marginTop: 8, border: "none", background: "none", color: colors.primary, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>
                  ← Back to weekly availability
                </button>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={form.program} onChange={e => setForm(f => ({ ...f, program: e.target.value }))} style={inputStyle()}>
              {PROGRAMS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input type="number" min={0} value={form.hourlyRate} onChange={e => setForm(f => ({ ...f, hourlyRate: e.target.value }))} placeholder="Rate" style={{ ...inputStyle(), width: 90 }} />
            <select value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))} style={inputStyle()}>
              {["USD", "GBP", "PKR", "AED", "SAR"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes (optional)" style={inputStyle()} />
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={saving} onClick={propose} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
              Send proposal
            </button>
            <button onClick={() => setShowForm(false)} style={{ padding: "8px 16px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, background: colors.white, color: colors.n700, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
