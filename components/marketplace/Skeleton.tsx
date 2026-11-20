"use client";
import { colors } from "@/lib/tokens";

export function SkeletonBlock({ width = "100%", height = 14, radius = 6, style = {} }: { width?: string | number; height?: number; radius?: number; style?: React.CSSProperties }) {
  return (
    <>
      <div className="hp-skeleton" style={{ width, height, borderRadius: radius, ...style }} />
      <style jsx>{`
        .hp-skeleton {
          background: linear-gradient(90deg, ${colors.n100} 25%, ${colors.n200} 37%, ${colors.n100} 63%);
          background-size: 400% 100%;
          animation: hp-shimmer 1.4s ease infinite;
        }
        @keyframes hp-shimmer {
          0% { background-position: 100% 50%; }
          100% { background-position: 0 50%; }
        }
      `}</style>
    </>
  );
}

export function TeacherCardSkeleton() {
  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: 18, display: "flex", gap: 14, alignItems: "flex-start" }}>
      <SkeletonBlock width={48} height={48} radius={999} />
      <div style={{ flex: 1, display: "grid", gap: 8 }}>
        <SkeletonBlock width="55%" height={15} />
        <SkeletonBlock width="35%" height={12} />
        <SkeletonBlock width="90%" height={12} />
        <div style={{ display: "flex", gap: 6 }}>
          <SkeletonBlock width={60} height={20} radius={999} />
          <SkeletonBlock width={60} height={20} radius={999} />
        </div>
      </div>
    </div>
  );
}
