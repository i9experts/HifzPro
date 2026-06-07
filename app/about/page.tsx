"use client";
import { useState } from "react";
import Link from "next/link";

const G = {
  deep:"#050D0A", dark:"#0A1510", card:"#111D16", border:"#1A2E22",
  primary:"#10B981", gold:"#C4882A", white:"#FFFFFF",
  dim:"rgba(255,255,255,0.55)", faint:"rgba(255,255,255,0.06)",
};
const serif  = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";
const mono   = "'JetBrains Mono','Fira Code',monospace";
const sans   = "'Inter','Segoe UI',system-ui,sans-serif";

const TEAM = [
  {
    name:"Muhammad Atiq",
    role:"Founder & CEO",
    roleUr:"بانی و سی ای او",
    bio:"Passionate about combining Islamic education with modern technology. Built HifzPro to solve the real challenges faced by Hifz institutes across Pakistan.",
    emoji:"👨‍💼",
    color:"#10B981",
  },
  {
    name:"Technology Team",
    role:"Platform & Engineering",
    roleUr:"ٹیکنالوجی ٹیم",
    bio:"A dedicated team of developers and designers working to build the most comprehensive Hifz management platform in the world.",
    emoji:"👨‍💻",
    color:"#60a5fa",
  },
  {
    name:"Islamic Advisory Board",
    role:"Shariah & Curriculum",
    roleUr:"شرعی مشاورتی بورڈ",
    bio:"Senior Asatidha and Ulama ensuring that every feature of HifzPro aligns with Islamic pedagogical principles and the sanctity of Quran education.",
    emoji:"🕌",
    color:G.gold,
  },
];

const TIMELINE = [
  { year:"2023", title:"The Problem",       arabic:"المشكلة",      desc:"Visited dozens of Hifz institutes in Karachi. Saw attendance registers, paper records, no parent communication system. Students were being lost to the system." },
  { year:"2024", title:"The Vision",        arabic:"الرؤية",       desc:"Decided to build Pakistan's first intelligent Hifz Management platform — one that respects the sanctity of Quran education while embracing modern technology." },
  { year:"2025", title:"First Institute",   arabic:"أول مدرسة",    desc:"Al-Noor Hifz Institute, Karachi became our seed partner. Every module was built from their real-world feedback." },
  { year:"2026", title:"Going National",    arabic:"التوسع الوطني",desc:"HifzPro is now live with 18 modules, serving institutions across Pakistan. The journey of preserving the Quran through technology has begun." },
];

const VALUES = [
  { icon:"📖", title:"Quran First",        arabic:"القرآن أولاً",   desc:"Every decision we make starts with one question: does this serve the students memorizing the Quran?" },
  { icon:"🇵🇰", title:"Built for Pakistan", arabic:"صُنع لباكستان",  desc:"Urdu interface, JazzCash payments, Hijri calendar, Madani mushaf — designed for how Pakistani institutes actually work." },
  { icon:"🔒", title:"Trust & Privacy",    arabic:"الثقة والخصوصية",desc:"Student data is sacred. No third-party sharing, no ads, no data mining. Ever." },
  { icon:"🤝", title:"Accessible",         arabic:"في متناول الجميع",desc:"From a 10-student Halqa in a mosque to a 500-student institute — HifzPro works for every size." },
];

