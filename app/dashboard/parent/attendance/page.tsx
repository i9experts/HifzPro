"use client";
import { useState } from "react";
import { useParent } from "../layout";
import { colors, fonts } from "@/lib/tokens";

const STATUS_CONFIG: Record<string, { label: string; ur: string; color: string; bg: string; dot: string }> = {
  PRESENT: { label: "Present", ur: "حاضر",   color: colors.successText, bg: colors.successBg, dot: "#16a34a" },
  ABSENT:  { label: "Absent",  ur: "غیر حاضر",color: colors.errorText,  bg: colors.errorBg,   dot: colors.error },
  LATE:    { label: "Late",    ur: "دیر سے",  color: colors.warningText, bg: colors.warningBg, dot: colors.warning },
  LEAVE:   { label: "Leave",   ur: "چھٹی",    color: "#0369a1",          bg: "#f0f9ff",         dot: "#3b82f6" },
};

const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function AttendancePage() {
  const { student, loading } = useParent();
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear,  setViewYear]  = useState(new Date().getFullYear());

  if (loading) return <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading attendance...</div>;
  if (!student) return null;

  const records = student.attendance || [];

  // Build attendance map: "YYYY-MM-DD" → status
  const attendanceMap: Record<string, string> = {};
  records.forEach((r: any) => {
    const date = new Date(r.session.date);
    const key  = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
    attendanceMap[key] = r.status;
  });

  // Build calendar
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const calDays: (number|null)[] = [...Array(firstDay).fill(null), ...Array.from({length:daysInMonth},(_,i)=>i+1)];

  const getKey = (day: number) => `${viewYear}-${String(viewMonth+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

  // Month stats
  const monthRecords = records.filter((r: any) => {
    const d = new Date(r.session.date);
    return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
  });
  const monthPresent  = monthRecords.filter((r: any) => r.status === "PRESENT").length;
  const monthAbsent   = monthRecords.filter((r: any) => r.status === "ABSENT").length;
  const monthLate     = monthRecords.filter((r: any) => r.status === "LATE").length;
  const monthLeave    = monthRecords.filter((r: any) => r.status === "LEAVE").length;
  const monthTotal    = monthRecords.length;
  const monthPct      = monthTotal > 0 ? Math.round((monthPresent / monthTotal) * 100) : 0;

  // Overall stats
  const totalPresent = records.filter((r: any) => r.status === "PRESENT").length;
  const totalSessions= records.length;
  const overallPct   = totalSessions > 0 ? Math.round((totalPresent / totalSessions) * 100) : 0;

  const prevMonth = () => { if (viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); };
  const nextMonth = () => { if (viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); };

  return (
    <div style={{ padding:"16px" }}>
      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.gold, marginBottom:4 }}>حاضری · ATTENDANCE</div>
        <div style={{ fontFamily:fonts.display, fontSize:"1.4rem", fontWeight:700, color:colors.n800 }}>Attendance Record</div>
      </div>

      {/* Overall stats */}
      <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary})`, borderRadius:16, padding:16, marginBottom:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:"rgba(255,255,255,0.4)", letterSpacing:2, marginBottom:4 }}>OVERALL ATTENDANCE</div>
            <div style={{ fontFamily:fonts.heading, fontSize:40, fontWeight:700, color:"white", lineHeight:1 }}>{overallPct}%</div>
            <div style={{ fontFamily:fonts.body, fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:4 }}>{totalPresent} of {totalSessions} sessions</div>
          </div>
          {/* Circular progress */}
          <svg width={80} height={80} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8"/>
            <circle cx="40" cy="40" r="32" fill="none" stroke={overallPct>=80?"#4ade80":overallPct>=60?"#fbbf24":"#f87171"} strokeWidth="8"
              strokeDasharray={`${(overallPct/100)*201} 201`} strokeLinecap="round" transform="rotate(-90 40 40)"/>
            <text x="40" y="45" textAnchor="middle" fill="white" fontFamily={fonts.heading} fontSize="14" fontWeight="700">{overallPct}%</text>
          </svg>
        </div>
      </div>

      {/* Month stat pills */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:16 }}>
        {[
          {...STATUS_CONFIG.PRESENT, val:monthPresent},
          {...STATUS_CONFIG.ABSENT,  val:monthAbsent},
          {...STATUS_CONFIG.LATE,    val:monthLate},
          {...STATUS_CONFIG.LEAVE,   val:monthLeave},
        ].map((s,i)=>(
          <div key={i} style={{ background:s.bg, borderRadius:10, padding:"10px 6px", textAlign:"center" }}>
            <div style={{ fontFamily:fonts.heading, fontSize:20, fontWeight:700, color:s.color }}>{s.val}</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:10, color:s.color, opacity:0.8 }}>{s.ur}</div>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16 }}>
        {/* Month nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <button onClick={prevMonth} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>‹</button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.n800 }}>{MONTHS[viewMonth]} {viewYear}</div>
            {monthTotal > 0 && <div style={{ fontFamily:fonts.mono, fontSize:10, color:monthPct>=80?colors.successText:colors.warningText }}>{monthPct}% this month</div>}
          </div>
          <button onClick={nextMonth} style={{ width:32,height:32,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16 }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:6 }}>
          {DAYS.map(d => <div key={d} style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:9, color:colors.n400, fontWeight:700 }}>{d}</div>)}
        </div>

        {/* Calendar cells */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
          {calDays.map((day, idx) => {
            if (!day) return <div key={idx}/>;
            const key    = getKey(day);
            const status = attendanceMap[key];
            const sc     = status ? STATUS_CONFIG[status] : null;
            const isToday = new Date().getDate()===day && new Date().getMonth()===viewMonth && new Date().getFullYear()===viewYear;
            return (
              <div key={idx} style={{
                aspectRatio:"1", borderRadius:8, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                background: sc ? sc.bg : isToday ? colors.green50 : "transparent",
                border: isToday ? `2px solid ${colors.primary}` : sc ? `1px solid ${sc.dot}33` : "1px solid transparent",
              }}>
                <span style={{ fontFamily:fonts.mono, fontSize:11, fontWeight:isToday?700:400, color: sc ? sc.color : isToday ? colors.primary : colors.n600 }}>{day}</span>
                {sc && <div style={{ width:5,height:5,borderRadius:"50%",background:sc.dot,marginTop:1 }}/>}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:12, flexWrap:"wrap" }}>
          {Object.entries(STATUS_CONFIG).map(([key,val])=>(
            <div key={key} style={{ display:"flex", alignItems:"center", gap:4 }}>
              <div style={{ width:8,height:8,borderRadius:"50%",background:val.dot }}/>
              <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent records list */}
      <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}` }}>
        <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:12 }}>Recent Records</div>
        {records.slice(0,15).map((r: any, i: number) => {
          const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.PRESENT;
          const date = new Date(r.session.date);
          return (
            <div key={i} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"9px 0", borderBottom:i<14?`1px solid ${colors.n100}`:"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:8,height:8,borderRadius:"50%",background:sc.dot,flexShrink:0 }}/>
                <div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n800 }}>
                    {date.toLocaleDateString("en-PK",{weekday:"short",day:"numeric",month:"short"})}
                  </div>
                  {r.absenceReason && <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>{r.absenceReason}</div>}
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:11, color:sc.color }}>{sc.ur}</span>
                <span style={{ background:sc.bg, color:sc.color, padding:"2px 8px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700 }}>{r.status}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
