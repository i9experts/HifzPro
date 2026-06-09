// app/[slug]/page.tsx
// Public institution profile page — no auth required
// Accessible at hifzpro.com/[slug]

import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const PROGRAM_INFO: Record<string, { label: string; labelUr: string; icon: string; color: string; bg: string; desc: string }> = {
  HIFZ:    { label: "Hifz ul Quran",  labelUr: "حفظ القرآن",  icon: "📖", color: "#0D5C3A", bg: "#dcfce7", desc: "Complete memorization of the Holy Quran" },
  NAZRA:   { label: "Nazrah",         labelUr: "ناظرہ",        icon: "👁️", color: "#7c3aed", bg: "#f5f3ff", desc: "Correct recitation with Tajweed rules" },
  TAJWEED: { label: "Tajweed",        labelUr: "تجوید",        icon: "✏️", color: "#b45309", bg: "#fffbeb", desc: "Mastery of Quranic pronunciation" },
  GIRDAAN: { label: "Girdaan",        labelUr: "گردان",        icon: "🔄", color: "#0f766e", bg: "#f0fdfa", desc: "Systematic revision & consolidation" },
};

async function getInstitution(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hifzpro.com";
    const res = await fetch(`${baseUrl}/api/public/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch { return null; }
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) return { title: "Institution Not Found — HifzPro" };

  return {
    title:       `${inst.name} — HifzPro`,
    description: inst.about || `${inst.name} is a Quran memorization institute in ${inst.city || "Pakistan"} using HifzPro for student management.`,
    openGraph: {
      title:       inst.name,
      description: inst.about || `Hifz institute in ${inst.city || "Pakistan"}`,
      images:      inst.logo ? [{ url: inst.logo, width: 400, height: 400, alt: inst.name }] : [],
      type:        "profile",
    },
  };
}

export default async function InstitutionProfilePage({ params }: Props) {
  const { slug } = await params;
  const inst = await getInstitution(slug);
  if (!inst) notFound();

  const whatsappUrl = inst.whatsapp
    ? `https://wa.me/${inst.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`السلام علیکم، I'm interested in enrolling my child at ${inst.name}. Please share details.`)}`
    : null;

  const joinedYear = inst.createdAt ? new Date(inst.createdAt).getFullYear() : null;
  const estYear    = inst.established || joinedYear;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fffe", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif" }}>

      {/* ── Navbar ── */}
      <nav style={{ background: "#0D5C3A", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "white" }}>HifzPro</div>
          <div style={{ fontFamily: "monospace", fontSize: 8, color: "#C4882A", letterSpacing: 2, opacity: 0.8 }}>حِفزپرو</div>
        </Link>
        <Link href="/signup" style={{ padding: "7px 18px", borderRadius: 8, background: "#C4882A", color: "white", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
          Register Your Institute
        </Link>
      </nav>

      {/* ── Hero / Header ── */}
      <div style={{ background: "linear-gradient(135deg,#0D5C3A,#065f46)", position: "relative", overflow: "hidden", padding: "40px 24px 48px" }}>
        {/* Islamic pattern */}
        <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.05 }} width="300" height="300" viewBox="0 0 80 80">
          {[0,1,2,3,4].map(i => <polygon key={i} points={`24,${4+i*4} ${56-i*4},4 76,${24+i*4} ${76-i*4},${56} ${56},${76-i*4} 24,${76-i*4} 4,${56-i*4} ${4+i*4},24`} fill="none" stroke="white" strokeWidth="0.4"/>)}
        </svg>

        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap", position: "relative" }}>

          {/* Logo */}
          <div style={{ width: 110, height: 110, borderRadius: 20, background: "white", boxShadow: "0 8px 32px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden", border: "3px solid rgba(255,255,255,0.3)" }}>
            {inst.logo
              ? <img src={inst.logo} alt={inst.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 44, fontWeight: 700, color: "#0D5C3A" }}>{inst.name.charAt(0)}</div>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", letterSpacing: 2, marginBottom: 4 }}>
              HIFZ INSTITUTE · قرآنی مدرسہ
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 700, color: "white", margin: "0 0 4px", lineHeight: 1.1 }}>
              {inst.name}
            </h1>
            {inst.nameArabic && (
              <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 20, color: "#C4882A", marginBottom: 8 }}>
                {inst.nameArabic}
              </div>
            )}
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
              {inst.city && (
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  📍 {inst.city}{inst.country && inst.country !== "Pakistan" ? `, ${inst.country}` : ", Pakistan"}
                </span>
              )}
              {estYear && (
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  🕌 Est. {estYear}
                </span>
              )}
              {inst.stats.campuses > 1 && (
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  🏛️ {inst.stats.campuses} Campuses
                </span>
              )}
            </div>
          </div>

          {/* CTA buttons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
            <Link href={`/signup?ref=${inst.slug}`} style={{ padding: "12px 24px", borderRadius: 10, background: "#C4882A", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center", boxShadow: "0 4px 16px rgba(196,136,42,0.4)" }}>
              📝 Enroll Now
            </Link>
            {whatsappUrl && (
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "11px 24px", borderRadius: 10, background: "#16a34a", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
                💬 WhatsApp Us
              </a>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats strip ── */}
      <div style={{ background: "white", borderBottom: "1px solid #e2e8f0", padding: "0 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {[
            { val: inst.stats.activeStudents, label: "Active Students",  labelUr: "طلباء",      icon: "👨‍🎓" },
            { val: inst.stats.asatidha,       label: "Asatidha",         labelUr: "اساتذہ",     icon: "👨‍🏫" },
            { val: inst.stats.campuses,       label: "Campuses",          labelUr: "کیمپس",      icon: "🏛️" },
            { val: inst.stats.sanadsIssued,   label: "Sanads Issued",    labelUr: "سند جاری",   icon: "🏆" },
          ].map((s, i) => (
            <div key={i} style={{ padding: "16px 12px", textAlign: "center", borderRight: i < 3 ? "1px solid #f1f5f9" : "none" }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 700, color: "#0D5C3A" }}>{s.val}</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 10, color: "#64748b" }}>{s.label}</div>
              <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 10, color: "#C4882A", opacity: 0.7 }}>{s.labelUr}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 24px", display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* About */}
          {inst.about && (
            <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#0D5C3A", marginBottom: 12 }}>ABOUT · تعارف</div>
              <p style={{ fontFamily: "'Inter',sans-serif", fontSize: 14, color: "#374151", lineHeight: 1.8, margin: 0 }}>
                {inst.about}
              </p>
            </div>
          )}

          {/* Programs */}
          {inst.programs.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#0D5C3A", marginBottom: 16 }}>PROGRAMS OFFERED · پروگرام</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {inst.programs.map((prog: string) => {
                  const info = PROGRAM_INFO[prog];
                  if (!info) return null;
                  const count = inst.stats.programCounts[prog] || 0;
                  return (
                    <div key={prog} style={{ background: info.bg, borderRadius: 12, padding: "14px 16px", border: `1px solid ${info.color}22`, display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>{info.icon}</span>
                      <div>
                        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 700, color: info.color }}>{info.label}</div>
                        <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 13, color: info.color, opacity: 0.8 }}>{info.labelUr}</div>
                        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#6b7280", marginTop: 4, lineHeight: 1.5 }}>{info.desc}</div>
                        {count > 0 && <div style={{ fontFamily: "monospace", fontSize: 10, color: info.color, marginTop: 4, fontWeight: 700 }}>{count} active students</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Campuses */}
          {inst.campuses.length > 0 && (
            <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#0D5C3A", marginBottom: 16 }}>
                {inst.campuses.length === 1 ? "LOCATION · مقام" : `CAMPUSES (${inst.campuses.length}) · کیمپس`}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {inst.campuses.map((campus: any) => (
                  <div key={campus.id} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#f8fffe", borderRadius: 10, border: "1px solid #dcfce7", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>🏛️</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 13, fontWeight: 700, color: "#1a1a1a" }}>{campus.name}</div>
                      {campus.nameArabic && <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 12, color: "#0D5C3A" }}>{campus.nameArabic}</div>}
                      {campus.address && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#64748b", marginTop: 2 }}>📍 {campus.address}</div>}
                      {campus.city && !campus.address && <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#64748b", marginTop: 2 }}>📍 {campus.city}</div>}
                    </div>
                    {campus.phone && (
                      <a href={`tel:${campus.phone}`} style={{ fontFamily: "monospace", fontSize: 11, color: "#0D5C3A", textDecoration: "none" }}>📞 {campus.phone}</a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Powered by HifzPro */}
          <div style={{ background: "linear-gradient(135deg,#050D0A,#0D5C3A)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 22 }}>📱</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, fontWeight: 700, color: "white" }}>Managed with HifzPro</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Pakistan's first intelligent Hifz management platform</div>
            </div>
            <Link href="/" style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>
              Learn More →
            </Link>
          </div>
        </div>

        {/* Right column — Contact card */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>

          {/* Contact card */}
          <div style={{ background: "white", borderRadius: 16, padding: "20px 20px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#0D5C3A", marginBottom: 14 }}>CONTACT · رابطہ</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {inst.phone && (
                <a href={`tel:${inst.phone}`} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#f8fffe", border: "1px solid #dcfce7", textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>📞</span>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#0D5C3A", fontWeight: 600 }}>{inst.phone}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: "#94a3b8" }}>Call / Phone</div>
                  </div>
                </a>
              )}
              {inst.whatsapp && (
                <a href={whatsappUrl!} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#f0fdf4", border: "1px solid #86efac", textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>💬</span>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "#166534", fontWeight: 600 }}>{inst.whatsapp}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: "#94a3b8" }}>WhatsApp</div>
                  </div>
                </a>
              )}
              {inst.email && (
                <a href={`mailto:${inst.email}`} style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>✉️</span>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#0369a1", fontWeight: 600, wordBreak: "break-all" }}>{inst.email}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: "#94a3b8" }}>Email</div>
                  </div>
                </a>
              )}
              {inst.website && (
                <a href={inst.website.startsWith("http") ? inst.website : `https://${inst.website}`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", gap: 10, alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#faf5ff", border: "1px solid #e9d5ff", textDecoration: "none" }}>
                  <span style={{ fontSize: 18 }}>🌐</span>
                  <div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: "#7c3aed", fontWeight: 600, wordBreak: "break-all" }}>{inst.website}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: "#94a3b8" }}>Website</div>
                  </div>
                </a>
              )}
              {inst.address && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "10px 12px", borderRadius: 8, background: "#fffbeb", border: "1px solid #fde68a" }}>
                  <span style={{ fontSize: 18, flexShrink: 0 }}>📍</span>
                  <div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "#92400e", fontWeight: 600 }}>{inst.address}</div>
                    <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 9, color: "#94a3b8" }}>Address</div>
                  </div>
                </div>
              )}
            </div>

            {/* Enroll CTA */}
            <div style={{ marginTop: 16, padding: "16px", background: "linear-gradient(135deg,#f0fdf4,#dcfce7)", borderRadius: 12, textAlign: "center", border: "1px solid #86efac" }}>
              <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 18, color: "#0D5C3A", marginBottom: 6 }}>حفظ القرآن الكريم</div>
              <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: "#166534", marginBottom: 12 }}>Enroll your child today</div>
              <Link href={`/signup?ref=${inst.slug}`} style={{ display: "block", padding: "10px", borderRadius: 8, background: "#0D5C3A", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none" }}>
                Apply for Admission →
              </Link>
            </div>
          </div>

          {/* Share card */}
          <div style={{ background: "white", borderRadius: 16, padding: "16px 20px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: 2, color: "#94a3b8", marginBottom: 12 }}>SHARE THIS PAGE</div>
            <div style={{ display: "flex", gap: 8" }}>
              <button
                onClick={() => { navigator.clipboard.writeText(`https://hifzpro.com/${inst.slug}`); }}
                style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#374151" }}>
                🔗 Copy Link
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out ${inst.name} on HifzPro: https://hifzpro.com/${inst.slug}`)}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, padding: "9px", borderRadius: 8, border: "1px solid #86efac", background: "#f0fdf4", cursor: "pointer", fontFamily: "'Inter',sans-serif", fontSize: 11, fontWeight: 600, color: "#166534", textDecoration: "none", textAlign: "center" }}>
                💬 Share
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: "#050D0A", borderTop: "1px solid #1a2e22", padding: "24px", textAlign: "center", marginTop: 16 }}>
        <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 16, color: "#C4882A", marginBottom: 8, opacity: 0.7 }}>
          وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
          Powered by <a href="https://hifzpro.com" style={{ color: "#10B981", textDecoration: "none" }}>HifzPro</a> — Pakistan's first intelligent Hifz management platform
        </div>
      </footer>
    </div>
  );
}
