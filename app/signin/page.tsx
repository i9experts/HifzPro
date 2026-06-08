"use client";
import { useState } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

type Role = "admin" | "ustadh" | "parent";
type Step = "phone" | "otp";

export default function SignInPage() {
  const [role, setRole]       = useState<Role>("admin");
  const [step, setStep]       = useState<Step>("phone");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [devOtp, setDevOtp]   = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp,   setOtp]   = useState("");

  const roles = [
    { id: "admin",  label: "Admin",  icon: "🏛" },
    { id: "ustadh", label: "Ustadh", icon: "📖" },
    { id: "parent", label: "Parent", icon: "👨‍👩‍👦" },
  ] as const;

  // ── Admin / Ustadh Sign In ──
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Sign in failed. Check your email and password.");
        return;
      }

      // Full page redirect — ensures cookie is read by middleware
      window.location.href = data.data.redirectTo || "/dashboard/admin";

    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Parent — Send OTP ──
  const handleSendOtp = async () => {
    if (!phone.trim()) { setError("Please enter your WhatsApp number"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/parent/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to send OTP");
        return;
      }

      if (data.data.devOtp) setDevOtp(data.data.devOtp);
      setStep("otp");
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Parent — Verify OTP ──
  const handleVerifyOtp = async () => {
    if (otp.length !== 6) { setError("Please enter the 6-digit OTP"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/parent/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Invalid OTP");
        return;
      }

      window.location.href = data.data.redirectTo || "/dashboard/parent";
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "11px 14px",
    border: `1.5px solid ${error ? colors.error : colors.n200}`,
    borderRadius: 8, fontSize: 13, color: colors.n800,
    background: colors.white, outline: "none",
    fontFamily: fonts.body,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${colors.deep} 0%, #0A2E1A 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 5%",
    }}>
      <div style={{ width: "100%", maxWidth: 440 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <HifzMark size={44} primary="#10B981" gold={colors.gold} />
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: fonts.display, fontSize: 24, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
              <div style={{ fontSize: 8, letterSpacing: 2.5, color: colors.gold, fontFamily: fonts.mono, marginTop: 3 }}>
                MEMORIZE · PROTECT · EXCEL
              </div>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div style={{ background: colors.white, borderRadius: 20, padding: 36, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>
          <h1 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 4px", textAlign: "center" }}>
            Welcome Back
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, textAlign: "center", marginBottom: 24 }}>
            Sign in to your HifzPro account
          </p>

          {/* Role selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 24, background: colors.n100, borderRadius: 10, padding: 4 }}>
            {roles.map(r => (
              <button key={r.id}
                onClick={() => { setRole(r.id); setError(""); setStep("phone"); }}
                style={{
                  flex: 1, padding: "9px 8px", borderRadius: 7, border: "none",
                  cursor: "pointer", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600,
                  transition: "all 0.2s",
                  background: role === r.id ? colors.white : "transparent",
                  color: role === r.id ? colors.primary : colors.n500,
                  boxShadow: role === r.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                }}>
                {r.icon} {r.label}
              </button>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{ background: colors.errorBg, border: `1px solid ${colors.error}33`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.errorText }}>⚠ {error}</span>
            </div>
          )}

          {/* Dev OTP */}
          {devOtp && (
            <div style={{ background: colors.warningBg, border: `1px solid ${colors.warning}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <span style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.warningText }}>
                🧪 Dev OTP: <strong>{devOtp}</strong>
              </span>
            </div>
          )}

          {/* Admin / Ustadh */}
          {(role === "admin" || role === "ustadh") && (
            <form onSubmit={handleSignIn}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>
                  Email Address
                </label>
                <input
                  type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={role === "admin" ? "admin@institution.com" : "ustadh@institution.com"}
                  required style={inputStyle}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700 }}>Password</label>
                  <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.primary, cursor: "pointer" }}>Forgot password?</span>
                </div>
                <input
                  type="password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required style={inputStyle}
                />
              </div>
              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "13px", borderRadius: 10,
                background: loading ? colors.n300 : colors.primary,
                color: colors.white, fontSize: 14, fontWeight: 700,
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                fontFamily: fonts.heading, transition: "all 0.2s",
              }}>
                {loading ? "Signing in..." : `Sign In as ${role === "admin" ? "Admin" : "Ustadh"}`}
              </button>
            </form>
          )}

          {/* Parent OTP */}
          {role === "parent" && (
            <div>
              {step === "phone" && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>
                      WhatsApp Number
                    </label>
                    <input
                      type="tel" value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+92 300 0000000" style={inputStyle}
                    />
                  </div>
                  <button onClick={handleSendOtp} disabled={loading} style={{
                    width: "100%", padding: "13px", borderRadius: 10,
                    background: loading ? colors.n300 : colors.primary,
                    color: colors.white, fontSize: 14, fontWeight: 700,
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: fonts.heading,
                  }}>
                    {loading ? "Sending OTP..." : "Send OTP via WhatsApp"}
                  </button>
                </>
              )}
              {step === "otp" && (
                <>
                  <div style={{ background: colors.successBg, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.successText }}>✓ OTP sent to {phone}</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>
                      Enter 6-Digit OTP
                    </label>
                    <input
                      type="text" value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000" maxLength={6}
                      style={{ ...inputStyle, fontSize: 24, textAlign: "center", letterSpacing: 12, fontFamily: fonts.mono }}
                    />
                  </div>
                  <button onClick={handleVerifyOtp} disabled={loading} style={{
                    width: "100%", padding: "13px", borderRadius: 10,
                    background: loading ? colors.n300 : colors.primary,
                    color: colors.white, fontSize: 14, fontWeight: 700,
                    border: "none", cursor: loading ? "not-allowed" : "pointer",
                    fontFamily: fonts.heading, marginBottom: 10,
                  }}>
                    {loading ? "Verifying..." : "Verify & Sign In"}
                  </button>
                  <button onClick={() => { setStep("phone"); setOtp(""); setError(""); setDevOtp(""); }} style={{
                    width: "100%", padding: "10px", borderRadius: 10,
                    background: "transparent", border: `1px solid ${colors.n200}`,
                    color: colors.n500, fontSize: 13, cursor: "pointer", fontFamily: fonts.heading,
                  }}>
                    ← Change Number
                  </button>
                </>
              )}
            </div>
          )}

          <div style={{ textAlign: "center", marginTop: 20, fontFamily: fonts.body, fontSize: 13, color: colors.n500 }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: colors.primary, fontWeight: 600, textDecoration: "none" }}>
              Get Started Free
            </Link>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 20 }}>
          <Link href="/" style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none" }}>
            ← Back to hifzpro.com
          </Link>
        </div>
      </div>
    </div>
  );
}
