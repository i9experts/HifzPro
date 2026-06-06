"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const MONTHS_FULL = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const MONTHS_SHORT= ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const PROGRAM_COLOR: Record<string,string> = {
  HIFZ:colors.primary, NAZRA:"#7c3aed", TAJWEED:"#b45309", GIRDAAN:"#0f766e"
};

interface DailyData {
  day:number; date:string; present:number; absent:number; total:number; rate:number|null;
}
interface BatchStat {
  id:string; name:string; program:string; studentCount:number;
  avgPct:number|null; totalPresent:number; totalSessions:number; chronicCount:number;
}
interface StudentStat {
  id:string; name:string; enrollmentNumber:string; batchName:string;
  present:number; absent:number; late:number; leave:number; total:number; attendancePct:number|null;
}
interface ChronicStudent extends StudentStat {
  guardian:{ name:string; phone:string; whatsapp:string|null } | null;
}
interface Snapshot {
  todayPresent:number; todayAbsent:number; todayTotal:number; todayRate:number|null;
  overallRate:number|null; totalPresent:number; totalAbsent:number; totalRecords:number;
  totalSessions:number; chronicCount:number; totalStudents:number; perfectAttendance:number;
}
interface ReportData {
  month:number; year:number;
  snapshot:Snapshot;
  dailyData:DailyData[];
  batchStats:BatchStat[];
  studentStats:StudentStat[];
  chronicAbsentees:ChronicStudent[];
  dowData:{dow:number;label:string;rate:number|null}[];
}

function RateBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span style={{ color:colors.n300, fontFamily:fonts.mono, fontSize:11 }}>—</span>;
  const color = pct>=80?colors.successText:pct>=60?colors.warningText:colors.errorText;
  const bg    = pct>=80?colors.successBg:pct>=60?colors.warningBg:colors.errorBg;
  return <span style={{ background:bg, color, padding:"2px 8px", borderRadius:999, fontSize:10, fontFamily:fonts.mono, fontWeight:700 }}>{pct}%</span>;
}

function ProgressBar({ pct, color=colors.primary, height=6 }: { pct:number; color?:string; height?:number }) {
  return (
    <div style={{ height, background:colors.n100, borderRadius:height/2, overflow:"hidden" }}>
      <div style={{ height:"100%", width:`${Math.min(100,pct)}%`, background:color, borderRadius:height/2, transition:"width 0.5s" }}/>
    </div>
  );
}

