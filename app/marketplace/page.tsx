"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import EmptyState from "@/components/marketplace/EmptyState";
import { TeacherCardSkeleton } from "@/components/marketplace/Skeleton";
import { colors, fonts, shadows } from "@/lib/tokens";

interface Teacher {
  id: string; gender: string; residenceCountry: string; bio: string | null; qiraat: string | null;
  yearsExperience: number | null; languages: string[]; countriesServed: string[]; ageGroupsTaught: string[];
  programsOffered: string[]; hourlyRate: number | null; currency: string; verificationTier: string;
  avgRating: number | null; totalReviews: number;
  avgResponseMinutes: number | null; responseSampleCount: number;
  user: { name: string; avatar: string | null };
}

const PROGRAM_OPTIONS = ["HIFZ", "NAZRA", "TAJWEED", "GIRDAAN"];
const AGE_GROUP_OPTIONS = ["5-8", "9-12", "13-17", "Adult"];
const EMPTY_FILTERS = { program: "", gender: "", language: "", country: "", ageGroup: "", maxRate: "" };

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  if (minutes < 24 * 60) return `~${Math.round(minutes / 60)} hr`;
  return `~${Math.round(minutes / (24 * 60))} day${minutes >= 2 * 24 * 60 ? "s" : ""}`;
}

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
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  // Silently ignore 401 — the directory is public; the heart button only
  // does anything once a parent is signed in.
  useEffect(() => {
    fetch("/api/marketplace/saved-teachers")
      .then(r => r.json())
      .then(d => { if (d.success) setSavedIds(new Set<string>(d.data.teacherIds)); })
      .catch(() => {});
  }, []);

  const toggleSave = async (e: React.MouseEvent, teacherId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const isSaved = savedIds.has(teacherId);
    try {
      if (isSaved) {
        const res = await fetch(`/api/marketplace/saved-teachers?teacherId=${teacherId}`, { method: "DELETE" });
        if (res.status === 401) { window.location.href = "/marketplace/join/parent"; return; }
        setSavedIds(s => { const n = new Set(s); n.delete(teacherId); return n; });
      } else {
        const res = await fetch("/api/marketplace/saved-teachers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ teacherId }) });
        if (res.status === 401) { window.location.href = "/marketplace/join/parent"; return; }
        setSavedIds(s => new Set(s).add(teacherId));
      }
    } catch { /* best-effort */ }
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);
  const stats = useMemo(() => {
    const verified = teachers.filter(t => t.verificationTier !== "UNVERIFIED").length;
    const countries = new Set(teachers.flatMap(t => t.countriesServed)).size;
    return { total: teachers.length, verified, countries };
  }, [teachers]);

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(160deg, ${colors.deep} 0%, ${colors.primary} 100%)` }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "18px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <HifzMark size={28} />
              <div style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700, fontSize: 15 }}>HifzPro Marketplace</div>
            </Link>
            <div style={{ display: "flex", gap: 16 }}>
              <Link href="/dashboard/family/saved" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none" }}>Saved teachers</Link>
              <Link href="/marketplace/join/parent" style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, textDecoration: "none" }}>Find a teacher</Link>
              <Link href="/marketplace/join/teacher" style={{ color: colors.goldLight, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Teach on HifzPro</Link>
            </div>
          </div>

          <div style={{ padding: "36px 0 64px", maxWidth: 640 }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 2, color: colors.goldLight, marginBottom: 10 }}>QURAN TEACHER MARKETPLACE</div>
            <h1 style={{ fontFamily: fonts.display, fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, color: "white", margin: 0, lineHeight: 1.15 }}>
              Find a Qari or Mu'allimah your family trusts
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, marginTop: 12, lineHeight: 1.6 }}>
              Browse independent, verified Quran teachers by program, language, country, and age group — with real reviews from other parents.
            </p>
            {stats.total > 0 && (
              <div style={{ display: "flex", gap: 22, marginTop: 24, flexWrap: "wrap" }}>
                <div><div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: "white" }}>{stats.total}+</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>teachers listed</div></div>
                <div><div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: "white" }}>{stats.verified}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>verified</div></div>
                <div><div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, color: "white" }}>{stats.countries}</div><div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>countries served</div></div>
              </div>
            )}
          </div>
        </div>
      </div>

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px 32px" }}>
        {/* Filters — floats up over the hero's bottom edge */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", marginTop: -40, marginBottom: 24, background: colors.white, padding: 16, borderRadius: 16, boxShadow: shadows.lg, border: `1px solid ${colors.n200}` }}>
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
          {hasActiveFilters && (
            <button onClick={() => setFilters(EMPTY_FILTERS)} style={{ border: "none", background: "none", color: colors.primary, fontSize: 13, fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}>
              Clear filters
            </button>
          )}
        </div>

        {loading && (
          <div style={{ display: "grid", gap: 14 }}>
            {[0, 1, 2].map(i => <TeacherCardSkeleton key={i} />)}
          </div>
        )}
        {!loading && teachers.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No teachers match these filters yet"
            description="Try widening your search — clear a filter or two to see more teachers."
            action={hasActiveFilters ? undefined : { label: "Teach on HifzPro", href: "/marketplace/join/teacher" }}
          />
        )}

        {!loading && teachers.length > 0 && (
          <div style={{ display: "grid", gap: 14 }}>
            {teachers.map(t => (
              <Link key={t.id} href={`/marketplace/teachers/${t.id}`} style={{ textDecoration: "none" }}>
                <div className="hp-teacher-card" style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "flex-start", boxShadow: shadows.sm }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: colors.green100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, overflow: "hidden", border: `2px solid ${colors.green100}` }}>
                    {t.user.avatar ? <img src={t.user.avatar} alt={t.user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (t.gender === "FEMALE" ? "👩" : "👨")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: colors.n800 }}>{t.user.name}</span>
                      <VerificationBadge tier={t.verificationTier} />
                    </div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 3 }}>
                      {t.avgRating != null && <span style={{ fontSize: 13, color: colors.n600 }}>⭐ {t.avgRating.toFixed(1)} ({t.totalReviews})</span>}
                      {t.responseSampleCount > 0 && t.avgResponseMinutes != null && (
                        <span style={{ fontSize: 12, color: colors.n500 }}>⏱ Replies in {formatResponseTime(t.avgResponseMinutes)}</span>
                      )}
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
                  <div style={{ textAlign: "right", flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                    <button onClick={e => toggleSave(e, t.id)} aria-label="Save teacher"
                      style={{ border: "none", background: "none", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1, color: savedIds.has(t.id) ? "#e0245e" : colors.n300 }}>
                      {savedIds.has(t.id) ? "♥" : "♡"}
                    </button>
                    {t.hourlyRate != null && (
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, color: colors.primary }}>{t.currency} {t.hourlyRate}</div>
                        <div style={{ fontSize: 11, color: colors.n500 }}>per hour</div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        .hp-teacher-card { transition: box-shadow 0.15s ease, transform 0.15s ease; }
        .hp-teacher-card:hover { box-shadow: ${shadows.md}; transform: translateY(-1px); }
      `}</style>
    </div>
  );
}
