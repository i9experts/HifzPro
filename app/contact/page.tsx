"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { colors, fonts, shadows } from "@/lib/tokens";

const INFO = [
  { icon: "📍", label: "Office Address",  value: "D-8/5, Shahrah-e-Jahangir",   note: "Gulberg Town, Karachi, Sindh, Pakistan" },
  { icon: "📧", label: "Email",           value: "info@i9experts.com",            note: "Response within 24 hours",   href: "mailto:info@i9experts.com" },
  { icon: "💬", label: "WhatsApp",        value: "+92-300-2517280",               note: "Fastest way to reach us",    href: "https://wa.me/923002517280" },
];

const INQUIRY_TYPES = ["General Inquiry","Request a Demo","Pricing Question","Technical Support","Partnership / Integration","Media / Press","Other"];
const STUDENT_SIZES = ["1–20 students (Small Halqa)","21–50 students (Small Institute)","51–200 students (Medium Institute)","201–500 students (Large Institute)","500+ students (Enterprise)"];

type FormState = {
  type: string; name: string; institution: string;
  email: string; wa: string; students: string; message: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: `1.5px solid ${colors.n200}`, background: colors.white,
  color: colors.n800, fontFamily: fonts.body,
  fontSize: 14, outline: "none",
};

export default function ContactPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState<FormState>({ type: "", name: "", institution: "", email: "", wa: "", students: "", message: "" });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submitEmail = () => {
    if (!form.name || !form.message) { alert("Please fill in your name and message."); return; }
    window.location.href = `mailto:info@i9experts.com?subject=HifzPro Inquiry: ${form.type || "General"}&body=Name: ${form.name}%0AInstitution: ${form.institution}%0AEmail: ${form.email}%0AStudents: ${form.students}%0A%0AMessage: ${form.message}`;
  };

  const submitWA = () => {
    const text = `السلام علیکم\n\nName: ${form.name}\nInstitution: ${form.institution}\nInquiry: ${form.type || "General"}\n\nMessage: ${form.message}`;
    window.open(`https://wa.me/923002517280?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ background: colors.white, minHeight: "100vh", color: colors.n800, fontFamily: fonts.body }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: 48, paddingLeft: 24, paddingRight: 24, maxWidth: 1100, margin: "0 auto", background: `linear-gradient(180deg, ${colors.green50} 0%, ${colors.white} 100%)` }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <Link href="/" style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n500, textDecoration: "none" }}>Home</Link>
          <span style={{ color: colors.n400, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.primary }}>Contact</span>
        </div>
        <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 12, fontWeight: 700 }}>GET IN TOUCH</div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "2rem" : "clamp(2rem,5vw,3.2rem)", fontWeight: 800, color: colors.n800, margin: "0 0 14px" }}>We're Here to Help</h1>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n600, maxWidth: 520, lineHeight: 1.75, margin: 0 }}>
          Questions about HifzPro? Need a demo? We respond within 24 hours — usually much faster via WhatsApp.
        </p>
      </section>

      {/* Grid */}
      <section style={{ padding: isMobile ? "0 20px 64px" : "0 24px 80px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1.6fr", gap: 40 }}>

          {/* Left: info */}
          <div>
            {/* WhatsApp instant */}
            <a href="https://wa.me/923002517280?text=السلام علیکم، میں HifzPro کے بارے میں معلومات چاہتا ہوں" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none" }}>
              <div style={{ background: "#128c7e", borderRadius: 16, padding: "18px 20px", display: "flex", gap: 14, alignItems: "center", marginBottom: 16, cursor: "pointer", boxShadow: "0 8px 24px rgba(18,140,126,0.25)" }}>
                <span style={{ fontSize: 28 }}>💬</span>
                <div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.white, marginBottom: 2 }}>Chat on WhatsApp — Instant Response</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.85)" }}>+92-300-2517280 · Usually within minutes</div>
                </div>
              </div>
            </a>

            {INFO.map((item, i) => (
              <div key={i} style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: "18px 20px", boxShadow: shadows.sm, display: "flex", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 12, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n400, marginBottom: 4 }}>{item.label.toUpperCase()}</div>
                  {item.href ? (
                    <a href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.primary, display: "block", marginBottom: 2, textDecoration: "none" }}>{item.value}</a>
                  ) : (
                    <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 2 }}>{item.value}</div>
                  )}
                  <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{item.note}</div>
                </div>
              </div>
            ))}

            {/* Hours */}
            <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: "18px 20px", boxShadow: shadows.sm, marginBottom: 12 }}>
              <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 12, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🕐</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n400, marginBottom: 10 }}>BUSINESS HOURS</div>
                  {[
                    { day: "Monday – Friday", time: "10:00 AM – 6:00 PM", active: true },
                    { day: "Saturday",         time: "By appointment",     active: false },
                    { day: "Sunday",           time: "Closed",             active: false },
                  ].map((h, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: i < 2 ? `1px solid ${colors.n100}` : "none" }}>
                      <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600 }}>{h.day}</span>
                      <span style={{ fontFamily: fonts.body, fontSize: 13, fontWeight: 700, color: h.active ? colors.primary : colors.n500 }}>{h.time}</span>
                    </div>
                  ))}
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n400, marginTop: 8 }}>All times Pakistan Standard Time (PKT, UTC+5)</div>
                </div>
              </div>
            </div>

            {/* Company */}
            <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: "18px 20px", boxShadow: shadows.sm }}>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n400, marginBottom: 10 }}>OUR COMPANY</div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, lineHeight: 1.75 }}>
                <strong style={{ color: colors.n800 }}>i9 Experts Private Limited</strong><br />
                D-8/5, Shahrah-e-Jahangir, Gulberg Town<br />
                Karachi, Sindh, Pakistan<br />
                <span style={{ fontSize: 11, color: colors.n400 }}>Registered in Pakistan</span>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 20, padding: isMobile ? 24 : 36, boxShadow: shadows.lg }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 800, color: colors.n800, margin: "0 0 6px" }}>Send us a Message</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, margin: "0 0 24px" }}>Fill the form and we'll respond via email or WhatsApp, whichever you prefer.</p>

            <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Inquiry Type</label>
            <select value={form.type} onChange={set("type")} style={{ ...inputStyle, marginBottom: 16 }}>
              <option value="">Select inquiry type</option>
              {INQUIRY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Your Name *</label>
                <input value={form.name} onChange={set("name")} placeholder="Muhammad Ahmed" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Institution Name</label>
                <input value={form.institution} onChange={set("institution")} placeholder="Al-Noor Hifz Institute" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Email Address</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="admin@institute.com" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>WhatsApp Number</label>
                <input value={form.wa} onChange={set("wa")} placeholder="+92-300-0000000" style={inputStyle} />
              </div>
            </div>

            <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Number of Students</label>
            <select value={form.students} onChange={set("students")} style={{ ...inputStyle, marginBottom: 16 }}>
              <option value="">Select approximate size</option>
              {STUDENT_SIZES.map(s => <option key={s}>{s}</option>)}
            </select>

            <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Message *</label>
            <textarea value={form.message} onChange={set("message")} placeholder="Tell us about your institution and how we can help..." style={{ ...inputStyle, minHeight: 120, resize: "vertical", lineHeight: 1.6, marginBottom: 16 }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <button onClick={submitEmail} style={{ padding: 13, borderRadius: 999, background: colors.n50, border: `1.5px solid ${colors.n200}`, color: colors.n800, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Send via Email ✉️
              </button>
              <button onClick={submitWA} style={{ padding: 13, borderRadius: 999, background: "#128c7e", border: "none", color: colors.white, fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Send via WhatsApp 💬
              </button>
            </div>
            <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, textAlign: "center", margin: 0 }}>
              By submitting you agree to our{" "}
              <Link href="/privacy-policy" style={{ color: colors.primary }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
