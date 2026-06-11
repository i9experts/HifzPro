"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Ustadh {
  id: string; userId: string; name: string; email: string;
  phone: string | null; whatsapp: string | null; photo: string | null;
  isActive: boolean; createdAt: string;
  qualifications: string[]; specialization: string | null;
  experience: number | null; nameArabic: string | null;
  batches: { id: string; name: string; program: string; _count: { students: number } }[];
  stats: { totalBatches: number; totalStudents: number; lessonsThisMonth: number; avgGrade: number | null; avgStudentHealth: number | null };
}
interface Stats { totalUstadh: number; unassigned: number; totalStudentsCovered: number; }

const PROGRAM_COLORS: Record<string,string> = {
  HIFZ:colors.primary, NAZRA:"#7c3aed", TAJWEED:"#b45309", GIRDAAN:"#0f766e"
};

function HealthBar({ score }: { score: number | null }) {
  if (score === null) return <span style={{ fontFamily:fonts.mono, fontSize:11, color:colors.n300 }}>—</span>;
  const color = score>=75?colors.successText:score>=55?colors.warningText:colors.errorText;
  const bg    = score>=75?colors.successBg:score>=55?colors.warningBg:colors.errorBg;
  return <span style={{ background:bg, color, padding:"2px 7px", borderRadius:999, fontSize:10, fontFamily:fonts.mono, fontWeight:700 }}>{score}%</span>;
}

// ── CSV template ──
const USTADH_CSV_TEMPLATE = `name,email,phone,whatsapp,specialization,experience,qualifications
Qari Abdullah,qari.abdullah@school.com,03001234567,03001234567,Hifz ul Quran,5,Hafiz ul Quran|Qari
Maulana Ibrahim,m.ibrahim@school.com,03111234567,,Tajweed & Qiraah,3,Alim|Graduate Darul Uloom
Hafiz Usman,h.usman@school.com,03211234567,,,8,Hafiz ul Quran`;

function parseCSV(text: string): Record<string, string>[] {
  // Strip UTF-8 BOM if present (Excel adds this)
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  const lines   = cleaned.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];

  // Auto-detect delimiter: semicolon (European Excel) or comma
  const firstLine = lines[0];
  const delim     = firstLine.includes(";") && !firstLine.includes(",") ? ";" : ",";

  function splitLine(line: string): string[] {
    const result: string[] = [];
    let cur = "", inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuote = !inQuote;
      } else if (ch === delim && !inQuote) {
        result.push(cur.trim().replace(/^"|"$/g, ""));
        cur = "";
      } else {
        cur += ch;
      }
    }
    result.push(cur.trim().replace(/^"|"$/g, ""));
    return result;
  }

  const headers = splitLine(lines[0]).map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = splitLine(line);
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  });
}

