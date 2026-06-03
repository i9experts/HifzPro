"use client";
import { useState } from "react";
import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import { colors, fonts } from "@/lib/tokens";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", institution: "", email: "", phone: "", program: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  const inp = (field: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>{label}</label>
      <input
        type={type} value={form[field]} placeholder={placeholder}
        onChange={e => setForm({ ...form, [field]: e.target.value })}
        required
        style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, outline: "none", fontFamily: fonts.body, transition: "border-color 0.2s" }}
      />
    </div>
  );

  return (
    <main>
      <SiteNav />
      <PageHero label="CONTACT" title="Let's Talk About<br/>Your Institution." subtitle="Book a demo, ask a question, or just tell us about your Hifz program. We respond within 24 hours." />

      <section style={{ background: colors.n50, padding: "80px 5%" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 60, alignItems: "start" }}>

          {/* Left — contact info */}
          <div>
            <h2 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, margin: "0 0 16px" }}>Get in Touch</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500, lineHeight: 1.8, marginBottom: 32 }}>
              Whether you run a single halqa or a network of 20 campuses — we want to understand your needs before you sign up for anything.
            </p>
            {[
              { icon: "📧", label: "Email", value: "hello@hifzpro.com" },
              { icon: "💬", label: "WhatsApp", value: "+92 300 0000000" },
              { icon: "📍", label: "Based in", value: "Pakistan · Serving globally" },
              { icon: "⏰", label: "Response time", value: "Within 24 hours" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 14, marginBottom: 20, padding: "16px", background: colors.white, borderRadius: 12, border: `1px solid ${colors.n200}` }}>
                <span style={{ fontSize: 20 }}>{c.icon}</span>
                <div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.gold, marginBottom: 2 }}>{c.label.toUpperCase()}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.n800 }}>{c.value}</div>
                </div>
              </div>
            ))}

            <div style={{ background: colors.deep, borderRadius: 12, padding: 20, marginTop: 8 }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: colors.white, marginBottom: 8 }}>Book a Live Demo</div>
              <p style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, marginBottom: 12 }}>
                We will walk through the full platform with you — tailored to your institution&apos;s programs and setup.
              </p>
              <div style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.gold, letterSpacing: 1 }}>30 MINUTES · FREE · ONLINE</div>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ background: colors.white, borderRadius: 20, padding: 36, border: `1px solid ${colors.n200}`, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <h3 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, marginBottom: 10 }}>Message Received!</h3>
                <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500, lineHeight: 1.8 }}>
                  JazakAllah Khair for reaching out. We will get back to you within 24 hours, InshaAllah.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <h3 style={{ fontFamily: fonts.display, fontSize: "1.6rem", fontWeight: 700, color: colors.n800, margin: "0 0 24px" }}>Send Us a Message</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {inp("name", "Your Name *", "text", "e.g. Qari Abdullah")}
                  {inp("institution", "Institution Name *", "text", "e.g. Al-Noor Institute")}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  {inp("email", "Email Address *", "email", "your@email.com")}
                  {inp("phone", "WhatsApp Number", "tel", "+92 300 0000000")}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Programs Offered</label>
                  <select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}
                    style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, fontFamily: fonts.body }}>
                    <option value="">Select your program</option>
                    <option>Hifz ul Quran</option>
                    <option>Nazra</option>
                    <option>Tajweed / Qaidah</option>
                    <option>Multiple Programs</option>
                  </select>
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Message *</label>
                  <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={4} placeholder="Tell us about your institution — number of students, campuses, what you're looking for..."
                    style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, color: colors.n800, background: colors.white, fontFamily: fonts.body, resize: "vertical" }} />
                </div>
                <button type="submit" disabled={loading} style={{ width: "100%", padding: "14px", borderRadius: 10, background: loading ? colors.n300 : colors.primary, color: colors.white, fontSize: 14, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", fontFamily: fonts.heading }}>
                  {loading ? "Sending..." : "Send Message →"}
                </button>
                <div style={{ textAlign: "center", marginTop: 12, fontFamily: fonts.body, fontSize: 11, color: colors.n400 }}>
                  We respond within 24 hours · Your information is kept private
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
