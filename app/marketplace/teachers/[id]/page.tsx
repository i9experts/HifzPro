"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Slot { id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string }
interface Review { id: string; rating: number; comment: string | null; createdAt: string; parent: { user: { name: string } } }
interface SimilarTeacher {
  id: string; gender: string; hourlyRate: number | null; currency: string;
  avgRating: number | null; totalReviews: number; user: { name: string; avatar: string | null };
}
interface Teacher {
  id: string; gender: string; residenceCountry: string; bio: string | null; qualification: string | null;
  qiraat: string | null; yearsExperience: number | null; languages: string[]; countriesServed: string[];
  ageGroupsTaught: string[]; programsOffered: string[]; hourlyRate: number | null; currency: string;
  verificationTier: string; avgRating: number | null; totalReviews: number;
  user: { name: string; avatar: string | null };
  availabilitySlots: Slot[];
  reviews: Review[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const AGE_GROUP_OPTIONS = ["5-8", "9-12", "13-17", "Adult"];
const PROGRAM_OPTIONS = [
  { id: "HIFZ", label: "Hifz (memorization)" },
  { id: "NAZRA", label: "Nazrah (reading)" },
  { id: "TAJWEED", label: "Tajweed" },
  { id: "GIRDAAN", label: "Girdaan (revision)" },
];

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: "6px 12px", borderRadius: 999, fontSize: 12.5, cursor: "pointer",
    border: `1.5px solid ${active ? colors.primary : colors.n200}`,
    background: active ? colors.green50 : colors.white,
    color: active ? colors.primary : colors.n600,
    fontWeight: active ? 700 : 500,
  };
}