export default function AboutPage() {
  const [contactForm, setContactForm] = useState({ name:"", email:"", phone:"", institution:"", message:"", type:"GENERAL" });
  const [sending,  setSending]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 40), { passive:true });
  }

  const set = (k:string,v:string) => setContactForm(p=>({...p,[k]:v}));

  const handleContact = async() => {
    if(!contactForm.name||!contactForm.message) return;
    setSending(true);
    // Send via WhatsApp
    const msg = `🕌 *HifzPro Inquiry*\n━━━━━━━━━━━━━━━\n👤 Name: ${contactForm.name}\n📧 Email: ${contactForm.email}\n📞 Phone: ${contactForm.phone}\n🏫 Institution: ${contactForm.institution}\n📋 Type: ${contactForm.type}\n\n💬 Message:\n${contactForm.message}`;
    const waUrl = `https://wa.me/923000000000?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, "_blank");
    setTimeout(()=>{ setSending(false); setSent(true); },800);
  };

  const inp = { width:"100%", padding:"12px 14px", border:`1.5px solid ${G.border}`, borderRadius:10, fontSize:13, fontFamily:sans, color:G.white, background:"rgba(255,255,255,0.05)", outline:"none" };

  return (
    <div style={{ background:G.deep, minHeight:"100vh", color:G.white, fontFamily:sans }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", background:"rgba(5,13,10,0.95)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${G.border}` }}>
        <Link href="/" style={{ display:"flex", alignItems:"center", gap:12, textDecoration:"none" }}>
          <div style={{ width:38, height:38, borderRadius:10, background:"linear-gradient(135deg,#10B981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>🕌</div>
          <div>
            <div style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:G.white, lineHeight:1 }}>HifzPro</div>
            <div style={{ fontFamily:mono, fontSize:7, color:G.primary, letterSpacing:2 }}>حِفزپرو</div>
          </div>
        </Link>
        <div style={{ display:"flex", gap:24, alignItems:"center" }}>
          {[["Features","/#features"],["Pricing","/#pricing"],["About","/about"]].map(([l,h])=>(
            <Link key={l} href={h} style={{ fontFamily:sans, fontSize:13, color:l==="About"?G.primary:G.dim, textDecoration:"none" }}>{l}</Link>
          ))}
          <Link href="/signin" style={{ fontFamily:sans, fontSize:13, color:G.dim, textDecoration:"none" }}>Sign In</Link>
          <Link href="/signup" style={{ padding:"9px 20px", borderRadius:9, background:G.primary, color:G.dark, fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:sans }}>Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ paddingTop:140, paddingBottom:80, textAlign:"center", padding:"140px 24px 80px", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:"40%", left:"50%", transform:"translateX(-50%)", width:500, height:500, background:"radial-gradient(circle,rgba(16,185,129,0.10),transparent 70%)", pointerEvents:"none" }}/>
        <svg style={{ position:"absolute", right:"8%", top:80, opacity:0.04 }} width="300" height="300" viewBox="0 0 80 80">
          {[...Array(5)].map((_,i)=><polygon key={i} points={`40,${4+i*6} ${76-i*6},${40} ${40},${76-i*6} ${4+i*6},${40}`} fill="none" stroke="white" strokeWidth="0.8"/>)}
        </svg>
        <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:12 }}>OUR STORY</div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(2.5rem,6vw,5rem)", fontWeight:700, color:G.white, margin:"0 0 16px", lineHeight:1.05 }}>
          Built with Purpose.<br/><span style={{ color:G.primary }}>Driven by Faith.</span>
        </h1>
        <div style={{ fontFamily:arabic, fontSize:"clamp(18px,3vw,28px)", color:G.gold, marginBottom:20, opacity:0.8 }}>
          إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ
        </div>
        <p style={{ fontFamily:sans, fontSize:16, color:G.dim, maxWidth:600, margin:"0 auto", lineHeight:1.8 }}>
          HifzPro was built by people who understand what it means to sit in a Halqa, memorize the words of Allah, and work hard every day to keep them. We built the platform we wished existed.
        </p>
      </section>

      {/* ── MISSION ── */}
      <section style={{ padding:"80px 24px", maxWidth:1000, margin:"0 auto" }}>
        <div style={{ background:G.card, borderRadius:24, padding:"48px 40px", border:`1px solid ${G.border}`, display:"grid", gridTemplateColumns:"1fr 1fr", gap:48, alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.gold, marginBottom:12 }}>OUR MISSION</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(1.8rem,3vw,2.8rem)", fontWeight:700, color:G.white, margin:"0 0 20px", lineHeight:1.2 }}>
              To preserve the Quran through technology
            </h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim, lineHeight:1.9, marginBottom:16 }}>
              Every Hafiz carries a piece of Allah's word in their heart. Our mission is to support the institutions and teachers who make that possible — giving them the tools to track every student, communicate with every parent, and never let a single student fall through the cracks.
            </p>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim, lineHeight:1.9 }}>
              HifzPro is not just software. It is a service to the Quran — built with the intention that every feature should ultimately help one more person memorize the words of Allah ﷻ.
            </p>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:arabic, fontSize:"clamp(28px,4vw,52px)", color:G.gold, lineHeight:1.7, opacity:0.85 }}>
              خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ<br/>وَعَلَّمَهُ
            </div>
            <div style={{ fontFamily:sans, fontSize:12, color:G.dim, marginTop:12, lineHeight:1.6 }}>
              "The best of you are those who<br/>learn the Quran and teach it."<br/>
              <span style={{ color:G.primary, fontSize:11 }}>— Prophet Muhammad ﷺ (Bukhari)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY WE BUILT IT ── */}
      <section style={{ padding:"80px 24px", background:G.dark }}>
        <div style={{ maxWidth:900, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:56 }}>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>THE ORIGIN</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:"0 0 16px" }}>Why We Built HifzPro</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim, maxWidth:560, margin:"0 auto", lineHeight:1.8 }}>
              The problem was everywhere. We just had to look.
            </p>
          </div>

          {/* Story timeline */}
          <div style={{ position:"relative" }}>
            <div style={{ position:"absolute", left:28, top:0, bottom:0, width:2, background:`linear-gradient(180deg,${G.primary},transparent)`, opacity:0.3 }}/>
            {TIMELINE.map((t,i)=>(
              <div key={i} style={{ display:"flex", gap:24, marginBottom:40, position:"relative" }}>
                <div style={{ flexShrink:0, width:56, height:56, borderRadius:14, background:G.card, border:`2px solid ${G.border}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", zIndex:1 }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:G.primary, fontWeight:700 }}>{t.year}</div>
                </div>
                <div style={{ background:G.card, borderRadius:16, padding:"20px 24px", flex:1, border:`1px solid ${G.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, flexWrap:"wrap", gap:4 }}>
                    <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:G.white, margin:0 }}>{t.title}</h3>
                    <span style={{ fontFamily:arabic, fontSize:14, color:G.gold, opacity:0.7 }}>{t.arabic}</span>
                  </div>
                  <p style={{ fontFamily:sans, fontSize:13, color:G.dim, margin:0, lineHeight:1.8 }}>{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding:"80px 24px", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:48 }}>
          <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>WHAT WE STAND FOR</div>
          <h2 style={{ fontFamily:serif, fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:0 }}>Our Core Values</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16 }}>
          {VALUES.map((v,i)=>(
            <div key={i} style={{ background:G.card, borderRadius:16, padding:"24px 22px", border:`1px solid ${G.border}`, display:"flex", gap:16, alignItems:"flex-start" }}>
              <div style={{ width:48, height:48, borderRadius:12, background:G.faint, display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>{v.icon}</div>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6, flexWrap:"wrap" }}>
                  <h3 style={{ fontFamily:serif, fontSize:18, fontWeight:700, color:G.white, margin:0 }}>{v.title}</h3>
                  <span style={{ fontFamily:arabic, fontSize:12, color:G.gold, opacity:0.6 }}>{v.arabic}</span>
                </div>
                <p style={{ fontFamily:sans, fontSize:13, color:G.dim, margin:0, lineHeight:1.7 }}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding:"80px 24px", background:G.dark }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>THE PEOPLE</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:"0 0 12px" }}>Who Built HifzPro</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim }}>A small team with a big mission — serving the Huffaz of Pakistan</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20 }}>
            {TEAM.map((m,i)=>(
              <div key={i} style={{ background:G.card, borderRadius:18, padding:"28px 22px", border:`1px solid ${G.border}`, textAlign:"center", borderTop:`3px solid ${m.color}` }}>
                <div style={{ width:64, height:64, borderRadius:20, background:`${m.color}20`, border:`2px solid ${m.color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>{m.emoji}</div>
                <h3 style={{ fontFamily:serif, fontSize:20, fontWeight:700, color:G.white, margin:"0 0 4px" }}>{m.name}</h3>
                <div style={{ fontFamily:sans, fontSize:12, color:m.color, fontWeight:600, marginBottom:4 }}>{m.role}</div>
                <div style={{ fontFamily:arabic, fontSize:12, color:"rgba(255,255,255,0.25)", marginBottom:14 }}>{m.roleUr}</div>
                <p style={{ fontFamily:sans, fontSize:12, color:G.dim, margin:0, lineHeight:1.7 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ padding:"80px 24px", maxWidth:900, margin:"0 auto" }}>
        <div style={{ background:`linear-gradient(135deg,#0A2E1A,#052e16)`, borderRadius:24, padding:"48px 40px", border:`1px solid rgba(16,185,129,0.2)`, textAlign:"center" }}>
          <div style={{ fontFamily:arabic, fontSize:"clamp(22px,3vw,36px)", color:G.gold, marginBottom:16, opacity:0.8 }}>
            وَإِنَّهُ لَكِتَابٌ عَزِيزٌ — لَّا يَأْتِيهِ الْبَاطِلُ
          </div>
          <p style={{ fontFamily:sans, fontSize:14, color:G.dim, marginBottom:36, lineHeight:1.7 }}>
            "And indeed, it is a mighty Book. Falsehood cannot approach it from before it or from behind it."
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }}>
            {[
              { val:"18+",    label:"Platform Modules",   arabic:"وحدة نشطة" },
              { val:"100%",   label:"WhatsApp Automated", arabic:"واتساب تلقائي" },
              { val:"PKR 0",  label:"Trial Cost",         arabic:"تجربة مجانية" },
              { val:"5 min",  label:"Setup Time",         arabic:"وقت الإعداد" },
            ].map((s,i)=>(
              <div key={i}>
                <div style={{ fontFamily:mono, fontSize:28, fontWeight:700, color:G.primary }}>{s.val}</div>
                <div style={{ fontFamily:sans, fontSize:12, color:G.dim, marginTop:4 }}>{s.label}</div>
                <div style={{ fontFamily:arabic, fontSize:11, color:"rgba(255,255,255,0.2)", marginTop:2 }}>{s.arabic}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section style={{ padding:"80px 24px", background:G.dark }} id="contact">
        <div style={{ maxWidth:700, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:48 }}>
            <div style={{ fontFamily:mono, fontSize:9, letterSpacing:3, color:G.primary, marginBottom:8 }}>GET IN TOUCH</div>
            <h2 style={{ fontFamily:serif, fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:700, color:G.white, margin:"0 0 12px" }}>Contact Us</h2>
            <p style={{ fontFamily:sans, fontSize:14, color:G.dim }}>Questions about HifzPro? Want a demo? We respond within 24 hours — usually much faster.</p>
          </div>

          {/* WhatsApp CTA */}
          <a href="https://wa.me/923000000000?text=السلام علیکم، میں HifzPro کے بارے میں معلومات چاہتا ہوں" target="_blank" rel="noopener noreferrer"
            style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:12, padding:"16px 28px", borderRadius:14, background:"#25D366", color:"white", fontSize:15, fontWeight:700, textDecoration:"none", fontFamily:sans, marginBottom:32, boxShadow:"0 4px 20px rgba(37,211,102,0.3)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.112 1.523 5.837L.057 23.49l5.797-1.521A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm.029 21.818a9.818 9.818 0 01-5.006-1.372l-.358-.213-3.722.976.997-3.634-.234-.374A9.785 9.785 0 012.182 12c0-5.435 4.412-9.847 9.847-9.847 5.434 0 9.847 4.412 9.847 9.847 0 5.435-4.413 9.818-9.847 9.818z"/></svg>
            💬 Chat on WhatsApp — Instant Response
          </a>

          {sent ? (
            <div style={{ background:"#052e16", borderRadius:16, padding:40, textAlign:"center", border:"1px solid rgba(16,185,129,0.3)" }}>
              <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
              <h3 style={{ fontFamily:serif, fontSize:24, color:G.white, margin:"0 0 8px" }}>Message Sent!</h3>
              <p style={{ fontFamily:sans, fontSize:13, color:G.dim }}>We'll get back to you within 24 hours. JazakAllah Khayran.</p>
            </div>
          ) : (
            <div style={{ background:G.card, borderRadius:20, padding:32, border:`1px solid ${G.border}` }}>

              {/* Inquiry type */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block", fontFamily:sans, fontSize:11, fontWeight:600, color:G.dim, marginBottom:8 }}>Inquiry Type</label>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {[["GENERAL","General Inquiry"],["DEMO","Request a Demo"],["PRICING","Pricing Question"],["SUPPORT","Technical Support"],["PARTNER","Partnership"]].map(([val,label])=>(
                    <button key={val} onClick={()=>set("type",val)} style={{ padding:"7px 14px", borderRadius:8, border:`1px solid ${contactForm.type===val?G.primary:G.border}`, background:contactForm.type===val?"rgba(16,185,129,0.15)":"transparent", color:contactForm.type===val?G.primary:G.dim, fontSize:12, cursor:"pointer", fontFamily:sans, fontWeight:contactForm.type===val?700:400 }}>{label}</button>
                  ))}
                </div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                <div>
                  <label style={{ display:"block", fontFamily:sans, fontSize:11, fontWeight:600, color:G.dim, marginBottom:5 }}>Your Name *</label>
                  <input value={contactForm.name} onChange={e=>set("name",e.target.value)} placeholder="Maulana / Name" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:sans, fontSize:11, fontWeight:600, color:G.dim, marginBottom:5 }}>Institution Name</label>
                  <input value={contactForm.institution} onChange={e=>set("institution",e.target.value)} placeholder="Your institute" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:sans, fontSize:11, fontWeight:600, color:G.dim, marginBottom:5 }}>Email</label>
                  <input type="email" value={contactForm.email} onChange={e=>set("email",e.target.value)} placeholder="you@institute.com" style={inp}/>
                </div>
                <div>
                  <label style={{ display:"block", fontFamily:sans, fontSize:11, fontWeight:600, color:G.dim, marginBottom:5 }}>WhatsApp Number</label>
                  <input value={contactForm.phone} onChange={e=>set("phone",e.target.value)} placeholder="+92 300 0000000" style={inp}/>
                </div>
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block", fontFamily:sans, fontSize:11, fontWeight:600, color:G.dim, marginBottom:5 }}>Message *</label>
                <textarea value={contactForm.message} onChange={e=>set("message",e.target.value)} rows={4} placeholder="Tell us about your institution, how many students, what you need..."
                  style={{ ...inp, resize:"vertical", lineHeight:1.7 }}/>
              </div>

              <button onClick={handleContact} disabled={sending||!contactForm.name||!contactForm.message}
                style={{ width:"100%", padding:"14px", borderRadius:11, background:!contactForm.name||!contactForm.message?"rgba(16,185,129,0.2)":G.primary, color:!contactForm.name||!contactForm.message?G.dim:G.dark, fontSize:14, fontWeight:700, border:"none", cursor:!contactForm.name||!contactForm.message?"not-allowed":"pointer", fontFamily:sans, boxShadow:contactForm.name&&contactForm.message?"0 4px 20px rgba(16,185,129,0.3)":"none" }}>
                {sending?"Opening WhatsApp...":"Send Message via WhatsApp →"}
              </button>

              <p style={{ textAlign:"center", fontFamily:sans, fontSize:11, color:G.dim, marginTop:12 }}>
                Submitting opens WhatsApp with your message pre-filled.
              </p>
            </div>
          )}

          {/* Contact info */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:24 }}>
            {[
              { icon:"💬", label:"WhatsApp",   val:"+92-300-0000000",          href:"https://wa.me/923000000000" },
              { icon:"📧", label:"Email",      val:"support@hifzpro.com",       href:"mailto:support@hifzpro.com" },
              { icon:"🌐", label:"Website",    val:"www.hifzpro.com",           href:"https://www.hifzpro.com" },
            ].map((c,i)=>(
              <a key={i} href={c.href} target="_blank" rel="noopener noreferrer" style={{ display:"block", background:G.card, borderRadius:12, padding:"16px 14px", border:`1px solid ${G.border}`, textAlign:"center", textDecoration:"none" }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{c.icon}</div>
                <div style={{ fontFamily:sans, fontSize:10, color:G.dim, marginBottom:3 }}>{c.label}</div>
                <div style={{ fontFamily:mono, fontSize:11, color:G.primary, wordBreak:"break-all" }}>{c.val}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ padding:"80px 24px", textAlign:"center" }}>
        <div style={{ fontFamily:arabic, fontSize:"clamp(20px,3vw,32px)", color:G.gold, marginBottom:16, opacity:0.7 }}>
          ابدأ رحلتك مع هِفزپرو اليوم
        </div>
        <h2 style={{ fontFamily:serif, fontSize:"clamp(2rem,4vw,3.5rem)", fontWeight:700, color:G.white, margin:"0 0 16px", lineHeight:1.1 }}>
          Ready to get started?
        </h2>
        <p style={{ fontFamily:sans, fontSize:14, color:G.dim, maxWidth:440, margin:"0 auto 32px", lineHeight:1.8 }}>
          Join institutions using HifzPro. 14-day free trial — no credit card required.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <Link href="/signup" style={{ padding:"15px 32px", borderRadius:12, background:G.primary, color:G.dark, fontSize:15, fontWeight:700, textDecoration:"none", fontFamily:sans, boxShadow:"0 6px 28px rgba(16,185,129,0.35)" }}>
            Start Free Trial →
          </Link>
          <Link href="/" style={{ padding:"15px 28px", borderRadius:12, background:"transparent", color:G.white, fontSize:15, fontWeight:600, textDecoration:"none", fontFamily:sans, border:`1px solid ${G.border}` }}>
            ← Back to Home
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background:G.dark, borderTop:`1px solid ${G.border}`, padding:"32px 28px", textAlign:"center" }}>
        <div style={{ fontFamily:arabic, fontSize:16, color:G.gold, opacity:0.4, marginBottom:8 }}>
          وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
        </div>
        <div style={{ fontFamily:sans, fontSize:12, color:"rgba(255,255,255,0.2)" }}>
          © {new Date().getFullYear()} HifzPro · Built for the Huffaz · <Link href="/" style={{ color:G.primary, textDecoration:"none" }}>www.hifzpro.com</Link>
        </div>
      </footer>
    </div>
  );
}
