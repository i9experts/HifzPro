"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

function inputStyle(): React.CSSProperties {
  return { width: "100%", padding: "11px 13px", borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 14, fontFamily: fonts.body, outline: "none" };
}
function labelStyle(): React.CSSProperties {
  return { fontFamily: fonts.heading, fontWeight: 600, fontSize: 13, color: colors.n700, marginBottom: 6, display: "block" };
}

function JoinAsParentForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/marketplace";
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", country: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace/signup/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Signup failed"); return; }
      window.location.href = next;
    } catch {
      setError("Signup failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 16px" }}>
      <Link href="/marketplace" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 24 }}>
        <HifzMark size={36} />
        <span style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 18, color: colors.n800 }}>HifzPro Marketplace</span>
      </Link>

      <form onSubmit={submit} style={{ width: "100%", maxWidth: 420, background: colors.white, borderRadius: 18, border: `1px solid ${colors.n200}`, padding: 26 }}>
        <h1 style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 20, marginBottom: 4 }}>Find a Quran teacher</h1>
        <p style={{ fontSize: 13, color: colors.n600, marginBottom: 20 }}>Sign up to message teachers and arrange trial lessons.</p>

        <div style={{ display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle()}>Your name</label>
            <input required type="text" value={form.name} onChange={e => set("name", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Email</label>
            <input required type="email" value={form.email} onChange={e => set("email", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Phone (with country code)</label>
            <input required type="text" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1..." style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Password</label>
            <input required type="password" minLength={8} value={form.password} onChange={e => set("password", e.target.value)} style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Country</label>
            <input required type="text" value={form.country} onChange={e => set("country", e.target.value)} placeholder="United States" style={inputStyle()} />
          </div>
        </div>

        {error && <div style={{ color: colors.errorText, background: colors.errorBg, padding: "10px 12px", borderRadius: 8, fontSize: 13, marginTop: 14 }}>{error}</div>}

        <button type="submit" disabled={saving} style={{ width: "100%", marginTop: 18, padding: "12px", borderRadius: 10, border: "none", background: colors.primary, color: "white", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {saving ? "Creating account…" : "Create account"}
        </button>

        <div style={{ textAlign: "center", marginTop: 14, fontSize: 13, color: colors.n600 }}>
          Are you a teacher? <Link href="/marketplace/join/teacher" style={{ color: colors.primary, fontWeight: 600 }}>Sign up to teach</Link>
        </div>
      </form>
    </div>
  );
}

export default function JoinAsParentPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading…</div>}>
      <JoinAsParentForm />
    </Suspense>
  );
}
