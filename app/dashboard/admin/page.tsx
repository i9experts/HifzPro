"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface DashboardStats {
  totalStudents:    number;
  activeStudents:   number;
  totalBatches:     number;
  totalAsatidha:    number;
  lessonsToday:     number;
  lessonsThisMonth: number;
  pendingFees:      number;
  attendanceToday:  number;
}

const MODULES = [
  // ── Core ──
  {
    id:"students",    icon:"👨‍🎓", title:"Students",             titleUr:"طلباء",
    desc:"Enroll, manage profiles, track 6 tabs",
    href:"/dashboard/admin/students",            color:"#0D5C3A", tag:"Core",
  },
  {
    id:"asatidha",    icon:"👨‍🏫", title:"Asatidha",             titleUr:"اساتذہ",
    desc:"Add Ustadh, qualifications, performance",
    href:"/dashboard/admin/asatidha",           color:"#7c3aed", tag:"Core",
  },
  {
    id:"batches",     icon:"👥",  title:"Batch Management",     titleUr:"حلقہ جات",
    desc:"Create Halqas, assign Ustadh, students",
    href:"/dashboard/admin/batches",            color:"#0369a1", tag:"Core",
  },
  {
    id:"attendance",  icon:"📋",  title:"Attendance",           titleUr:"حاضری",
    desc:"Daily attendance, dot grid, auto-notify parents",
    href:"/dashboard/admin/attendance",         color:"#0f766e", tag:"Core",
  },
  // ── Academic ──
  {
    id:"tests",       icon:"📝",  title:"Test & Assessment",    titleUr:"امتحانات",
    desc:"7 test types, 30-Para visual board, WhatsApp results",
    href:"/dashboard/admin/tests",              color:"#b45309", tag:"Academic",
  },
  {
    id:"mutashabihat",icon:"🧠",  title:"Mutashabihat",         titleUr:"المتشابهات",
    desc:"35 classical pairs, AI priority scoring, Manzil alerts",
    href:"/dashboard/admin/mutashabihat",       color:"#6d28d9", tag:"Intelligence",
  },
  {
    id:"analytics",   icon:"📊",  title:"Analytics",            titleUr:"تجزیہ",
    desc:"Dropout risk, Manzil health map, 6-tab insights",
    href:"/dashboard/admin/analytics",          color:"#0e7490", tag:"Intelligence",
  },
  // ── Reports ──
  {
    id:"attendance-reports", icon:"📈", title:"Attendance Reports", titleUr:"حاضری رپورٹ",
    desc:"Calendar heatmap, chronic absentees, batch comparison, print",
    href:"/dashboard/admin/attendance/reports", color:"#065f46", tag:"Reports",
  },
  // ── Finance ──
  {
    id:"fees",        icon:"💰",  title:"Fee Management",       titleUr:"فیس مینجمنٹ",
    desc:"Structures, payments, outstanding, receipts",
    href:"/dashboard/admin/fees",               color:"#166534", tag:"Finance",
  },
  {
    id:"scholarships",icon:"🎓",  title:"Scholarship Manager",  titleUr:"وظائف",
    desc:"Full/partial waivers, merit & need-based, donor-linked",
    href:"/dashboard/admin/fees/scholarships",  color:"#7c3aed", tag:"Finance",
  },
  {
    id:"donors",      icon:"🤲",  title:"Donors",               titleUr:"مخیران",
    desc:"Manage donors, link to students, send portal access",
    href:"/dashboard/admin/donors",             color:"#C4882A", tag:"Finance",
  },
  // ── Certificates ──
  {
    id:"sanads",      icon:"🏆",  title:"Sanad & Certificates", titleUr:"سند",
    desc:"3 templates, QR verification, bilingual, PDF download",
    href:"/dashboard/admin/sanads",             color:"#C4882A", tag:"Certificates",
  },
  // ── Enterprise ──
  {
    id:"campuses",    icon:"🏛️",  title:"Multi-Campus",         titleUr:"کیمپس",
    desc:"Manage campuses, compare performance, transfer students",
    href:"/dashboard/admin/campuses",           color:"#0369a1", tag:"Enterprise",
  },
  {
  id:"quran", icon:"📖", title:"Quran Module", titleUr:"قرآن",
  desc:"Arabic text, audio recitation, memorization mode",
  href:"/dashboard/admin/quran", color:"#C4882A", tag:"Reference",
}
];

