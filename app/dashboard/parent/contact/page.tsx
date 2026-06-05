"use client";
import { useParent } from "../layout";
import { colors, fonts } from "@/lib/tokens";

export default function ContactPage() {
  const { student, loading } = useParent();

  if (loading) return <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading...</div>;
  if (!student) return null;

  const institution = student.batch?.institution;
  const ustadh      = student.batch?.ustadh;
  const campus      = student.batch?.campus;

  const openWhatsApp = (phone: string, message?: string) => {
    const clean = phone.replace(/[^0-9]/g,"");
    const msg   = message ? encodeURIComponent(message) : "";
    window.open(`https://wa.me/${clean}${msg ? `?text=${msg}` : ""}`, "_blank");
  };

  const call = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  return (
    <div style={{ padding:"16px" }}>
      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.gold, marginBottom:4 }}>رابطہ · CONTACT</div>
        <div style={{ fontFamily:fonts.display, fontSize:"1.4rem", fontWeight:700, color:colors.n800 }}>Get in Touch</div>
        <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500 }}>Contact your Ustadh or the institute</div>
      </div>

      {/* Student info card */}
      <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
        <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n600, marginBottom:10 }}>YOUR CHILD'S DETAILS</div>
        {[
          { label:"Name",              val:student.name },
          { label:"Enrollment #",      val:student.enrollmentNumber || "—" },
          { label:"Program",           val:student.program },
          { label:"Batch / Halqa",     val:student.batch?.name || "—" },
          { label:"Current Juz",       val:`Juz ${student.progress?.currentJuz || "—"}` },
          { label:"Status",            val:student.status },
        ].map((s,i,arr)=>(
          <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:i<arr.length-1?`1px solid ${colors.n100}`:"none" }}>
            <span style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500 }}>{s.label}</span>
            <span style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n800 }}>{s.val}</span>
          </div>
        ))}
      </div>

      {/* Ustadh contact */}
      {ustadh && (
        <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
          <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n600, marginBottom:12 }}>USTADH</div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:colors.green50, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:fonts.display, fontSize:22, fontWeight:700, color:colors.primary }}>{ustadh.name?.charAt(0)}</span>
            </div>
            <div>
              <div style={{ fontFamily:fonts.heading, fontSize:16, fontWeight:700, color:colors.n800 }}>{ustadh.name}</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500 }}>Ustadh · {student.batch?.name}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {ustadh.whatsapp && (
              <button onClick={() => openWhatsApp(ustadh.whatsapp, `السلام علیکم، میں ${student.name} کا والدین ہوں۔`)}
                style={{ flex:1, padding:"11px", borderRadius:10, background:"#25D366", border:"none", color:"white", fontFamily:fonts.heading, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span>💬</span> WhatsApp
              </button>
            )}
            {ustadh.phone && (
              <button onClick={() => call(ustadh.phone)}
                style={{ flex:1, padding:"11px", borderRadius:10, background:colors.primary, border:"none", color:"white", fontFamily:fonts.heading, fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                <span>📞</span> Call
              </button>
            )}
          </div>
          <div style={{ marginTop:10, padding:"10px 12px", background:colors.n50, borderRadius:8, border:`1px solid ${colors.n200}` }}>
            <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n600, lineHeight:1.6 }}>
              💡 <strong>Tip:</strong> For daily progress, check the Diary tab. Contact Ustadh only for specific concerns about your child's Hifz.
            </div>
          </div>
        </div>
      )}

      {/* Institute contact */}
      {institution && (
        <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
          <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n600, marginBottom:12 }}>INSTITUTE</div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ width:44, height:44, borderRadius:12, background:`${colors.gold}20`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontSize:22 }}>🏫</span>
            </div>
            <div>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>{institution.name}</div>
              {campus && <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500 }}>{campus}</div>}
            </div>
          </div>
          {[
            { icon:"📞", label:"Phone", val:institution.phone, action:()=>institution.phone&&call(institution.phone) },
            { icon:"📧", label:"Email", val:institution.email, action:()=>institution.email&&window.open(`mailto:${institution.email}`) },
            { icon:"🌐", label:"Website", val:institution.website, action:()=>institution.website&&window.open(institution.website,"_blank") },
            { icon:"📍", label:"Address", val:institution.address, action:null },
          ].filter(s=>s.val).map((s,i)=>(
            <div key={i} onClick={s.action||undefined} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${colors.n100}`, cursor:s.action?"pointer":"default" }}>
              <span style={{ fontSize:16 }}>{s.icon}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.n400, letterSpacing:1 }}>{s.label.toUpperCase()}</div>
                <div style={{ fontFamily:fonts.body, fontSize:12, color:s.action?colors.primary:colors.n800 }}>{s.val}</div>
              </div>
              {s.action && <span style={{ color:colors.n300, fontSize:14 }}>›</span>}
            </div>
          ))}
        </div>
      )}

      {/* HifzPro portal info */}
      <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary})`, borderRadius:16, padding:16, marginBottom:8 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
          <span style={{ fontSize:24 }}>🌿</span>
          <div>
            <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"white" }}>HifzPro Parent Portal</div>
            <div style={{ fontFamily:fonts.body, fontSize:10, color:"rgba(255,255,255,0.5)" }}>www.hifzpro.com</div>
          </div>
        </div>
        <div style={{ fontFamily:fonts.body, fontSize:11, color:"rgba(255,255,255,0.6)", lineHeight:1.7 }}>
          You receive daily WhatsApp updates automatically after each lesson. Check the Diary tab for full history, Attendance for monthly records, and Progress for your child's Quran journey.
        </div>
        <div style={{ marginTop:12, fontFamily:"'Cormorant Garamond',serif", fontSize:14, color:colors.gold, direction:"rtl", textAlign:"center", lineHeight:1.8 }}>
          جَزَاكُمُ اللَّهُ خَيْرًا
        </div>
        <div style={{ fontFamily:fonts.body, fontSize:10, color:"rgba(255,255,255,0.4)", textAlign:"center", marginTop:2 }}>
          May Allah reward you for investing in your child's Quran education.
        </div>
      </div>
    </div>
  );
}
