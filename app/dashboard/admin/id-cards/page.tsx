"use client";
// app/dashboard/admin/id-cards/page.tsx
// HifzPro ID Card Studio
// Tabs: Design Studio | Student Cards | Staff Cards
// CR80 card (323×204px), QR code, bulk PDF print

import { useState, useEffect, useRef, useCallback } from "react";
import { colors, fonts } from "@/lib/tokens";

// ─── Types ───────────────────────────────────────────────────
interface CardDesign {
  primaryColor:  string;
  accentColor:   string;
  logoUrl:       string | null;
  bgType:        "solid" | "gradient" | "image";
  bgValue:       string;
  fontStyle:     "classic" | "modern" | "arabic";
  instituteName: string;
  tagline:       string | null;
  address:       string | null;
  footerText:    string | null;
  parentAppUrl:  string;
  ustadhAppUrl:  string;
  visibleFields: string[];
}

interface StudentCard {
  id: string;
  name: string;
  nameArabic: string | null;
  enrollmentNumber: string;
  program: string;
  photo: string | null;
  dateOfBirth: string | null;
  batch: { name: string } | null;
  guardians: { name: string; phone: string; relation: string }[];
  progress: { currentJuz: number } | null;
}

interface StaffCard {
  id: string;
  userId: string;
  user: {
    name: string;
    phone: string | null;
    avatar: string | null;
    createdAt: string;
  };
  qualification: string | null;
  specialization: string | null;
  joinedAt: string;
  batches: { name: string }[];
}

type Tab = "design" | "students" | "staff";

const EMERALD = "#0D5C3A";
const GOLD    = "#C4882A";

// ─── Defaults ────────────────────────────────────────────────
const DEFAULT_DESIGN: CardDesign = {
  primaryColor: EMERALD, accentColor: GOLD,
  logoUrl: null, bgType: "gradient", bgValue: EMERALD,
  fontStyle: "classic", instituteName: "", tagline: null,
  address: null, footerText: null,
  parentAppUrl: "https://hifzpro.com/parent-app",
  ustadhAppUrl: "https://hifzpro.com/ustadh-app",
  visibleFields: ["guardian","batch","program","bloodGroup"],
};

