"use client";
import { useState, useEffect, useCallback } from "react";
import { colors, fonts } from "@/lib/tokens";

interface Booking {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
  program: string | null; hourlyRate: number | null; currency: string; notes: string | null;
  status: "PROPOSED" | "ACCEPTED" | "DECLINED" | "PAYMENT_CONFIRMED" | "CANCELLED";
  proposedById: string;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PROGRAMS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];

function inputStyle(): React.CSSProperties {
  return { padding: "9px 10px", borderRadius: 8, border: `1.5px solid ${colors.n200}`, fontSize: 13, fontFamily: fonts.body };
}

export default function BookingPanel({ inquiryId, myUserId }: { inquiryId: string; myUserId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ dayOfWeek: 0, startTime: "16:00", endTime: "17:00", timezone: "Asia/Karachi", program: "HIFZ", hourlyRate: "", currency: "USD", notes: "" });

  const load = useCallback(() => {
    fetch(`/api/marketplace/inquiries/${inquiryId}/bookings`)
      .then(r => r.json())
      .then(d => { if (d.success) setBookings(d.data.bookings); })
      .finally(() => setLoading(false));
  }, [inquiryId]);

  useEffect(load, [load]);

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

  if (loading) return null;

  const latest = bookings[0];
  const canProposeNew = !latest || latest.status === "DECLINED" || latest.status === "CANCELLED";

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
          {latest.status === "ACCEPTED" && (
            <div style={{ fontSize: 12, color: colors.successText, marginTop: 8, fontWeight: 600 }}>
              ✅ Both sides agreed — HifzPro will follow up to collect payment and confirm the arrangement.
            </div>
          )}
          {latest.status === "PAYMENT_CONFIRMED" && (
            <div style={{ fontSize: 12, color: colors.successText, marginTop: 8, fontWeight: 600 }}>
              ✅ Payment confirmed — this arrangement is active.
            </div>
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
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <select value={form.dayOfWeek} onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))} style={{ ...inputStyle(), width: 130 }}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))} style={{ ...inputStyle(), width: 100 }} />
            <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))} style={{ ...inputStyle(), width: 100 }} />
            <input value={form.timezone} onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))} placeholder="Timezone" style={{ ...inputStyle(), width: 130 }} />
          </div>
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
