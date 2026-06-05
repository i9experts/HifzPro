"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Payment {
  id: string; receiptNumber: string; amount: number; paidAmount: number;
  month: number; year: number; status: string; paymentMethod: string; createdAt: string;
  student: { id: string; name: string; enrollmentNumber: string; photo: string | null };
  feeStructure: { name: string; feeType: string } | null;
  collectedBy: { name: string };
}
interface Stats {
  thisMonthCollected: number; thisMonthTotal: number;
  outstandingAmount: number; outstandingCount: number; thisMonthCount: number;
}

const MONTHS = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTHS_FULL = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

const METHOD_INFO: Record<string,{label:string;icon:string;color:string}> = {
  CASH:          { label:"Cash",          icon:"💵", color:"#166534" },
  BANK_TRANSFER: { label:"Bank Transfer", icon:"🏦", color:"#1e40af" },
  JAZZCASE:      { label:"JazzCash",      icon:"📱", color:"#b45309" },
  EASYPAISA:     { label:"EasyPaisa",     icon:"💚", color:"#065f46" },
  CHEQUE:        { label:"Cheque",        icon:"📄", color:"#6b21a8" },
  ONLINE:        { label:"Online",        icon:"🌐", color:"#0369a1" },
  OTHER:         { label:"Other",         icon:"💳", color:"#374151" },
};

const STATUS_INFO: Record<string,{label:string;color:string;bg:string}> = {
  PAID:    { label:"Paid",    color:colors.successText, bg:colors.successBg },
  PARTIAL: { label:"Partial", color:colors.warningText, bg:colors.warningBg },
  PENDING: { label:"Pending", color:"#d97706",          bg:"#fffbeb" },
  OVERDUE: { label:"Overdue", color:colors.errorText,   bg:colors.errorBg },
  WAIVED:  { label:"Waived",  color:"#7c3aed",          bg:"#f5f3ff" },
};