// ─── QR Code (pure SVG — no external lib needed) ─────────────
// Uses a simple URL-encoded QR via Google Charts API
function QRImg({ data, size = 48 }: { data: string; size?: number }) {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size*2}x${size*2}&data=${encodeURIComponent(data)}&format=png&bgcolor=ffffff&color=000000&margin=2`;
  return (
    <img
      src={url}
      width={size} height={size}
      style={{ imageRendering: "pixelated", display: "block" }}
      alt="QR"
    />
  );
}

// ─── Card Component (renders one CR80 card) ──────────────────
// 323 × 204px = CR80 at 96dpi
function StudentIDCard({
  student, design, selected, onClick,
}: {
  student: StudentCard;
  design: CardDesign;
  selected?: boolean;
  onClick?: () => void;
}) {
  const W = 323; const H = 204;
  const g = student.guardians?.[0];
  const qrData = JSON.stringify({
    id: student.id,
    enrollment: student.enrollmentNumber,
    type: "student",
    app: design.parentAppUrl,
  });

  const bg = design.bgType === "gradient"
    ? `linear-gradient(135deg, ${design.primaryColor} 0%, ${adjustColor(design.primaryColor, -30)} 100%)`
    : design.bgType === "image" && design.bgValue.startsWith("http")
    ? `url(${design.bgValue}) center/cover`
    : design.bgValue;

  const show = (f: string) => design.visibleFields.includes(f);

  return (
    <div
      onClick={onClick}
      style={{
        width: W, height: H, borderRadius: 12,
        background: bg,
        border: selected ? `3px solid ${GOLD}` : "3px solid transparent",
        cursor: onClick ? "pointer" : "default",
        position: "relative", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        flexShrink: 0,
        fontFamily: design.fontStyle === "arabic"
          ? "'Scheherazade New', 'Cormorant Garamond', serif"
          : design.fontStyle === "modern"
          ? "'Inter', sans-serif"
          : "'Cormorant Garamond', Georgia, serif",
      }}
    >
      {/* Decorative arc */}
      <svg style={{ position:"absolute", right:-20, top:-20, opacity:0.08 }} width={120} height={120}>
        <circle cx={60} cy={60} r={55} fill="none" stroke="white" strokeWidth={18}/>
      </svg>

      {/* Header strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        height: 46, background: `rgba(0,0,0,0.25)`,
        display: "flex", alignItems: "center", padding: "0 10px", gap: 8,
      }}>
        {design.logoUrl ? (
          <img src={design.logoUrl} style={{ width: 28, height: 28, borderRadius: 4, objectFit: "cover" }} alt="logo"/>
        ) : (
          <div style={{ width: 28, height: 28, borderRadius: 4, background: design.accentColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14 }}>🕌</span>
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "white", lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {design.instituteName || "Institution Name"}
          </div>
          {design.tagline && (
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.65)", marginTop: 1, lineHeight: 1 }}>{design.tagline}</div>
          )}
        </div>
        <div style={{ fontSize: 7, color: design.accentColor, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", flexShrink: 0 }}>
          STUDENT ID
        </div>
      </div>

      {/* Body */}
      <div style={{ position: "absolute", top: 50, left: 0, right: 0, bottom: 30, display: "flex", gap: 8, padding: "0 10px" }}>
        {/* Photo */}
        <div style={{ width: 64, flexShrink: 0 }}>
          {student.photo ? (
            <img src={student.photo} style={{ width: 64, height: 72, objectFit: "cover", borderRadius: 6, border: `2px solid ${design.accentColor}` }} alt="photo"/>
          ) : (
            <div style={{ width: 64, height: 72, borderRadius: 6, background: "rgba(255,255,255,0.15)", border: `2px solid ${design.accentColor}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 24, color: "rgba(255,255,255,0.5)" }}>👤</span>
            </div>
          )}
          {/* QR below photo */}
          <div style={{ marginTop: 4, background: "white", borderRadius: 4, padding: 2, width: 60 }}>
            <QRImg data={qrData} size={56}/>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "white", lineHeight: 1.1 }}>{student.name}</div>
          {student.nameArabic && (
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.7)", direction: "rtl", textAlign: "left", fontFamily: "'Scheherazade New', serif" }}>{student.nameArabic}</div>
          )}
          <div style={{ fontSize: 9, color: design.accentColor, fontWeight: 700, letterSpacing: 0.5, marginTop: 2 }}>
            {student.enrollmentNumber}
          </div>
          <div style={{ height: 1, background: "rgba(255,255,255,0.15)", margin: "2px 0" }}/>
          {show("program") && <CardRow label="Program" val={student.program} accent={design.accentColor}/>}
          {show("batch") && student.batch && <CardRow label="Halqa" val={student.batch.name} accent={design.accentColor}/>}
          {show("guardian") && g && <CardRow label="Guardian" val={`${g.name} · ${g.phone}`} accent={design.accentColor}/>}
          {student.dateOfBirth && <CardRow label="DOB" val={new Date(student.dateOfBirth).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})} accent={design.accentColor}/>}
          {show("batch") && student.progress && <CardRow label="Juz" val={`${student.progress.currentJuz} / 30`} accent={design.accentColor}/>}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 26,
        background: design.accentColor,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 10px",
      }}>
        <div style={{ fontSize: 7, color: "white", fontWeight: 700 }}>
          {design.footerText || `Scan QR to download Parent App`}
        </div>
        <div style={{ fontSize: 7, color: "rgba(255,255,255,0.7)" }}>
          Session {new Date().getFullYear()}–{new Date().getFullYear()+1}
        </div>
      </div>
    </div>
  );
}

