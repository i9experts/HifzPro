"use client";
import { useState, useEffect, use } from "react";
import { colors, fonts } from "@/lib/tokens";

// ── QR Code component (pure CSS/SVG, no external library) ──
function QRPlaceholder({ value, size = 80 }: { value: string; size?: number }) {
  // Simple visual QR placeholder — in production use `qrcode` npm package
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&bgcolor=ffffff&color=000000&margin=4`;
  return <img src={url} alt="QR Code" width={size} height={size} style={{ display: "block" }} />;
}

// ──────────────────────────────────────────────
// TEMPLATE 1: CLASSIC ISLAMIC
// ──────────────────────────────────────────────
function ClassicTemplate({ data, settings }: { data: any; settings: any }) {
  const { student, sanad, institution } = data;
  const { color, language, borderStyle, includeSilsila, includeQR, examinerName, principalName, hijriDate, customText } = settings;

  const isArabic   = language === "ARABIC";
  const isUrdu     = language === "URDU";
  const isBilingual= language === "BILINGUAL" || !language;

  const prog: Record<string,{en:string;ar:string;ur:string}> = {
    HIFZ:    { en:"Hifz ul Quran",  ar:"حِفْظُ الْقُرْآنِ الْكَرِيم", ur:"حفظ القرآن الکریم" },
    NAZRA:   { en:"Nazrah",          ar:"نَاظِرَة",                       ur:"ناظرہ" },
    TAJWEED: { en:"Tajweed",         ar:"تَجْوِيد",                       ur:"تجوید" },
    GIRDAAN: { en:"Girdaan",         ar:"گردان",                          ur:"گردان" },
  };
  const programInfo = prog[sanad.program] || prog.HIFZ;

  const bodyText: Record<string,string> = {
    HIFZ:    isBilingual
      ? "This is to certify that the bearer has successfully memorized the complete Holy Quran"
      : isArabic ? "يُشهد بأن حامل هذه الوثيقة قد أتم حفظ كتاب الله الكريم كاملاً"
      : isUrdu   ? "تصدیق کی جاتی ہے کہ مشمول نے مکمل قرآن کریم حفظ کر لیا ہے"
      : "This is to certify that the bearer has successfully memorized the complete Holy Quran",
    NAZRA:   "has successfully completed the recitation of the Holy Quran with Tajweed",
    TAJWEED: "has successfully completed the study of Tajweed rules",
    GIRDAAN: "has successfully completed the Girdaan (intensive revision) program",
  };

  const arabicBodyText: Record<string,string> = {
    HIFZ:    "يُشهد بأن حامل هذه الوثيقة قد أتم حفظ كتاب الله الكريم كاملاً بإذن الله تعالى",
    NAZRA:   "قد أتم قراءة القرآن الكريم بالتجويد",
    TAJWEED: "قد أتم دراسة أحكام التجويد",
    GIRDAAN: "قد أتم دورة المراجعة المكثفة للقرآن الكريم",
  };

  const isDate = new Date(sanad.issuedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div id="certificate" style={{
      width: 794, minHeight: 1123, background: "#fffdf5",
      position: "relative", display: "flex", flexDirection: "column",
      alignItems: "center", padding: 0, fontFamily: "'Scheherazade New','Cormorant Garamond',Georgia,serif",
    }}>
      {/* Outer border */}
      {borderStyle !== "NONE" && (
        <div style={{ position: "absolute", inset: 12, border: `3px solid ${color}`, borderRadius: 4, pointerEvents: "none", zIndex: 1 }} />
      )}
      {borderStyle === "ORNATE" && (
        <>
          <div style={{ position: "absolute", inset: 18, border: `1px solid ${color}88`, borderRadius: 2, pointerEvents: "none", zIndex: 1 }} />
          {/* Corner ornaments */}
          {[{ top: 10, left: 10 }, { top: 10, right: 10 }, { bottom: 10, left: 10 }, { bottom: 10, right: 10 }].map((pos, i) => (
            <div key={i} style={{ position: "absolute", ...pos, width: 40, height: 40, zIndex: 2, pointerEvents: "none" }}>
              <svg viewBox="0 0 40 40" fill="none">
                <path d="M2,2 L20,2 L2,20 Z" fill={color} opacity="0.4" />
                <path d="M2,2 L12,2 L2,12 Z" fill={color} opacity="0.8" />
                <circle cx="20" cy="20" r="3" fill={color} opacity="0.3" />
              </svg>
            </div>
          ))}
        </>
      )}

      {/* Top geometric band */}
      <div style={{ width: "100%", background: color, padding: "12px 40px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.1, backgroundImage: `repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)`, backgroundSize: "10px 10px" }} />
        {/* Bismillah */}
        <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 22, color: "#fef3c7", letterSpacing: 2, position: "relative" }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
      </div>

      {/* Institution */}
      <div style={{ textAlign: "center", padding: "20px 50px 10px", width: "100%" }}>
        {institution?.logo && (
          <img src={institution.logo} alt="" style={{ height: 60, marginBottom: 10, objectFit: "contain" }} />
        )}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: color, letterSpacing: 2, textTransform: "uppercase" }}>
          {institution?.name || "Al-Noor Hifz Institute"}
        </div>
        {institution?.city && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#666", marginTop: 2 }}>{institution.city}</div>}

        {/* Decorative divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "12px auto", maxWidth: 500 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${color}88)` }} />
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 20, color: color }}>✦</div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${color}88,transparent)` }} />
        </div>
      </div>

      {/* Certificate title */}
      <div style={{ textAlign: "center", padding: "0 40px 16px" }}>
        {(isBilingual || isArabic || isUrdu) && (
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 32, color: color, lineHeight: 1.4, marginBottom: 6, direction: "rtl" }}>
            شَهَادَةُ {sanad.program === "HIFZ" ? "حِفْظِ الْقُرْآنِ الْكَرِيم" : programInfo.ar}
          </div>
        )}
        {(isBilingual || !isArabic) && !isUrdu && (
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: color, letterSpacing: 3, fontWeight: 400 }}>
            CERTIFICATE OF {sanad.program}
          </div>
        )}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: "0 60px", width: "100%", textAlign: "center" }}>

        {/* "This certifies..." */}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#444", marginBottom: 8 }}>
          {isArabic ? "يُشهد بموجب هذه الوثيقة أن" : "This is to certify that"}
        </div>

        {/* Student name — large */}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 42, fontWeight: 700, color: color, lineHeight: 1.2, marginBottom: 6 }}>
          {student.name}
        </div>
        {student.nameArabic && (
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 28, color: `${color}bb`, marginBottom: 4, direction: "rtl" }}>
            {student.nameArabic}
          </div>
        )}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: "#888", marginBottom: 16 }}>
          {student.enrollmentNumber}
        </div>

        {/* Body text */}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "#555", lineHeight: 1.8, maxWidth: 560, margin: "0 auto 10px" }}>
          {bodyText[sanad.program] || bodyText.HIFZ}
        </div>
        {(isBilingual || isArabic) && (
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 17, color: "#666", lineHeight: 2, maxWidth: 560, margin: "0 auto 16px", direction: "rtl" }}>
            {arabicBodyText[sanad.program] || arabicBodyText.HIFZ}
          </div>
        )}

        {/* Custom dua */}
        {customText && (
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 18, color: color, margin: "0 auto 14px", direction: "rtl", fontStyle: "italic" }}>
            {customText}
          </div>
        )}

        {/* Date */}
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "#666", marginBottom: 6 }}>
          Issued on: <strong style={{ color: color }}>{isDate}</strong>
          {hijriDate && <span style={{ fontFamily: "'Scheherazade New',serif", marginLeft: 12, direction: "rtl" }}> — {hijriDate}</span>}
        </div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px auto", maxWidth: 500 }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,transparent,${color}55)` }} />
          <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 16, color: `${color}88` }}>❖</div>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${color}55,transparent)` }} />
        </div>

        {/* Silsila */}
        {includeSilsila && sanad.silsila && (
          <div style={{ background: `${color}08`, border: `1px solid ${color}22`, borderRadius: 8, padding: "12px 16px", margin: "0 auto 16px", maxWidth: 600 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "#888", letterSpacing: 2, marginBottom: 8 }}>CHAIN OF TRANSMISSION — سِلْسِلَةُ السَّنَدِ</div>
            <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 14, color: color, lineHeight: 2.2, direction: "rtl", wordBreak: "break-word" }}>
              {sanad.silsila}
            </div>
          </div>
        )}

        {/* Signatures */}
        <div style={{ display: "grid", gridTemplateColumns: (examinerName && principalName) ? "1fr 1fr" : "1fr", gap: 30, margin: "16px 80px 0" }}>
          {examinerName && (
            <div style={{ textAlign: "center" }}>
              <div style={{ height: 1, background: `${color}55`, marginBottom: 6 }} />
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: color }}>{examinerName}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "#888" }}>{isArabic ? "الأستاذ / الممتحن" : "Ustadh / Examiner"}</div>
            </div>
          )}
          {principalName && (
            <div style={{ textAlign: "center" }}>
              <div style={{ height: 1, background: `${color}55`, marginBottom: 6 }} />
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, fontWeight: 700, color: color }}>{principalName}</div>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "#888" }}>{isArabic ? "المدير / المهتمم" : "Principal / Muhtamim"}</div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ width: "100%", padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 16 }}>
        {/* QR code */}
        {includeQR && (
          <div style={{ textAlign: "center" }}>
            <QRPlaceholder value={sanad.qrCode || `https://www.hifzpro.com/certificates/${sanad.sanadNumber}`} size={70} />
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "#999", marginTop: 3 }}>Scan to verify</div>
          </div>
        )}
        {/* Sanad number */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#999" }}>Certificate No.</div>
          <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: color }}>{sanad.sanadNumber}</div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 9, color: "#bbb", marginTop: 2 }}>HifzPro · www.hifzpro.com</div>
        </div>
        {/* Verified seal */}
        <div style={{ width: 70, height: 70, borderRadius: "50%", border: `2px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontSize: 16 }}>✓</div>
          <div style={{ fontFamily: "monospace", fontSize: 7, color: color, textAlign: "center", lineHeight: 1.3 }}>VERIFIED</div>
        </div>
      </div>

      {/* Bottom band */}
      <div style={{ width: "100%", background: color, padding: "8px 40px", textAlign: "center" }}>
        <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: 1 }}>
          وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا — And recite the Quran with measured recitation
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TEMPLATE 2: MODERN PROFESSIONAL
// ──────────────────────────────────────────────
function ModernTemplate({ data, settings }: { data: any; settings: any }) {
  const { student, sanad, institution } = data;
  const { color, language, includeSilsila, includeQR, examinerName, principalName, hijriDate, customText } = settings;
  const isDate = new Date(sanad.issuedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div id="certificate" style={{ width: 794, minHeight: 1123, background: "#ffffff", display: "flex", flexDirection: "column", position: "relative", fontFamily: "'Cormorant Garamond',Georgia,serif" }}>
      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 8, background: `linear-gradient(180deg,${color},${color}88)` }} />

      <div style={{ paddingLeft: 60, paddingRight: 50, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ paddingTop: 50, paddingBottom: 24, borderBottom: `1px solid ${color}22`, marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 11, letterSpacing: 4, color: color, textTransform: "uppercase", marginBottom: 6 }}>Certificate of Achievement</div>
              <div style={{ fontSize: 36, fontWeight: 700, color: "#1a1a1a", lineHeight: 1 }}>{institution?.name || "Al-Noor Hifz Institute"}</div>
              {institution?.city && <div style={{ fontSize: 14, color: "#888", marginTop: 4 }}>{institution.city}</div>}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 20, color: color, direction: "rtl" }}>شهادة تقدير</div>
              <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>{sanad.sanadNumber}</div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, color: "#666", marginBottom: 12 }}>This certificate is proudly presented to</div>

          <div style={{ fontSize: 52, fontWeight: 700, color: color, lineHeight: 1.1, marginBottom: 6 }}>{student.name}</div>
          {student.nameArabic && <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 28, color: `${color}99`, marginBottom: 10, direction: "rtl" }}>{student.nameArabic}</div>}
          <div style={{ fontSize: 12, color: "#aaa", marginBottom: 28, letterSpacing: 1 }}>{student.enrollmentNumber}</div>

          {/* Gold accent line */}
          <div style={{ height: 3, width: 80, background: color, marginBottom: 24, borderRadius: 2 }} />

          <div style={{ fontSize: 17, color: "#333", lineHeight: 1.9, maxWidth: 520, marginBottom: 16 }}>
            In recognition of the successful completion of the
            <strong style={{ color: color }}> {sanad.program === "HIFZ" ? "Hifz ul Quran" : sanad.program} </strong>
            program, demonstrating exceptional dedication to the memorization and preservation of the Holy Quran.
          </div>

          {(language === "BILINGUAL" || language === "ARABIC" || language === "URDU") && (
            <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 18, color: "#555", lineHeight: 2.2, direction: "rtl", marginBottom: 24, background: `${color}06`, padding: "12px 16px", borderRadius: 6, borderRight: `3px solid ${color}` }}>
              {sanad.program === "HIFZ" ? "قد أتم حفظ القرآن الكريم كاملاً — بإذن الله تعالى — وأجازه الأستاذ بذلك" : "قد أتم البرنامج بنجاح"}
            </div>
          )}

          {customText && <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 18, color: color, marginBottom: 20, direction: "rtl" }}>{customText}</div>}

          {/* Date row */}
          <div style={{ display: "flex", gap: 32, marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#aaa", textTransform: "uppercase", marginBottom: 2 }}>Date of Issue</div>
              <div style={{ fontSize: 15, color: "#333", fontWeight: 600 }}>{isDate}</div>
              {hijriDate && <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 13, color: "#888", direction: "rtl" }}>{hijriDate}</div>}
            </div>
            <div>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#aaa", textTransform: "uppercase", marginBottom: 2 }}>Certificate ID</div>
              <div style={{ fontSize: 15, color: color, fontWeight: 700 }}>{sanad.sanadNumber}</div>
            </div>
          </div>

          {/* Silsila */}
          {includeSilsila && sanad.silsila && (
            <div style={{ background: `${color}08`, borderLeft: `3px solid ${color}`, padding: "12px 16px", marginBottom: 24, borderRadius: "0 6px 6px 0" }}>
              <div style={{ fontSize: 10, letterSpacing: 2, color: "#aaa", textTransform: "uppercase", marginBottom: 6 }}>Chain of Transmission — Silsila</div>
              <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 13, color: color, lineHeight: 2.2, direction: "rtl" }}>{sanad.silsila}</div>
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: "flex", gap: 48, marginBottom: 32 }}>
            {examinerName && (
              <div>
                <div style={{ width: 140, borderTop: `1px solid ${color}66`, paddingTop: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{examinerName}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>Ustadh / Examiner</div>
                </div>
              </div>
            )}
            {principalName && (
              <div>
                <div style={{ width: 140, borderTop: `1px solid ${color}66`, paddingTop: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{principalName}</div>
                  <div style={{ fontSize: 11, color: "#aaa" }}>Principal</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ borderTop: `1px solid ${color}22`, paddingTop: 16, paddingBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {includeQR && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <QRPlaceholder value={sanad.qrCode || `https://www.hifzpro.com/certificates/${sanad.sanadNumber}`} size={60} />
              <div>
                <div style={{ fontSize: 9, color: "#aaa", letterSpacing: 1 }}>SCAN TO VERIFY</div>
                <div style={{ fontSize: 9, color: "#ccc" }}>www.hifzpro.com</div>
              </div>
            </div>
          )}
          <div style={{ textAlign: "right" }}>
            <div style={{ width: 50, height: 50, borderRadius: "50%", border: `2px solid ${color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginLeft: "auto" }}>
              <div style={{ fontSize: 14 }}>✓</div>
              <div style={{ fontSize: 6, color: color }}>VERIFIED</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// TEMPLATE 3: TRADITIONAL GREEN
// ──────────────────────────────────────────────
function TraditionalTemplate({ data, settings }: { data: any; settings: any }) {
  const { student, sanad, institution } = data;
  const { color, language, includeSilsila, includeQR, examinerName, principalName, hijriDate, customText, borderStyle } = settings;
  const isDate = new Date(sanad.issuedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div id="certificate" style={{ width: 794, minHeight: 1123, background: color, position: "relative", display: "flex", flexDirection: "column", fontFamily: "'Scheherazade New','Cormorant Garamond',serif" }}>
      {/* Pattern overlay */}
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: `repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 20px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 20px)`, pointerEvents: "none" }} />
      {/* Gold border */}
      {borderStyle !== "NONE" && <div style={{ position: "absolute", inset: 14, border: "2px solid rgba(255,255,255,0.3)", borderRadius: 4, pointerEvents: "none", zIndex: 1 }} />}
      {borderStyle === "ORNATE" && <div style={{ position: "absolute", inset: 20, border: "1px solid rgba(255,255,255,0.15)", borderRadius: 2, pointerEvents: "none", zIndex: 1 }} />}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "40px 60px", position: "relative", zIndex: 2 }}>
        {/* Bismillah */}
        <div style={{ textAlign: "center", fontSize: 26, color: "#fef3c7", marginBottom: 12, letterSpacing: 2 }}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>

        {/* Geometric divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.3)" }} />
          <svg width="30" height="30" viewBox="0 0 30 30"><polygon points="15,2 28,9 28,21 15,28 2,21 2,9" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" /><circle cx="15" cy="15" r="3" fill="rgba(255,255,255,0.5)" /></svg>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.3)" }} />
        </div>

        {/* Institute */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 700, color: "white", letterSpacing: 3, textTransform: "uppercase" }}>
            {institution?.name || "Al-Noor Hifz Institute"}
          </div>
          {institution?.city && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>{institution.city}</div>}
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", background: "rgba(0,0,0,0.2)", borderRadius: 8, padding: "14px 30px", marginBottom: 24 }}>
          <div style={{ fontSize: 30, color: "#fef3c7", lineHeight: 1.4, marginBottom: 4 }}>شَهَادَةُ حِفْظِ الْقُرْآنِ الْكَرِيم</div>
          {(language === "BILINGUAL" || language === "ENGLISH") && (
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: "rgba(255,255,255,0.7)", letterSpacing: 3 }}>CERTIFICATE OF {sanad.program}</div>
          )}
        </div>

        {/* Content */}
        <div style={{ textAlign: "center", flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            {language === "ARABIC" ? "يُشهد بأن" : "This is to certify that"}
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 46, fontWeight: 700, color: "white", lineHeight: 1.1, marginBottom: 6 }}>{student.name}</div>
          {student.nameArabic && <div style={{ fontSize: 28, color: "rgba(255,255,255,0.7)", marginBottom: 8 }}>{student.nameArabic}</div>}
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 20, letterSpacing: 2 }}>{student.enrollmentNumber}</div>

          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: "rgba(255,255,255,0.8)", lineHeight: 1.9, maxWidth: 520, margin: "0 auto 12px" }}>
            has successfully completed the memorization of the complete Holy Quran by the Grace of Allah ﷻ
          </div>
          <div style={{ fontSize: 16, color: "rgba(255,255,255,0.7)", lineHeight: 2, maxWidth: 520, margin: "0 auto 16px" }}>
            قد أتم حفظ القرآن الكريم كاملاً بفضل الله ومنّته
          </div>

          {customText && <div style={{ fontSize: 18, color: "#fef3c7", margin: "0 auto 16px" }}>{customText}</div>}

          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>
            {isDate}{hijriDate && ` — ${hijriDate}`}
          </div>

          {/* Silsila */}
          {includeSilsila && sanad.silsila && (
            <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, padding: "12px 16px", margin: "0 auto 20px", maxWidth: 580 }}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 6 }}>CHAIN OF TRANSMISSION — سِلْسِلَةُ السَّنَدِ</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", lineHeight: 2.2, direction: "rtl" }}>{sanad.silsila}</div>
            </div>
          )}

          {/* Signatures */}
          <div style={{ display: "flex", justifyContent: "center", gap: 60 }}>
            {examinerName && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 140, borderTop: "1px solid rgba(255,255,255,0.4)", paddingTop: 6 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "white", fontWeight: 600 }}>{examinerName}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Ustadh / Examiner</div>
                </div>
              </div>
            )}
            {principalName && (
              <div style={{ textAlign: "center" }}>
                <div style={{ width: 140, borderTop: "1px solid rgba(255,255,255,0.4)", paddingTop: 6 }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "white", fontWeight: 600 }}>{principalName}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Principal</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.2)" }}>
          {includeQR ? <div><QRPlaceholder value={sanad.qrCode || `https://www.hifzpro.com/certificates/${sanad.sanadNumber}`} size={65} /><div style={{ fontFamily: "monospace", fontSize: 7, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>Scan to verify</div></div> : <div />}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{sanad.sanadNumber}</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 9, color: "rgba(255,255,255,0.3)" }}>HifzPro · www.hifzpro.com</div>
          </div>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 18, color: "white" }}>✓</div>
            <div style={{ fontFamily: "monospace", fontSize: 6, color: "rgba(255,255,255,0.5)" }}>VERIFIED</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN CERTIFICATE PAGE
