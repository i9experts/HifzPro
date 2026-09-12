"use client";
import { useState, useEffect } from "react";
import { colors, fonts } from "@/lib/tokens";
import { MAKHRAJ_CATEGORIES, ARABIC_LETTERS, type MakhrajCategory } from "@/lib/qaida-content";

// Original schematic side-profile diagram of the mouth/throat/nasal cavity,
// marking the 5 classical Makharij al-Huruf categories (Jawf, Halq, Lisan,
// Shafatain, Khaishoom). This is an original, simplified illustration drawn
// for this app — not traced or copied from any publisher's Qaida artwork —
// intended as a clear teaching schematic rather than an anatomical diagram.

interface Marker { id: string; category: MakhrajCategory; x: number; y: number; label: string }

const MARKERS: Marker[] = [
  { id: "shafatain",   category: "SHAFATAIN", x: 60,  y: 150, label: "Lips" },
  { id: "lisan-front", category: "LISAN",     x: 95,  y: 150, label: "Tongue tip" },
  { id: "lisan-mid",   category: "LISAN",     x: 130, y: 120, label: "Tongue middle" },
  { id: "lisan-back",  category: "LISAN",     x: 160, y: 95,  label: "Tongue back" },
  { id: "khaishoom",   category: "KHAISHOOM", x: 100, y: 85,  label: "Nasal cavity" },
  { id: "halq-adna",   category: "HALQ",      x: 175, y: 130, label: "Near throat" },
  { id: "halq-wasat",  category: "HALQ",      x: 185, y: 165, label: "Mid throat" },
  { id: "halq-aqsa",   category: "HALQ",      x: 195, y: 200, label: "Far throat" },
  { id: "jawf",        category: "JAWF",      x: 140, y: 160, label: "Oral cavity" },
];

export default function MakharijChart({ highlightLetter }: { highlightLetter?: string }) {
  const [active, setActive] = useState<MakhrajCategory | null>(null);

  useEffect(() => {
    if (!highlightLetter) return;
    const l = ARABIC_LETTERS.find(l => l.letter === highlightLetter);
    if (l) setActive(l.makhraj);
  }, [highlightLetter]);

  const cat = MAKHRAJ_CATEGORIES.find(c => c.id === active);
  const letters = active ? ARABIC_LETTERS.filter(l => l.makhraj === active) : [];

  return (
    <div style={{ background: colors.white, borderRadius: 14, padding: 18, border: `1px solid ${colors.n200}` }}>
      <div style={{ fontSize: 10, letterSpacing: 2, color: "#b45309", fontFamily: fonts.mono, marginBottom: 12 }}>
        MAKHARIJ AL-HUROOF — ARTICULATION POINTS
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>
        <svg viewBox="0 0 260 260" width={220} height={220} style={{ flexShrink: 0 }}>
          {/* Simplified side-profile head silhouette (facing right) */}
          <path
            d="M 40 190 C 20 160 20 110 45 80 C 60 55 90 40 120 35 C 160 28 210 40 225 75 C 235 98 232 110 210 108 C 200 107 198 118 205 128 C 212 138 210 148 198 150 C 188 152 186 162 190 172 C 194 184 186 195 172 196 C 150 198 150 215 130 220 C 100 227 55 220 40 190 Z"
            fill="#fde8cf" stroke="#c2793a" strokeWidth={2}
          />
          {/* Oral + throat cavity outline (Jawf — the empty space itself) */}
          <path
            d="M 70 150 C 90 145 115 130 150 100 C 172 122 190 145 195 200 C 175 210 150 212 130 205 C 105 196 82 178 70 150 Z"
            fill={active === "JAWF" ? `${MAKHRAJ_CATEGORIES.find(c=>c.id==="JAWF")!.color}33` : "rgba(124,58,237,0.08)"}
            stroke="#7c3aed" strokeWidth={1} strokeDasharray="3 3"
          />
          {MARKERS.map(m => {
            const c = MAKHRAJ_CATEGORIES.find(x => x.id === m.category)!;
            const isActive = active === m.category;
            return (
              <g key={m.id} onClick={() => setActive(m.category)} style={{ cursor: "pointer" }}>
                <circle cx={m.x} cy={m.y} r={isActive ? 12 : 9} fill={isActive ? c.color : `${c.color}99`} stroke={colors.white} strokeWidth={2} />
              </g>
            );
          })}
        </svg>

        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {MAKHRAJ_CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setActive(c.id)} style={{
                padding: "6px 10px", borderRadius: 8, border: `1.5px solid ${active === c.id ? c.color : colors.n200}`,
                background: active === c.id ? `${c.color}15` : colors.white, cursor: "pointer",
                fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: active === c.id ? c.color : colors.n600,
              }}>
                {c.label}
              </button>
            ))}
          </div>

          {cat ? (
            <div>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: cat.color, marginBottom: 2 }}>
                {cat.label} <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14 }}>{cat.arabic}</span>
              </div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, marginBottom: 10, lineHeight: 1.5 }}>{cat.desc}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {letters.map(l => (
                  <div key={l.letter} title={l.makhrajPoint} style={{
                    width: 34, height: 34, borderRadius: 8, background: `${cat.color}15`, border: `1px solid ${cat.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: cat.color,
                  }}>
                    {l.letter}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n400 }}>
              Tap a point on the diagram, or a category above, to see which letters are produced there.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
