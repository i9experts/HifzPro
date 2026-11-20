"use client";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
  action?: { label: string; href: string };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div style={{
      textAlign: "center", padding: "48px 24px", background: colors.white,
      borderRadius: 16, border: `1px dashed ${colors.n200}`,
    }}>
      <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.8 }}>{icon}</div>
      <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: colors.n700 }}>{title}</div>
      {description && (
        <div style={{ fontSize: 13, color: colors.n500, marginTop: 6, maxWidth: 360, marginInline: "auto", lineHeight: 1.6 }}>
          {description}
        </div>
      )}
      {action && (
        <Link href={action.href} style={{
          display: "inline-block", marginTop: 16, padding: "9px 18px", borderRadius: 9,
          background: colors.primary, color: "white", fontFamily: fonts.heading, fontWeight: 700,
          fontSize: 13, textDecoration: "none",
        }}>
          {action.label}
        </Link>
      )}
    </div>
  );
}
