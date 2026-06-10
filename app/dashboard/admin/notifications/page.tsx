"use client";
// app/dashboard/admin/notifications/page.tsx
// Notification Center — compose, target, preview, send, history
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const TEMPLATES = [
  { id:"announcement", icon:"📢", label:"Announcement",  title:"📢 Announcement from {institute}",        message:"Assalamu Alaikum! We have an important announcement for all parents. Please check the parent portal for details." },
  { id:"holiday",      icon:"🌙", label:"Holiday",       title:"🌙 Holiday Notice",                        message:"The institute will remain closed on {date} on account of {occasion}. Classes resume the following day, InshaAllah." },
  { id:"exam",         icon:"📝", label:"Exam Schedule", title:"📝 Upcoming Test",                         message:"Tests for {batch} begin next week. Please ensure your child revises their Sabqi and Manzil daily." },
  { id:"fee",          icon:"💰", label:"Fee Reminder",  title:"💰 Fee Reminder",                          message:"This is a gentle reminder that monthly fees are due. Please clear dues at your earliest convenience. JazakAllah Khair." },
  { id:"event",        icon:"🎉", label:"Event",         title:"🎉 You're Invited!",                       message:"Join us for our upcoming event. Your presence will encourage the students. Details in the parent portal." },
  { id:"emergency",    icon:"🚨", label:"Urgent",        title:"🚨 Urgent Notice",                         message:"Important: please read this urgent update regarding today's classes." },
];

const PROGRAMS = ["HIFZ","NAZRA","TAJWEED","GIRDAAN"];

