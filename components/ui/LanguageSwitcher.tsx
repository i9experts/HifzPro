"use client";
import { useLanguage } from "@/providers/LanguageProvider";
import { colors, fonts } from "@/lib/tokens";

export default function LanguageSwitcher() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 14px", borderRadius: 8,
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.18)",
        color: "rgba(255,255,255,0.85)",
        cursor: "pointer", transition: "all 0.2s",
        fontFamily: language === "en" ? "'Cairo', sans-serif" : fonts.heading,
        fontSize: 13, fontWeight: 600,
      }}
      title={language === "en" ? "Switch to Arabic" : "Switch to English"}
    >
      <span style={{ fontSize: 14 }}>{language === "en" ? "🇸🇦" : "🇬🇧"}</span>
      <span>{t.nav.language}</span>
    </button>
  );
}
