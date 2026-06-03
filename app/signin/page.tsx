"use client";
import { useState } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

export default function SignInPage() {
  const [role, setRole] = useState<"admin" | "ustadh" | "parent">("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const roles = [
    { id: "admin",  label: "Admin",  icon: "🏛" },
    { id: "ustadh", label: "Ustadh", icon: "📖" },
    { id: "parent", label: "Parent", icon: "👨‍👩‍👦" },
  ] as const;

  const handleSendOtp = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setOtpSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${colors.deep} 0%, #0A2E1A 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 5%" }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <HifzMark size={44} primary="#10B981" gold={colors.gold} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
              <div style={{ fontSize: 8, letterSpacing: 2.5, color: colors.gold, fontFamily: fonts.mono, marginTop: 3 }}>MEMORIZE · PROTECT · EXCEL</div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: colors.white, borderRadius: 20, padding: 36, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
          <h1 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px", textAlign: "center" }}>Welcome Back</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, textAlign: "center", marginBottom: 24 }}>Sign in to your HifzPro account</p>

          {/* Role selector */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24, background: colors.n100, borderRadius: 10, padding: 4 }}>
            {roles.map(r => (
              <button key={r.id} onClick={() => { setRole(r.id); setOtpSent(false); }}
                style={{ flex: 1, padding: "9px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, transition: "all 0.2s", background: role === r.id ? colors.white : "transparent", color: role === r.id ? colors.primary : colors.n500, boxShadow: role === r.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none" }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          {/* Admin / Ustadh form */}
          {(role === "admin" || role === "ustadh") && (
            <form onSubmit={e => e.preventDefault()}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Email Address</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@institution.com" required
                  style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, outline: "none", fontFamily: fonts.body }} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700 }}>Password</label>
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.primary, cursor: "pointer" }}>Forgot password?</span>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                  style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, outline: "none", fontFamily: fonts.body }} />
              </div>
              <button type="submit"
                style={{ width: "100%", padding: "13px", borderRadius: 10, background: colors.primary, color: colors.white, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
                Sign In as {role === "admin" ? "Admin" : "Ustadh"}
              </button>
            </form>
          )}

          {/* Parent OTP form */}
          {role === "parent" && (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>WhatsApp Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+92 300 0000000"
                  style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, outline: "none", fontFamily: fonts.body }} />
              </div>
              {!otpSent ? (
                <button onClick={handleSendOtp} disabled={loading}
                  style={{ width: "100%", padding: "13px", borderRadius: 10, background: colors.primary, color: colors.white, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
                  {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
                </button>
              ) : (
                <>
                  <div style={{ background: colors.successBg, borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.successText }}>✓ OTP sent to your WhatsApp number</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Enter OTP</label>
                    <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 18, textAlign: "center", letterSpacing: 8, color: colors.n800, background: colors.white, outline: "none", fontFamily: fonts.mono }} />
                  </div>
                  <button style={{ width: "100%", padding: "13px", borderRadius: 10, background: colors.primary, color: colors.white, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
                    Verify & Sign In
                  </button>
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 20, fontFamily: fonts.body, fontSize: 13, color: colors.n500 }}>
            Don&apos;t have an account?{" "}
            <Link href="/get-started" style={{ color: colors.primary, fontWeight: 600, textDecoration: "none" }}>Get Started Free</Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/" style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>← Back to hifzpro.com</Link>
        </div>
      </div>
    </div>
  );
}
