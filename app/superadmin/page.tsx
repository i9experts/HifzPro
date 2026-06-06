"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Institution {
  id:string; name:string; email:string|null; city:string|null;
  isActive:boolean; createdAt:string; totalStudents:number; activeStudents:number;
  totalUstadh:number; totalBatches:number; totalCampuses:number;
  recentLessons:number; daysSinceActive:number; daysSinceLogin:number|null;
  healthScore:number; adminName:string|null; churnRisk:boolean;
  subscription:{ plan:string; status:string; amount:number; endDate:string|null; trialEndsAt:string|null } | null;
}

interface Snapshot {
  totalInstitutions:number; totalCampuses:number; totalStudents:number;
  totalAsatidha:number; totalParents:number; activeStudents:number;
  lessonsToday:number; lessonsThisMonth:number; newStudentsThisMonth:number;
  newInstitutionsThisMonth:number; studentGrowthPct:number|null;
  whatsappThisMonth:number; testsThisMonth:number;
}

const PLAN_INFO: Record<string,{label:string;color:string;bg:string}> = {
  TRIAL:        { label:"Trial",        color:"#d97706",          bg:"#fffbeb" },
  BASIC:        { label:"Basic",        color:"#0369a1",          bg:"#f0f9ff" },
  PROFESSIONAL: { label:"Professional", color:colors.primary,     bg:colors.green50 },
  ENTERPRISE:   { label:"Enterprise",   color:"#7c3aed",          bg:"#f5f3ff" },
};

const STATUS_INFO: Record<string,{color:string;bg:string}> = {
  ACTIVE:    { color:colors.successText, bg:colors.successBg },
  TRIAL:     { color:"#d97706",          bg:"#fffbeb" },
  EXPIRED:   { color:colors.errorText,   bg:colors.errorBg },
  CANCELLED: { color:colors.n500,        bg:colors.n100 },
  SUSPENDED: { color:colors.errorText,   bg:colors.errorBg },
};

function PKR(n:number) { return `PKR ${n.toLocaleString("en-PK")}`; }

