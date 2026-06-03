"use client";
import { useState } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const steps = ["Institution", "Programs", "Account", "Done"];

export default function GetStartedPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    institutionName: "", city: "", campuses: "1", students: "",
    programs: [] as string[], plan: "Growth",
    name: "", email: "", phone: "", password: "",
  });

  const programOptions = ["Hifz ul Quran", "Nazra", "Tajweed / Qaidah", "Girdaan / Dohraai"];
  const toggleProgram = (p: string) => setForm(f => ({ ...f, programs: f.programs.includes(p) ? f.programs.filter(x => x !== p) : [...f.programs, p] }));

  const inp = (field: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>{label}</label>
      <input type={type} value={form[field] as string} onChange={e => setForm({ ...form, [field]: e.target.value })} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, outline: "none", fontFamily: fonts.body }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${colors.deep} 0%, #0A2E1A 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 5%" }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
            <HifzMark size={40} primary="#10B981" gold={colors.gold} />
            <div style={{ fontFamily: fonts.display, fontSize: 22, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
          </Link>
        </div>

        {/* Progress steps */}
        <div style={{ display: "flex", gap: 0, marginBottom: 28, background: "rgba(255,255,255,0.06)", borderRadius: 12, overflow: "hidden" }}>
          {steps.map((s, i) => (
            <div key={i} style={{ flex: 1, padding: "10px 8px", textAlign: "center", background: i === step ? colors.primary : "transparent", transition: "background 0.2s" }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 1, color: i === step ? colors.gold : "rgba(255,255,255,0.3)" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: i === step ? colors.white : "rgba(255,255,255,0.3)", marginTop: 2 }}>{s}</div>
            </div>
          ))}
        </div>

        {/* Card */}
        <div style={{ background: colors.white, borderRadius: 20, padding: 36, boxShadow: "0 16px 48px rgba(0,0,0,0.3)" }}>

          {/* Step 0 — Institution */}
          {step === 0 && (
            <div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px" }}>Your Institution</h2>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, marginBottom: 24 }}>Tell us about your Hifz institution.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {inp("institutionName", "Institution Name *", "text", "e.g. Al-Noor Hifz Institute")}
                {inp("city", "City *", "text", "e.g. Karachi, Lahore, Islamabad")}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Number of Campuses</label>
                    <select value={form.campuses} onChange={e => setForm({ ...form, campuses: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, fontFamily: fonts.body }}>
                      {["1", "2", "3", "4-10", "10+"].map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  {inp("students", "Approx. Students", "number", "e.g. 80")}
                </div>
              </div>
            </div>
          )}

          {/* Step 1 — Programs */}
          {step === 1 && (
            <div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px" }}>Programs Offered</h2>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, marginBottom: 24 }}>Select all programs your institution offers.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                {programOptions.map(p => (
                  <div key={p} onClick={() => toggleProgram(p)}
                    style={{ padding: "14px 16px", borderRadius: 10, border: `2px solid ${form.programs.includes(p) ? colors.primary : colors.n200}`, background: form.programs.includes(p) ? colors.green50 : colors.white, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${form.programs.includes(p) ? colors.primary : colors.n300}`, background: form.programs.includes(p) ? colors.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {form.programs.includes(p) && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
                    </div>
                    <span style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: form.programs.includes(p) ? 600 : 400, color: form.programs.includes(p) ? colors.primary : colors.n700 }}>{p}</span>
                  </div>
                ))}
              </div>
              <div>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 10 }}>Select Plan</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {[{ name: "Starter", price: "PKR 4,999" }, { name: "Growth", price: "PKR 12,999" }, { name: "Enterprise", price: "Custom" }].map(p => (
                    <div key={p.name} onClick={() => setForm({ ...form, plan: p.name })}
                      style={{ padding: "12px 8px", borderRadius: 10, border: `2px solid ${form.plan === p.name ? colors.primary : colors.n200}`, background: form.plan === p.name ? colors.green50 : colors.white, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: form.plan === p.name ? colors.primary : colors.n700 }}>{p.name}</div>
                      <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.gold, marginTop: 2 }}>{p.price}/mo</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 — Account */}
          {step === 2 && (
            <div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px" }}>Create Your Account</h2>
              <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, marginBottom: 24 }}>This will be the Admin account for your institution.</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {inp("name", "Full Name *", "text", "e.g. Muhammad Atiq")}
                {inp("email", "Email Address *", "email", "admin@yourinstitution.com")}
                {inp("phone", "WhatsApp Number *", "tel", "+92 300 0000000")}
                {inp("password", "Password *", "password", "Min. 8 characters")}
              </div>
              <div style={{ background: colors.green50, borderRadius: 8, padding: "10px 14px", marginTop: 14 }}>
                <span style={{ fontFamily: fonts.body, fontSize: 11, color: colors.successText }}>✓ 30-day free trial · No credit card required · Cancel anytime</span>
              </div>
            </div>
          )}

          {/* Step 3 — Done */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, marginBottom: 10 }}>Mubarak! You&apos;re In.</h2>
              <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500, lineHeight: 1.8, marginBottom: 24 }}>
                Your HifzPro account has been created. Check your email for login details. Your 30-day free trial starts now.
              </p>
              <div style={{ background: colors.green50, borderRadius: 12, padding: 20, marginBottom: 24, border: `1px solid ${colors.green200}`, textAlign: "left" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.primary, marginBottom: 10 }}>Next Steps:</div>
                {["Add your Asatidha accounts", "Enrol your first students", "Record your first Sabaq", "Invite parents to receive updates"].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                    <span style={{ color: colors.success, fontWeight: 700 }}>{i + 1}.</span>
                    <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n700 }}>{s}</span>
                  </div>
                ))}
              </div>
              <Link href="/signin" style={{ display: "block", padding: "14px", borderRadius: 10, background: colors.primary, color: colors.white, fontSize: 14, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading, textAlign: "center" }}>
                Go to My Dashboard →
              </Link>
            </div>
          )}

          {/* Navigation buttons */}
          {step < 3 && (
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)}
                  style={{ flex: 1, padding: "13px", borderRadius: 10, background: "transparent", border: `2px solid ${colors.n200}`, color: colors.n600, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: fonts.heading }}>
                  ← Back
                </button>
              )}
              <button onClick={() => setStep(s => s + 1)}
                style={{ flex: 2, padding: "13px", borderRadius: 10, background: colors.primary, color: colors.white, fontSize: 14, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
                {step === 2 ? "Create Account →" : "Continue →"}
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
          Already have an account?{" "}
          <Link href="/signin" style={{ color: colors.gold, textDecoration: "none" }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
