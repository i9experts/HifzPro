"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Slot { id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string }
interface Teacher {
  id: string; gender: string; residenceCountry: string; bio: string | null; qualification: string | null;
  qiraat: string | null; yearsExperience: number | null; languages: string[]; countriesServed: string[];
  ageGroupsTaught: string[]; programsOffered: string[]; hourlyRate: number | null; currency: string;
  verificationTier: string; avgRating: number | null; totalReviews: number;
  user: { name: string; avatar: string | null };
  availabilitySlots: Slot[];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function TeacherPublicProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/public/marketplace/teachers/${id}`)
      .then(r => r.json())
      .then(d => { if (d.success) setTeacher(d.data.teacher); else setNotFound(true); })
      .finally(() => setLoading(false));
  }, [id]);

  const sendInquiry = async () => {
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: id, message }),
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
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: colors.green100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
            {teacher.gender === "FEMALE" ? "👩" : "👨"}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: colors.n800 }}>{teacher.user.name}</div>
            <div style={{ fontSize: 13, color: colors.n600, marginTop: 4 }}>
              {teacher.qiraat && <>{teacher.qiraat} · </>}{teacher.residenceCountry}
              {teacher.yearsExperience != null && <> · {teacher.yearsExperience} yrs experience</>}
            </div>
            {teacher.avgRating != null && <div style={{ fontSize: 13, color: colors.n600, marginTop: 4 }}>⭐ {teacher.avgRating.toFixed(1)} ({teacher.totalReviews} reviews)</div>}
          </div>
          {teacher.hourlyRate != null && (
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: colors.primary }}>{teacher.currency} {teacher.hourlyRate}</div>
              <div style={{ fontSize: 11, color: colors.n500 }}>per hour</div>
            </div>
          )}
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

        <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 18 }}>
          <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Message this teacher</div>
          {sent ? (
            <div style={{ color: colors.successText }}>Your message has been sent — the teacher will reply from their inbox.</div>
          ) : (
            <>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={3}
                placeholder="Introduce yourself and your child's level, then ask your question…"
                style={{ width: "100%", padding: 10, borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 14, marginBottom: 10 }}
              />
              {error && <div style={{ color: colors.errorText, fontSize: 13, marginBottom: 8 }}>{error}</div>}
              <button
                disabled={sending || !message.trim()}
                onClick={sendInquiry}
                style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700, cursor: "pointer" }}
              >
                {sending ? "Sending…" : "Send message"}
              </button>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
