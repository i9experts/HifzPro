"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Teacher {
  id: string; gender: string; residenceCountry: string; bio: string | null; qiraat: string | null;
  yearsExperience: number | null; hourlyRate: number | null; currency: string; verificationTier: string;
  avgRating: number | null; totalReviews: number; isListed: boolean; isActive: boolean;
  user: { name: string; avatar: string | null };
}

export default function SavedTeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    fetch("/api/marketplace/saved-teachers")
      .then(r => r.json())
      .then(d => { if (d.success) setTeachers(d.data.teachers); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const unsave = async (teacherId: string) => {
    await fetch(`/api/marketplace/saved-teachers?teacherId=${teacherId}`, { method: "DELETE" });
    setTeachers(ts => ts.filter(t => t.id !== teacherId));
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      <header style={{ background: colors.primary, padding: "18px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/dashboard/family" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <HifzMark size={28} />
          <span style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700 }}>← Saved teachers</span>
        </Link>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        {loading && <div style={{ color: colors.n500, textAlign: "center", padding: 30 }}>Loading…</div>}
        {!loading && teachers.length === 0 && (
          <div style={{ color: colors.n500, textAlign: "center", padding: 30, background: colors.white, borderRadius: 14 }}>
            No saved teachers yet. Tap the ♡ on a teacher's profile to keep them here.
          </div>
        )}
        <div style={{ display: "grid", gap: 14 }}>
          {teachers.map(t => (
            <div key={t.id} style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
              <Link href={`/marketplace/teachers/${t.id}`} style={{ display: "flex", gap: 14, flex: 1, textDecoration: "none" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: colors.green100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, overflow: "hidden" }}>
                  {t.user.avatar ? <img src={t.user.avatar} alt={t.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (t.gender === "FEMALE" ? "👩" : "👨")}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: colors.n800 }}>{t.user.name}</span>
                    {!t.isListed && <span style={{ fontSize: 11, fontWeight: 700, color: colors.n500, background: colors.n100, padding: "2px 8px", borderRadius: 999 }}>Not currently listed</span>}
                    {t.avgRating != null && <span style={{ fontSize: 13, color: colors.n600 }}>⭐ {t.avgRating.toFixed(1)} ({t.totalReviews})</span>}
                  </div>
                  <div style={{ fontSize: 13, color: colors.n600, marginTop: 4 }}>
                    {t.qiraat && <>{t.qiraat} · </>}{t.residenceCountry}{t.yearsExperience != null && <> · {t.yearsExperience} yrs experience</>}
                  </div>
                </div>
              </Link>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {t.hourlyRate != null && <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: colors.primary }}>{t.currency} {t.hourlyRate}/hr</div>}
                <button onClick={() => unsave(t.id)} style={{ marginTop: 6, border: "none", background: "none", color: colors.n500, fontSize: 12, cursor: "pointer", textDecoration: "underline" }}>Remove</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
