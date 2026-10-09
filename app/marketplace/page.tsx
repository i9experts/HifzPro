"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Teacher {
  id: string; gender: string; residenceCountry: string; bio: string | null; qiraat: string | null;
  yearsExperience: number | null; languages: string[]; countriesServed: string[]; ageGroupsTaught: string[];
  programsOffered: string[]; hourlyRate: number | null; currency: string; verificationTier: string;
  avgRating: number | null; totalReviews: number;
  user: { name: string; avatar: string | null };
}

const PROGRAM_OPTIONS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];
const AGE_GROUP_OPTIONS = ["5-8", "9-12", "13-17", "Adult"];

function selectStyle(): React.CSSProperties {
  return { padding: "9px 10px", borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 13, background: colors.white, fontFamily: fonts.body };
}

function VerificationBadge({ tier }: { tier: string }) {
  if (tier === "UNVERIFIED") return null;
  const label = tier === "ID_VERIFIED" ? "ID Verified" : tier === "CREDENTIAL_VERIFIED" ? "Credential Verified" : "Background Checked";
  return <span style={{ fontSize: 11, fontWeight: 700, color: colors.successText, background: colors.successBg, padding: "2px 8px", borderRadius: 999 }}>✓ {label}</span>;
}

export default function MarketplacePage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ program: "", gender: "", language: "", country: "", ageGroup: "", maxRate: "" });

  const load = useCallback(() => {
    setLoading(true);
    const sp = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v) sp.set(k, v); });
    fetch(`/api/public/marketplace/teachers?${sp.toString()}`)
      .then(r => r.json())
      .then(d => { if (d.success) setTeachers(d.data.teachers); })
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(load, [load]);

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      <header style={{ background: colors.primary, padding: "20px 20px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <HifzMark size={30} />
            <div style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700, fontSize: 17 }}>HifzPro Marketplace</div>
          </Link>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/marketplace/join/parent" style={{ color: "white", fontSize: 13, textDecoration: "underline" }}>Find a teacher</Link>
            <Link href="/marketplace/join/teacher" style={{ color: colors.goldLight, fontSize: 13, fontWeight: 700, textDecoration: "underline" }}>Teach on HifzPro</Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 16px" }}>
        <h1 style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.n800, marginBottom: 6 }}>
          Find a Qari or Mu'allimah
        </h1>
        <p style={{ color: colors.n600, fontSize: 14, marginBottom: 20 }}>
          Browse independent Quran teachers by program, language, country, and age group.
        </p>

        {/* Filters */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20, background: colors.white, padding: 14, borderRadius: 14, border: `1px solid ${colors.n200}` }}>
          <select style={selectStyle()} value={filters.program} onChange={e => setFilters(f => ({ ...f, program: e.target.value }))}>
            <option value="">Any program</option>
            {PROGRAM_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select style={selectStyle()} value={filters.gender} onChange={e => setFilters(f => ({ ...f, gender: e.target.value }))}>
            <option value="">Any gender</option>
            <option value="MALE">Male (Qari)</option>
            <option value="FEMALE">Female (Mu'allimah)</option>
          </select>
          <select style={selectStyle()} value={filters.ageGroup} onChange={e => setFilters(f => ({ ...f, ageGroup: e.target.value }))}>
            <option value="">Any age group</option>
            {AGE_GROUP_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <input style={selectStyle()} placeholder="Language (e.g. English)" value={filters.language} onChange={e => setFilters(f => ({ ...f, language: e.target.value }))} />
          <input style={selectStyle()} placeholder="Country served (e.g. US)" value={filters.country} onChange={e => setFilters(f => ({ ...f, country: e.target.value }))} />
          <input style={selectStyle()} type="number" placeholder="Max hourly rate" value={filters.maxRate} onChange={e => setFilters(f => ({ ...f, maxRate: e.target.value }))} />
        </div>

        {loading && <div style={{ color: colors.n500, textAlign: "center", padding: 30 }}>Loading teachers…</div>}
        {!loading && teachers.length === 0 && (
          <div style={{ color: colors.n500, textAlign: "center", padding: 30, background: colors.white, borderRadius: 14 }}>
            No teachers match these filters yet.
          </div>
        )}

        <div style={{ display: "grid", gap: 14 }}>
          {teachers.map(t => (
            <Link key={t.id} href={`/marketplace/teachers/${t.id}`} style={{ textDecoration: "none" }}>
              <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: colors.green100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {t.gender === "FEMALE" ? "👩" : "👨"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: colors.n800 }}>{t.user.name}</span>
                    <VerificationBadge tier={t.verificationTier} />
                    {t.avgRating != null && <span style={{ fontSize: 13, color: colors.n600 }}>⭐ {t.avgRating.toFixed(1)} ({t.totalReviews})</span>}
                  </div>
                  <div style={{ fontSize: 13, color: colors.n600, marginTop: 4 }}>
                    {t.qiraat && <>{t.qiraat} · </>}{t.residenceCountry}{t.yearsExperience != null && <> · {t.yearsExperience} yrs experience</>}
                  </div>
                  {t.bio && <div style={{ fontSize: 13, color: colors.n700, marginTop: 6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{t.bio}</div>}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {t.programsOffered.map(p => (
                      <span key={p} style={{ fontSize: 11, fontWeight: 600, color: colors.primary, background: colors.green50, padding: "2px 8px", borderRadius: 999 }}>{p}</span>
                    ))}
                  </div>
                </div>
                {t.hourlyRate != null && (
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, color: colors.primary }}>{t.currency} {t.hourlyRate}</div>
                    <div style={{ fontSize: 11, color: colors.n500 }}>per hour</div>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
