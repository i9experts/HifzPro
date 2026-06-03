// components/ui/HifzMark.tsx
// The Sealed Quran — Final HifzPro Logo Mark

interface HifzMarkProps {
  size?: number;
  primary?: string;
  gold?: string;
  className?: string;
}

export default function HifzMark({
  size = 48,
  primary = "#0D5C3A",
  gold = "#C4882A",
  className = "",
}: HifzMarkProps) {
  const id = `hm_${size}_${primary.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ display: "block", flexShrink: 0 }}
      aria-label="HifzPro Logo"
    >
      <defs>
        <radialGradient id={`${id}_g`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.14" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.03" />
        </radialGradient>
        <linearGradient id={`${id}_lp`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.18" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id={`${id}_rp`} x1="100%" y1="0%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={primary} stopOpacity="0.13" />
          <stop offset="100%" stopColor={primary} stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Outer octagon fill */}
      <polygon
        points="33.5,10.3 66.5,10.3 89.7,33.5 89.7,66.5 66.5,89.7 33.5,89.7 10.3,66.5 10.3,33.5"
        fill={`url(#${id}_g)`}
      />
      {/* Outer octagon border — The Seal */}
      <polygon
        points="33.5,10.3 66.5,10.3 89.7,33.5 89.7,66.5 66.5,89.7 33.5,89.7 10.3,66.5 10.3,33.5"
        fill="none"
        stroke={primary}
        strokeWidth="3.2"
        strokeLinejoin="miter"
      />
      {/* Inner octagon ring — gold */}
      <polygon
        points="37.2,18.6 62.8,18.6 81.4,37.2 81.4,62.8 62.8,81.4 37.2,81.4 18.6,62.8 18.6,37.2"
        fill="none"
        stroke={gold}
        strokeWidth="0.75"
        strokeOpacity="0.65"
        strokeLinejoin="miter"
      />
      {/* 4-corner diamond ornaments (4-pointed only) */}
      {([
        [24.9, 24.9], [75.1, 24.9], [75.1, 75.1], [24.9, 75.1],
      ] as [number, number][]).map(([cx, cy], i) => (
        <polygon
          key={i}
          points={`${cx},${cy - 3.1} ${cx + 3.1},${cy} ${cx},${cy + 3.1} ${cx - 3.1},${cy}`}
          fill={gold}
          fillOpacity="0.72"
        />
      ))}
      {/* Cardinal accent dots */}
      {([
        [50, 14.4], [50, 85.6], [14.4, 50], [85.6, 50],
      ] as [number, number][]).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.1" fill={gold} fillOpacity="0.45" />
      ))}
      {/* Left page */}
      <path
        d="M 50,23.5 L 21,32 L 21,68 L 50,76.5"
        fill={`url(#${id}_lp)`}
        stroke={primary}
        strokeWidth="1.15"
        strokeLinejoin="round"
        strokeOpacity="0.75"
      />
      {/* Right page */}
      <path
        d="M 50,23.5 L 79,32 L 79,68 L 50,76.5"
        fill={`url(#${id}_rp)`}
        stroke={primary}
        strokeWidth="1.15"
        strokeLinejoin="round"
        strokeOpacity="0.65"
      />
      {/* Gold spine */}
      <line x1="50" y1="20.5" x2="50" y2="79.5"
        stroke={gold} strokeWidth="1.6" strokeLinecap="round" />
      {/* Spine finial */}
      <polygon points="50,17 52.2,20.5 50,24 47.8,20.5" fill={gold} fillOpacity="0.9" />
      <circle cx="50" cy="81.5" r="1.3" fill={gold} fillOpacity="0.55" />
      {/* Ayah lines — left page */}
      {([
        [26, 40, 46, 40], [26, 47.5, 44, 47.5],
        [26, 55, 45.5, 55], [26, 62.5, 43, 62.5],
      ] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={primary} strokeWidth="0.65"
          strokeLinecap="round" strokeOpacity={0.27 + i * 0.03} />
      ))}
      {/* Ayah lines — right page */}
      {([
        [54, 40, 74, 40], [56, 47.5, 74, 47.5],
        [54.5, 55, 74, 55], [57, 62.5, 74, 62.5],
      ] as [number, number, number, number][]).map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke={primary} strokeWidth="0.65"
          strokeLinecap="round" strokeOpacity={0.21 + i * 0.03} />
      ))}
      {/* Top decorative arch */}
      <path d="M 40,24.5 Q 50,19.5 60,24.5"
        fill="none" stroke={gold}
        strokeWidth="0.6" strokeOpacity="0.5" strokeLinecap="round" />
    </svg>
  );
}