function HealthBar({ score }: { score: number }) {
  const color = score>=70?colors.success:score>=40?colors.warning:colors.error;
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
        <span style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n500 }}>Health</span>
        <span style={{ fontFamily:fonts.mono, fontSize:9, fontWeight:700, color }}>{score}</span>
      </div>
      <div style={{ height:4, background:colors.n100, borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${score}%`, background:color, borderRadius:2 }}/>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"institutions"|"revenue"|"alerts">("overview");
  const [search,  setSearch]  = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [healthFilter,setHealthFilter] = useState("");

  useEffect(() => {
    fetch("/api/superadmin/dashboard")
      .then(r => r.json())
      .then(d => { if(d.success) setData(d.data); else window.location.href="/signin"; })
      .finally(() => setLoading(false));
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method:"POST" });
    window.location.href = "/signin";
  };

  const s: Snapshot = data?.snapshot || {} as Snapshot;
  const revenue = data?.revenue || {};

  const filteredInstitutions = (data?.institutions || []).filter((i: Institution) => {
    if (search && !i.name.toLowerCase().includes(search.toLowerCase()) && !i.city?.toLowerCase().includes(search.toLowerCase())) return false;
    if (planFilter && i.subscription?.plan !== planFilter) return false;
    if (healthFilter === "at-risk" && !i.churnRisk) return false;
    if (healthFilter === "healthy" && i.healthScore < 70) return false;
    return true;
  });

  return (
    <div style={{ minHeight:"100vh", background:"#0a0f1a" }}>
      {/* Nav */}
      <nav style={{ background:"#111827", borderBottom:"1px solid #1f2937", padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <HifzMark size={36} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:18, fontWeight:700, color:"white", lineHeight:1 }}>HifzPro</div>
            <div style={{ fontFamily:fonts.mono, fontSize:9, color:"#10B981", letterSpacing:2, marginTop:1 }}>SUPER ADMIN · SAAS CONTROL</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {data?.alerts?.length > 0 && (
            <div style={{ background:"#dc2626", color:"white", borderRadius:20, padding:"3px 10px", fontFamily:fonts.mono, fontSize:11, fontWeight:700 }}>
              {data.alerts.length} Alerts
            </div>
          )}
          <button onClick={handleSignOut} style={{ padding:"6px 14px", borderRadius:7, background:"#1f2937", border:"1px solid #374151", color:"#9ca3af", fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1400, margin:"0 auto", padding:"28px 24px" }}>

        {loading ? (
          <div style={{ padding:80, textAlign:"center" }}>
            <div style={{ fontFamily:fonts.heading, fontSize:16, color:"#4b5563" }}>Loading platform data...</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ marginBottom:28 }}>
              <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:"#10B981", marginBottom:4 }}>PLATFORM INTELLIGENCE</div>
              <h1 style={{ fontFamily:fonts.display, fontSize:"2.2rem", fontWeight:700, color:"white", margin:"0 0 4px" }}>SaaS Control Panel</h1>
              <p style={{ fontFamily:fonts.body, fontSize:13, color:"#6b7280" }}>
                {s.totalInstitutions} institutions · {s.totalStudents?.toLocaleString()} students · {s.totalAsatidha} Asatidha worldwide
              </p>
            </div>

            {/* Top KPI row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:16 }}>
              {[
                { icon:"🏫", val:s.totalInstitutions,   label:"Institutions",      sub:`+${s.newInstitutionsThisMonth} this month`, color:"#10B981", bg:"#052e16" },
                { icon:"👨‍🎓", val:s.totalStudents,       label:"Total Students",   sub:`${s.activeStudents} active`, color:"#60a5fa", bg:"#1e3a5f" },
                { icon:"👨‍🏫", val:s.totalAsatidha,       label:"Asatidha",         sub:"across all campuses", color:"#a78bfa", bg:"#2e1b69" },
                { icon:"👨‍👩‍👦",val:s.totalParents,         label:"Parents",          sub:"on portal", color:"#f97316", bg:"#431407" },
              ].map((c,i) => (
                <div key={i} style={{ background:c.bg, borderRadius:14, padding:"18px 16px", border:`1px solid ${c.color}22` }}>
                  <div style={{ fontSize:26, marginBottom:8 }}>{c.icon}</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:30, fontWeight:700, color:c.color }}>{c.val?.toLocaleString()}</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:c.color, opacity:0.9, marginTop:4 }}>{c.label}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:10, color:c.color, opacity:0.5, marginTop:2 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Second KPI row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }}>
              {[
                { icon:"📖", val:s.lessonsToday,       label:"Lessons Today",     color:"#34d399", bg:"#064e3b" },
                { icon:"📊", val:s.lessonsThisMonth,   label:"Lessons This Month",color:"#34d399", bg:"#052e16" },
                { icon:"💬", val:s.whatsappThisMonth,  label:"WhatsApp Sent",     color:"#4ade80", bg:"#052e16" },
                { icon:"📝", val:s.testsThisMonth,     label:"Tests Recorded",    color:"#86efac", bg:"#052e16" },
              ].map((c,i) => (
                <div key={i} style={{ background:c.bg, borderRadius:12, padding:"14px 16px", border:`1px solid ${c.color}22` }}>
                  <span style={{ fontSize:20 }}>{c.icon}</span>
                  <div style={{ fontFamily:fonts.heading, fontSize:22, fontWeight:700, color:c.color, marginTop:6 }}>{c.val?.toLocaleString()}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:11, color:c.color, opacity:0.6, marginTop:2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div style={{ display:"flex", gap:4, background:"#111827", borderRadius:10, padding:4, border:"1px solid #1f2937", marginBottom:24 }}>
              {[
                {id:"overview",     label:"Overview"},
                {id:"institutions", label:`All Institutions (${s.totalInstitutions})`},
                {id:"revenue",      label:"Revenue & Subscriptions"},
                {id:"alerts",       label:`Alerts (${data?.alerts?.length || 0})`},
              ].map(t => (
                <button key={t.id} onClick={() => setTab(t.id as any)} style={{ flex:1, padding:"10px", borderRadius:8, border:"none", cursor:"pointer", background:tab===t.id?"#10B981":"transparent", color:tab===t.id?"#052e16":"#6b7280", fontFamily:fonts.heading, fontSize:12, fontWeight:700 }}>{t.label}</button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Monthly growth chart */}
                <div style={{ background:"#111827", borderRadius:14, padding:24, border:"1px solid #1f2937" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:"white", marginBottom:4 }}>📈 Platform Growth — Last 6 Months</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color:"#6b7280", marginBottom:20 }}>New institutions, students and lessons per month</div>
                  <div style={{ display:"flex", gap:6, alignItems:"flex-end", height:120 }}>
                    {(data?.monthlyGrowth || []).map((m: any, i: number) => {
                      const maxLessons = Math.max(...(data?.monthlyGrowth||[]).map((x:any)=>x.lessons), 1);
                      const h = Math.max(6, (m.lessons / maxLessons) * 110);
                      return (
                        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                          <div style={{ fontFamily:fonts.mono, fontSize:9, color:"#10B981" }}>{m.lessons}</div>
                          <div style={{ width:"100%", height:h, background:"#10B981", borderRadius:"4px 4px 0 0", opacity:0.7+i*0.05 }}/>
                          <div style={{ fontFamily:fonts.mono, fontSize:9, color:"#4b5563" }}>{m.month}</div>
                          {m.institutions > 0 && <div style={{ fontFamily:fonts.mono, fontSize:8, color:"#f97316" }}>+{m.institutions} inst</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  {/* City distribution */}
                  <div style={{ background:"#111827", borderRadius:14, padding:24, border:"1px solid #1f2937" }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"white", marginBottom:14 }}>🗺️ City Distribution</div>
                    {(data?.cityDistribution || []).map((c: any, i: number) => (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                        <span style={{ fontFamily:fonts.body, fontSize:12, color:"#d1d5db", minWidth:80 }}>{c.city}</span>
                        <div style={{ flex:1, height:6, background:"#1f2937", borderRadius:3, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${(c.count/data.cityDistribution[0].count)*100}%`, background:"#10B981", borderRadius:3 }}/>
                        </div>
                        <span style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:700, color:"#10B981", minWidth:20 }}>{c.count}</span>
                      </div>
                    ))}
                  </div>

                  {/* Plan distribution */}
                  <div style={{ background:"#111827", borderRadius:14, padding:24, border:"1px solid #1f2937" }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"white", marginBottom:14 }}>💳 Subscription Plans</div>
                    {Object.entries(revenue.planCounts || {}).map(([plan, count]: any, i) => {
                      const pi = PLAN_INFO[plan] || { label:plan, color:"#6b7280", bg:"#1f2937" };
                      return (
                        <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 0", borderBottom:"1px solid #1f2937" }}>
                          <span style={{ background:pi.bg, color:pi.color, padding:"3px 10px", borderRadius:6, fontFamily:fonts.heading, fontSize:11, fontWeight:700 }}>{pi.label}</span>
                          <span style={{ fontFamily:fonts.mono, fontSize:14, fontWeight:700, color:"white" }}>{count}</span>
                        </div>
                      );
                    })}
                    <div style={{ marginTop:14, padding:"12px 14px", background:"#052e16", borderRadius:10 }}>
                      <div style={{ fontFamily:fonts.mono, fontSize:9, color:"#10B981", letterSpacing:1, marginBottom:4 }}>MONTHLY RECURRING REVENUE</div>
                      <div style={{ fontFamily:fonts.heading, fontSize:24, fontWeight:700, color:"#10B981" }}>{PKR(revenue.mrr || 0)}</div>
                      <div style={{ fontFamily:fonts.body, fontSize:10, color:"#4b5563", marginTop:2 }}>ARR: {PKR(revenue.arr || 0)}</div>
                    </div>
                  </div>
                </div>

                {/* Churn risk institutions */}
                {(data?.institutions || []).filter((i: Institution) => i.churnRisk && i.isActive).length > 0 && (
                  <div style={{ background:"#1c0a0a", borderRadius:14, padding:20, border:"1px solid #7f1d1d" }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"#fca5a5", marginBottom:12 }}>
                      ⚠️ Churn Risk — {(data.institutions as Institution[]).filter(i => i.churnRisk && i.isActive).length} Institutions
                    </div>
                    {(data.institutions as Institution[]).filter(i => i.churnRisk && i.isActive).slice(0,5).map((inst, i) => (
                      <div key={inst.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"8px 0", borderBottom:i<4?"1px solid #7f1d1d33":"none" }}>
                        <div style={{ flex:1 }}>
                          <Link href={`/superadmin/institutions/${inst.id}`} style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:"#fca5a5", textDecoration:"none" }}>{inst.name}</Link>
                          <div style={{ fontFamily:fonts.body, fontSize:10, color:"#9ca3af" }}>{inst.city} · {inst.totalStudents} students · last active {inst.daysSinceActive}d ago</div>
                        </div>
                        <div style={{ width:80 }}><HealthBar score={inst.healthScore}/></div>
                        <Link href={`/superadmin/institutions/${inst.id}`} style={{ padding:"4px 10px", borderRadius:6, background:"#7f1d1d", color:"#fca5a5", fontSize:10, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>View</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ALL INSTITUTIONS ── */}
            {tab === "institutions" && (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {/* Filters */}
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search institution or city..."
                    style={{ flex:1, minWidth:200, padding:"9px 12px", background:"#111827", border:"1px solid #1f2937", borderRadius:8, fontSize:12, fontFamily:fonts.body, color:"white", outline:"none" }}/>
                  <select value={planFilter} onChange={e=>setPlanFilter(e.target.value)}
                    style={{ padding:"9px 12px", background:"#111827", border:"1px solid #1f2937", borderRadius:8, fontSize:12, fontFamily:fonts.heading, color:"#d1d5db", outline:"none" }}>
                    <option value="">All Plans</option>
                    {Object.entries(PLAN_INFO).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
                  </select>
                  <select value={healthFilter} onChange={e=>setHealthFilter(e.target.value)}
                    style={{ padding:"9px 12px", background:"#111827", border:"1px solid #1f2937", borderRadius:8, fontSize:12, fontFamily:fonts.heading, color:"#d1d5db", outline:"none" }}>
                    <option value="">All Health</option>
                    <option value="healthy">Healthy (70+)</option>
                    <option value="at-risk">At Risk</option>
                  </select>
                </div>

                {/* Table header */}
                <div style={{ background:"#111827", borderRadius:12, overflow:"hidden", border:"1px solid #1f2937" }}>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 80px 80px 90px 100px 80px", gap:0, padding:"10px 16px", background:"#0f172a", borderBottom:"1px solid #1f2937" }}>
                    {["Institution","Students","Ustadh","Batches","Health","Plan","Last Active","Actions"].map((h,i)=>(
                      <div key={i} style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:"#4b5563", textAlign:i>0?"center":"left" }}>{h}</div>
                    ))}
                  </div>

                  {filteredInstitutions.map((inst: Institution, idx: number) => {
                    const pi = PLAN_INFO[inst.subscription?.plan || "TRIAL"] || PLAN_INFO.TRIAL;
                    return (
                      <div key={inst.id} style={{ display:"grid", gridTemplateColumns:"1fr 90px 80px 80px 80px 90px 100px 80px", gap:0, padding:"13px 16px", borderBottom:idx<filteredInstitutions.length-1?"1px solid #1f2937":"none", alignItems:"center", background:!inst.isActive?"#1a0a0a":inst.churnRisk?"#1a1005":"transparent" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:8, height:8, borderRadius:"50%", background:inst.isActive?colors.success:colors.error, flexShrink:0 }}/>
                            <span style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"white" }}>{inst.name}</span>
                            {!inst.isActive&&<span style={{ background:"#7f1d1d", color:"#fca5a5", padding:"1px 5px", borderRadius:4, fontSize:8, fontFamily:fonts.mono, fontWeight:700 }}>SUSPENDED</span>}
                          </div>
                          <div style={{ fontFamily:fonts.mono, fontSize:9, color:"#4b5563", marginTop:1 }}>{inst.city || "—"} · {inst.email || "—"}</div>
                        </div>
                        <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:13, fontWeight:700, color:"#60a5fa" }}>{inst.totalStudents}</div>
                        <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:13, color:"#a78bfa" }}>{inst.totalUstadh}</div>
                        <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:13, color:"#34d399" }}>{inst.totalBatches}</div>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:700, color:inst.healthScore>=70?colors.success:inst.healthScore>=40?colors.warning:colors.error }}>{inst.healthScore}</div>
                          <div style={{ height:3, background:"#1f2937", borderRadius:2, overflow:"hidden", marginTop:2 }}>
                            <div style={{ height:"100%", width:`${inst.healthScore}%`, background:inst.healthScore>=70?"#10B981":inst.healthScore>=40?colors.warning:colors.error }}/>
                          </div>
                        </div>
                        <div style={{ textAlign:"center" }}>
                          <span style={{ background:pi.bg, color:pi.color, padding:"2px 7px", borderRadius:5, fontSize:9, fontFamily:fonts.heading, fontWeight:700 }}>{pi.label}</span>
                        </div>
                        <div style={{ textAlign:"center", fontFamily:fonts.body, fontSize:10, color:inst.daysSinceActive>14?"#dc2626":"#9ca3af" }}>
                          {inst.daysSinceActive===0?"Today":inst.daysSinceActive===999?"Never":`${inst.daysSinceActive}d ago`}
                        </div>
                        <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
                          <Link href={`/superadmin/institutions/${inst.id}`} style={{ padding:"4px 10px", borderRadius:6, background:"#1f2937", color:"#9ca3af", fontSize:10, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>View</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── REVENUE ── */}
            {tab === "revenue" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {/* Revenue KPIs */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
                  {[
                    { label:"Monthly Recurring Revenue", val:PKR(revenue.mrr||0), sub:`${revenue.activeSubs||0} active subscriptions`, color:"#10B981", bg:"#052e16", icon:"💰" },
                    { label:"Annual Recurring Revenue",  val:PKR(revenue.arr||0), sub:"Based on current MRR", color:"#60a5fa", bg:"#1e3a5f", icon:"📈" },
                    { label:"Trial Institutions",        val:revenue.trialSubs||0, sub:"Converting to paid", color:"#d97706", bg:"#431d00", icon:"⏳" },
                  ].map((c,i)=>(
                    <div key={i} style={{ background:c.bg, borderRadius:14, padding:"20px 18px", border:`1px solid ${c.color}22` }}>
                      <div style={{ fontSize:26, marginBottom:8 }}>{c.icon}</div>
                      <div style={{ fontFamily:fonts.heading, fontSize:24, fontWeight:700, color:c.color }}>{c.val}</div>
                      <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:c.color, opacity:0.9, marginTop:4 }}>{c.label}</div>
                      <div style={{ fontFamily:fonts.body, fontSize:10, color:c.color, opacity:0.5, marginTop:2 }}>{c.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Subscription table */}
                <div style={{ background:"#111827", borderRadius:14, border:"1px solid #1f2937", overflow:"hidden" }}>
                  <div style={{ padding:"14px 18px", borderBottom:"1px solid #1f2937", fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:"white" }}>
                    All Subscriptions
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px 100px 100px 100px", gap:0, padding:"10px 16px", background:"#0f172a", borderBottom:"1px solid #1f2937" }}>
                    {["Institution","Plan","Status","Amount","Renewal","Actions"].map((h,i)=>(
                      <div key={i} style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:"#4b5563", textAlign:i>0?"center":"left" }}>{h}</div>
                    ))}
                  </div>
                  {(data?.institutions || []).map((inst: Institution, idx: number) => {
                    const sub = inst.subscription;
                    const pi  = PLAN_INFO[sub?.plan || "TRIAL"] || PLAN_INFO.TRIAL;
                    const si  = STATUS_INFO[sub?.status || "TRIAL"] || STATUS_INFO.TRIAL;
                    const renewal = sub?.endDate ? new Date(sub.endDate).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"}) : sub?.trialEndsAt ? `Trial ends ${new Date(sub.trialEndsAt).toLocaleDateString("en-PK",{day:"numeric",month:"short"})}` : "—";
                    return (
                      <div key={inst.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 80px 100px 100px 100px", gap:0, padding:"11px 16px", borderBottom:idx<(data?.institutions||[]).length-1?"1px solid #1f2937":"none", alignItems:"center" }}>
                        <div>
                          <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:"white" }}>{inst.name}</div>
                          <div style={{ fontFamily:fonts.body, fontSize:10, color:"#4b5563" }}>{inst.city || "—"}</div>
                        </div>
                        <div style={{ textAlign:"center" }}><span style={{ background:pi.bg, color:pi.color, padding:"2px 7px", borderRadius:5, fontSize:9, fontFamily:fonts.heading, fontWeight:700 }}>{pi.label}</span></div>
                        <div style={{ textAlign:"center" }}><span style={{ background:si.bg, color:si.color, padding:"2px 7px", borderRadius:5, fontSize:9, fontFamily:fonts.mono, fontWeight:700 }}>{sub?.status||"TRIAL"}</span></div>
                        <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:12, fontWeight:700, color:"#10B981" }}>{sub?.amount ? PKR(sub.amount) : "—"}</div>
                        <div style={{ textAlign:"center", fontFamily:fonts.body, fontSize:10, color:"#9ca3af" }}>{renewal}</div>
                        <div style={{ textAlign:"center" }}>
                          <Link href={`/superadmin/institutions/${inst.id}`} style={{ padding:"4px 10px", borderRadius:6, background:"#1f2937", color:"#9ca3af", fontSize:10, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>Manage</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── ALERTS ── */}
            {tab === "alerts" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {(!data?.alerts || data.alerts.length === 0) ? (
                  <div style={{ background:"#052e16", borderRadius:14, padding:48, textAlign:"center", border:"1px solid #10B98133" }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>✅</div>
                    <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:"#10B981" }}>No alerts — platform is healthy!</div>
                  </div>
                ) : data.alerts.map((alert: any, i: number) => {
                  const colors_map: Record<string,{bg:string;border:string;color:string;icon:string}> = {
                    TRIAL_EXPIRING: { bg:"#431d00", border:"#d97706", color:"#fbbf24", icon:"⏰" },
                    CHURN_RISK:     { bg:"#1c0a0a", border:"#dc2626", color:"#fca5a5", icon:"⚠️" },
                    NO_USTADH:      { bg:"#1e1b4b", border:"#6366f1", color:"#a5b4fc", icon:"👨‍🏫" },
                  };
                  const cm = colors_map[alert.type] || colors_map.CHURN_RISK;
                  return (
                    <div key={i} style={{ background:cm.bg, borderRadius:12, padding:"14px 18px", border:`1px solid ${cm.border}44`, display:"flex", alignItems:"center", gap:14 }}>
                      <span style={{ fontSize:22 }}>{cm.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:cm.color }}>{alert.institution}</div>
                        <div style={{ fontFamily:fonts.body, fontSize:11, color:cm.color, opacity:0.7, marginTop:2 }}>{alert.detail}</div>
                      </div>
                      <Link href={`/superadmin/institutions/${alert.id}`} style={{ padding:"6px 14px", borderRadius:8, background:`${cm.border}33`, color:cm.color, fontSize:11, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>Take Action →</Link>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
