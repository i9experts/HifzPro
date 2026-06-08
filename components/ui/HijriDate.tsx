"use client";
// components/ui/HijriDate.tsx
// Drop-in Hijri date display components — use anywhere in the app.
// All rendering is client-side since Intl.DateTimeFormat is browser/Node API.

import { toHijri, formatHijri, formatHijriBilingual, HIJRI_MONTHS } from "@/lib/hijri";
import { fonts, colors } from "@/lib/tokens";

// ── Single line Hijri date ──
export function HijriDate({
  date = new Date(),
  lang = "en",
  style,
}: {
  date?:  Date;
  lang?:  "en" | "ar" | "ur";
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ fontFamily: lang !== "en" ? "'Scheherazade New',serif" : fonts.mono, ...style }}>
      {formatHijri(date, lang)}
    </span>
  );
}

// ── Bilingual display (Hijri + Gregorian stacked) ──
export function HijriBilingual({
  date = new Date(),
  size = "md",
}: {
  date?: Date;
  size?: "sm" | "md" | "lg";
}) {
  const h = toHijri(date);
  const gregorian = date.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  const sizes = {
    sm: { hijriAr: 14, hijriEn: 10, greg: 9 },
    md: { hijriAr: 18, hijriEn: 12, greg: 11 },
    lg: { hijriAr: 24, hijriEn: 15, greg: 13 },
  }[size];

  return (
    <div>
      <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: sizes.hijriAr, color: colors.primary, direction: "rtl", textAlign: "left" }}>
        {h.day} {h.monthNameAr} {h.year}
      </div>
      <div style={{ fontFamily: fonts.heading, fontSize: sizes.hijriEn, fontWeight: 700, color: colors.n700, marginTop: 1 }}>
        {h.day} {h.monthNameEn} {h.year} AH
      </div>
      <div style={{ fontFamily: fonts.body, fontSize: sizes.greg, color: colors.n400, marginTop: 1 }}>
        {gregorian}
      </div>
    </div>
  );
}

// ── Compact badge for use in navbars / headers ──
export function HijriBadge({
  date = new Date(),
  dark = false,
}: {
  date?: Date;
  dark?: boolean;
}) {
  const h = toHijri(date);
  return (
    <div style={{
      background: dark ? "rgba(255,255,255,0.08)" : colors.green50,
      border:     `1px solid ${dark ? "rgba(255,255,255,0.15)" : colors.green200}`,
      borderRadius: 8,
      padding: "5px 10px",
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: 1,
    }}>
      <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 12, color: dark ? colors.gold : colors.primary, direction: "rtl" }}>
        {h.day} {h.monthNameAr}
      </div>
      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: dark ? "rgba(255,255,255,0.5)" : colors.n500, letterSpacing: 0.5 }}>
        {h.year} AH
      </div>
    </div>
  );
}

// ── Sanad / Certificate date line ──
export function CertificateDate({ date }: { date: Date }) {
  const { hijri, hijriAr, gregorian } = formatHijriBilingual(date);
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, letterSpacing: 1, marginBottom: 2 }}>GREGORIAN</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{gregorian}</div>
      </div>
      <div style={{ width: 1, height: 32, background: colors.n200 }} />
      <div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, letterSpacing: 1, marginBottom: 2 }}>HIJRI</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n700 }}>{hijri}</div>
        <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 14, color: colors.gold, direction: "rtl", textAlign: "left", marginTop: 1 }}>{hijriAr}</div>
      </div>
    </div>
  );
}

// ── Today widget for dashboards ──
export function TodayHijri() {
  const today = new Date();
  const h = toHijri(today);
  const month = HIJRI_MONTHS[h.month - 1];

  return (
    <div style={{ background: `linear-gradient(135deg,${colors.deep},${colors.primary}22)`, borderRadius: 14, padding: "14px 18px", border: `1px solid ${colors.green200}` }}>
      <div style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: 2, color: colors.gold, marginBottom: 6 }}>TODAY · اليوم</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
        <div style={{ fontFamily: fonts.heading, fontSize: 44, fontWeight: 800, color: colors.primary, lineHeight: 1 }}>{h.day}</div>
        <div>
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 20, color: colors.primary }}>{h.monthNameAr}</div>
          <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600 }}>{h.monthNameEn} {h.year} AH</div>
          <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>{h.monthNameUr}</div>
        </div>
      </div>
      {month?.significance && (
        <div style={{ marginTop: 8, fontFamily: fonts.body, fontSize: 10, color: colors.primary, background: colors.green50, padding: "4px 10px", borderRadius: 20, display: "inline-block" }}>
          ✦ {month.significance}
        </div>
      )}
      <div style={{ marginTop: 8, fontFamily: fonts.body, fontSize: 11, color: colors.n400 }}>
        {today.toLocaleDateString("en-PK", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </div>
    </div>
  );
}