function PKR(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export default function FeesPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState<"payments"|"outstanding"|"structures"|"scholarships">("payments");

  const now = new Date();
  const [filterMonth, setFilterMonth] = useState(now.getMonth() + 1);
  const [filterYear,  setFilterYear]  = useState(now.getFullYear());

  const fetchPayments = () => {
    setLoading(true);
    fetch(`/api/admin/fees/payments?month=${filterMonth}&year=${filterYear}&limit=30`)
      .then(r => r.json())
      .then(d => { if (d.success) { setPayments(d.data.payments); setStats(d.data.stats); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [filterMonth, filterYear]);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  const collectedPct = stats && stats.thisMonthTotal > 0
    ? Math.round((stats.thisMonthCollected / stats.thisMonthTotal) * 100)
    : 0;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:colors.white, lineHeight:1 }}>Fee Management</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, opacity:0.8, letterSpacing:1 }}>فیس مینجمنٹ</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Link href="/dashboard/admin/fees/payments/new" style={{ padding:"8px 16px", borderRadius:8, background:colors.gold, color:colors.white, fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>+ Record Payment</Link>
          <button onClick={handleSignOut} style={{ padding:"6px 12px", borderRadius:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px" }}>

        {/* Header */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>FEE MANAGEMENT</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>Fee Management</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>Fee structures, payments, outstanding balances & scholarships</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
            {[
              { icon:"💰", val:PKR(stats.thisMonthCollected), label:"Collected This Month", sub:`${stats.thisMonthCount} payments`, color:colors.successText, bg:colors.successBg, border:`${colors.success}44` },
              { icon:"📊", val:`${collectedPct}%`,            label:"Collection Rate",      sub:`of monthly target`,               color:collectedPct>=80?colors.successText:colors.warningText, bg:collectedPct>=80?colors.successBg:colors.warningBg, border:`${collectedPct>=80?colors.success:colors.warning}44` },
              { icon:"⚠️", val:PKR(stats.outstandingAmount),  label:"Outstanding",          sub:`${stats.outstandingCount} entries`, color:colors.errorText,   bg:colors.errorBg,   border:`${colors.error}44` },
              { icon:"📋", val:PKR(stats.thisMonthTotal),     label:"Total Due This Month", sub:`fee structures total`,             color:colors.primary,      bg:colors.green50,   border:colors.green200 },
            ].map((s,i)=>(
              <div key={i} style={{ background:s.bg, borderRadius:14, padding:"16px 14px", border:`1px solid ${s.border}` }}>
                <div style={{ fontSize:22, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:s.color, lineHeight:1.1 }}>{s.val}</div>
                <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:s.color, opacity:0.8, marginTop:4 }}>{s.label}</div>
                <div style={{ fontFamily:fonts.body, fontSize:9, color:s.color, opacity:0.5, marginTop:2 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        )}

        {/* Quick actions */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:24 }}>
          {[
            { href:"/dashboard/admin/fees/payments/new",  icon:"💰", label:"Record Payment",     labelUr:"فیس وصول کریں",  color:colors.gold },
            { href:"/dashboard/admin/fees/outstanding",   icon:"⚠️", label:"View Outstanding",   labelUr:"باقی فیس دیکھیں",color:colors.errorText },
            { href:"/dashboard/admin/fees/structures/new",icon:"⚙️", label:"Fee Structures",     labelUr:"فیس ڈھانچہ",      color:colors.primary },
            { href:"/dashboard/admin/fees/scholarships",  icon:"🎓", label:"Scholarships",       labelUr:"وظائف",            color:"#7c3aed" },
          ].map((a,i)=>(
            <Link key={i} href={a.href} style={{ textDecoration:"none" }}>
              <div style={{ background:colors.white, borderRadius:12, padding:"14px 12px", border:`1px solid ${colors.n200}`, borderLeft:`3px solid ${a.color}`, textAlign:"center", cursor:"pointer" }}>
                <span style={{ fontSize:22 }}>{a.icon}</span>
                <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:a.color, marginTop:4 }}>{a.label}</div>
                <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:10, color:colors.n400 }}>{a.labelUr}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Month filter + Tabs */}
        <div style={{ background:colors.white, borderRadius:14, padding:16, border:`1px solid ${colors.n200}`, marginBottom:16, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", gap:6, background:colors.n50, borderRadius:8, padding:3 }}>
            {[{id:"payments",label:"Payments"},{id:"outstanding",label:"Outstanding"},{id:"structures",label:"Fee Structures"},{id:"scholarships",label:"Scholarships"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id as any)} style={{ padding:"8px 14px", borderRadius:6, border:"none", cursor:"pointer", background:tab===t.id?colors.primary:"transparent", color:tab===t.id?"white":colors.n500, fontFamily:fonts.heading, fontSize:12, fontWeight:600 }}>{t.label}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <select value={filterMonth} onChange={e=>setFilterMonth(parseInt(e.target.value))}
              style={{ padding:"8px 10px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.heading, outline:"none" }}>
              {MONTHS_FULL.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select value={filterYear} onChange={e=>setFilterYear(parseInt(e.target.value))}
              style={{ padding:"8px 10px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.heading, outline:"none" }}>
              {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Payment History */}
        {tab === "payments" && (
          <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${colors.n100}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>
                {MONTHS_FULL[filterMonth]} {filterYear} — Payments
              </div>
              <button onClick={fetchPayments} style={{ padding:"6px 12px", borderRadius:6, background:colors.green50, border:`1px solid ${colors.green200}`, color:colors.primary, fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>↻ Refresh</button>
            </div>

            {loading ? (
              <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading...</div>
            ) : payments.length === 0 ? (
              <div style={{ padding:48, textAlign:"center" }}>
                <div style={{ fontSize:40, marginBottom:12 }}>💰</div>
                <div style={{ fontFamily:fonts.heading, fontSize:15, color:colors.n700, marginBottom:6 }}>No payments for {MONTHS_FULL[filterMonth]}</div>
                <Link href="/dashboard/admin/fees/payments/new" style={{ display:"inline-block", marginTop:8, padding:"10px 24px", borderRadius:8, background:colors.gold, color:"white", textDecoration:"none", fontFamily:fonts.heading, fontSize:13, fontWeight:700 }}>Record First Payment →</Link>
              </div>
            ) : (
              <>
                {/* Header row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px 90px 80px 80px 90px", gap:0, padding:"10px 16px", background:colors.n50, borderBottom:`1px solid ${colors.n100}` }}>
                  {["Student","Fee Type","Amount","Method","Status","Month","Actions"].map((h,i)=>(
                    <div key={i} style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.n500, textAlign:i>1?"center":"left" }}>{h}</div>
                  ))}
                </div>
                {payments.map((p,idx)=>{
                  const si = STATUS_INFO[p.status] || STATUS_INFO.PENDING;
                  const mi = METHOD_INFO[p.paymentMethod] || METHOD_INFO.CASH;
                  return (
                    <div key={p.id} style={{ display:"grid", gridTemplateColumns:"1fr 100px 100px 90px 80px 80px 90px", gap:0, padding:"11px 16px", borderBottom:idx<payments.length-1?`1px solid ${colors.n100}`:"none", alignItems:"center" }}>
                      <div>
                        <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800 }}>{p.student.name}</div>
                        <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400 }}>{p.student.enrollmentNumber} · {p.receiptNumber}</div>
                      </div>
                      <div style={{ textAlign:"center", fontFamily:fonts.body, fontSize:11, color:colors.n600 }}>{p.feeStructure?.name || "—"}</div>
                      <div style={{ textAlign:"center" }}>
                        <div style={{ fontFamily:fonts.mono, fontSize:12, fontWeight:700, color:p.status==="PAID"?colors.successText:colors.errorText }}>{PKR(p.paidAmount)}</div>
                        {p.paidAmount < p.amount && <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400 }}>of {PKR(p.amount)}</div>}
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <span style={{ fontSize:14 }}>{mi.icon}</span>
                        <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n500 }}>{mi.label}</div>
                      </div>
                      <div style={{ textAlign:"center" }}>
                        <span style={{ background:si.bg, color:si.color, padding:"2px 7px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700 }}>{si.label}</span>
                      </div>
                      <div style={{ textAlign:"center", fontFamily:fonts.mono, fontSize:10, color:colors.n600 }}>{MONTHS[p.month]} {p.year}</div>
                      <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
                        <Link href={`/dashboard/admin/fees/receipts/${p.id}`} style={{ padding:"4px 10px", borderRadius:6, background:colors.green50, color:colors.primary, fontSize:10, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>Receipt</Link>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}

        {tab === "outstanding" && <OutstandingPanel/>}
        {tab === "structures"  && <StructuresPanel/>}
        {tab === "scholarships"&& <ScholarshipsPanel/>}
      </div>
    </div>
  );
}

// ── Outstanding Panel ──
function OutstandingPanel() {
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/admin/fees/outstanding")
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d.data); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading...</div>;
  if(!data?.students?.length) return (
    <div style={{ background:colors.successBg, borderRadius:14, padding:40, textAlign:"center", border:`1px solid ${colors.green200}` }}>
      <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
      <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.successText }}>No outstanding fees!</div>
      <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.successText, opacity:0.8, marginTop:4 }}>All students are up to date.</div>
    </div>
  );

  return (
    <div>
      {/* Summary */}
      <div style={{ background:`linear-gradient(135deg,#7f1d1d,#991b1b)`, borderRadius:14, padding:20, marginBottom:16, display:"flex", gap:20, flexWrap:"wrap" }}>
        {[
          {val:data.summary.totalStudents,   label:"Students with outstanding fees"},
          {val:`PKR ${data.summary.totalOutstanding.toLocaleString()}`,label:"Total outstanding"},
          {val:data.summary.overdueCritical, label:"Critical (3+ months)"},
        ].map((s,i)=>(
          <div key={i}>
            <div style={{ fontFamily:fonts.heading, fontSize:22, fontWeight:700, color:"white" }}>{s.val}</div>
            <div style={{ fontFamily:fonts.body, fontSize:11, color:"rgba(255,255,255,0.6)" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background:colors.white, borderRadius:14, border:`1px solid ${colors.n200}`, overflow:"hidden" }}>
        {data.students.map((s: any, i: number)=>(
          <div key={s.studentId} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderBottom:i<data.students.length-1?`1px solid ${colors.n100}`:"none" }}>
            <div style={{ width:40,height:40,borderRadius:10,background:s.monthsOverdue>=3?colors.errorBg:colors.warningBg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              <span style={{ fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:s.monthsOverdue>=3?colors.errorText:colors.warningText }}>{s.name.charAt(0)}</span>
            </div>
            <div style={{ flex:1 }}>
              <Link href={`/dashboard/admin/students/${s.studentId}`} style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.primary,textDecoration:"none" }}>{s.name}</Link>
              <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n500 }}>{s.enrollmentNumber} · {s.batch} · Since {s.oldestMonth}</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:fonts.mono,fontSize:13,fontWeight:700,color:s.monthsOverdue>=3?colors.errorText:colors.warningText }}>PKR {s.totalDue.toLocaleString()}</div>
              <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400 }}>{s.monthsOverdue} month{s.monthsOverdue!==1?"s":""} overdue</div>
            </div>
            {s.scholarship && <span style={{ background:"#f5f3ff",color:"#7c3aed",padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>🎓 {s.scholarship.name}</span>}
            {s.monthsOverdue>=3 && <span style={{ background:colors.errorBg,color:colors.errorText,padding:"2px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>CRITICAL</span>}
            <Link href="/dashboard/admin/fees/payments/new" style={{ padding:"6px 12px",borderRadius:8,background:colors.gold,color:"white",fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,flexShrink:0 }}>Collect</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Structures Panel ──
function StructuresPanel() {
  const [data,    setData]    = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/admin/fees/structures")
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d.data.structures); })
      .finally(()=>setLoading(false));
  },[]);

  const FEE_TYPES: Record<string,{label:string;icon:string;color:string}> = {
    TUITION:      {label:"Tuition",  icon:"📚",color:colors.primary},
    REGISTRATION: {label:"Reg Fee", icon:"📋",color:"#7c3aed"},
    TRANSPORT:    {label:"Transport",icon:"🚌",color:"#b45309"},
    HOSTEL:       {label:"Hostel",   icon:"🏠",color:"#0f766e"},
    EXAM:         {label:"Exam",     icon:"📝",color:"#dc2626"},
    BOOKS:        {label:"Books",    icon:"📖",color:"#1d4ed8"},
    OTHER:        {label:"Other",    icon:"💰",color:"#374151"},
  };

  if(loading) return <div style={{ padding:40,textAlign:"center",color:colors.n400,fontFamily:fonts.body }}>Loading...</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:14 }}>
        <Link href="/dashboard/admin/fees/structures/new" style={{ padding:"10px 20px",borderRadius:8,background:colors.primary,color:"white",fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>+ Add Fee Structure</Link>
      </div>
      {data.length === 0 ? (
        <div style={{ background:colors.white,borderRadius:14,padding:40,textAlign:"center",border:`1px solid ${colors.n200}` }}>
          <div style={{ fontSize:40,marginBottom:12 }}>⚙️</div>
          <div style={{ fontFamily:fonts.heading,fontSize:15,color:colors.n700,marginBottom:6 }}>No fee structures yet</div>
          <Link href="/dashboard/admin/fees/structures/new" style={{ display:"inline-block",padding:"10px 20px",borderRadius:8,background:colors.primary,color:"white",textDecoration:"none",fontFamily:fonts.heading,fontSize:12,fontWeight:700 }}>Create First Structure →</Link>
        </div>
      ) : (
        <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12 }}>
          {data.map(s=>{
            const ft = FEE_TYPES[s.feeType] || FEE_TYPES.OTHER;
            return (
              <div key={s.id} style={{ background:colors.white,borderRadius:12,padding:16,border:`1px solid ${colors.n200}`,borderLeft:`4px solid ${ft.color}` }}>
                <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                  <div style={{ fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800 }}>{s.name}</div>
                  <span style={{ fontSize:18 }}>{ft.icon}</span>
                </div>
                <div style={{ fontFamily:fonts.heading,fontSize:22,fontWeight:700,color:ft.color }}>PKR {s.amount.toLocaleString()}</div>
                <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n400,marginTop:2 }}>{s.frequency} · {ft.label}</div>
                {s.program && <div style={{ fontFamily:fonts.mono,fontSize:9,background:`${ft.color}15`,color:ft.color,padding:"2px 8px",borderRadius:4,marginTop:6,display:"inline-block" }}>{s.program}</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Scholarships Panel ──
function ScholarshipsPanel() {
  const [data,    setData]    = useState<any>({ scholarships:[], stats:{} });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    fetch("/api/admin/fees/scholarships")
      .then(r=>r.json())
      .then(d=>{ if(d.success) setData(d.data); })
      .finally(()=>setLoading(false));
  },[]);

  if(loading) return <div style={{ padding:40,textAlign:"center",color:colors.n400,fontFamily:fonts.body }}>Loading...</div>;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex",gap:10 }}>
          {[{label:`Total: ${data.stats.total||0}`,color:colors.primary},{label:`Active: ${data.stats.active||0}`,color:colors.successText},{label:`Full: ${data.stats.full||0}`,color:"#7c3aed"}].map((s,i)=>(
            <span key={i} style={{ fontFamily:fonts.mono,fontSize:10,fontWeight:700,color:s.color,background:`${s.color}15`,padding:"4px 10px",borderRadius:6 }}>{s.label}</span>
          ))}
        </div>
        <Link href="/dashboard/admin/fees/scholarships" style={{ padding:"8px 16px",borderRadius:8,background:"#7c3aed",color:"white",fontSize:12,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>+ Grant Scholarship</Link>
      </div>
      {data.scholarships.length === 0 ? (
        <div style={{ background:colors.white,borderRadius:14,padding:40,textAlign:"center",border:`1px solid ${colors.n200}` }}>
          <div style={{ fontSize:40,marginBottom:12 }}>🎓</div>
          <div style={{ fontFamily:fonts.heading,fontSize:15,color:colors.n700 }}>No scholarships granted yet</div>
        </div>
      ) : data.scholarships.map((s: any,i: number)=>(
        <div key={s.id} style={{ background:colors.white,borderRadius:12,padding:"14px 16px",border:`1px solid ${colors.n200}`,marginBottom:8,display:"flex",alignItems:"center",gap:12 }}>
          <span style={{ fontSize:22 }}>🎓</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800 }}>{s.student.name}</div>
            <div style={{ fontFamily:fonts.body,fontSize:11,color:colors.n500 }}>{s.name} · {s.student.enrollmentNumber}</div>
            {s.reason && <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n400,marginTop:2 }}>{s.reason}</div>}
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:"#7c3aed" }}>
              {s.type==="FULL"?"100%":s.type==="PARTIAL_PERCENT"?`${s.percentage}%`:`PKR ${s.fixedAmount?.toLocaleString()}`}
            </div>
            <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400 }}>
              {s.type==="FULL"?"Full Scholarship":s.type==="PARTIAL_PERCENT"?"Partial %":"Fixed Amount"}
            </div>
          </div>
          <span style={{ background:s.isActive?"#f5f3ff":colors.n100, color:s.isActive?"#7c3aed":colors.n400, padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>
            {s.isActive?"ACTIVE":"ENDED"}
          </span>
        </div>
      ))}
    </div>
  );
}
