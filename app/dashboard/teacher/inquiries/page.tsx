"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import EmptyState from "@/components/marketplace/EmptyState";
import { SkeletonBlock } from "@/components/marketplace/Skeleton";
import { colors, fonts, shadows } from "@/lib/tokens";

interface Inquiry {
  id: string; status: string; updatedAt: string;
  parent: { user: { name: string } };
  messages: { body: string; createdAt: string; readAt: string | null; senderId: string }[];
}

const STATUS_COLOR: Record<string, { color: string; bg: string }> = {
  PENDING:  { color: colors.warningText, bg: colors.warningBg },
  ACCEPTED: { color: colors.successText, bg: colors.successBg },
  DECLINED: { color: colors.errorText,   bg: colors.errorBg },
  CLOSED:   { color: colors.n600,        bg: colors.n100 },
};

export default function TeacherInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketplace/inquiries")
      .then(r => r.json())
      .then(d => { if (d.success) setInquiries(d.data.inquiries); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      <header style={{ background: colors.primary, padding: "18px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/dashboard/teacher" style={{ textDecoration: "none" }}><HifzMark size={28} /></Link>
        <div style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700, fontSize: 16 }}>Inquiries</div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px" }}>
        {loading && (
          <div style={{ display: "grid", gap: 10 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 16, display: "grid", gap: 8 }}>
                <SkeletonBlock width="40%" height={15} />
                <SkeletonBlock width="70%" height={12} />
              </div>
            ))}
          </div>
        )}
        {!loading && inquiries.length === 0 && (
          <EmptyState icon="📭" title="No inquiries yet" description="Once your profile is listed, parent messages will show up here." />
        )}
        <div style={{ display: "grid", gap: 10 }}>
          {inquiries.map(inq => {
            const last = inq.messages[0];
            const st = STATUS_COLOR[inq.status] || STATUS_COLOR.CLOSED;
            return (
              <Link key={inq.id} href={`/dashboard/teacher/inquiries/${inq.id}`} style={{ textDecoration: "none" }}>
                <div className="hp-row-card" style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: 16, display: "flex", justifyContent: "space-between", gap: 10, boxShadow: shadows.sm }}>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 15, color: colors.n800 }}>{inq.parent.user.name}</div>
                    {last && <div style={{ fontSize: 13, color: colors.n600, marginTop: 4, maxWidth: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{last.body}</div>}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: st.color, background: st.bg, padding: "3px 10px", borderRadius: 999, height: "fit-content" }}>{inq.status}</span>
                </div>
              </Link>
            );
          })}
        </div>
        <style jsx global>{`
          .hp-row-card { transition: box-shadow 0.15s ease; }
          .hp-row-card:hover { box-shadow: ${shadows.md}; }
        `}</style>
      </main>
    </div>
  );
}
