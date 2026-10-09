"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { colors, fonts, shadows } from "@/lib/tokens";

const BENEFITS = [
  { icon: "📋", title: "Full Platform Walkthrough",    desc: "Live demonstration of all 18 modules from student enrollment to certificate generation." },
  { icon: "💬", title: "WhatsApp Integration Demo",    desc: "Watch a real WhatsApp message go to a parent's phone live during the demo." },
  { icon: "🧠", title: "AI Features in Action",        desc: "See the Mutashabihat detection and dropout risk scoring working on real data." },
  { icon: "💰", title: "Pricing Consultation",         desc: "Get a recommendation on the right plan for your institution size and needs." },
  { icon: "🎯", title: "Your Questions Answered",      desc: "Ask anything about setup, integration, security, or customization." },
];

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: `1.5px solid ${colors.n200}`, background: colors.white,
  color: colors.n800, fontFamily: fonts.body,
  fontSize: 14, outline: "none",
};

export default function DemoPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", institution: "", wa: "", email: "", students: "", lang: "English", notes: "" });

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = () => {
    if (!form.name || !form.institution) { alert("Please fill in your name and institution."); return; }
    const text = `السلام علیکم، میں HifzPro کا demo دیکھنا چاہتا ہوں\n\nName: ${form.name}\nRole: ${form.role}\nInstitution: ${form.institution}\nWhatsApp: ${form.wa}\nEmail: ${form.email}\nStudents: ${form.students}\nLanguage: ${form.lang}\n\nNotes: ${form.notes}`;
    window.open(`https://wa.me/923002517280?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div style={{ background: colors.white, minHeight: "100vh", color: colors.n800, fontFamily: fonts.body }}>
      <MarketingNav />

      {/* Hero */}
      <section style={{ paddingTop: isMobile ? 40 : 64, paddingBottom: 56, paddingLeft: 24, paddingRight: 24, textAlign: "center", position: "relative", overflow: "hidden", background: `linear-gradient(180deg, ${colors.green50} 0%, ${colors.white} 100%)` }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "radial-gradient(circle,rgba(13,92,58,0.08),transparent 70%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
          <Link href="/" style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n500, textDecoration: "none" }}>Home</Link>
          <span style={{ color: colors.n400, fontSize: 11 }}>/</span>
          <span style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.primary }}>Book a Demo</span>
        </div>
        <h1 style={{ fontFamily: fonts.heading, fontSize: isMobile ? "2.1rem" : "clamp(2.1rem,5vw,3.2rem)", fontWeight: 800, color: colors.n800, margin: "0 0 14px" }}>See HifzPro in Action</h1>
        <p style={{ fontFamily: fonts.body, fontSize: 15, color: colors.n600, maxWidth: 480, margin: "0 auto" }}>A 30-minute live walkthrough tailored to your institution. Ask anything, see everything.</p>
      </section>

      {/* Content */}
      <section style={{ padding: isMobile ? "40px 20px" : "64px 24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 48, alignItems: "start" }}>

          {/* Left */}
          <div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: colors.primary, marginBottom: 20, fontWeight: 700 }}>WHAT YOU'LL SEE</div>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ display: "flex", gap: 16, padding: "16px 0", borderBottom: `1px solid ${colors.n200}` }}>
                <div style={{ width: 40, height: 40, minWidth: 40, borderRadius: 12, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>{b.icon}</div>
                <div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>{b.title}</div>
                  <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, margin: 0, lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              </div>
            ))}

            <div style={{ background: colors.n50, border: `1px solid ${colors.n200}`, borderRadius: 16, padding: 24, marginTop: 24 }}>
              {[
                { label: "Duration",  value: "Typically 30–45 minutes. We go at your pace." },
                { label: "Language",  value: "English or Urdu — your choice." },
                { label: "Format",    value: "WhatsApp video call, Zoom, or in-person in Karachi." },
              ].map((item, i) => (
                <div key={i} style={{ marginBottom: i < 2 ? 16 : 0 }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.primary, marginBottom: 4, fontWeight: 700 }}>{item.label.toUpperCase()}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n700 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 20, padding: isMobile ? 24 : 36, boxShadow: shadows.lg }}>
            <h2 style={{ fontFamily: fonts.heading, fontSize: 22, fontWeight: 800, color: colors.n800, margin: "0 0 6px" }}>Book Your Demo</h2>
            <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n600, margin: "0 0 24px" }}>Fill in your details and we'll confirm a time within one business day.</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Your Name *</label>
                <input value={form.name} onChange={set("name")} placeholder="Muhammad Ahmed" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Your Role</label>
                <input value={form.role} onChange={set("role")} placeholder="Muhtamim / Ustadh / Admin" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Institution Name *</label>
              <input value={form.institution} onChange={set("institution")} placeholder="Al-Noor Hifz Institute" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>WhatsApp Number *</label>
                <input value={form.wa} onChange={set("wa")} placeholder="+92-300-0000000" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Email</label>
                <input type="email" value={form.email} onChange={set("email")} placeholder="admin@institute.com" style={inputStyle} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Number of Students</label>
                <select value={form.students} onChange={set("students")} style={inputStyle}>
                  <option value="">Select size</option>
                  {["1–20","21–50","51–200","201–500","500+"].map(s => <option key={s}>{s} students</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Demo Language</label>
                <select value={form.lang} onChange={set("lang")} style={inputStyle}>
                  <option>English</option>
                  <option>Urdu</option>
                  <option>No preference</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n600, display: "block", marginBottom: 6 }}>Anything specific you'd like to see?</label>
              <textarea value={form.notes} onChange={set("notes")} placeholder="e.g. WhatsApp integration, fee management, multi-campus..." style={{ ...inputStyle, minHeight: 80, resize: "vertical", lineHeight: 1.6 }} />
            </div>

            <button onClick={submit} style={{ width: "100%", padding: 14, borderRadius: 999, background: colors.primary, border: "none", color: colors.white, fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 12, boxShadow: "0 6px 20px rgba(13,92,58,0.3)" }}>
              Book My Demo via WhatsApp →
            </button>
            <p style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, textAlign: "center", margin: 0 }}>
              Or{" "}
              <a href="https://wa.me/923002517280?text=السلام علیکم، میں HifzPro کا demo دیکھنا چاہتا ہوں" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary }}>
                message us directly on WhatsApp
              </a>{" "}
              for instant scheduling.
            </p>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