const TAG_COLORS: Record<string,{color:string;bg:string;border:string}> = {
  Core:         { color:"#0D5C3A", bg:"#dcfce7", border:"#86efac" },
  Academic:     { color:"#b45309", bg:"#fffbeb", border:"#fde68a" },
  Intelligence: { color:"#6d28d9", bg:"#f5f3ff", border:"#c4b5fd" },
  Reports:      { color:"#065f46", bg:"#f0fdfa", border:"#99f6e4" },
  Finance:      { color:"#166534", bg:"#dcfce7", border:"#86efac" },
  Certificates: { color:"#92400e", bg:"#fffbeb", border:"#fde68a" },
  Enterprise:   { color:"#0369a1", bg:"#f0f9ff", border:"#bae6fd" },
};

export default function AdminDashboard() {
  const [stats,     setStats]     = useState<DashboardStats | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [adminName, setAdminName] = useState("");
  const [search,    setSearch]    = useState("");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => r.json())
      .then(d => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => { if (d.success) setAdminName(d.data?.name || ""); })
      .catch(console.error);
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method:"POST" });
    window.location.href = "/signin";
  };

  const now       = new Date();
  const hour      = now.getHours();
  const greeting  = hour < 12 ? "Subh Bakhair" : hour < 17 ? "Assalamu Alaikum" : "Shaam Bakhair";
  const filtered  = MODULES.filter(m =>
    !search ||
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.titleUr.includes(search) ||
    m.tag.toLowerCase().includes(search.toLowerCase()) ||
    m.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight:"100vh", background:"#f0fdf4" }}>

      {/* Nav */}
      <nav style={{ background:"#0D5C3A", padding:"0 24px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50, boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <HifzMark size={36} primary="#10B981" gold="#C4882A"/>
          <div>
            <div style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:20, fontWeight:700, color:"white", lineHeight:1 }}>HifzPro</div>
            <div style={{ fontFamily:"monospace", fontSize:8, color:"#C4882A", letterSpacing:2, opacity:0.8 }}>ADMIN DASHBOARD</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Link href="/dashboard/admin/students/new" style={{ padding:"8px 16px", borderRadius:8, background:"#C4882A", color:"white", fontSize:12, fontWeight:700, textDecoration:"none" }}>
            + Enroll Student
          </Link>
          <button onClick={handleSignOut} style={{ padding:"7px 14px", borderRadius:7, background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.7)", fontSize:12, cursor:"pointer" }}>
            Sign Out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 20px" }}>

        {/* Welcome banner */}
        <div style={{ background:"linear-gradient(135deg,#0D5C3A,#065f46)", borderRadius:20, padding:"26px 32px", marginBottom:24, position:"relative", overflow:"hidden" }}>
          <svg style={{ position:"absolute", right:-20, top:-20, opacity:0.05 }} width="180" height="180" viewBox="0 0 80 80">
            {[...Array(4)].map((_,i)=><polygon key={i} points={`40,${4+i*8} ${76-i*8},${40} ${40},${76-i*8} ${4+i*8},${40}`} fill="none" stroke="white" strokeWidth="1"/>)}
          </svg>
          <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:3, color:"#C4882A", marginBottom:4 }}>ADMIN CONTROL CENTER</div>
          <h1 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.8rem", fontWeight:700, color:"white", margin:"0 0 4px" }}>
            {greeting}{adminName ? `, ${adminName}` : ""}
          </h1>
          <div style={{ fontFamily:"'Scheherazade New',serif", fontSize:18, color:"#C4882A", opacity:0.8 }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { icon:"👨‍🎓", val:loading?"…":(stats?.activeStudents??0),   label:"Active Students",  color:"#0D5C3A", bg:"#dcfce7", border:"#86efac" },
            { icon:"👥",  val:loading?"…":(stats?.totalBatches??0),    label:"Active Halqas",    color:"#0369a1", bg:"#f0f9ff", border:"#bae6fd" },
            { icon:"📖",  val:loading?"…":(stats?.lessonsToday??0),    label:"Lessons Today",    color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4" },
            { icon:"👨‍🏫", val:loading?"…":(stats?.totalAsatidha??0),  label:"Total Asatidha",   color:"#7c3aed", bg:"#f5f3ff", border:"#c4b5fd" },
          ].map((s,i)=>(
            <div key={i} style={{ background:s.bg, borderRadius:14, padding:"16px 14px", border:`1px solid ${s.border}`, textAlign:"center" }}>
              <div style={{ fontSize:24, marginBottom:6 }}>{s.icon}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:26, fontWeight:700, color:s.color }}>{s.val}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:s.color, opacity:0.75, marginTop:3 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search bar */}
        <div style={{ marginBottom:20 }}>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", fontSize:16 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search modules... (Students, Fees, Sanad, Mutashabihat...)"
              style={{ width:"100%", padding:"12px 16px 12px 42px", border:"1.5px solid #bbf7d0", borderRadius:10, fontSize:13, fontFamily:"'Inter',sans-serif", outline:"none", background:"white", color:"#1a1a1a", boxSizing:"border-box" }}
            />
          </div>
        </div>

        {/* Module grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(245px,1fr))", gap:14, marginBottom:28 }}>
          {filtered.map(m => {
            const tc = TAG_COLORS[m.tag] || TAG_COLORS.Core;
            return (
              <Link key={m.id} href={m.href} style={{ textDecoration:"none" }}>
                <div style={{ background:"white", borderRadius:14, padding:"18px 16px", border:"1px solid #e2e8f0", borderTop:`3px solid ${m.color}`, cursor:"pointer", height:"100%", display:"flex", flexDirection:"column", gap:10, boxSizing:"border-box", transition:"box-shadow 0.15s" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <span style={{ fontSize:30 }}>{m.icon}</span>
                    <span style={{ background:tc.bg, color:tc.color, padding:"2px 8px", borderRadius:5, fontSize:9, fontFamily:"monospace", fontWeight:700, border:`1px solid ${tc.border}` }}>
                      {m.tag}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:700, color:"#1a1a1a" }}>{m.title}</div>
                    <div style={{ fontFamily:"'Scheherazade New','Cormorant Garamond',serif", fontSize:13, color:m.color, opacity:0.8, marginTop:1 }}>{m.titleUr}</div>
                  </div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:"#64748b", lineHeight:1.65, flex:1 }}>{m.desc}</div>
                  <div style={{ display:"flex", alignItems:"center", gap:4, color:m.color, fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, paddingTop:4, borderTop:"1px solid #f1f5f9" }}>
                    Open Module <span style={{ fontSize:14 }}>→</span>
                  </div>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ gridColumn:"1/-1", textAlign:"center", padding:40, color:"#94a3b8", fontFamily:"'Inter',sans-serif" }}>
              No modules found for "{search}"
            </div>
          )}
        </div>

        {/* Bottom quick links */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          {[
            { icon:"📊", label:"View Analytics",     sub:"Dropout risk & health",       href:"/dashboard/admin/analytics",  color:"#0e7490" },
            { icon:"📱", label:"Parent Portal",       sub:"Mobile-first parent view",    href:"/dashboard/parent",           color:"#7c3aed" },
            { icon:"🔐", label:"Super Admin Panel",   sub:"SaaS control center",         href:"/superadmin",                 color:"#0D5C3A" },
          ].map((q,i)=>(
            <Link key={i} href={q.href} style={{ textDecoration:"none" }}>
              <div style={{ background:"white", borderRadius:10, padding:"14px 16px", border:"1px solid #e2e8f0", display:"flex", alignItems:"center", gap:12, borderLeft:`4px solid ${q.color}` }}>
                <span style={{ fontSize:22 }}>{q.icon}</span>
                <div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:12, fontWeight:700, color:"#1a1a1a" }}>{q.label}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:"#94a3b8" }}>{q.sub}</div>
                </div>
                <span style={{ marginLeft:"auto", color:"#94a3b8" }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