export default function AttendanceReportsPage() {
  const now = new Date();
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [year,    setYear]    = useState(now.getFullYear());
  const [data,    setData]    = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState<"overview"|"calendar"|"batches"|"students"|"chronic">("overview");
  const [search,  setSearch]  = useState("");

  const fetchData = () => {
    setLoading(true);
    fetch(`/api/admin/attendance/reports?month=${month}&year=${year}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d.data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const handlePrint = () => window.print();

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method:"POST" });
    window.location.href = "/signin";
  };

  const s = data?.snapshot;

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <style>{`@media print { .no-print{display:none!important} body{background:white} }`}</style>

      {/* Nav */}
      <nav className="no-print" style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:colors.white, lineHeight:1 }}>Attendance Reports</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, opacity:0.8, letterSpacing:1 }}>حاضری رپورٹ</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={handlePrint} style={{ padding:"7px 14px",borderRadius:8,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.2)",color:"rgba(255,255,255,0.8)",fontSize:12,cursor:"pointer",fontFamily:fonts.heading }}>🖨️ Print</button>
          <button onClick={handleSignOut} style={{ padding:"6px 12px",borderRadius:6,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"rgba(255,255,255,0.6)",fontSize:11,cursor:"pointer",fontFamily:fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24, flexWrap:"wrap", gap:12 }}>
          <div>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>ATTENDANCE REPORTS</div>
            <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>Attendance Reports</h1>
            <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>Monthly summaries, chronic absentees, batch comparison</p>
          </div>
          {/* Month/Year selector */}
          <div className="no-print" style={{ display:"flex", gap:8, alignItems:"center" }}>
            <select value={month} onChange={e=>setMonth(parseInt(e.target.value))}
              style={{ padding:"9px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.heading, color:colors.n700, background:colors.white, outline:"none" }}>
              {MONTHS_FULL.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(parseInt(e.target.value))}
              style={{ padding:"9px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.heading, color:colors.n700, background:colors.white, outline:"none" }}>
              {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📊</div>
            <div style={{ fontFamily:fonts.body, fontSize:14, color:colors.n400 }}>Calculating attendance data...</div>
          </div>
        ) : !data || !s ? (
          <div style={{ background:colors.white, borderRadius:14, padding:48, textAlign:"center", border:`1px solid ${colors.n200}` }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📅</div>
            <div style={{ fontFamily:fonts.heading, fontSize:16, color:colors.n700 }}>No attendance data for {MONTHS_FULL[month]} {year}</div>
            <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400, marginTop:6 }}>Record attendance via the Ustadh dashboard to see reports here.</div>
          </div>
        ) : (
          <>
            {/* Stats grid */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:20 }}>
              {[
                { icon:"📊", val:s.overallRate!==null?`${s.overallRate}%`:"—", label:"Overall Rate",       sub:`${MONTHS_FULL[month]}`,                color:s.overallRate===null?colors.n400:s.overallRate>=80?colors.successText:s.overallRate>=60?colors.warningText:colors.errorText, bg:s.overallRate===null?colors.n50:s.overallRate>=80?colors.successBg:s.overallRate>=60?colors.warningBg:colors.errorBg, border:s.overallRate===null?colors.n200:s.overallRate>=80?`${colors.success}44`:s.overallRate>=60?`${colors.warning}44`:`${colors.error}44` },
                { icon:"✅", val:s.todayPresent,        label:"Present Today",      sub:`of ${s.todayTotal} sessions`,color:colors.successText, bg:colors.successBg, border:`${colors.success}44` },
                { icon:"⚠️", val:s.chronicCount,        label:"Chronic Absentees",  sub:"< 70% this month",  color:s.chronicCount>0?colors.errorText:colors.successText, bg:s.chronicCount>0?colors.errorBg:colors.successBg, border:`${s.chronicCount>0?colors.error:colors.success}44` },
                { icon:"⭐", val:s.perfectAttendance,   label:"Perfect Attendance", sub:"100% this month",   color:"#166534", bg:"#dcfce7", border:"#86efac" },
              ].map((c,i)=>(
                <div key={i} style={{ background:c.bg, borderRadius:14, padding:"16px 14px", border:`1px solid ${c.border}`, textAlign:"center" }}>
                  <div style={{ fontSize:22, marginBottom:6 }}>{c.icon}</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:26, fontWeight:700, color:c.color }}>{c.val}</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:c.color, opacity:0.9, marginTop:3 }}>{c.label}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:9, color:c.color, opacity:0.6, marginTop:1 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Second row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
              {[
                { label:"Total Students",    val:s.totalStudents,  icon:"👨‍🎓" },
                { label:"Sessions Recorded", val:s.totalSessions,  icon:"📋" },
                { label:"Total Present",     val:s.totalPresent,   icon:"✅" },
                { label:"Total Absent",      val:s.totalAbsent,    icon:"❌" },
              ].map((c,i)=>(
                <div key={i} style={{ background:colors.white, borderRadius:12, padding:"14px 12px", border:`1px solid ${colors.n200}`, textAlign:"center" }}>
                  <span style={{ fontSize:20 }}>{c.icon}</span>
                  <div style={{ fontFamily:fonts.heading, fontSize:22, fontWeight:700, color:colors.n800, marginTop:4 }}>{c.val}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500, marginTop:2 }}>{c.label}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="no-print" style={{ display:"flex", gap:6, background:colors.white, borderRadius:12, padding:4, border:`1px solid ${colors.n200}`, marginBottom:20, overflowX:"auto" }}>
              {[
                { id:"overview",  label:"Overview" },
                { id:"calendar",  label:"Calendar Heatmap" },
                { id:"batches",   label:"Batch Comparison" },
                { id:"students",  label:`All Students (${s.totalStudents})` },
                { id:"chronic",   label:`Chronic Absentees (${s.chronicCount})` },
              ].map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ flex:1, padding:"9px 10px", borderRadius:8, border:"none", cursor:"pointer", whiteSpace:"nowrap", background:tab===t.id?colors.primary:"transparent", color:tab===t.id?"white":colors.n500, fontFamily:fonts.heading, fontSize:12, fontWeight:600 }}>{t.label}</button>
              ))}
            </div>

            {/* ── OVERVIEW ── */}
            {tab === "overview" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* Day of Week analysis */}
                <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:4 }}>📅 Attendance by Day of Week</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginBottom:16 }}>Which days have the highest attendance this month</div>
                  <div style={{ display:"flex", gap:8, alignItems:"flex-end", height:100 }}>
                    {data.dowData.filter(d => d.dow !== 0).map((d, i) => {
                      const h = d.rate !== null ? Math.max(8, (d.rate / 100) * 88) : 8;
                      const c = d.rate===null?colors.n200:d.rate>=80?colors.success:d.rate>=60?colors.warning:colors.error;
                      return (
                        <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                          <div style={{ fontFamily:fonts.mono, fontSize:10, fontWeight:700, color:c }}>{d.rate!==null?`${d.rate}%`:""}</div>
                          <div style={{ width:"100%", height:h, background:c, borderRadius:"4px 4px 0 0", transition:"height 0.5s", minHeight:8 }}/>
                          <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:colors.n600 }}>{d.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Top/Bottom students split */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                  {/* Best attendance */}
                  <div style={{ background:colors.white, borderRadius:14, padding:20, border:`1px solid ${colors.n200}` }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:12 }}>⭐ Best Attendance</div>
                    {data.studentStats.filter(s=>s.attendancePct!==null).slice(-5).reverse().map((s,i)=>(
                      <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?`1px solid ${colors.n100}`:"none" }}>
                        <span style={{ fontFamily:fonts.mono, fontSize:11, color:colors.gold, width:16 }}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}`}</span>
                        <div style={{ flex:1 }}>
                          <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary, textDecoration:"none" }}>{s.name}</Link>
                          <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400 }}>{s.batchName}</div>
                        </div>
                        <RateBadge pct={s.attendancePct}/>
                      </div>
                    ))}
                  </div>
                  {/* Needs attention */}
                  <div style={{ background:colors.white, borderRadius:14, padding:20, border:`1px solid ${colors.n200}` }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:12 }}>⚠️ Needs Attention</div>
                    {data.studentStats.filter(s=>s.attendancePct!==null&&s.attendancePct<70).slice(0,5).map((s,i)=>(
                      <div key={s.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderBottom:i<4?`1px solid ${colors.n100}`:"none" }}>
                        <span style={{ fontFamily:fonts.mono, fontSize:11, color:colors.errorText, width:20 }}>{s.absent}x</span>
                        <div style={{ flex:1 }}>
                          <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary, textDecoration:"none" }}>{s.name}</Link>
                          <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400 }}>{s.batchName}</div>
                        </div>
                        <RateBadge pct={s.attendancePct}/>
                      </div>
                    ))}
                    {data.studentStats.filter(s=>s.attendancePct!==null&&s.attendancePct<70).length===0&&(
                      <div style={{ textAlign:"center",padding:16,color:colors.successText,fontFamily:fonts.body,fontSize:12 }}>🎉 No students below 70%</div>
                    )}
                  </div>
                </div>

                {/* Quick month summary */}
                <div style={{ background:colors.white, borderRadius:14, padding:20, border:`1px solid ${colors.n200}` }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:14 }}>
                    📋 {MONTHS_FULL[month]} {year} — Summary
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
                    {[
                      { label:"Overall Rate",         val:`${s.overallRate ?? "—"}%`,              color:s.overallRate&&s.overallRate>=80?colors.successText:colors.warningText },
                      { label:"Students Tracked",     val:String(s.totalStudents),                  color:colors.primary },
                      { label:"Sessions Held",        val:String(s.totalSessions),                  color:colors.primary },
                      { label:"Total Attendances",    val:String(s.totalPresent),                   color:colors.successText },
                      { label:"Total Absences",       val:String(s.totalAbsent),                    color:colors.errorText },
                      { label:"Perfect Attendance",   val:String(s.perfectAttendance),              color:"#166534" },
                    ].map((c,i)=>(
                      <div key={i} style={{ background:colors.n50, borderRadius:10, padding:"12px 14px", borderLeft:`3px solid ${c.color}` }}>
                        <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:c.color }}>{c.val}</div>
                        <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n600, marginTop:2 }}>{c.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CALENDAR HEATMAP ── */}
            {tab === "calendar" && (
              <div style={{ background:colors.white, borderRadius:14, padding:24, border:`1px solid ${colors.n200}` }}>
                <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:4 }}>
                  📅 {MONTHS_FULL[month]} {year} — Daily Heatmap
                </div>
                <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500, marginBottom:20 }}>
                  Colour shows attendance rate each day — hover/tap for details
                </div>

                {/* Day headers */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
                  {DAYS_SHORT.map(d=>(
                    <div key={d} style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:10, fontWeight:700, color:colors.n400 }}>{d}</div>
                  ))}
                </div>

                {/* Calendar cells */}
                {(() => {
                  const firstDay = new Date(year, month-1, 1).getDay();
                  const cells: (DailyData|null)[] = [...Array(firstDay).fill(null), ...data.dailyData];
                  while (cells.length % 7 !== 0) cells.push(null);
                  const weeks: (DailyData|null)[][] = [];
                  for (let i=0;i<cells.length;i+=7) weeks.push(cells.slice(i,i+7));
                  return weeks.map((week, wi) => (
                    <div key={wi} style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:6, marginBottom:6 }}>
                      {week.map((day, di) => {
                        if (!day) return <div key={di}/>;
                        const today = new Date().getDate()===day.day && new Date().getMonth()===month-1 && new Date().getFullYear()===year;
                        const bg = day.rate===null ? colors.n100
                          : day.rate>=80 ? "#dcfce7"
                          : day.rate>=60 ? "#fffbeb"
                          : day.rate>=40 ? "#fef2f2"
                          : day.total===0 ? colors.n100
                          : "#fecaca";
                        const textColor = day.rate===null?colors.n300:day.rate>=80?"#166534":day.rate>=60?"#d97706":day.total===0?colors.n300:"#dc2626";
                        return (
                          <div key={di} title={`${day.date}: ${day.present}/${day.total} present${day.rate!==null?` (${day.rate}%)`:""}`}
                            style={{ borderRadius:8, padding:"8px 4px", textAlign:"center", background:bg, border:today?`2px solid ${colors.primary}`:`1px solid ${colors.n200}`, cursor:"default" }}>
                            <div style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:today?700:400, color:today?colors.primary:colors.n700 }}>{day.day}</div>
                            {day.rate!==null?(
                              <div style={{ fontFamily:fonts.mono, fontSize:9, fontWeight:700, color:textColor, marginTop:2 }}>{day.rate}%</div>
                            ):(
                              <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n300, marginTop:2 }}>—</div>
                            )}
                            {day.total>0&&<div style={{ fontFamily:fonts.body, fontSize:8, color:colors.n400 }}>{day.present}/{day.total}</div>}
                          </div>
                        );
                      })}
                    </div>
                  ));
                })()}

                {/* Legend */}
                <div style={{ display:"flex", gap:16, marginTop:16, justifyContent:"center", flexWrap:"wrap" }}>
                  {[
                    {color:"#dcfce7",text:"#16a34a",label:"≥ 80% (Excellent)"},
                    {color:"#fffbeb",text:"#d97706",label:"60–79% (Good)"},
                    {color:"#fef2f2",text:"#dc2626",label:"40–59% (Concerning)"},
                    {color:"#fecaca",text:"#dc2626",label:"< 40% (Critical)"},
                    {color:colors.n100,text:colors.n400,label:"No session"},
                  ].map((l,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:5 }}>
                      <div style={{ width:14,height:14,borderRadius:3,background:l.color,border:`1px solid ${colors.n200}` }}/>
                      <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── BATCH COMPARISON ── */}
            {tab === "batches" && (
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:4 }}>
                  Batch Attendance — {MONTHS_FULL[month]} {year}
                </div>
                {data.batchStats.length===0?(
                  <div style={{ background:colors.white,borderRadius:14,padding:40,textAlign:"center",border:`1px solid ${colors.n200}` }}>
                    <div style={{ fontFamily:fonts.body,fontSize:14,color:colors.n400 }}>No batch attendance data for this month</div>
                  </div>
                ):data.batchStats.map((b,i)=>(
                  <div key={b.id} style={{ background:colors.white, borderRadius:14, padding:20, border:`1px solid ${colors.n200}` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12, flexWrap:"wrap", gap:8 }}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:10,height:10,borderRadius:2,background:PROGRAM_COLOR[b.program]||colors.primary }}/>
                          <span style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>{b.name}</span>
                          <span style={{ fontFamily:fonts.mono, fontSize:9, background:`${PROGRAM_COLOR[b.program]||colors.primary}15`, color:PROGRAM_COLOR[b.program]||colors.primary, padding:"2px 6px", borderRadius:4, fontWeight:700 }}>{b.program}</span>
                        </div>
                        <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginTop:2 }}>
                          {b.studentCount} students · {b.totalSessions} sessions recorded
                          {b.chronicCount>0&&<span style={{ color:colors.errorText, marginLeft:8 }}>· {b.chronicCount} chronic absentee{b.chronicCount>1?"s":""}</span>}
                        </div>
                      </div>
                      <RateBadge pct={b.avgPct}/>
                    </div>
                    <ProgressBar pct={b.avgPct??0} color={b.avgPct===null?colors.n200:b.avgPct>=80?colors.success:b.avgPct>=60?colors.warning:colors.error} height={10}/>
                    <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                      <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400 }}>0%</span>
                      <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400 }}>100%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── ALL STUDENTS ── */}
            {tab === "students" && (
              <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
                <div style={{ padding:"14px 16px", borderBottom:`1px solid ${colors.n100}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>
                    All Students — {MONTHS_FULL[month]} {year}
                  </div>
                  <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search student..."
                    style={{ padding:"7px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, outline:"none", width:200 }}/>
                </div>
                {/* Table header */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 60px 60px 60px 60px 80px", gap:0, padding:"10px 16px", background:colors.n50, borderBottom:`1px solid ${colors.n200}` }}>
                  {["Student","Batch","Present","Absent","Late","Leave","Rate"].map((h,i)=>(
                    <div key={i} style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.n500, textAlign:i>1?"center":"left" }}>{h}</div>
                  ))}
                </div>
                {data.studentStats
                  .filter(s=>!search||s.name.toLowerCase().includes(search.toLowerCase()))
                  .map((s,i,arr)=>(
                  <div key={s.id} style={{ display:"grid", gridTemplateColumns:"1fr 120px 60px 60px 60px 60px 80px", gap:0, padding:"10px 16px", borderBottom:i<arr.length-1?`1px solid ${colors.n100}`:"none", alignItems:"center", background:s.attendancePct!==null&&s.attendancePct<60?"#fff5f5":"transparent" }}>
                    <div>
                      <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary, textDecoration:"none" }}>{s.name}</Link>
                      <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400 }}>{s.enrollmentNumber}</div>
                    </div>
                    <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.batchName}</div>
                    <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:12, fontWeight:700, color:colors.successText }}>{s.present}</div>
                    <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:12, fontWeight:700, color:s.absent>0?colors.errorText:colors.n400 }}>{s.absent}</div>
                    <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:12, color:colors.warningText }}>{s.late}</div>
                    <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:12, color:"#0369a1" }}>{s.leave}</div>
                    <div style={{ textAlign:"center" }}><RateBadge pct={s.attendancePct}/></div>
                  </div>
                ))}
              </div>
            )}

            {/* ── CHRONIC ABSENTEES ── */}
            {tab === "chronic" && (
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
                {data.chronicAbsentees.length===0?(
                  <div style={{ background:colors.successBg, borderRadius:14, padding:48, textAlign:"center", border:`1px solid ${colors.green200}` }}>
                    <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
                    <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.successText }}>No chronic absentees!</div>
                    <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.successText, opacity:0.8, marginTop:4 }}>All students have ≥ 70% attendance this month. Excellent!</div>
                  </div>
                ):(
                  <>
                    <div style={{ background:`linear-gradient(135deg,#7f1d1d,#991b1b)`, borderRadius:14, padding:18, color:"white" }}>
                      <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, marginBottom:4 }}>🚨 Chronic Absentees — {MONTHS_FULL[month]} {year}</div>
                      <div style={{ fontFamily:fonts.body, fontSize:12, color:"rgba(255,255,255,0.6)" }}>
                        {data.chronicAbsentees.length} student{data.chronicAbsentees.length>1?"s":""} with attendance below 70% or 3+ absences. Contact guardians immediately.
                      </div>
                    </div>

                    <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
                      {data.chronicAbsentees.map((s,i)=>(
                        <div key={s.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"16px 18px", borderBottom:i<data.chronicAbsentees.length-1?`1px solid ${colors.n100}`:"none", background:s.attendancePct!==null&&s.attendancePct<50?"#fff5f5":"transparent" }}>
                          {/* Avatar */}
                          <div style={{ width:40,height:40,borderRadius:10,background:colors.errorBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                            <span style={{ fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.errorText }}>{s.name.charAt(0)}</span>
                          </div>
                          {/* Info */}
                          <div style={{ flex:1 }}>
                            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                              <Link href={`/dashboard/admin/students/${s.id}`} style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary,textDecoration:"none" }}>{s.name}</Link>
                              <RateBadge pct={s.attendancePct}/>
                            </div>
                            <div style={{ fontFamily:fonts.body,fontSize:11,color:colors.n500 }}>
                              {s.batchName} · {s.enrollmentNumber}
                            </div>
                            {/* Absence breakdown */}
                            <div style={{ display:"flex",gap:12,marginTop:4 }}>
                              {[
                                {label:"Present", val:s.present, color:colors.successText},
                                {label:"Absent",  val:s.absent,  color:colors.errorText},
                                {label:"Late",    val:s.late,    color:colors.warningText},
                                {label:"Leave",   val:s.leave,   color:"#0369a1"},
                              ].map((x,j)=>(
                                <div key={j} style={{ textAlign:"center" }}>
                                  <div style={{ fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:x.color }}>{x.val}</div>
                                  <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400 }}>{x.label}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                          {/* Guardian contact */}
                          {s.guardian?(
                            <div style={{ textAlign:"right",flexShrink:0 }}>
                              <div style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.n800 }}>{s.guardian.name}</div>
                              <div style={{ fontFamily:fonts.mono,fontSize:10,color:colors.n500,marginTop:1 }}>{s.guardian.phone}</div>
                              <div style={{ display:"flex",gap:6,marginTop:6,justifyContent:"flex-end" }}>
                                {(s.guardian.whatsapp||s.guardian.phone)&&(
                                  <a href={`https://wa.me/${(s.guardian.whatsapp||s.guardian.phone).replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer"
                                    style={{ padding:"5px 10px",borderRadius:6,background:"#dcfce7",color:"#166534",fontSize:10,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>
                                    💬 WhatsApp
                                  </a>
                                )}
                                <a href={`tel:${s.guardian.phone}`}
                                  style={{ padding:"5px 10px",borderRadius:6,background:colors.n50,color:colors.n700,border:`1px solid ${colors.n200}`,fontSize:10,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>
                                  📞 Call
                                </a>
                              </div>
                            </div>
                          ):(
                            <div style={{ fontFamily:fonts.body,fontSize:11,color:colors.n400 }}>No guardian</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