export default function TeacherPublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saved, setSaved] = useState(false);
  const [similar, setSimilar] = useState<SimilarTeacher[]>([]);
  const [childAge, setChildAge] = useState("");
  const [program, setProgram] = useState("");
  const [preferredDays, setPreferredDays] = useState<number[]>([]);
  const [goal, setGoal] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const toggleDay = (d: number) => setPreferredDays(ds => ds.includes(d) ? ds.filter(x => x !== d) : [...ds, d].sort());

  useEffect(() => {
    fetch(`/api/public/marketplace/teachers/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setTeacher(d.data.teacher); else setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  // Silently ignore 401 — only matters once a parent is signed in.
  useEffect(() => {
    fetch("/api/marketplace/saved-teachers")
      .then(r => r.json())
      .then(d => { if (d.success) setSaved((d.data.teacherIds as string[]).includes(id)); })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!teacher || teacher.programsOffered.length === 0) return;
    const sp = new URLSearchParams({ program: teacher.programsOffered[0] });
    fetch(`/api/public/marketplace/teachers?${sp.toString()}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSimilar((d.data.teachers as SimilarTeacher[]).filter(t => t.id !== id).slice(0, 3)); })
      .catch(() => {});
  }, [teacher, id]);

  const toggleSave = async () => {
    try {
      if (saved) {
        const res = await fetch(`/api/marketplace/saved-teachers?teacherId=${id}`, { method: "DELETE" });
        if (res.status === 401) { window.location.href = `/marketplace/join/parent?next=/marketplace/teachers/${id}`; return; }
        setSaved(false);
      } else {
        const res = await fetch("/api/marketplace/saved-teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherId: id }) });
        if (res.status === 401) { window.location.href = `/marketplace/join/parent?next=/marketplace/teachers/${id}`; return; }
        setSaved(true);
      }
    } catch { /* best-effort */ }
  };

  const composedMessage = () => {
    const lines: string[] = [];
    if (childAge) lines.push(`Child's age group: ${childAge}`);
    if (program) lines.push(`Program: ${PROGRAM_OPTIONS.find(p => p.id === program)?.label || program}`);
    if (preferredDays.length) lines.push(`Preferred days: ${preferredDays.map(d => DAY_FULL[d]).join(", ")}`);
    const details = lines.length ? lines.map(l => `• ${l}`).join("\n") + "\n\n" : "";
    return `${details}${goal.trim()}`;
  };

  const canSend = childAge && program && goal.trim().length > 0;

  const sendInquiry = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: id, message: composedMessage() }),
      });
      const data = await res.json();
      if (!data.success) {
        if (res.status === 401) { window.location.href = `/marketplace/join/parent?next=/marketplace/teachers/${id}`; return; }
        setError(data.error || "Failed to send message");
        return;
      }
      setSent(true);
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: colors.n500 }}>Loading…</div>;
  if (notFound || !teacher) return <div style={{ padding: 40, textAlign: "center", color: colors.errorText }}>Teacher not found.</div>;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      <header style={{ background: colors.primary, padding: "18px 20px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/marketplace" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <HifzMark size={28} />
            <span style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700 }}>← Back to directory</span>
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 18 }}>
        <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 18, padding: 22, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: colors.green100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, overflow: "hidden" }}>
            {teacher.user.avatar ? <img src={teacher.user.avatar} alt={teacher.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (teacher.gender === "FEMALE" ? "👩" : "👨")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: colors.n800 }}>{teacher.user.name}</div>
            <div style={{ fontSize: 13, color: colors.n600, marginTop: 4 }}>
              {teacher.qiraat && <>{teacher.qiraat} · </>}{teacher.residenceCountry}
              {teacher.yearsExperience != null && <> · {teacher.yearsExperience} yrs experience</>}
            </div>
            {teacher.avgRating != null && <div style={{ fontSize: 13, color: colors.n600, marginTop: 4 }}>⭐ {teacher.avgRating.toFixed(1)} ({teacher.totalReviews} reviews)</div>}
          </div>
          <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            <button onClick={toggleSave} aria-label="Save teacher"
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 22, padding: 0, lineHeight: 1, color: saved ? "#e0245e" : colors.n300 }}>
              {saved ? "♥" : "♡"}
            </button>
            {teacher.hourlyRate != null && (
              <div>
                <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: colors.primary }}>{teacher.currency} {teacher.hourlyRate}</div>
                <div style={{ fontSize: 11, color: colors.n500 }}>per hour</div>
              </div>
            )}
          </div>
        </div>

        {teacher.bio && (
          <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 8, color: colors.n800 }}>About</div>
            <div style={{ fontSize: 14, color: colors.n700, lineHeight: 1.6 }}>{teacher.bio}</div>
          </div>
        )}

        <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 18, display: "grid", gap: 10 }}>
          <div><strong style={{ fontSize: 13 }}>Programs:</strong> <span style={{ fontSize: 13 }}>{teacher.programsOffered.join(", ") || "—"}</span></div>
          <div><strong style={{ fontSize: 13 }}>Age groups:</strong> <span style={{ fontSize: 13 }}>{teacher.ageGroupsTaught.join(", ") || "—"}</span></div>
          <div><strong style={{ fontSize: 13 }}>Languages:</strong> <span style={{ fontSize: 13 }}>{teacher.languages.join(", ") || "—"}</span></div>
          <div><strong style={{ fontSize: 13 }}>Teaches students in:</strong> <span style={{ fontSize: 13 }}>{teacher.countriesServed.join(", ") || "—"}</span></div>
          {teacher.qualification && <div><strong style={{ fontSize: 13 }}>Credentials:</strong> <span style={{ fontSize: 13 }}>{teacher.qualification}</span></div>}
        </div>

        {teacher.availabilitySlots.length > 0 && (
          <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Weekly availability</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {teacher.availabilitySlots.map(s => (
                <span key={s.id} style={{ fontSize: 12, background: colors.green50, color: colors.primary, padding: "4px 10px", borderRadius: 999 }}>
                  {DAYS[s.dayOfWeek]} {s.startTime}–{s.endTime} ({s.timezone})
                </span>
              ))}
            </div>
          </div>
        )}

        {teacher.reviews.length > 0 && (
          <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 18 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
              Reviews {teacher.avgRating != null && <span style={{ color: colors.n500, fontWeight: 400 }}>· ⭐ {teacher.avgRating.toFixed(1)} from {teacher.totalReviews}</span>}
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {teacher.reviews.map(r => (
                <div key={r.id} style={{ borderBottom: `1px solid ${colors.n100}`, paddingBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13 }}>{r.parent.user.name}</span>
                    <span style={{ color: colors.gold, fontSize: 13 }}>{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  </div>
                  {r.comment && <div style={{ fontSize: 13, color: colors.n700, marginTop: 4 }}>{r.comment}</div>}
                  <div style={{ fontSize: 11, color: colors.n400, marginTop: 2 }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Message this teacher</div>
          <div style={{ fontSize: 12.5, color: colors.n500, marginBottom: 14 }}>A few quick details help the teacher reply with a real answer right away.</div>
          {sent ? (
            <div style={{ color: colors.successText }}>Your message has been sent — the teacher will reply from their inbox.</div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: colors.n600, display: "block", marginBottom: 6 }}>Child's age group</label>
                  <select value={childAge} onChange={e => setChildAge(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 13, background: colors.white }}>
                    <option value="">Select…</option>
                    {AGE_GROUP_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: colors.n600, display: "block", marginBottom: 6 }}>Program</label>
                  <select value={program} onChange={e => setProgram(e.target.value)}
                    style={{ width: "100%", padding: "9px 10px", borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 13, background: colors.white }}>
                    <option value="">Select…</option>
                    {PROGRAM_OPTIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: colors.n600, display: "block", marginBottom: 6 }}>Preferred days (optional)</label>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {DAYS.map((d, i) => (
                    <span key={d} style={chipStyle(preferredDays.includes(i))} onClick={() => toggleDay(i)}>{d}</span>
                  ))}
                </div>
              </div>

              <label style={{ fontSize: 12, fontWeight: 600, color: colors.n600, display: "block", marginBottom: 6 }}>Tell the teacher a bit more</label>
              <textarea
                value={goal}
                onChange={e => setGoal(e.target.value)}
                rows={3}
                placeholder="Your child's current level, your goals, and anything else the teacher should know…"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 14, marginBottom: 10 }}
              />
              {error && <div style={{ color: colors.errorText, fontSize: 13, marginBottom: 8 }}>{error}</div>}
              <button
                disabled={sending || !canSend}
                onClick={sendInquiry}
                style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700, cursor: canSend ? "pointer" : "not-allowed", opacity: canSend ? 1 : 0.6 }}
              >
                {sending ? "Sending…" : "Send message"}
              </button>
            </>
          )}
        </div>

        {similar.length > 0 && (
          <div>
            <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 10, color: colors.n700 }}>Similar teachers</div>
            <div style={{ display: "grid", gap: 10 }}>
              {similar.map(t => (
                <Link key={t.id} href={`/marketplace/teachers/${t.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 14, display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: colors.green100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, overflow: "hidden" }}>
                      {t.user.avatar ? <img src={t.user.avatar} alt={t.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (t.gender === "FEMALE" ? "👩" : "👨")}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: colors.n800 }}>{t.user.name}</div>
                      {t.avgRating != null && <div style={{ fontSize: 12, color: colors.n600 }}>⭐ {t.avgRating.toFixed(1)} ({t.totalReviews})</div>}
                    </div>
                    {t.hourlyRate != null && <div style={{ fontSize: 13, fontWeight: 700, color: colors.primary }}>{t.currency} {t.hourlyRate}/hr</div>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