function StaffIDCard({
  staff, design, selected, onClick,
}: {
  staff: StaffCard;
  design: CardDesign;
  selected?: boolean;
  onClick?: () => void;
}) {
  const W = 323; const H = 204;
  const qrData = JSON.stringify({
    id: staff.id,
    name: staff.user.name,
    type: "staff",
    app: design.ustadhAppUrl,
  });

  const bg = design.bgType === "gradient"
    ? `linear-gradient(135deg, ${adjustColor(design.primaryColor, -20)} 0%, #1a1a2e 100%)`
    : design.bgType === "image" && design.bgValue.startsWith("http")
    ? `url(${design.bgValue}) center/cover`
    : design.bgValue;

  return (
    <div
      onClick={onClick}
      style={{
        width: W, height: H, borderRadius: 12,
        background: bg,
        border: selected ? `3px solid ${GOLD}` : "3px solid transparent",
        cursor: onClick ? "pointer" : "default",
        position: "relative", overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        flexShrink: 0,
      }}
    >
      {/* Geometric accent */}
      <svg style={{ position:"absolute", left:-10, bottom:-10, opacity:0.08 }} width={100} height={100}>
        <polygon points="0,100 50,0 100,100" fill="white"/>
      </svg>

      {/* Header */}
      <div style={{
        position:"absolute", top:0, left:0, right:0, height:46,
        background:"rgba(0,0,0,0.3)",
        display:"flex", alignItems:"center", padding:"0 10px", gap:8,
      }}>
        {design.logoUrl ? (
          <img src={design.logoUrl} style={{width:28,height:28,borderRadius:4,objectFit:"cover"}} alt="logo"/>
        ) : (
          <div style={{width:28,height:28,borderRadius:4,background:design.accentColor,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:14}}>🕌</span>
          </div>
        )}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:10,fontWeight:700,color:"white",lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
            {design.instituteName || "Institution Name"}
          </div>
          {design.tagline && <div style={{fontSize:7,color:"rgba(255,255,255,0.65)",marginTop:1}}>{design.tagline}</div>}
        </div>
        <div style={{fontSize:7,color:design.accentColor,fontWeight:700,letterSpacing:1}}>STAFF ID</div>
      </div>

      {/* Body */}
      <div style={{position:"absolute",top:50,left:0,right:0,bottom:30,display:"flex",gap:8,padding:"0 10px"}}>
        <div style={{width:64,flexShrink:0}}>
          {staff.user.avatar ? (
            <img src={staff.user.avatar} style={{width:64,height:72,objectFit:"cover",borderRadius:6,border:`2px solid ${design.accentColor}`}} alt="photo"/>
          ) : (
            <div style={{width:64,height:72,borderRadius:6,background:"rgba(255,255,255,0.15)",border:`2px solid ${design.accentColor}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontSize:24,color:"rgba(255,255,255,0.5)"}}>👨‍🏫</span>
            </div>
          )}
          <div style={{marginTop:4,background:"white",borderRadius:4,padding:2,width:60}}>
            <QRImg data={qrData} size={56}/>
          </div>
        </div>

        <div style={{flex:1,display:"flex",flexDirection:"column",gap:3}}>
          <div style={{fontSize:13,fontWeight:700,color:"white",lineHeight:1.1}}>{staff.user.name}</div>
          <div style={{fontSize:9,color:design.accentColor,fontWeight:700,letterSpacing:0.5,marginTop:2}}>USTADH / STAFF</div>
          <div style={{height:1,background:"rgba(255,255,255,0.15)",margin:"2px 0"}}/>
          {staff.qualification && <CardRow label="Qualification" val={staff.qualification} accent={design.accentColor}/>}
          {staff.specialization && <CardRow label="Specialization" val={staff.specialization} accent={design.accentColor}/>}
          {staff.batches?.length > 0 && <CardRow label="Halqa(s)" val={staff.batches.map(b=>b.name).join(", ")} accent={design.accentColor}/>}
          {staff.user.phone && <CardRow label="Phone" val={staff.user.phone} accent={design.accentColor}/>}
          <CardRow label="Joined" val={new Date(staff.joinedAt).toLocaleDateString("en-PK",{month:"short",year:"numeric"})} accent={design.accentColor}/>
        </div>
      </div>

      {/* Footer */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,height:26,background:design.accentColor,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 10px"}}>
        <div style={{fontSize:7,color:"white",fontWeight:700}}>{design.footerText||"Scan QR to download Ustadh App"}</div>
        <div style={{fontSize:7,color:"rgba(255,255,255,0.7)"}}>Session {new Date().getFullYear()}–{new Date().getFullYear()+1}</div>
      </div>
    </div>
  );
}

function CardRow({ label, val, accent }: { label: string; val: string; accent: string }) {
  return (
    <div style={{ display:"flex", gap:4, alignItems:"flex-start" }}>
      <span style={{ fontSize:7, color:"rgba(255,255,255,0.5)", minWidth:42, flexShrink:0, paddingTop:1 }}>{label}</span>
      <span style={{ fontSize:8, color:"white", fontWeight:600, lineHeight:1.2, overflow:"hidden", display:"-webkit-box", WebkitLineClamp:1, WebkitBoxOrient:"vertical" as any }}>{val}</span>
    </div>
  );
}

// ─── Color helper ─────────────────────────────────────────────
function adjustColor(hex: string, amount: number): string {
  try {
    const num = parseInt(hex.replace("#",""), 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount));
    const b = Math.min(255, Math.max(0, (num & 0xff) + amount));
    return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,"0")}`;
  } catch { return hex; }
}

// ─── Print helper ─────────────────────────────────────────────
function printCards(cardIds: string[], type: "student"|"staff") {
  const cards = document.querySelectorAll(`[data-card-print="${type}"]`);
  const selected = Array.from(cards).filter(c => cardIds.includes(c.getAttribute("data-card-id")||""));
  if (!selected.length) { alert("No cards selected"); return; }

  const html = `<!DOCTYPE html><html><head><style>
    @page { size: A4; margin: 10mm; }
    body { margin:0; padding:0; background:white; }
    .grid { display:grid; grid-template-columns:repeat(2,1fr); gap:8mm; }
    .card-wrap { break-inside:avoid; page-break-inside:avoid; }
    .card-wrap > div { transform-origin: top left; }
    @media print { body { -webkit-print-color-adjust:exact; print-color-adjust:exact; } }
  </style></head><body>
    <div class="grid">
      ${selected.map(c => `<div class="card-wrap">${c.outerHTML}</div>`).join("")}
    </div>
  </body></html>`;

  const win = window.open("","_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.onload = () => { win.print(); win.close(); };
}

// ─── ColorPicker ─────────────────────────────────────────────
function ColorPicker({ label, value, onChange }: { label:string; value:string; onChange:(v:string)=>void }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>{label}</label>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <input type="color" value={value} onChange={e=>onChange(e.target.value)}
          style={{ width:36, height:36, borderRadius:8, border:`1px solid ${colors.n200}`, cursor:"pointer", padding:2 }}/>
        <input type="text" value={value} onChange={e=>onChange(e.target.value)}
          style={{ flex:1, padding:"8px 10px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:"monospace" }}/>
      </div>
    </div>
  );
}

// ─── Toggle field ─────────────────────────────────────────────
function ToggleField({ label, field, fields, onChange }: { label:string; field:string; fields:string[]; onChange:(f:string[])=>void }) {
  const on = fields.includes(field);
  return (
    <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", marginBottom:8 }}>
      <input type="checkbox" checked={on}
        onChange={e => onChange(e.target.checked ? [...fields, field] : fields.filter(f=>f!==field))}
        style={{ width:16, height:16, accentColor:EMERALD }}/>
      <span style={{ fontSize:12, fontFamily:fonts.body, color:colors.n700 }}>{label}</span>
    </label>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function IDCardStudioPage() {
  const [tab,            setTab]            = useState<Tab>("design");
  const [design,         setDesign]         = useState<CardDesign>(DEFAULT_DESIGN);
  const [savingDesign,   setSavingDesign]   = useState(false);
  const [designSaved,    setDesignSaved]    = useState(false);

  const [students,       setStudents]       = useState<StudentCard[]>([]);
  const [staff,          setStaff]          = useState<StaffCard[]>([]);
  const [loadingCards,   setLoadingCards]   = useState(false);

  const [selectedStu,   setSelectedStu]    = useState<Set<string>>(new Set());
  const [selectedStaff, setSelectedStaff]  = useState<Set<string>>(new Set());

  const [stuSearch,     setStuSearch]      = useState("");
  const [staffSearch,   setStaffSearch]    = useState("");
  const [printing,      setPrinting]       = useState(false);

  const setD = (key: keyof CardDesign, val: any) =>
    setDesign(prev => ({ ...prev, [key]: val }));

  // Load saved design
  useEffect(() => {
    fetch("/api/admin/id-cards/design")
      .then(r=>r.json())
      .then(d => {
        const json = d?.data ?? d;
        if (json?.design) {
          const saved = json.design;
          setDesign({
            ...DEFAULT_DESIGN,
            ...saved,
            visibleFields: typeof saved.visibleFields === "string"
              ? JSON.parse(saved.visibleFields)
              : saved.visibleFields ?? DEFAULT_DESIGN.visibleFields,
          });
        }
      }).catch(()=>{});
  }, []);

  // Load students & staff when switching tabs
  useEffect(() => {
    if (tab === "students" && students.length === 0) {
      setLoadingCards(true);
      fetch("/api/admin/students?limit=200")
        .then(r=>r.json())
        .then(d => {
          const json = d?.data ?? d;
          setStudents(json?.students ?? []);
        })
        .catch(()=>{})
        .finally(()=>setLoadingCards(false));
    }
    if (tab === "staff" && staff.length === 0) {
      setLoadingCards(true);
      fetch("/api/admin/asatidha")
  .then(r=>r.json())
  .then(d => {
    const json = d?.data ?? d;
    const list = (json?.asatidha ?? json?.data ?? []) as any[];
    // Only keep records that have a valid user object
    setStaff(list.filter(s => s?.user?.name));
  })
        .catch(()=>{})
        .finally(()=>setLoadingCards(false));
    }
  }, [tab]);

  const saveDesign = async () => {
    setSavingDesign(true);
    try {
      await fetch("/api/admin/id-cards/design", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(design),
      });
      setDesignSaved(true);
      setTimeout(()=>setDesignSaved(false), 3000);
    } catch {}
    finally { setSavingDesign(false); }
  };

  const toggleStu  = (id:string) => setSelectedStu(prev  => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });
  const toggleStaff= (id:string) => setSelectedStaff(prev => { const s=new Set(prev); s.has(id)?s.delete(id):s.add(id); return s; });

  const filteredStu   = students.filter(s => !stuSearch   || s.name.toLowerCase().includes(stuSearch.toLowerCase())   || s.enrollmentNumber?.includes(stuSearch));
  const filteredStaff = staff.filter(s    => !staffSearch || s.user.name.toLowerCase().includes(staffSearch.toLowerCase()));

  // Preview student (first selected or first in list)
  const previewStudent = students.find(s => selectedStu.has(s.id)) ?? students[0];
  const previewStaff   = staff.find(s => selectedStaff.has(s.id)) ?? staff[0];

  const inp = { width:"100%", padding:"9px 11px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, color:colors.n800, outline:"none" };

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Nav */}
      <nav style={{ background:EMERALD, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50, boxShadow:"0 2px 12px rgba(0,0,0,0.2)" }}>
        <a href="/dashboard/admin" style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.1)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:"white", fontSize:16 }}>←</a>
        <div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:18, fontWeight:700, color:"white", lineHeight:1 }}>ID Card Studio</div>
          <div style={{ fontFamily:"monospace", fontSize:7, color:GOLD, letterSpacing:2 }}>DESIGN · GENERATE · PRINT</div>
        </div>
        <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
          {tab === "design" && (
            <button onClick={saveDesign} disabled={savingDesign} style={{ padding:"8px 20px", borderRadius:8, background:designSaved?"#16a34a":GOLD, color:"white", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
              {savingDesign ? "Saving…" : designSaved ? "✓ Saved!" : "Save Design"}
            </button>
          )}
          {tab === "students" && selectedStu.size > 0 && (
            <button onClick={()=>printCards(Array.from(selectedStu),"student")} style={{ padding:"8px 20px", borderRadius:8, background:GOLD, color:"white", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
              🖨 Print {selectedStu.size} Card{selectedStu.size>1?"s":""}
            </button>
          )}
          {tab === "staff" && selectedStaff.size > 0 && (
            <button onClick={()=>printCards(Array.from(selectedStaff),"staff")} style={{ padding:"8px 20px", borderRadius:8, background:GOLD, color:"white", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
              🖨 Print {selectedStaff.size} Card{selectedStaff.size>1?"s":""}
            </button>
          )}
        </div>
      </nav>

      {/* Tabs */}
      <div style={{ background:"white", borderBottom:`1px solid ${colors.n200}`, display:"flex", padding:"0 24px" }}>
        {([
          { id:"design",   label:"🎨 Design Studio" },
          { id:"students", label:`👨‍🎓 Student Cards (${students.length})` },
          { id:"staff",    label:`👨‍🏫 Staff Cards (${staff.length})` },
        ] as {id:Tab;label:string}[]).map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{ padding:"14px 20px", border:"none", background:"none", cursor:"pointer", borderBottom:`3px solid ${tab===t.id?EMERALD:"transparent"}`, fontFamily:fonts.heading, fontSize:13, fontWeight:600, color:tab===t.id?EMERALD:colors.n500 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DESIGN STUDIO TAB ── */}
      {tab === "design" && (
        <div style={{ maxWidth:1100, margin:"0 auto", padding:"24px 20px", display:"grid", gridTemplateColumns:"340px 1fr", gap:24 }}>

          {/* Left: controls */}
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

            {/* Branding */}
            <Section title="🏫 Institute Branding">
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Institute Name</label>
              <input value={design.instituteName} onChange={e=>setD("instituteName",e.target.value)} placeholder="e.g. Al-Noor Islamic Academy" style={{...inp, marginBottom:10}}/>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Tagline</label>
              <input value={design.tagline||""} onChange={e=>setD("tagline",e.target.value)} placeholder="e.g. Nurturing the Huffaz of Tomorrow" style={{...inp, marginBottom:10}}/>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Logo URL <span style={{color:colors.n400,fontWeight:400}}>(Cloudinary link)</span></label>
              <input value={design.logoUrl||""} onChange={e=>setD("logoUrl",e.target.value||null)} placeholder="https://res.cloudinary.com/..." style={inp}/>
            </Section>

            {/* Colors */}
            <Section title="🎨 Colors">
              <ColorPicker label="Primary Color" value={design.primaryColor} onChange={v=>setD("primaryColor",v)}/>
              <ColorPicker label="Accent Color"  value={design.accentColor}  onChange={v=>setD("accentColor",v)}/>
            </Section>

            {/* Background */}
            <Section title="🖼 Card Background">
              <div style={{ display:"flex", gap:6, marginBottom:10 }}>
                {(["solid","gradient","image"] as const).map(t=>(
                  <button key={t} onClick={()=>setD("bgType",t)}
                    style={{ flex:1, padding:"7px 0", borderRadius:7, border:`2px solid ${design.bgType===t?EMERALD:colors.n200}`, background:design.bgType===t?"#f0f9f4":"white", fontSize:11, fontFamily:fonts.heading, fontWeight:600, cursor:"pointer", color:design.bgType===t?EMERALD:colors.n600 }}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
              {design.bgType !== "image" && (
                <ColorPicker label="Background Color" value={design.bgValue.startsWith("#")?design.bgValue:"#0D5C3A"} onChange={v=>setD("bgValue",v)}/>
              )}
              {design.bgType === "image" && (
                <>
                  <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Background Image URL</label>
                  <input value={design.bgValue.startsWith("http")?design.bgValue:""} onChange={e=>setD("bgValue",e.target.value)} placeholder="https://res.cloudinary.com/..." style={inp}/>
                </>
              )}
            </Section>

            {/* Font */}
            <Section title="🔤 Font Style">
              <div style={{ display:"flex", gap:6 }}>
                {(["classic","modern","arabic"] as const).map(f=>(
                  <button key={f} onClick={()=>setD("fontStyle",f)}
                    style={{ flex:1, padding:"7px 0", borderRadius:7, border:`2px solid ${design.fontStyle===f?EMERALD:colors.n200}`, background:design.fontStyle===f?"#f0f9f4":"white", fontSize:11, fontFamily:f==="arabic"?"'Scheherazade New',serif":f==="modern"?"'Inter',sans-serif":"'Cormorant Garamond',serif", fontWeight:600, cursor:"pointer", color:design.fontStyle===f?EMERALD:colors.n600 }}>
                    {f.charAt(0).toUpperCase()+f.slice(1)}
                  </button>
                ))}
              </div>
            </Section>

            {/* Fields */}
            <Section title="📋 Visible Fields on Card">
              <ToggleField label="Guardian Name & Phone" field="guardian" fields={design.visibleFields} onChange={v=>setD("visibleFields",v)}/>
              <ToggleField label="Batch / Halqa"         field="batch"    fields={design.visibleFields} onChange={v=>setD("visibleFields",v)}/>
              <ToggleField label="Program"               field="program"  fields={design.visibleFields} onChange={v=>setD("visibleFields",v)}/>
              <ToggleField label="Blood Group"           field="bloodGroup" fields={design.visibleFields} onChange={v=>setD("visibleFields",v)}/>
              <ToggleField label="Current Juz"           field="juz"      fields={design.visibleFields} onChange={v=>setD("visibleFields",v)}/>
            </Section>

            {/* Footer & App URLs */}
            <Section title="📱 App Download URLs (for QR)">
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Parent App URL</label>
              <input value={design.parentAppUrl} onChange={e=>setD("parentAppUrl",e.target.value)} style={{...inp, marginBottom:10}}/>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Ustadh App URL</label>
              <input value={design.ustadhAppUrl} onChange={e=>setD("ustadhAppUrl",e.target.value)} style={{...inp, marginBottom:10}}/>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:colors.n700, fontFamily:fonts.heading, marginBottom:4 }}>Footer Text</label>
              <input value={design.footerText||""} onChange={e=>setD("footerText",e.target.value)} placeholder="Scan QR to download Parent App" style={inp}/>
            </Section>
          </div>

          {/* Right: live preview */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
            <div style={{ background:"white", borderRadius:16, border:`1px solid ${colors.n200}`, padding:28 }}>
              <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800, marginBottom:20 }}>Live Preview</div>

              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.n400, marginBottom:10 }}>STUDENT CARD</div>
                <StudentIDCard
                  student={{
                    id:"preview", name:"Muhammad Ahmed", nameArabic:"محمد احمد",
                    enrollmentNumber:"HP-26-0001", program:"HIFZ",
                    photo:null, dateOfBirth:"2014-03-19",
                    batch:{ name:"DTP-Boys-Batch-01" },
                    guardians:[{ name:"Abdullah Ahmed", phone:"0300-1234567", relation:"Father" }],
                    progress:{ currentJuz:15 },
                  }}
                  design={design}
                />
              </div>

              <div>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.n400, marginBottom:10 }}>STAFF CARD</div>
                <StaffIDCard
                  staff={{
                    id:"preview2", userId:"u1",
                    user:{ name:"Qari Muhammad Ibrahim", phone:"0300-9876543", avatar:null, createdAt:new Date().toISOString() },
                    qualification:"Hafiz-e-Quran, Tajweed Certificate",
                    specialization:"Hifz & Tajweed",
                    joinedAt:new Date().toISOString(),
                    batches:[{ name:"Boys-Hifz-01" },{ name:"Boys-Hifz-02" }],
                  }}
                  design={design}
                />
              </div>
            </div>

            <div style={{ background:"#FBF3E4", borderRadius:12, padding:16, border:`1px solid ${GOLD}44` }}>
              <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:"#92660F", marginBottom:6 }}>🖨 Print Guide</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:"#92660F", lineHeight:1.7 }}>
                Cards print 2 per row on A4. For best results use card stock paper (250gsm). After printing, cut along card edges and laminate for durability. QR codes are readable by ZKTeco scanners for automatic attendance marking.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STUDENT CARDS TAB ── */}
      {tab === "students" && (
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
          {/* Toolbar */}
          <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center", flexWrap:"wrap" }}>
            <input value={stuSearch} onChange={e=>setStuSearch(e.target.value)} placeholder="Search students…" style={{ flex:1, minWidth:200, padding:"10px 14px", border:`1px solid ${colors.n200}`, borderRadius:10, fontSize:13, fontFamily:fonts.body, outline:"none" }}/>
            <button onClick={()=>setSelectedStu(new Set(filteredStu.map(s=>s.id)))}
              style={{ padding:"10px 16px", borderRadius:10, background:EMERALD, color:"white", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
              Select All
            </button>
            <button onClick={()=>setSelectedStu(new Set())}
              style={{ padding:"10px 16px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Clear
            </button>
            <div style={{ fontFamily:fonts.mono, fontSize:11, color:colors.n500, padding:"10px 0" }}>
              {selectedStu.size} selected · {filteredStu.length} total
            </div>
          </div>

          {loadingCards ? (
            <div style={{ textAlign:"center", padding:60, color:colors.n400, fontFamily:fonts.body }}>Loading students…</div>
          ) : filteredStu.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:colors.n400, fontFamily:fonts.body }}>No students found</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:16 }}>
              {filteredStu.map(s => (
                <div key={s.id} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="checkbox" checked={selectedStu.has(s.id)} onChange={()=>toggleStu(s.id)}
                      style={{ width:16, height:16, accentColor:EMERALD, cursor:"pointer" }}/>
                    <span style={{ fontFamily:fonts.body, fontSize:12, color:colors.n700 }}>{s.name} · {s.enrollmentNumber}</span>
                  </div>
                  {/* Hidden print version with data attrs */}
                  <div
                    data-card-print="student"
                    data-card-id={s.id}
                    style={{ display:"inline-block" }}
                  >
                    <StudentIDCard student={s} design={design} selected={selectedStu.has(s.id)} onClick={()=>toggleStu(s.id)}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── STAFF CARDS TAB ── */}
      {tab === "staff" && (
        <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>
          <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center", flexWrap:"wrap" }}>
            <input value={staffSearch} onChange={e=>setStaffSearch(e.target.value)} placeholder="Search staff…" style={{ flex:1, minWidth:200, padding:"10px 14px", border:`1px solid ${colors.n200}`, borderRadius:10, fontSize:13, fontFamily:fonts.body, outline:"none" }}/>
            <button onClick={()=>setSelectedStaff(new Set(filteredStaff.map(s=>s.id)))}
              style={{ padding:"10px 16px", borderRadius:10, background:EMERALD, color:"white", fontSize:12, fontWeight:700, border:"none", cursor:"pointer" }}>
              Select All
            </button>
            <button onClick={()=>setSelectedStaff(new Set())}
              style={{ padding:"10px 16px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:12, fontWeight:700, cursor:"pointer" }}>
              Clear
            </button>
            <div style={{ fontFamily:fonts.mono, fontSize:11, color:colors.n500, padding:"10px 0" }}>
              {selectedStaff.size} selected · {filteredStaff.length} total
            </div>
          </div>

          {loadingCards ? (
            <div style={{ textAlign:"center", padding:60, color:colors.n400, fontFamily:fonts.body }}>Loading staff…</div>
          ) : filteredStaff.length === 0 ? (
            <div style={{ textAlign:"center", padding:60, color:colors.n400, fontFamily:fonts.body }}>No staff found</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(340px, 1fr))", gap:16 }}>
              {filteredStaff.map(s => (
                <div key={s.id} style={{ display:"flex", flexDirection:"column", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <input type="checkbox" checked={selectedStaff.has(s.id)} onChange={()=>toggleStaff(s.id)}
                      style={{ width:16, height:16, accentColor:EMERALD, cursor:"pointer" }}/>
                    <span style={{ fontFamily:fonts.body, fontSize:12, color:colors.n700 }}>{s.user.name}</span>
                  </div>
                  <div
                    data-card-print="staff"
                    data-card-id={s.id}
                    style={{ display:"inline-block" }}
                  >
                    <StaffIDCard staff={s} design={design} selected={selectedStaff.has(s.id)} onClick={()=>toggleStaff(s.id)}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────
function Section({ title, children }: { title:string; children:React.ReactNode }) {
  return (
    <div style={{ background:"white", borderRadius:14, border:`1px solid ${colors.n200}`, padding:18 }}>
      <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:14 }}>{title}</div>
      {children}
    </div>
  );
}
