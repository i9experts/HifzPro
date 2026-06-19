import React from "react";

// ── HifzMark — standalone octagon SVG mark ────────────────────
interface HifzMarkProps {
  size?: number;
  primary?: string;
  gold?: string;
  className?: string;
  shadow?: boolean;
}

export default function HifzMark({
  size = 48,
  primary = "#0D5C3A",
  gold = "#C4882A",
  className = "",
  shadow = false,
}: HifzMarkProps) {
  const id = `hm_${size}_${primary.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{
        display: "block",
        flexShrink: 0,
        filter: shadow ? "drop-shadow(0 4px 16px rgba(16,185,129,0.35))" : undefined,
      }}
    >
      <defs>
        <linearGradient id={`${id}_g1`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id={`${id}_g2`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gold} stopOpacity="1" />
          <stop offset="100%" stopColor={gold} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Octagon background */}
      <polygon
        points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30"
        fill={`url(#${id}_g1)`}
        stroke={gold}
        strokeWidth="2"
        strokeOpacity="0.6"
      />

      {/* Inner octagon ring */}
      <polygon
        points="34,12 66,12 88,34 88,66 66,88 34,88 12,66 12,34"
        fill="none"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />

      {/* Book pages — left */}
      <path
        d="M28 35 Q28 28 35 28 L50 30 L50 72 L35 70 Q28 70 28 63 Z"
        fill="rgba(255,255,255,0.18)"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
      />

      {/* Book pages — right */}
      <path
        d="M72 35 Q72 28 65 28 L50 30 L50 72 L65 70 Q72 70 72 63 Z"
        fill="rgba(255,255,255,0.10)"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="1"
      />

      {/* Spine */}
      <line x1="50" y1="30" x2="50" y2="72" stroke={gold} strokeWidth="1.5" strokeOpacity="0.8" />

      {/* Arabic ح */}
      <text
        x="50"
        y="57"
        textAnchor="middle"
        fontSize="22"
        fontFamily="'Scheherazade New', 'Amiri', serif"
        fill={gold}
        opacity="0.95"
      >
        ح
      </text>
    </svg>
  );
}

// ── HifzWordmark — mark + logotype lockup ────────────────────
interface HifzWordmarkProps {
  size?: number;
  textColor?: string;
  goldColor?: string;
  className?: string;
}

export function HifzWordmark({
  size = 36,
  textColor = "#10B981",
  goldColor = "#C4882A",
  className = "",
}: HifzWordmarkProps) {
  const taglineColor = "#FFFFFF"; // ← always white for maximum readability

  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: Math.round(size * 0.28),
        userSelect: "none",
      }}
    >
      {/* Mark */}
      <HifzMark size={size} primary="#0D5C3A" gold={goldColor} />

      {/* Text lockup */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
        {/* HifzPro wordmark */}
        <span
          style={{
            fontFamily: "'Cormorant Garamond', 'Georgia', serif",
            fontSize: Math.round(size * 0.72),
            fontWeight: 700,
            color: textColor,
            letterSpacing: "-0.01em",
            lineHeight: 1.1,
          }}
        >
          HifzPro
        </span>

        {/* Tagline — WHITE for full visibility */}
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            fontSize: Math.round(size * 0.225),
            fontWeight: 600,
            color: taglineColor,          // ← WHITE, not dim green
            letterSpacing: "0.12em",
            lineHeight: 1,
            marginTop: Math.round(size * 0.06),
            textTransform: "uppercase" as const,
            opacity: 0.9,               // ← near-full opacity
          }}
        >
          Memorize · Protect · Excel
        </span>
      </div>
    </div>
  );
}