// ──────────────────────────────────────────────
export default function CertificatePage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const [sanad,   setSanad]   = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [template,setTemplate]= useState("CLASSIC");
  const [color,   setColor]   = useState("#0D5C3A");
  const [printing,setPrinting]= useState(false);

  useEffect(() => {
    fetch(`/api/certificates/${number}`)
      .then(r => r.json())
      .then(d => { if (d.success) setSanad(d.data.sanad); })
      .finally(() => setLoading(false));
  }, [number]);

  const handlePrint = () => {
    setPrinting(true);
    setTimeout(() => { window.print(); setPrinting(false); }, 300);
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0D5C3A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: "rgba(255,255,255,0.5)" }}>Loading Certificate...</div>
    </div>
  );

  if (!sanad) return (
    <div style={{ minHeight: "100vh", background: "#0D5C3A", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
      <div style={{ fontSize: 48 }}>❌</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "rgba(255,255,255,0.7)" }}>Certificate Not Found</div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{number}</div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: "rgba(255,255,255,0.4)" }}>This certificate could not be verified.</div>
    </div>
  );

  const institution = sanad.student?.campus?.institution;
  const settings = {
    color,
    language:       "BILINGUAL",
    borderStyle:    "ORNATE",
    includeSilsila: !!sanad.silsila,
    includeQR:      true,
    examinerName:   sanad.student?.batch?.ustadh?.user?.name || "",
    principalName:  "",
    hijriDate:      "",
    customText:     "بارك الله فيه وجعله حافظاً للقرآن الكريم",
  };

  const certData = { student: sanad.student, sanad, institution };
  const TemplateComponent = template === "MODERN" ? ModernTemplate : template === "TRADITIONAL" ? TraditionalTemplate : ClassicTemplate;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
          #certificate { transform: none !important; box-shadow: none !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ position: "fixed", top: 0, left: 0, right: 0, background: "#1a1a1a", padding: "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 100, boxShadow: "0 2px 10px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "white" }}>{sanad.sanadNumber}</div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#888" }}>QR VERIFIED CERTIFICATE</div>
          </div>
        </div>

        {/* Template switcher */}
        <div style={{ display: "flex", gap: 6 }}>
          {[{ id:"CLASSIC",label:"Classic"},{ id:"MODERN",label:"Modern"},{ id:"TRADITIONAL",label:"Traditional"}].map(t => (
            <button key={t.id} onClick={() => setTemplate(t.id)} style={{ padding: "6px 14px", borderRadius: 6, border: `1px solid ${template===t.id?"#4ade80":"#444"}`, background: template===t.id?"#166534":"transparent", color: template===t.id?"white":"#888", fontSize: 11, cursor: "pointer", fontFamily: "monospace" }}>
              {t.label}
            </button>
          ))}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", background: "#333", borderRadius: 6 }}>
            <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 24, height: 24, borderRadius: "50%", border: "none", cursor: "pointer" }} />
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "#888" }}>Color</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handlePrint} style={{ padding: "8px 20px", borderRadius: 8, background: "#4ade80", color: "#1a1a1a", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "monospace" }}>
            {printing ? "Opening..." : "⬇ Download PDF"}
          </button>
          <div style={{ padding: "6px 12px", borderRadius: 6, background: "#1e3a1e", border: "1px solid #4ade8044", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
            <span style={{ fontFamily: "monospace", fontSize: 10, color: "#4ade80" }}>VERIFIED</span>
          </div>
        </div>
      </div>

      {/* Certificate display */}
      <div style={{ minHeight: "100vh", background: "#2a2a2a", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 80, paddingBottom: 60 }}>
        {/* Verification badge */}
        <div className="no-print" style={{ background: "#1e3a1e", border: "1px solid #4ade8033", borderRadius: 10, padding: "10px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>✅</span>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#4ade80" }}>Certificate Verified — {sanad.sanadNumber}</div>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#666" }}>
              Issued by {institution?.name || "HifzPro"} · {new Date(sanad.issuedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        {/* Certificate */}
        <div style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5)", borderRadius: 4 }}>
          <TemplateComponent data={certData} settings={settings} />
        </div>

        {/* Instructions */}
        <div className="no-print" style={{ marginTop: 24, fontFamily: "monospace", fontSize: 11, color: "#555", textAlign: "center", lineHeight: 1.8 }}>
          Click "Download PDF" → In print dialog → Change destination to "Save as PDF"<br />
          Or use Ctrl+P / Cmd+P to print directly
        </div>
      </div>
    </>
  );
}
