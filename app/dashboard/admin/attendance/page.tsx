"use client";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

export default function AdminAttendancePage() {
  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin" style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:"white", fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold="#C4882A" />
        <div>
          <div style={{ fontFamily:fonts.display, fontSize:15, fontWeight:700, color:"white", lineHeight:1 }}>Attendance</div>
          <div style={{ fontFamily:fonts.mono, fontSize:8, color:"#C4882A", letterSpacing:1 }}>حاضری</div>
        </div>
      </nav>

      <div style={{ maxWidth:800, margin:"0 auto", padding:"40px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:"#C4882A", marginBottom:4 }}>ATTENDANCE MODULE</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 8px" }}>Attendance Management</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>
            Attendance is recorded daily by each Ustadh in their dashboard. View reports and analysis here.
          </p>
        </div>

        {/* Main cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24 }}>

          <Link href="/dashboard/admin/attendance/reports" style={{ textDecoration:"none" }}>
            <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #e2e8f0", borderTop:`4px solid #065f46`, cursor:"pointer" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📈</div>
              <h2 style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.n800, margin:"0 0 8px" }}>Attendance Reports</h2>
              <p style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, lineHeight:1.7, margin:"0 0 16px" }}>
                Monthly calendar heatmap, chronic absentees list, batch comparison, day-of-week analysis. Print to PDF.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {["📅 Calendar Heatmap","⚠️ Chronic Absentees","📊 Batch Comparison","🖨️ Print PDF"].map((f,i)=>(
                  <span key={i} style={{ background:"#f0fdfa", color:"#065f46", padding:"3px 8px", borderRadius:5, fontSize:10, fontFamily:fonts.mono, fontWeight:700 }}>{f}</span>
                ))}
              </div>
              <div style={{ marginTop:16, color:"#065f46", fontFamily:fonts.heading, fontSize:12, fontWeight:700 }}>Open Reports →</div>
            </div>
          </Link>

          <Link href="/dashboard/ustadh/attendance" style={{ textDecoration:"none" }}>
            <div style={{ background:"white", borderRadius:16, padding:24, border:"1px solid #e2e8f0", borderTop:`4px solid ${colors.primary}`, cursor:"pointer" }}>
              <div style={{ fontSize:36, marginBottom:12 }}>✅</div>
              <h2 style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.n800, margin:"0 0 8px" }}>Mark Attendance</h2>
              <p style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, lineHeight:1.7, margin:"0 0 16px" }}>
                Daily attendance is marked by each Ustadh from their own dashboard. Click to go to the Ustadh attendance screen.
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                {["📋 Dot Grid","🔔 Auto WhatsApp","📱 Mobile-First","⏱️ Quick Mark"].map((f,i)=>(
                  <span key={i} style={{ background:colors.green50, color:colors.primary, padding:"3px 8px", borderRadius:5, fontSize:10, fontFamily:fonts.mono, fontWeight:700 }}>{f}</span>
                ))}
              </div>
              <div style={{ marginTop:16, color:colors.primary, fontFamily:fonts.heading, fontSize:12, fontWeight:700 }}>Open Ustadh Attendance →</div>
            </div>
          </Link>
        </div>

        {/* Quick info banner */}
        <div style={{ background:"linear-gradient(135deg,#0D5C3A,#065f46)", borderRadius:14, padding:20, display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ fontSize:32 }}>💡</div>
          <div>
            <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:"white", marginBottom:4 }}>How Attendance Works in HifzPro</div>
            <div style={{ fontFamily:fonts.body, fontSize:12, color:"rgba(255,255,255,0.65)", lineHeight:1.7 }}>
              Each Ustadh marks attendance for their Halqa daily from <strong style={{ color:"white" }}>their dashboard</strong>. The system auto-notifies parents via WhatsApp on absence. Admin can view <strong style={{ color:"white" }}>all reports and analytics</strong> from the Attendance Reports page.
            </div>
          </div>
          <Link href="/dashboard/admin/attendance/reports" style={{ flexShrink:0, padding:"10px 18px", borderRadius:10, background:"#C4882A", color:"white", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading, whiteSpace:"nowrap" }}>
            View Reports →
          </Link>
        </div>
      </div>
    </div>
  );
}