export default function NotificationCenterPage() {
  const [tab,      setTab]      = useState<"compose"|"history">("compose");
  const [title,    setTitle]    = useState("");
  const [message,  setMessage]  = useState("");
  const [audience, setAudience] = useState<"ALL"|"BATCH"|"PROGRAM">("ALL");
  const [batchId,  setBatchId]  = useState("");
  const [program,  setProgram]  = useState("HIFZ");
  const [batches,  setBatches]  = useState<any[]>([]);
  const [history,  setHistory]  = useState<any[]>([]);
  const [stats,    setStats]    = useState<{totalParents:number;subscribedParents:number}|null>(null);
  const [sending,  setSending]  = useState(false);
  const [result,   setResult]   = useState<any>(null);
  const [error,    setError]    = useState("");

  const fetchData = () => {
    fetch("/api/admin/notifications").then(r=>r.json()).then(d=>{
      if (d.success) { setHistory(d.data.notifications); setStats(d.data.stats); }
    });
    fetch("/api/admin/batches").then(r=>r.json()).then(d=>{
      if (d.success) setBatches(d.data.batches || d.data || []);
    }).catch(()=>{});
  };
  useEffect(fetchData, []);

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTitle(t.title.replace("{institute}","our institute").replace("{date}","__").replace("{occasion}","__").replace("{batch}","your child's batch"));
    setMessage(t.message.replace("{date}","__").replace("{occasion}","__").replace("{batch}","the selected batch"));
  };

  const handleSend = async () => {
    setError(""); setResult(null);
    if (!title.trim() || !message.trim()) { setError("Title and message are required"); return; }
    if (audience === "BATCH" && !batchId)  { setError("Please select a batch"); return; }
    if (!confirm(`Send this notification to ${audience === "ALL" ? "ALL parents" : audience === "BATCH" ? "parents of the selected batch" : `parents of ${program} students`}?`)) return;

    setSending(true);
    try {
      const res  = await fetch("/api/admin/notifications", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ title, message, audience, batchId: audience==="BATCH"?batchId:undefined, program: audience==="PROGRAM"?program:undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setResult(data.data.result);
        setTitle(""); setMessage("");
        fetchData();
      } else setError(data.error || "Failed to send");
    } catch { setError("Connection error"); }
    finally { setSending(false); }
  };

  const inp = { width:"100%", padding:"11px 13px", border:`1.5px solid ${colors.n200}`, borderRadius:9, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:"white", outline:"none", boxSizing:"border-box" as const };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>

      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:"white", fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:"white", lineHeight:1 }}>Notification Center</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, letterSpacing:1 }}>PUSH BROADCASTS · اطلاعات</div>
          </div>
        </div>
        {stats && (
          <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:8, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)" }}>
            <span style={{ fontSize:14 }}>🔔</span>
            <span style={{ fontFamily:fonts.mono, fontSize:11, color:"#10B981", fontWeight:700 }}>{stats.subscribedParents}</span>
            <span style={{ fontFamily:fonts.body, fontSize:10, color:"rgba(255,255,255,0.5)" }}>of {stats.totalParents} parents subscribed</span>
          </div>
        )}
      </nav>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px" }}>

        {/* Tabs */}
        <div style={{ display:"flex", gap:6, marginBottom:24, background:colors.n100, borderRadius:10, padding:4, width:"fit-content" }}>
          {([["compose","✏️ Compose"],["history","📜 History"]] as const).map(([t,label])=>(
            <button key={t} onClick={()=>setTab(t)} style={{ padding:"8px 22px", borderRadius:8, border:"none", cursor:"pointer", background:tab===t?colors.primary:"transparent", color:tab===t?"white":colors.n500, fontFamily:fonts.heading, fontSize:13, fontWeight:700 }}>
              {label}
            </button>
          ))}
        </div>

        {tab === "compose" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:20, alignItems:"start" }}>

            {/* ── Left: Composer ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

              {/* Templates */}
              <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.n500, marginBottom:12 }}>QUICK TEMPLATES</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                  {TEMPLATES.map(t=>(
                    <button key={t.id} onClick={()=>applyTemplate(t)} style={{ padding:"10px 8px", borderRadius:10, border:`1px solid ${colors.n200}`, background:colors.n50, cursor:"pointer", textAlign:"center" }}>
                      <div style={{ fontSize:20, marginBottom:3 }}>{t.icon}</div>
                      <div style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.n700 }}>{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.n500, marginBottom:12 }}>MESSAGE</div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:colors.n700, marginBottom:5 }}>
                  Title <span style={{ fontWeight:400, color:colors.n400 }}>({title.length}/80)</span>
                </label>
                <input value={title} maxLength={80} onChange={e=>setTitle(e.target.value)} placeholder="📢 Announcement title..." style={inp}/>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:colors.n700, margin:"12px 0 5px" }}>
                  Message <span style={{ fontWeight:400, color:colors.n400 }}>({message.length}/300)</span>
                </label>
                <textarea value={message} maxLength={300} onChange={e=>setMessage(e.target.value)} rows={4} placeholder="Your message to parents..." style={{ ...inp, resize:"vertical" }}/>
              </div>

              {/* Audience */}
              <div style={{ background:"white", borderRadius:14, padding:"18px 20px", border:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.n500, marginBottom:12 }}>AUDIENCE · سامعین</div>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:12 }}>
                  {([["ALL","👨‍👩‍👦 All Parents"],["BATCH","👥 By Batch"],["PROGRAM","📖 By Program"]] as const).map(([a,label])=>(
                    <button key={a} onClick={()=>setAudience(a)} style={{ padding:"11px 8px", borderRadius:10, border:`2px solid ${audience===a?colors.primary:colors.n200}`, background:audience===a?colors.green50:colors.n50, cursor:"pointer", fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:audience===a?colors.primary:colors.n600 }}>
                      {label}
                    </button>
                  ))}
                </div>
                {audience === "BATCH" && (
                  <select value={batchId} onChange={e=>setBatchId(e.target.value)} style={inp}>
                    <option value="">Select a batch / Halqa...</option>
                    {batches.map((b:any)=><option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                )}
                {audience === "PROGRAM" && (
                  <select value={program} onChange={e=>setProgram(e.target.value)} style={inp}>
                    {PROGRAMS.map(p=><option key={p} value={p}>{p}</option>)}
                  </select>
                )}
              </div>

              {/* Result / Error */}
              {error && (
                <div style={{ padding:"12px 16px", borderRadius:10, background:colors.errorBg, border:`1px solid ${colors.error}44`, fontFamily:fonts.body, fontSize:13, color:colors.errorText }}>
                  ⚠ {error}
                </div>
              )}
              {result && (
                <div style={{ padding:"14px 18px", borderRadius:10, background:colors.successBg, border:`1px solid ${colors.green200}` }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.successText, marginBottom:4 }}>✅ Notification Sent!</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.successText, opacity:0.85 }}>
                    Targeted {result.targeted} parents · Delivered to {result.delivered} devices{result.failed > 0 ? ` · ${result.failed} failed` : ""}
                  </div>
                </div>
              )}

              {/* Send */}
              <button onClick={handleSend} disabled={sending} style={{ padding:"14px", borderRadius:12, border:"none", background:sending?colors.n300:colors.primary, color:"white", fontFamily:fonts.heading, fontSize:14, fontWeight:700, cursor:sending?"not-allowed":"pointer", boxShadow:sending?"none":"0 4px 16px rgba(13,92,58,0.3)" }}>
                {sending ? "Sending..." : "🚀 Send Notification"}
              </button>
            </div>

            {/* ── Right: Live phone preview ── */}
            <div style={{ position:"sticky", top:80 }}>
              <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.n400, marginBottom:10, textAlign:"center" }}>LIVE PREVIEW</div>
              <div style={{ background:"#1a1a2e", borderRadius:32, padding:"14px 10px", boxShadow:"0 12px 40px rgba(0,0,0,0.25)", border:"3px solid #2a2a3e" }}>
                {/* Status bar */}
                <div style={{ display:"flex", justifyContent:"space-between", padding:"4px 14px 10px", alignItems:"center" }}>
                  <span style={{ fontFamily:fonts.mono, fontSize:10, color:"rgba(255,255,255,0.7)" }}>9:41</span>
                  <div style={{ width:60, height:16, borderRadius:10, background:"#000" }}/>
                  <span style={{ fontFamily:fonts.mono, fontSize:10, color:"rgba(255,255,255,0.7)" }}>📶 🔋</span>
                </div>
                {/* Notification card */}
                <div style={{ background:"rgba(255,255,255,0.95)", borderRadius:14, padding:"12px 14px", margin:"0 4px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                    <div style={{ width:18, height:18, borderRadius:5, background:"#0D5C3A", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
  <svg viewBox="0 0 80 80" width="14" height="14" fill="none">
    <polygon points="40,4 76,20 76,60 40,76 4,60 4,20" stroke="#10B981" strokeWidth="3" fill="none"/>
    <polygon points="40,14 66,26 66,54 40,66 14,54 14,26" stroke="#C4882A" strokeWidth="2" fill="none"/>
    <polygon points="40,24 56,32 56,48 40,56 24,48 24,32" stroke="#10B981" strokeWidth="1.5" fill="none"/>
    <circle cx="40" cy="40" r="5" fill="#C4882A"/>
  </svg>
</div>
                    <span style={{ fontFamily:fonts.body, fontSize:10, color:"#666", fontWeight:600 }}>HifzPro</span>
                    <span style={{ fontFamily:fonts.body, fontSize:9, color:"#999", marginLeft:"auto" }}>now</span>
                  </div>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"#1a1a1a", marginBottom:3, wordBreak:"break-word" }}>
                    {title || "Your notification title"}
                  </div>
                  <div style={{ fontFamily:fonts.body, fontSize:11, color:"#555", lineHeight:1.5, wordBreak:"break-word" }}>
                    {message || "Your message will appear here exactly as parents will see it on their phone..."}
                  </div>
                </div>
                <div style={{ height:160 }}/>
              </div>
            </div>
          </div>
        )}

        {tab === "history" && (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {history.length === 0 ? (
              <div style={{ background:"white", borderRadius:14, padding:48, textAlign:"center", border:`1px solid ${colors.n200}` }}>
                <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                <div style={{ fontFamily:fonts.heading, fontSize:15, color:colors.n600 }}>No notifications sent yet</div>
              </div>
            ) : history.map((n:any)=>(
              <div key={n.id} style={{ background:"white", borderRadius:12, padding:"14px 18px", border:`1px solid ${colors.n200}` }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap" }}>
                  <div style={{ flex:1, minWidth:200 }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>{n.title}</div>
                    <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginTop:3, lineHeight:1.6 }}>{n.body}</div>
                    <div style={{ display:"flex", gap:10, marginTop:8, flexWrap:"wrap" }}>
                      <span style={{ background:colors.green50, color:colors.primary, padding:"2px 9px", borderRadius:5, fontSize:9, fontFamily:fonts.mono, fontWeight:700, border:`1px solid ${colors.green200}` }}>
                        {n.audience}
                      </span>
                      <span style={{ fontFamily:fonts.mono, fontSize:10, color:colors.n400 }}>
                        by {n.sentBy?.name || "Admin"} · {new Date(n.createdAt).toLocaleString("en-PK", { day:"numeric", month:"short", hour:"numeric", minute:"2-digit" })}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:fonts.mono, fontSize:18, fontWeight:700, color:colors.successText }}>{n.sentCount}</div>
                    <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400 }}>delivered of {n.targetCount}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