// ── Bulk Import Modal ──
function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step,    setStep]    = useState<"upload"|"preview"|"results">("upload");
  const [rows,    setRows]    = useState<Record<string,string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error,   setError]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = e => {
      const text   = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) { setError("Could not parse CSV. Make sure it matches the template format."); return; }
      if (parsed.length > 100) { setError("Maximum 100 rows allowed per import."); return; }
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/admin/asatidha/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ asatidha: rows }),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setStep("results");
        if (data.data.succeeded > 0) onSuccess();
      } else {
        setError(data.error || "Import failed");
      }
    } catch { setError("Connection error. Please try again."); }
    finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const blob = new Blob([USTADH_CSV_TEMPLATE], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "asatidha_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:colors.white, borderRadius:20, width:"100%", maxWidth:780, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ padding:"22px 28px", borderBottom:`1px solid ${colors.n100}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:18, fontWeight:700, color:colors.n800 }}>📥 Bulk Import Asatidha</div>
            <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n400, marginTop:2 }}>Upload a CSV to add multiple Asatidha at once — passwords auto-generated</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${colors.n200}`, background:colors.n50, cursor:"pointer", fontSize:16, color:colors.n500 }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", padding:"16px 28px", gap:0, borderBottom:`1px solid ${colors.n100}` }}>
          {[["upload","1. Upload"],["preview","2. Preview"],["results","3. Results"]].map(([s,label],i) => (
            <div key={s} style={{ display:"flex", alignItems:"center" }}>
              <div style={{ padding:"4px 14px", borderRadius:20, background:step===s?colors.primary:colors.n100, color:step===s?colors.white:colors.n400, fontSize:11, fontWeight:700, fontFamily:fonts.heading }}>{label}</div>
              {i<2 && <div style={{ width:20, height:1, background:colors.n200 }}/>}
            </div>
          ))}
        </div>

        <div style={{ padding:"24px 28px" }}>

          {/* ── STEP 1: Upload ── */}
          {step === "upload" && (
            <div>
              <div style={{ background:colors.green50, borderRadius:12, padding:"16px 20px", border:`1px solid ${colors.green200}`, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.primary, marginBottom:2 }}>📋 Download CSV Template</div>
                  <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500 }}>Columns: name, email, phone, whatsapp, specialization, experience, qualifications</div>
                </div>
                <button onClick={downloadTemplate} style={{ padding:"8px 18px", borderRadius:8, background:colors.primary, color:colors.white, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:fonts.heading, whiteSpace:"nowrap" }}>
                  ↓ Template
                </button>
              </div>

              <div style={{ background:"#fffbeb", borderRadius:10, padding:"12px 16px", border:"1px solid #fde68a", marginBottom:20 }}>
                <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:"#b45309", marginBottom:4 }}>Notes</div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:"#92400e", lineHeight:1.7 }}>
                  • Passwords will be auto-generated and shown in results — share with each Ustadh<br/>
                  • Qualifications: separate multiple with pipe <code style={{ background:"#fef3c7", padding:"0 4px", borderRadius:3 }}>|</code> e.g. <code style={{ background:"#fef3c7", padding:"0 4px", borderRadius:3 }}>Hafiz ul Quran|Alim</code><br/>
                  • whatsapp, specialization, experience, qualifications are all optional
                </div>
              </div>

              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }}
                style={{ border:`2px dashed ${colors.n200}`, borderRadius:14, padding:"40px 20px", textAlign:"center", cursor:"pointer" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
                <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n700, marginBottom:4 }}>Drop CSV here or click to browse</div>
                <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n400 }}>Supports .csv files · max 100 rows</div>
                <input ref={fileRef} type="file" accept=".csv" style={{ display:"none" }} onChange={e => { if(e.target.files?.[0]) handleFile(e.target.files[0]); }} />
              </div>

              {error && <div style={{ marginTop:14, padding:"10px 14px", borderRadius:8, background:colors.errorBg, color:colors.errorText, fontFamily:fonts.body, fontSize:12 }}>⚠ {error}</div>}
            </div>
          )}

          {/* ── STEP 2: Preview ── */}
          {step === "preview" && (
            <div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
                <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n800 }}>
                  {rows.length} Ustadh ready to import
                </div>
                <button onClick={() => setStep("upload")} style={{ padding:"6px 14px", borderRadius:7, border:`1px solid ${colors.n200}`, background:colors.white, color:colors.n600, fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>
                  ← Change File
                </button>
              </div>

              <div style={{ border:`1px solid ${colors.n200}`, borderRadius:10, overflow:"auto", maxHeight:340, marginBottom:20 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:fonts.body }}>
                  <thead>
                    <tr style={{ background:colors.n50 }}>
                      {["#","Name","Email","Phone","Specialization","Exp (yrs)","Qualifications"].map(h => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.n500, borderBottom:`1px solid ${colors.n200}`, whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const hasName  = !!row.name?.trim();
                      const hasEmail = !!row.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.trim());
                      const hasPhone = !!row.phone?.trim();
                      const rowOk    = hasName && hasEmail && hasPhone;
                      return (
                        <tr key={i} style={{ background: rowOk ? "transparent" : "#fff5f5", borderBottom:`1px solid ${colors.n100}` }}>
                          <td style={{ padding:"8px 12px", color:colors.n400, fontFamily:fonts.mono, fontSize:11 }}>{i+1}</td>
                          <td style={{ padding:"8px 12px", fontWeight:600, color: hasName ? colors.n800 : colors.errorText }}>{row.name || "⚠ Missing"}</td>
                          <td style={{ padding:"8px 12px", color: hasEmail ? colors.n600 : colors.errorText, fontFamily:fonts.mono, fontSize:11 }}>{row.email || "⚠ Missing"}</td>
                          <td style={{ padding:"8px 12px", color: hasPhone ? colors.n600 : colors.errorText, fontFamily:fonts.mono, fontSize:11 }}>{row.phone || "⚠ Missing"}</td>
                          <td style={{ padding:"8px 12px", color:colors.n500 }}>{row.specialization || "—"}</td>
                          <td style={{ padding:"8px 12px", color:colors.n500, textAlign:"center" }}>{row.experience || "—"}</td>
                          <td style={{ padding:"8px 12px", color:colors.n500, fontSize:11 }}>
                            {row.qualifications
                              ? row.qualifications.split("|").map((q,j) => (
                                <span key={j} style={{ background:colors.green50, color:colors.primary, padding:"1px 6px", borderRadius:4, fontSize:9, fontFamily:fonts.heading, fontWeight:700, marginRight:3 }}>{q.trim()}</span>
                              ))
                              : "—"
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {error && <div style={{ marginBottom:14, padding:"10px 14px", borderRadius:8, background:colors.errorBg, color:colors.errorText, fontFamily:fonts.body, fontSize:12 }}>⚠ {error}</div>}

              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={() => setStep("upload")} style={{ padding:"10px 20px", borderRadius:9, border:`1px solid ${colors.n200}`, background:colors.white, color:colors.n600, fontSize:13, cursor:"pointer", fontFamily:fonts.heading }}>Back</button>
                <button onClick={handleImport} disabled={loading} style={{ padding:"10px 28px", borderRadius:9, background: loading ? colors.n300 : colors.primary, color:colors.white, fontSize:13, fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", fontFamily:fonts.heading }}>
                  {loading ? "Importing..." : `Import ${rows.length} Asatidha →`}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Results ── */}
          {step === "results" && results && (
            <div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                <div style={{ background:colors.successBg, borderRadius:12, padding:"18px 20px", border:`1px solid ${colors.success}44`, textAlign:"center" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:32, fontWeight:700, color:colors.successText }}>{results.succeeded}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.successText }}>✓ Successfully Imported</div>
                </div>
                <div style={{ background: results.failed>0 ? colors.errorBg : colors.n50, borderRadius:12, padding:"18px 20px", border:`1px solid ${results.failed>0?colors.error+"44":colors.n200}`, textAlign:"center" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:32, fontWeight:700, color: results.failed>0 ? colors.errorText : colors.n400 }}>{results.failed}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color: results.failed>0 ? colors.errorText : colors.n400 }}>✕ Failed</div>
                </div>
              </div>

              {/* Password table — share with Asatidha */}
              {results.results.filter((r: any) => r.status === "success").length > 0 && (
                <div style={{ border:`1px solid ${colors.green200}`, borderRadius:10, overflow:"hidden", marginBottom:16 }}>
                  <div style={{ padding:"10px 14px", background:colors.green50, fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:colors.primary, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>🔑 Auto-Generated Passwords — Share with each Ustadh</span>
                  </div>
                  <div style={{ maxHeight:200, overflow:"auto" }}>
                    {results.results.filter((r: any) => r.status === "success").map((r: any) => (
                      <div key={r.row} style={{ padding:"10px 14px", borderTop:`1px solid ${colors.n100}`, display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:12, alignItems:"center" }}>
                        <span style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n800 }}>{r.name}</span>
                        <span style={{ fontFamily:fonts.mono, fontSize:12, color:colors.primary, fontWeight:700 }}>{r.password}</span>
                        <span style={{ fontFamily:fonts.body, fontSize:10, color:colors.n400 }}>Row {r.row}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Failed rows */}
              {results.failed > 0 && (
                <div style={{ border:`1px solid ${colors.errorBg}`, borderRadius:10, overflow:"hidden", marginBottom:20 }}>
                  <div style={{ padding:"10px 14px", background:colors.errorBg, fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:colors.errorText }}>Failed Rows</div>
                  {results.results.filter((r: any) => r.status === "error").map((r: any) => (
                    <div key={r.row} style={{ padding:"10px 14px", borderTop:`1px solid ${colors.n100}`, display:"flex", gap:12, alignItems:"center" }}>
                      <span style={{ fontFamily:fonts.mono, fontSize:11, color:colors.n400, width:40 }}>Row {r.row}</span>
                      <span style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, flex:1 }}>{r.name}</span>
                      <span style={{ fontFamily:fonts.body, fontSize:11, color:colors.errorText }}>{r.error}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                {results.failed > 0 && (
                  <button onClick={() => { setStep("upload"); setRows([]); setResults(null); }} style={{ padding:"10px 20px", borderRadius:9, border:`1px solid ${colors.n200}`, background:colors.white, color:colors.n600, fontSize:13, cursor:"pointer", fontFamily:fonts.heading }}>Import More</button>
                )}
                <button onClick={onClose} style={{ padding:"10px 28px", borderRadius:9, background:colors.primary, color:colors.white, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:fonts.heading }}>Done ✓</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AsatidhaPage() {
  const [asatidha,      setAsatidha]      = useState<Ustadh[]>([]);
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [view,          setView]          = useState<"cards"|"table">("cards");
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [sendingCreds, setSendingCreds] = useState<string | null>(null);
  const [toast,        setToast]        = useState("");
  const fetchData = () => {
    setLoading(true);
    fetch("/api/admin/asatidha")
      .then(r => r.json())
      .then(d => { if (d.success) { setAsatidha(d.data.asatidha); setStats(d.data.stats); } })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = asatidha.filter(u =>
    !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method:"POST" });
    window.location.href = "/signin";
  };

    return (
      <div style={{ minHeight:"100vh", background:colors.n50 }}>
        {toast && (
          <div style={{ position:"fixed", top:70, left:"50%", transform:"translateX(-50%)", background:colors.n800, color:"white", padding:"10px 20px", borderRadius:10, fontFamily:fonts.heading, fontSize:13, zIndex:999, boxShadow:"0 4px 16px rgba(0,0,0,0.3)", whiteSpace:"nowrap" }}>
            {toast}
          </div>
        )}
          {/* Bulk Import Modal */}
      {/* Bulk Import Modal */}
      {showBulkModal && (
        <BulkImportModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => { fetchData(); }}
        />
      )}

      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <Link href="/dashboard/admin" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold}/>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:16, fontWeight:700, color:colors.white, lineHeight:1 }}>Asatidha</div>
            <div style={{ fontFamily:fonts.mono, fontSize:8, color:colors.gold, opacity:0.8, letterSpacing:1 }}>أساتذة الكرام</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{ padding:"8px 16px", borderRadius:8, background:"rgba(196,136,42,0.15)", border:"1px solid rgba(196,136,42,0.4)", color:colors.gold, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:fonts.heading }}>
            📥 Bulk Import
          </button>
          <Link href="/dashboard/admin/asatidha/new" style={{ padding:"8px 18px", borderRadius:8, background:colors.gold, color:colors.white, fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>
            + Add Ustadh
          </Link>
          <button onClick={handleSignOut} style={{ padding:"6px 12px", borderRadius:6, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", color:"rgba(255,255,255,0.6)", fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px 20px" }}>

        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>TEACHING STAFF</div>
          <h1 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>Asatidha Management</h1>
          <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500 }}>Add, manage and track all Asatidha across your institution</p>
        </div>

        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
            {[
              { val:stats.totalUstadh,          label:"Total Asatidha",        icon:"👨‍🏫", color:colors.primary,     bg:colors.green50,   border:colors.green200 },
              { val:stats.totalStudentsCovered,  label:"Students Covered",      icon:"👨‍🎓", color:colors.successText, bg:colors.successBg, border:`${colors.success}44` },
              { val:stats.unassigned,            label:"No Batch Assigned",     icon:"⚠️", color:stats.unassigned>0?colors.warningText:colors.successText, bg:stats.unassigned>0?colors.warningBg:colors.successBg, border:`${stats.unassigned>0?colors.warning:colors.success}44` },
            ].map((s,i)=>(
              <div key={i} style={{ background:s.bg, borderRadius:14, padding:"18px 16px", border:`1px solid ${s.border}`, textAlign:"center" }}>
                <div style={{ fontSize:26, marginBottom:6 }}>{s.icon}</div>
                <div style={{ fontFamily:fonts.heading, fontSize:28, fontWeight:700, color:s.color }}>{s.val}</div>
                <div style={{ fontFamily:fonts.body, fontSize:11, color:s.color, opacity:0.8, marginTop:3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {stats && stats.unassigned > 0 && (
          <div style={{ background:colors.warningBg, borderRadius:12, padding:"12px 16px", border:`1px solid ${colors.warning}44`, marginBottom:20, display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:20 }}>⚠️</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.warningText }}>{stats.unassigned} Ustadh not assigned to any Halqa</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.warningText, opacity:0.8 }}>Their students won't see them in the Ustadh dashboard</div>
            </div>
            <Link href="/dashboard/admin/batches" style={{ padding:"7px 14px", borderRadius:8, background:colors.warning, color:"white", fontSize:12, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>Assign Batches →</Link>
          </div>
        )}

        <div style={{ display:"flex", gap:10, marginBottom:20, alignItems:"center" }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ flex:1, padding:"10px 12px", border:`1px solid ${colors.n200}`, borderRadius:8, fontSize:12, fontFamily:fonts.body, outline:"none" }}/>
          <div style={{ display:"flex", gap:4, background:colors.white, borderRadius:8, padding:3, border:`1px solid ${colors.n200}` }}>
            {[{id:"cards",icon:"⊞"},{id:"table",icon:"☰"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id as any)} style={{ width:34,height:34,borderRadius:6,border:"none",cursor:"pointer",background:view===v.id?colors.primary:"transparent",color:view===v.id?"white":colors.n400,fontSize:16 }}>{v.icon}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding:48, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading Asatidha...</div>
        ) : filtered.length === 0 ? (
          <div style={{ background:colors.white, borderRadius:16, padding:56, textAlign:"center", border:`1px solid ${colors.n200}` }}>
            <div style={{ fontSize:56, marginBottom:16 }}>👨‍🏫</div>
            <div style={{ fontFamily:fonts.heading, fontSize:18, fontWeight:700, color:colors.n700, marginBottom:8 }}>No Asatidha yet</div>
            <div style={{ fontFamily:fonts.body, fontSize:13, color:colors.n400, marginBottom:24 }}>Add individually or bulk import from CSV</div>
            <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
              <button onClick={() => setShowBulkModal(true)} style={{ padding:"10px 22px", borderRadius:9, background:"rgba(196,136,42,0.1)", border:`1px solid ${colors.gold}`, color:colors.gold, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:fonts.heading }}>
                📥 Bulk Import CSV
              </button>
              <Link href="/dashboard/admin/asatidha/new" style={{ padding:"10px 22px", borderRadius:9, background:colors.gold, color:"white", textDecoration:"none", fontFamily:fonts.heading, fontSize:12, fontWeight:700 }}>+ Add First Ustadh →</Link>
            </div>
          </div>
        ) : view === "cards" ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16 }}>
            {filtered.map(u => (
              <div key={u.id} style={{ background:colors.white, borderRadius:16, overflow:"hidden", border:`1px solid ${colors.n200}`, boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ background:`linear-gradient(135deg,${colors.deep},${colors.primary}88)`, padding:"18px 18px 14px", position:"relative", overflow:"hidden" }}>
                  <svg style={{ position:"absolute",right:-10,top:-10,opacity:0.06 }} width="100" height="100" viewBox="0 0 80 80">
                    <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2"/>
                  </svg>
                  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                    <div style={{ width:52,height:52,borderRadius:14,background:"rgba(255,255,255,0.15)",border:"2px solid rgba(255,255,255,0.3)",overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      {u.photo
                        ? <img src={u.photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        : <span style={{ fontFamily:fonts.display,fontSize:22,fontWeight:700,color:"white" }}>{u.name.charAt(0)}</span>
                      }
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:"white",lineHeight:1.2 }}>{u.name}</div>
                      {u.nameArabic && <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:"rgba(255,255,255,0.5)",direction:"rtl",textAlign:"left" }}>{u.nameArabic}</div>}
                      <div style={{ fontFamily:fonts.mono,fontSize:9,color:"rgba(255,255,255,0.4)",marginTop:2 }}>{u.email}</div>
                    </div>
                    {!u.isActive && <span style={{ background:"rgba(239,68,68,0.3)",color:"#fca5a5",padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.mono,fontWeight:700 }}>INACTIVE</span>}
                  </div>
                </div>
                <div style={{ padding:"14px 18px" }}>
                  {u.qualifications?.length > 0 && (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:12 }}>
                      {u.qualifications.map((q,i)=>(<span key={i} style={{ background:colors.green50,color:colors.primary,padding:"2px 8px",borderRadius:5,fontSize:9,fontFamily:fonts.heading,fontWeight:700 }}>{q}</span>))}
                    </div>
                  )}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14 }}>
                    {[
                      { label:"Batches",   val:u.stats.totalBatches,    color:colors.n700 },
                      { label:"Students",  val:u.stats.totalStudents,   color:colors.n700 },
                      { label:"Lessons/mo",val:u.stats.lessonsThisMonth,color:colors.primary },
                    ].map((s,i)=>(
                      <div key={i} style={{ background:colors.n50,borderRadius:8,padding:"8px 6px",textAlign:"center" }}>
                        <div style={{ fontFamily:fonts.heading,fontSize:16,fontWeight:700,color:s.color }}>{s.val}</div>
                        <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                    <div>
                      <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400,marginBottom:2 }}>Avg Student Health</div>
                      <HealthBar score={u.stats.avgStudentHealth}/>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:fonts.body,fontSize:9,color:colors.n400,marginBottom:2 }}>Avg Grade Score</div>
                      {u.stats.avgGrade !== null
                        ? <span style={{ fontFamily:fonts.mono,fontSize:11,fontWeight:700,color:u.stats.avgGrade>=75?colors.successText:colors.warningText }}>{u.stats.avgGrade}%</span>
                        : <span style={{ fontFamily:fonts.mono,fontSize:11,color:colors.n300 }}>No data</span>
                      }
                    </div>
                  </div>
                  {u.batches.length > 0 ? (
                    <div style={{ display:"flex",flexWrap:"wrap",gap:4,marginBottom:14 }}>
                    <button
                      onClick={async () => {
                        setSendingCreds(u.id);
                        cost res  = await fetch(`/api/admin/asatidha/${u.id}/send-credentials`, { method:"POST" });
                        const data = await res.json();
                        if (data.success) {
                          if (data.data.sent) { setToast(`✅ Login sent to ${u.name} via WhatsApp`); }
                          else { setToast(`⚠️ Password reset. Share manually: ${data.data.password}`); }
                        } else { setToast(`❌ ${data.error}`); }
                        setSendingCreds(null);
                        setTimeout(() => setToast(""), 5000);
                      }}
                      disabled={sendingCreds === u.id}
                      style={{ padding:"7px 12px", borderRadius:8, background:"#f0fdf4", color:colors.primary, border:`1px solid ${colors.green200}`, fontSize:11, fontWeight:700, cursor:sendingCreds===u.id?"not-allowed":"pointer", fontFamily:fonts.heading, opacity:sendingCreds===u.id?0.6:1, whiteSpace:"nowrap" }}>
                      {sendingCreds === u.id ? "Sending..." : "📨 Send Login"}
                    </button> 
                      {u.batches.map(b=>(<span key={b.id} style={{ background:`${PROGRAM_COLORS[b.program]||colors.primary}15`,color:PROGRAM_COLORS[b.program]||colors.primary,padding:"3px 8px",borderRadius:6,fontSize:9,fontFamily:fonts.heading,fontWeight:700 }}>{b.name} · {b._count.students}s</span>))}
                    </div>
                  ) : (
                    <div style={{ marginBottom:14,padding:"6px 10px",background:colors.warningBg,borderRadius:6,fontFamily:fonts.body,fontSize:11,color:colors.warningText }}>⚠️ No batch assigned yet</div>
                  )}
                  <div style={{ display:"flex",gap:6 }}>
                    {u.whatsapp && (
                      <a href={`https://wa.me/${u.whatsapp.replace(/[^0-9]/g,"")}`} target="_blank" rel="noopener noreferrer"
                        style={{ padding:"7px 12px",borderRadius:8,background:"#dcfce7",color:"#166534",fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>💬 WhatsApp</a>
                    )}
                    {u.phone && (<a href={`tel:${u.phone}`} style={{ padding:"7px 10px",borderRadius:8,background:colors.n50,color:colors.n700,border:`1px solid ${colors.n200}`,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>📞</a>)}
                    <Link href={`/dashboard/admin/asatidha/${u.id}`} style={{ flex:1,padding:"7px",borderRadius:8,background:colors.green50,color:colors.primary,border:`1px solid ${colors.green200}`,fontSize:11,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center" }}>View Profile →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ background:colors.white,borderRadius:14,border:`1px solid ${colors.n200}`,overflow:"hidden" }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 140px 80px 80px 80px 100px 90px",gap:0,padding:"10px 16px",background:colors.n50,borderBottom:`1px solid ${colors.n200}` }}>
              {["Ustadh","Batches","Students","Lessons/mo","Health","Grade","Actions"].map((h,i)=>(
                <div key={i} style={{ fontFamily:fonts.heading,fontSize:10,fontWeight:700,color:colors.n500,textAlign:i>0?"center":"left" }}>{h}</div>
              ))}
            </div>
            {filtered.map((u,idx)=>(
              <div key={u.id} style={{ display:"grid",gridTemplateColumns:"1fr 140px 80px 80px 80px 100px 90px",gap:0,padding:"12px 16px",borderBottom:idx<filtered.length-1?`1px solid ${colors.n100}`:"none",alignItems:"center" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <div style={{ width:36,height:36,borderRadius:10,background:colors.green50,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,overflow:"hidden" }}>
                    {u.photo ? <img src={u.photo} alt="" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span style={{ fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.primary }}>{u.name.charAt(0)}</span>}
                  </div>
                  <div>
                    <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800 }}>{u.name}</div>
                    <div style={{ fontFamily:fonts.mono,fontSize:9,color:colors.n400 }}>{u.email}</div>
                  </div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <div style={{ display:"flex",flexWrap:"wrap",gap:3,justifyContent:"center" }}>
                    {u.batches.slice(0,2).map(b=>(<span key={b.id} style={{ background:`${PROGRAM_COLORS[b.program]||colors.primary}15`,color:PROGRAM_COLORS[b.program]||colors.primary,padding:"1px 6px",borderRadius:4,fontSize:8,fontFamily:fonts.mono,fontWeight:700 }}>{b.name}</span>))}
                    {u.batches.length > 2 && <span style={{ fontSize:9,color:colors.n400 }}>+{u.batches.length-2}</span>}
                    {u.batches.length === 0 && <span style={{ fontSize:9,color:colors.warningText }}>None</span>}
                  </div>
                </div>
                <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:13,fontWeight:700,color:colors.primary }}>{u.stats.totalStudents}</div>
                <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:12,color:colors.n600 }}>{u.stats.lessonsThisMonth}</div>
                <div style={{ textAlign:"center" }}><HealthBar score={u.stats.avgStudentHealth}/></div>
                <div style={{ textAlign:"center",fontFamily:fonts.mono,fontSize:11,fontWeight:700,color:u.stats.avgGrade&&u.stats.avgGrade>=75?colors.successText:colors.warningText }}>
                  {u.stats.avgGrade !== null ? `${u.stats.avgGrade}%` : "—"}
                </div>
                <div style={{ display:"flex",gap:4,justifyContent:"center" }}>
                  <Link href={`/dashboard/admin/asatidha/${u.id}`} style={{ padding:"5px 10px",borderRadius:6,background:colors.green50,color:colors.primary,fontSize:10,fontWeight:700,textDecoration:"none",fontFamily:fonts.heading }}>View</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
