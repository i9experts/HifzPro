"use client";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const MODULES = [
  {
    href: "/marketplace",
    icon: "🔍",
    title: "Find a Teacher",
    desc: "Browse and filter independent Qari Sahiban and Mu'allimat",
    color: colors.primary,
    bg: colors.green50,
    border: colors.green200,
  },
  {
    href: "/dashboard/family/inquiries",
    icon: "💬",
    title: "Inquiries",
    desc: "Your conversations with teachers",
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
];

export default function FamilyDashboardPage() {
  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      <header style={{ background: colors.primary, padding: "18px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <HifzMark size={28} />
        <div>
          <div style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700, fontSize: 16 }}>Family Dashboard</div>
          <div style={{ color: colors.green100, fontSize: 12 }}>Quran Teacher Marketplace</div>
        </div>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
        <div style={{ display: "grid", gap: 14 }}>
          {MODULES.map(m => (
            <Link key={m.href} href={m.href} style={{ textDecoration: "none" }}>
              <div style={{ background: m.bg, border: `1.5px solid ${m.border}`, borderRadius: 16, padding: "18px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28 }}>{m.icon}</div>
                <div>
                  <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 16, color: m.color }}>{m.title}</div>
                  <div style={{ fontSize: 13, color: colors.n600, marginTop: 2 }}>{m.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
