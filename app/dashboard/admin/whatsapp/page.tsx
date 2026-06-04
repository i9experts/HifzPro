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

const TYPE_LABELS: Record<string, { label: string; emoji: string }> = {
  sabaq:   { label: "Daily Sabaq",      emoji: "📖" },
  absence: { label: "Absence Alert",    emoji: "❌" },
  test:    { label: "Test Result",      emoji: "📝" },
  health:  { label: "Health Alert",     emoji: "⚠️" },
  welcome: { label: "Welcome",          emoji: "🌿" },
  weekly:  { label: "Weekly Report",    emoji: "📊" },
  manual:  { label: "Manual",           emoji: "💬" },
};

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <div
      onClick={() => onChange(!on)}
      style={{
        width: 48, height: 26, borderRadius: 13, cursor: "pointer",
        background: on ? colors.success : colors.n300,
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: "white",
        position: "absolute", top: 3, left: on ? 25 : 3,
        transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      }} />
    </div>
  );
}

export default function WhatsAppPage() {
  const [stats,      setStats]      = useState<Stats>({ sent: 0, failed: 0, pending: 0 });
  const [logs,       setLogs]       = useState<LogEntry[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [testPhone,  setTestPhone]  = useState("");
  const [testing,    setTesting]    = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab,  setActiveTab]  = useState<"overview" | "log" | "settings">("overview");
  const [expandLog,  setExpandLog]  = useState<string | null>(null);

  const [notifications, setNotifications] = useState({
    sendOnSabaq:    true,
    sendOnAbsence:  true,
    sendOnTest:     true,
    sendHealthAlert:true,
    sendWeekly:     true,
    sendWelcome:    true,
  });

  const [language, setLanguage] = useState<"ur" | "en">("ur");

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/whatsapp/log?limit=50")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setLogs(d.data.notifications);
          setStats(d.data.stats);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
    // Load saved settings from localStorage
    try {
      const saved = localStorage.getItem("hifzpro_wa_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotifications(n => ({ ...n, ...parsed.notifications }));
        if (parsed.language) setLanguage(parsed.language);
      }
    } catch {}
  }, []);

  // Save settings to localStorage when changed
  const updateNotification = (key: string, val: boolean) => {
    const updated = { ...notifications, [key]: val };
    setNotifications(updated);
    localStorage.setItem("hifzpro_wa_settings", JSON.stringify({ notifications: updated, language }));
  };

  const updateLanguage = (lang: "ur" | "en") => {
    setLanguage(lang);
    localStorage.setItem("hifzpro_wa_settings", JSON.stringify({ notifications, language: lang }));
  };

  const handleTest = async () => {
    if (!testPhone.trim()) return;
    setTesting(true); setTestResult(null);
    try {
      const res  = await fetch("/api/whatsapp/test", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: testPhone }),
      });
      const data = await res.json();
      setTestResult({
        success: data.success,
        message: data.success
          ? `✅ Test message sent successfully to ${testPhone}`
          : `❌ Failed: ${data.error || "Unknown error. Check your UltraMsg credentials."}`,
      });
      if (data.success) fetchLogs();
    } catch {
      setTestResult({ success: false, message: "❌ Connection error. Please try again." });
    } finally { setTesting(false); }
  };

  const totalSent = stats.sent + stats.failed + stats.pending;

  const NOTIFICATION_ITEMS = [
    {
      key:   "sendOnSabaq",
      icon:  "📖",
      title: "Daily Sabaq Report",
      desc:  "Sent immediately after Ustadh records each lesson. Includes Sabaq, Sabqi, Manzil grades in Urdu.",
      color: colors.primary,
    },
    {
      key:   "sendOnAbsence",
      icon:  "❌",
      title: "Absence Alert",
      desc:  "Sent the same day when a student is marked Absent. Includes reason if provided by Ustadh.",
      color: colors.errorText,
    },
    {
      key:   "sendOnTest",
      icon:  "📝",
      title: "Test Result",
      desc:  "Sent immediately after a Para test, Sanad test, or any other assessment result is recorded.",
      color: "#0369a1",
    },
    {
      key:   "sendHealthAlert",
      icon:  "⚠️",
      title: "Manzil Health Alert",
      desc:  "Sent automatically when a student's Manzil health drops below 60%, encouraging extra home revision.",
      color: colors.warningText,
    },
    {
      key:   "sendWelcome",
      icon:  "🌿",
      title: "Welcome Message",
      desc:  "Sent to the guardian's WhatsApp when a new student is enrolled, with enrollment number and program details.",
      color: "#16a34a",
    },
    {
      key:   "sendWeekly",
      icon:  "📊",
      title: "Weekly Progress Report",
      desc:  "Sent every Friday with the week's total lessons, attendance rate, current Juz, and Manzil health.",
      color: "#7c3aed",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold} />
        <div>
          <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white }}>WhatsApp Integration</div>
          <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, opacity: 0.8, letterSpacing: 1 }}>PARENT COMMUNICATION</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: colors.success, boxShadow: `0 0 6px ${colors.success}` }} />
          <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.success }}>ACTIVE</span>
        </div>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>WHATSAPP INTEGRATION</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, margin: "0 0 6px" }}>
            Parent Communication Hub
          </h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500 }}>
            Automatic Sabaq reports, absence alerts & test results — delivered to parents in Urdu via WhatsApp
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { val: totalSent,     label: "Total Messages", icon: "💬", color: colors.primary,     bg: colors.green50,  border: colors.green200 },
            { val: stats.sent,    label: "Delivered",      icon: "✅", color: colors.successText, bg: colors.successBg,border: `${colors.success}44` },
            { val: stats.failed,  label: "Failed",         icon: "❌", color: colors.errorText,   bg: colors.errorBg,  border: `${colors.error}44` },
            { val: stats.pending, label: "Pending",        icon: "⏳", color: colors.warningText, bg: colors.warningBg,border: `${colors.warning}44` },
          ].map((s, i) => (
            <div key={i} style={{ background: s.bg, borderRadius: 14, padding: "16px 14px", border: `1px solid ${s.border}`, textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 26, fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontFamily: fonts.body, fontSize: 10, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, background: colors.white, borderRadius: 12, padding: 4, border: `1px solid ${colors.n200}`, marginBottom: 20 }}>
          {[
            { id: "overview", label: "Overview" },
            { id: "log",      label: `Message Log (${totalSent})` },
            { id: "settings", label: "Settings" },
          ].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id as any)} style={{
              flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === t.id ? colors.primary : "transparent",
              color: activeTab === t.id ? colors.white : colors.n500,
              fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Test message */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>📱 Send Test Message</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginBottom: 16 }}>
                Verify your WhatsApp connection is working by sending a test message to any number.
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={testPhone} onChange={e => setTestPhone(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleTest()}
                  placeholder="+92 300 0000000"
                  style={{ flex: 1, padding: "10px 12px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n800, outline: "none" }}
                />
                <button onClick={handleTest} disabled={testing || !testPhone.trim()} style={{
                  padding: "10px 24px", borderRadius: 8,
                  background: testing || !testPhone.trim() ? colors.n300 : colors.primary,
                  color: "white", fontSize: 13, fontWeight: 700, border: "none",
                  cursor: testing || !testPhone.trim() ? "not-allowed" : "pointer", fontFamily: fonts.heading,
                }}>
                  {testing ? "Sending..." : "Send Test"}
                </button>
              </div>
              {testResult && (
                <div style={{ marginTop: 12, padding: "10px 14px", borderRadius: 8, background: testResult.success ? colors.successBg : colors.errorBg, border: `1px solid ${testResult.success ? colors.green200 : `${colors.error}44`}` }}>
                  <span style={{ fontFamily: fonts.body, fontSize: 13, color: testResult.success ? colors.successText : colors.errorText }}>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Notification toggles — all active, no SOON */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>🔔 Automatic Notifications</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginBottom: 18 }}>
                All notifications are sent automatically. Toggle to enable or disable each type.
              </div>
              {NOTIFICATION_ITEMS.map((item, i) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 0", borderBottom: i < NOTIFICATION_ITEMS.length - 1 ? `1px solid ${colors.n100}` : "none" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{item.title}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 2, lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                  <Toggle
                    on={(notifications as any)[item.key]}
                    onChange={val => updateNotification(item.key, val)}
                  />
                </div>
              ))}
            </div>

            {/* Message preview */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>💬 How Parents See It</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginBottom: 16 }}>
                This is the exact Sabaq report parents receive on WhatsApp after each lesson:
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* WhatsApp mockup */}
                <div style={{ background: "#e5ddd5", borderRadius: 16, overflow: "hidden", width: 300, flexShrink: 0, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}>
                  <div style={{ background: "#075e54", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 16 }}>🌿</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 13, color: "white", fontWeight: 700 }}>HifzPro</div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: "rgba(255,255,255,0.6)" }}>آج کی رپورٹ</div>
                    </div>
                  </div>
                  <div style={{ padding: "12px 10px", background: "#e5ddd5" }}>
                    <div style={{ background: "white", borderRadius: "0 12px 12px 12px", padding: "10px 12px", fontFamily: "monospace", fontSize: 10, color: "#1a1a1a", lineHeight: 1.8, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                      {"🌿 "}
                      <strong>{"HifzPro — آج کی رپورٹ"}</strong>
                      {"\n━━━━━━━━━━━━━━━\n👤 "}
                      <strong>{"طالب علم:"}</strong>
                      {" احمد رضا\n📅 جمعرات، 4 جون 2026\n🏫 معهد النور\n\n📖 "}
                      <strong>{"سبق (نیا سبق)"}</strong>
                      {"\n   جز 18 · صفحہ 274–275\n   درجہ: اچھا ✅\n   غلطیاں: 2\n\n💚 "}
                      <strong>{"منزل"}</strong>
                      {"\n   جز 15–16 · بہت اچھا ⭐\n\n📊 "}
                      <strong>{"منزل صحت:"}</strong>
                      {" 78% 💚\n\n👨‍🏫 "}
                      <strong>{"استاذ:"}</strong>
                      {" قاری محمد سلیم\n━━━━━━━━━━━━━━━\n🌐 www.hifzpro.com"}
                    </div>
                    <div style={{ fontFamily: fonts.body, fontSize: 9, color: "#888", marginTop: 4, textAlign: "right" }}>9:45 AM ✓✓</div>
                  </div>
                </div>
                {/* What each section means */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  {[
                    { icon:"📖", title:"Sabaq Section",    desc:"Today's new lesson — Juz, Page range, grade, mistake count" },
                    { icon:"🔁", title:"Sabqi Section",    desc:"Recent revision — shown when Ustadh records Sabqi" },
                    { icon:"💚", title:"Manzil Section",   desc:"Long-term revision quality — the most important for parents" },
                    { icon:"📊", title:"Manzil Health",    desc:"0–100 score showing overall retention. Red = needs attention" },
                    { icon:"📝", title:"Ustadh's Notes",   desc:"Any specific observations from the Ustadh" },
                  ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{s.icon}</span>
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>{s.title}</div>
                        <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, lineHeight: 1.5 }}>{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── LOG ── */}
        {activeTab === "log" && (
          <div style={{ background: colors.white, borderRadius: 14, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${colors.n100}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800 }}>Message History</div>
              <button onClick={fetchLogs} style={{ padding: "6px 14px", borderRadius: 8, background: colors.green50, border: `1px solid ${colors.green200}`, color: colors.primary, fontSize: 12, cursor: "pointer", fontFamily: fonts.heading }}>↻ Refresh</button>
            </div>
            {loading ? (
              <div style={{ padding: 48, textAlign: "center", color: colors.n400, fontFamily: fonts.body }}>Loading messages...</div>
            ) : logs.length === 0 ? (
              <div style={{ padding: 48, textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 15, color: colors.n700, marginBottom: 6 }}>No messages yet</div>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n400 }}>Messages appear here after Ustadh records lessons. Try recording a Sabaq entry.</div>
              </div>
            ) : (
              logs.map((log, i) => {
                const typeInfo = TYPE_LABELS[log.type] || TYPE_LABELS.manual;
                const isExpanded = expandLog === log.id;
                return (
                  <div key={log.id} style={{ borderBottom: i < logs.length-1 ? `1px solid ${colors.n100}` : "none" }}>
                    <div
                      onClick={() => setExpandLog(isExpanded ? null : log.id)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", cursor: "pointer" }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{typeInfo.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>{typeInfo.label}</span>
                          <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.n500 }}>→ {log.recipientId}</span>
                        </div>
                        <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400, marginTop: 1 }}>
                          {new Date(log.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{
                          background: log.status === "SENT" ? colors.successBg : log.status === "FAILED" ? colors.errorBg : colors.warningBg,
                          color: log.status === "SENT" ? colors.successText : log.status === "FAILED" ? colors.errorText : colors.warningText,
                          padding: "3px 8px", borderRadius: 6, fontSize: 9, fontFamily: fonts.mono, fontWeight: 700,
                        }}>{log.status}</span>
                        <span style={{ color: colors.n300, fontSize: 12 }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    {isExpanded && (
                      <div style={{ padding: "0 20px 16px 50px" }}>
                        <div style={{ background: colors.n50, borderRadius: 10, padding: 12, fontFamily: "monospace", fontSize: 11, color: colors.n700, whiteSpace: "pre-wrap", lineHeight: 1.7, border: `1px solid ${colors.n200}` }}>
                          {log.body}
                        </div>
                        {log.error && (
                          <div style={{ marginTop: 8, fontFamily: fonts.body, fontSize: 11, color: colors.errorText }}>
                            Error: {log.error}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ── SETTINGS ── */}
        {activeTab === "settings" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Provider config */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>⚙️ Provider Configuration</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginBottom: 16 }}>Add these variables in Railway → HifzPro → Variables, then redeploy.</div>
              <div style={{ background: colors.n800, borderRadius: 12, padding: 16, fontFamily: "monospace", fontSize: 12 }}>
                {[
                  ["WHATSAPP_PROVIDER",    "ultramsg"],
                  ["ULTRAMSG_INSTANCE_ID", "your-instance-id"],
                  ["ULTRAMSG_TOKEN",       "your-token"],
                  ["WHATSAPP_ENABLED",     "true"],
                ].map(([key, val]) => (
                  <div key={key} style={{ marginBottom: 6 }}>
                    <span style={{ color: "#a8ff78" }}>{key}</span>
                    <span style={{ color: "#fff" }}> = </span>
                    <span style={{ color: "#ffd700" }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
                <a href="https://ultramsg.com" target="_blank" rel="noopener noreferrer"
                  style={{ padding: "10px 20px", borderRadius: 8, background: "#25D366", color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
                  Open UltraMsg →
                </a>
              </div>
            </div>

            {/* Language */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 4 }}>🌍 Message Language</div>
              <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginBottom: 16 }}>Choose the language for all parent notifications.</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { id: "ur", label: "اردو — Urdu",  desc: "Recommended for Pakistani parents",   flag: "🇵🇰" },
                  { id: "en", label: "English",         desc: "For international institutions",    flag: "🇬🇧" },
                ].map(l => (
                  <button key={l.id} onClick={() => updateLanguage(l.id as any)} style={{
                    flex: 1, padding: "16px", borderRadius: 12,
                    border: `2px solid ${language === l.id ? colors.primary : colors.n200}`,
                    background: language === l.id ? colors.green50 : colors.white, cursor: "pointer", textAlign: "center",
                  }}>
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{l.flag}</div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: language === l.id ? colors.primary : colors.n800 }}>{l.label}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 3 }}>{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* How it works */}
            <div style={{ background: colors.white, borderRadius: 14, padding: 24, border: `1px solid ${colors.n200}` }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 16 }}>📋 How It Works</div>
              {[
                { step: "1", title: "Ustadh records Sabaq",         desc: "In the Hifz Diary, Ustadh taps grades and saves the lesson entry." },
                { step: "2", title: "System auto-triggers message",  desc: "HifzPro instantly formats the Urdu message with all lesson details." },
                { step: "3", title: "UltraMsg sends to parent",      desc: "The message is sent to all guardians who have 'receive updates' enabled." },
                { step: "4", title: "Logged in message history",     desc: "Every message is recorded with delivery status — sent, failed, or pending." },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontFamily: fonts.mono, fontSize: 13, fontWeight: 700, color: "white" }}>{s.step}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>{s.title}</div>
                    <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, marginTop: 2, lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
