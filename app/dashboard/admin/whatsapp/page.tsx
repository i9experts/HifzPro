"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface LogEntry {
  id: string; recipientId: string; type: string;
  status: string; sentAt: string | null; error: string | null;
  createdAt: string; body: string;
}
interface Stats { sent: number; failed: number; pending: number; }

const TYPE_LABELS: Record<string,{label:string;emoji:string}> = {
  sabaq:   {label:"Daily Sabaq",    emoji:"📖"},
  absence: {label:"Absence Alert",  emoji:"❌"},
  test:    {label:"Test Result",    emoji:"📝"},
  health:  {label:"Health Alert",   emoji:"⚠️"},
  welcome: {label:"Welcome",        emoji:"🌿"},
  weekly:  {label:"Weekly Report",  emoji:"📊"},
  manual:  {label:"Manual",         emoji:"💬"},
};

export default function WhatsAppPage() {
  const [stats,     setStats]     = useState<Stats>({ sent: 0, failed: 0, pending: 0 });
  const [logs,      setLogs]      = useState<LogEntry[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [testing,   setTesting]   = useState(false);
  const [testResult,setTestResult]= useState<{success:boolean;message:string}|null>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"log"|"settings">("overview");

  // Settings
  const [settings, setSettings] = useState({
    sendOnSabaq:    true,
    sendOnAbsence:  true,
    sendOnTest:     true,
    sendHealthAlert:true,
    sendWeekly:     true,
    language:       "ur",
  });

  const fetchLogs = () => {
    fetch("/api/whatsapp/log?limit=50")
      .then(r => r.json())
      .then(d => {
        if (d.success) { setLogs(d.data.notifications); setStats(d.data.stats); }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLogs(); }, []);

  const handleTest = async () => {
    if (!testPhone.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const res  = await fetch("/api/whatsapp/test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      setTestResult({ success: data.success, message: data.success ? `✅ Test message sent to ${testPhone}` : `❌ ${data.error}` });
      if (data.success) fetchLogs();
    } catch { setTestResult({ success: false, message: "❌ Connection error" }); }
    finally { setTesting(false); }
  };

  const providerConfigured = true; // In production check env vars

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>WhatsApp Integration</div>
      </nav>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>WHATSAPP INTEGRATION</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 6px" }}>Parent Communication Hub</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>Automatic daily Sabaq reports, absence alerts, and test results sent to parents via WhatsApp</p>
        </div>

        {/* Connection status */}
        <div style={{ background:providerConfigured?colors.successBg:colors.warningBg, borderRadius:14, padding:"16px 20px", border:`1px solid ${providerConfigured?colors.green200:`${colors.warning}44`}`, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:40,height:40,borderRadius:10,background:providerConfigured?colors.successText:colors.warning,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20 }}>
              {providerConfigured?"✅":"⚙️"}
            </div>
            <div>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>
                {providerConfigured ? "WhatsApp Connected — UltraMsg" : "WhatsApp Not Configured"}
              </div>
              <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n600 }}>
                {providerConfigured ? "Messages will be sent automatically after each lesson entry" : "Add ULTRAMSG_INSTANCE_ID and ULTRAMSG_TOKEN to Railway Variables"}
              </div>
            </div>
          </div>
          {!providerConfigured && (
            <Link href="https://ultramsg.com" target="_blank" style={{ padding:"8px 16px", borderRadius:8, background:colors.warning, color:"white", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
              Set Up UltraMsg →
            </Link>
          )}
        </div>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            {val:stats.sent+stats.failed+stats.pending, label:"Total Sent",     color:colors.primary,     bg:colors.green50,  icon:"💬"},
            {val:stats.sent,                            label:"Delivered",      color:colors.successText, bg:colors.successBg,icon:"✅"},
            {val:stats.failed,                          label:"Failed",         color:colors.errorText,   bg:colors.errorBg,  icon:"❌"},
            {val:stats.pending,                         label:"Pending",        color:colors.warningText, bg:colors.warningBg,icon:"⏳"},
          ].map((s,i)=>(
            <div key={i} style={{ background:s.bg, borderRadius:12, padding:"16px 14px", textAlign:"center" }}>
              <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontFamily:fonts.heading, fontSize:24, fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ fontFamily:fonts.body, fontSize:10, color:s.color, opacity:0.8, marginTop:2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, background:colors.white, borderRadius:12, padding:4, border:`1px solid ${colors.n200}`, marginBottom:20 }}>
          {[{id:"overview",label:"Overview"},{id:"log",label:"Message Log"},{id:"settings",label:"Settings"}].map(t=>(
            <button key={t.id} onClick={()=>setActiveTab(t.id as any)} style={{ flex:1, padding:"10px", borderRadius:10, border:"none", cursor:"pointer", background:activeTab===t.id?colors.primary:"transparent", color:activeTab===t.id?colors.white:colors.n500, fontFamily:fonts.heading, fontSize:13, fontWeight:600, transition:"all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            {/* Test message */}
            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:4 }}>📱 Send Test Message</div>
              <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginBottom:16 }}>Verify your WhatsApp connection is working by sending a test message.</div>
              <div style={{ display:"flex", gap:10 }}>
                <input value={testPhone} onChange={e=>setTestPhone(e.target.value)}
                  placeholder="+92 300 0000000"
                  style={{ flex:1, padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, outline:"none" }}/>
                <button onClick={handleTest} disabled={testing||!testPhone}
                  style={{ padding:"10px 20px", borderRadius:8, background:testing||!testPhone?colors.n300:colors.primary, color:"white", fontSize:13, fontWeight:700, border:"none", cursor:testing||!testPhone?"not-allowed":"pointer", fontFamily:fonts.heading }}>
                  {testing?"Sending...":"Send Test"}
                </button>
              </div>
              {testResult && (
                <div style={{ marginTop:12, padding:"10px 14px", borderRadius:8, background:testResult.success?colors.successBg:colors.errorBg, border:`1px solid ${testResult.success?colors.green200:`${colors.error}44`}` }}>
                  <span style={{ fontFamily:fonts.body, fontSize:13, color:testResult.success?colors.successText:colors.errorText }}>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Auto-notification types */}
            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:16 }}>🔔 Automatic Notifications</div>
              {[
                { key:"sendOnSabaq",    icon:"📖", title:"Daily Sabaq Report",     desc:"Sent immediately after Ustadh records each lesson. Includes Sabaq, Sabqi, Manzil grades in Urdu.", active:true },
                { key:"sendOnAbsence",  icon:"❌", title:"Absence Alert",           desc:"Sent same day when student is marked Absent. Includes reason if provided.", active:true },
                { key:"sendOnTest",     icon:"📝", title:"Test Result",             desc:"Sent immediately after Para test or Sanad test result is recorded.", active:true },
                { key:"sendHealthAlert",icon:"⚠️", title:"Manzil Health Alert",    desc:"Sent when Manzil health drops below 60%. Encourages parents to support extra revision.", active:true },
                { key:"sendWeekly",     icon:"📊", title:"Weekly Progress Report",  desc:"Sent every Friday with weekly attendance, lessons completed, and health score.", active:false },
              ].map(n=>(
                <div key={n.key} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:`1px solid ${colors.n100}` }}>
                  <span style={{ fontSize:22, flexShrink:0 }}>{n.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800 }}>{n.title}</div>
                    <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginTop:2, lineHeight:1.5 }}>{n.desc}</div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                    {!n.active && <span style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400, background:colors.n100, padding:"2px 6px", borderRadius:4 }}>SOON</span>}
                    <div style={{ width:44, height:24, borderRadius:12, background:n.active?colors.success:colors.n200, position:"relative", cursor:"pointer" }}>
                      <div style={{ width:18, height:18, borderRadius:"50%", background:"white", position:"absolute", top:3, left:n.active?23:3, transition:"left 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Sample messages preview */}
            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:4 }}>💬 Sample Message Preview</div>
              <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginBottom:16 }}>This is how the daily Sabaq report looks to parents:</div>
              <div style={{ background:"#075e54", borderRadius:16, padding:0, overflow:"hidden", maxWidth:340, boxShadow:"0 4px 20px rgba(0,0,0,0.15)" }}>
                <div style={{ background:"#075e54", padding:"12px 16px 8px", borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, color:"white", fontWeight:700 }}>HifzPro</div>
                  <div style={{ fontFamily:fonts.body, fontSize:10, color:"rgba(255,255,255,0.6)" }}>Official Updates</div>
                </div>
                <div style={{ background:"#128c7e", padding:16 }}>
                  <div style={{ background:"#dcf8c6", borderRadius:"0 12px 12px 12px", padding:"12px 14px", fontFamily:"monospace", fontSize:11, color:"#1a1a1a", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
{`🌿 *HifzPro — آج کی رپورٹ*
━━━━━━━━━━━━━━━━━━━━
👤 *طالب علم:* احمد رضا
📅 جمعرات، 4 جون 2026

📖 *سبق (نیا سبق)*
   جز 18 · صفحہ 274–275
   درجہ: اچھا ✅
   غلطیاں: 2

💚 *منزل (پرانی مراجعہ)*
   جز 15–16
   درجہ: بہت اچھا ⭐

📊 *منزل صحت:* 78% 💚

👨‍🏫 *استاذ:* قاری محمد سلیم
━━━━━━━━━━━━━━━━━━━━
🌐 HifzPro — www.hifzpro.com`}
                  </div>
                  <div style={{ fontFamily:fonts.body, fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:8, textAlign:"right" }}>9:45 AM ✓✓</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOG */}
        {activeTab === "log" && (
          <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${colors.n100}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>Message Log</div>
              <button onClick={fetchLogs} style={{ padding:"6px 14px", borderRadius:8, background:colors.green50, border:`1px solid ${colors.green200}`, color:colors.primary, fontSize:12, cursor:"pointer", fontFamily:fonts.heading }}>↻ Refresh</button>
            </div>
            {loading ? (
              <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading...</div>
            ) : logs.length === 0 ? (
              <div style={{ padding:40, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>💬</div>
                <div style={{ fontFamily:fonts.heading, fontSize:15, color:colors.n700 }}>No messages sent yet</div>
                <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400, marginTop:4 }}>Messages appear here after Ustadh records lessons</div>
              </div>
            ) : (
              logs.map((log, i) => {
                const typeInfo = TYPE_LABELS[log.type] || TYPE_LABELS.manual;
                return (
                  <div key={log.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 20px", borderBottom:i<logs.length-1?`1px solid ${colors.n100}`:"none" }}>
                    <span style={{ fontSize:18 }}>{typeInfo.emoji}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800 }}>{typeInfo.label}</span>
                        <span style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n500 }}>{log.recipientId}</span>
                      </div>
                      <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400, marginTop:1 }}>
                        {new Date(log.createdAt).toLocaleString("en-PK")}
                      </div>
                    </div>
                    <span style={{ background:log.status==="SENT"?colors.successBg:log.status==="FAILED"?colors.errorBg:colors.warningBg, color:log.status==="SENT"?colors.successText:log.status==="FAILED"?colors.errorText:colors.warningText, padding:"3px 8px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700, flexShrink:0 }}>
                      {log.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === "settings" && (
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:16 }}>⚙️ Provider Configuration</div>
              <div style={{ background:colors.n50, borderRadius:10, padding:16, border:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n700, marginBottom:12 }}>UltraMsg Setup (Recommended)</div>
                {[
                  { var:"WHATSAPP_PROVIDER",    val:"ultramsg" },
                  { var:"ULTRAMSG_INSTANCE_ID", val:"your-instance-id" },
                  { var:"ULTRAMSG_TOKEN",        val:"your-token" },
                  { var:"WHATSAPP_ENABLED",      val:"true" },
                ].map(v=>(
                  <div key={v.var} style={{ display:"flex", gap:8, marginBottom:8, fontFamily:fonts.mono, fontSize:11 }}>
                    <span style={{ background:colors.n800, color:"#a8ff78", padding:"4px 10px", borderRadius:6, minWidth:280 }}>{v.var}</span>
                    <span style={{ color:colors.n500 }}>=</span>
                    <span style={{ background:colors.n100, color:colors.n700, padding:"4px 10px", borderRadius:6 }}>{v.val}</span>
                  </div>
                ))}
                <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginTop:12 }}>
                  Add these to <strong>Railway → HifzPro → Variables</strong> then redeploy.
                </div>
              </div>
            </div>

            <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:16 }}>🌍 Message Language</div>
              <div style={{ display:"flex", gap:10 }}>
                {[{id:"ur",label:"اردو (Urdu)",desc:"Best for Pakistani parents"},{id:"en",label:"English",desc:"For international institutions"}].map(l=>(
                  <button key={l.id} onClick={()=>setSettings(s=>({...s,language:l.id}))} style={{ flex:1, padding:"14px", borderRadius:12, border:`2px solid ${settings.language===l.id?colors.primary:colors.n200}`, background:settings.language===l.id?colors.green50:colors.white, cursor:"pointer", textAlign:"center" }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:settings.language===l.id?colors.primary:colors.n700 }}>{l.label}</div>
                    <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginTop:3 }}>{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
