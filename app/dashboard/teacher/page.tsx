"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { SkeletonBlock } from "@/components/marketplace/Skeleton";
import { colors, fonts, shadows } from "@/lib/tokens";

interface Profile {
  isListed: boolean;
  avgRating: number | null;
  totalReviews: number;
  avgResponseMinutes: number | null;
  responseSampleCount: number;
  verificationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  verificationTier: string;
  verificationRejectionReason: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  govIdType: string | null;
  govIdDocumentUrl: string | null;
  qualification: string | null;
  educationDocumentUrl: string | null;
  ijazahChain: string | null;
  ijazahIssuer: string | null;
  ijazahDocumentUrl: string | null;
  videoIntroUrl: string | null;
  references: { id: string }[];
  user: { name: string; avatar: string | null };
}

interface Inquiry { status: string }

const PROFILE_FIELDS_TOTAL = 7; // kept in sync with minimumFieldsMissing() in the profile API

const TIER_LABELS: Record<string, string> = {
  UNVERIFIED: "Unverified",
  ID_VERIFIED: "ID Verified",
  CREDENTIAL_VERIFIED: "Credential Verified",
  BACKGROUND_CHECKED: "Background Checked",
};

function applicationProgress(p: Profile) {
  const steps = [
    !!(p.dateOfBirth && p.nationality && p.govIdType && p.govIdDocumentUrl),
    !!(p.qualification && p.educationDocumentUrl),
    !!(p.ijazahChain && p.ijazahIssuer && p.ijazahDocumentUrl),
    !!p.videoIntroUrl,
    p.references.length > 0,
  ];
  return { done: steps.filter(Boolean).length, total: steps.length };
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  if (minutes < 24 * 60) return `~${Math.round(minutes / 60)} hr`;
  return `~${Math.round(minutes / (24 * 60))} day${minutes >= 2 * 24 * 60 ? "s" : ""}`;
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name;
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ background: colors.n100, borderRadius: 999, height: 6, overflow: "hidden", marginTop: 8 }}>
      <div style={{ width: `${Math.max(pct, 3)}%`, height: "100%", background: color, borderRadius: 999, transition: "width 0.3s ease" }} />
    </div>
  );
}

function StatTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "14px 16px", flex: "1 1 130px", minWidth: 130 }}>
      <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n500, textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</div>
      <div style={{ fontFamily: fonts.heading, fontSize: 24, fontWeight: 700, color: colors.n800, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: colors.n500, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function TeacherDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/marketplace/teacher/profile").then(r => r.json()),
      fetch("/api/marketplace/inquiries").then(r => r.json()),
      fetch("/api/ustadh/students").then(r => r.json()),
    ]).then(([profileRes, inquiriesRes, studentsRes]) => {
      if (profileRes.success) {
        setProfile(profileRes.data.profile);
        setMissing(profileRes.data.missingForListing || []);
      }
      if (inquiriesRes.success) setInquiries(inquiriesRes.data.inquiries || []);
      if (studentsRes.success) setStudentCount((studentsRes.data.students || []).length);
    }).finally(() => setLoading(false));
  }, []);

  const profilePct = Math.round(((PROFILE_FIELDS_TOTAL - missing.length) / PROFILE_FIELDS_TOTAL) * 100);
  const app = profile ? applicationProgress(profile) : { done: 0, total: 5 };
  const appPct = Math.round((app.done / app.total) * 100);
  const newInquiries = inquiries.filter(i => i.status === "PENDING").length;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body }}>
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px 48px", display: "grid", gap: 18 }}>
        {loading ? (
          <SkeletonBlock width="60%" height={26} />
        ) : (
          <h1 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 700, color: colors.n800 }}>
            Assalamu Alaikum{profile ? `, ${firstName(profile.user.name)}` : ""}!
          </h1>
        )}

        {/* Hadith banner */}
        <div style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryDark})`, borderRadius: 16, padding: "22px 24px", textAlign: "center", boxShadow: shadows.md }}>
          <div dir="rtl" style={{ fontFamily: "'Scheherazade New',serif", fontSize: 26, color: colors.goldLight, lineHeight: 1.6 }}>
            خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ
          </div>
          <div style={{ fontFamily: fonts.display, fontStyle: "italic", fontSize: 15, color: colors.green100, marginTop: 10 }}>
            "The best among you are those who learn the Qur'an and teach it."
          </div>
          <div style={{ fontSize: 11, color: colors.green200, marginTop: 6, letterSpacing: 0.4, textTransform: "uppercase" }}>
            Sahih al-Bukhari 5027
          </div>
        </div>

        {/* Progress cards */}
        {!loading && profile && (
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, color: colors.n800 }}>
                  Complete your profile <span style={{ fontWeight: 400, color: colors.n500 }}>— {profilePct}% done</span>
                </div>
                <div style={{ fontSize: 12, color: colors.n500, marginTop: 2 }}>Bio, qiraat, rate, languages and availability parents need to evaluate you</div>
                <ProgressBar pct={profilePct} color={colors.primary} />
              </div>
              <Link href="/dashboard/teacher/profile" style={{ textDecoration: "none", flexShrink: 0 }}>
                <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.primary, background: colors.green50, border: `1px solid ${colors.green200}`, borderRadius: 8, padding: "8px 14px", whiteSpace: "nowrap" }}>Continue</span>
              </Link>
            </div>

            <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "16px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, color: colors.n800 }}>
                  Onboarding application
                  {profile.verificationStatus === "APPROVED" && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: colors.successText, background: colors.successBg, borderRadius: 999, padding: "2px 8px" }}>✓ {TIER_LABELS[profile.verificationTier] || "Approved"}</span>
                  )}
                  {profile.verificationStatus === "PENDING" && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: colors.warningText, background: colors.warningBg, borderRadius: 999, padding: "2px 8px" }}>Under review</span>
                  )}
                  {profile.verificationStatus === "REJECTED" && (
                    <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 700, color: colors.errorText, background: colors.errorBg, borderRadius: 999, padding: "2px 8px" }}>Needs changes</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: colors.n500, marginTop: 2 }}>
                  {profile.verificationStatus === "APPROVED" && "You're verified and eligible to list yourself publicly."}
                  {profile.verificationStatus === "PENDING" && "Submitted — an admin is reviewing your identity, education and references."}
                  {profile.verificationStatus === "REJECTED" && (profile.verificationRejectionReason || "An admin asked for changes — resubmit when ready.")}
                  {profile.verificationStatus === "NONE" && "Identity, education, ijazah/sanad and references — required before you can be listed"}
                </div>
                {profile.verificationStatus !== "APPROVED" && <ProgressBar pct={appPct} color={colors.gold} />}
              </div>
              <Link href="/dashboard/teacher/profile" style={{ textDecoration: "none", flexShrink: 0 }}>
                <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.goldDark, background: "#FBF3E4", border: `1px solid ${colors.gold}55`, borderRadius: 8, padding: "8px 14px", whiteSpace: "nowrap" }}>
                  {profile.verificationStatus === "NONE" ? "Start" : profile.verificationStatus === "REJECTED" ? "Resubmit" : "View"}
                </span>
              </Link>
            </div>
          </div>
        )}

        {/* Stats */}
        {loading ? (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[0, 1, 2, 3, 4].map(i => <SkeletonBlock key={i} width={130} height={70} radius={14} />)}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <StatTile label="My Students" value={studentCount != null ? String(studentCount) : "—"} sub={studentCount ? "actively enrolled" : "none yet"} />
            <StatTile label="New Inquiries" value={String(newInquiries)} sub={newInquiries > 0 ? "awaiting your reply" : "all caught up"} />
            <StatTile
              label="Rating"
              value={profile?.avgRating != null ? profile.avgRating.toFixed(1) : "—"}
              sub={profile && profile.totalReviews > 0 ? `${profile.totalReviews} review${profile.totalReviews === 1 ? "" : "s"}` : "no reviews yet"}
            />
            <StatTile
              label="Reply Time"
              value={profile?.avgResponseMinutes != null && profile.responseSampleCount > 0 ? formatResponseTime(profile.avgResponseMinutes) : "—"}
              sub="average first reply"
            />
            <StatTile label="Listing" value={profile?.isListed ? "Live" : "Not listed"} sub={profile?.isListed ? "visible to parents" : "finish profile + application"} />
          </div>
        )}
      </main>
    </div>
  );
}
