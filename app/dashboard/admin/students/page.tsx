"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface Student {
  id: string; name: string; enrollmentNumber: string; program: string;
  status: string; enrolledAt: string; photo: string | null;
  batch: { name: string } | null;
  guardian: { name: string; phone: string } | null;
  progress: { currentJuz: number; percentComplete: number } | null;
  manzilHealth: number | null; lastLesson: { date: string; grade: string } | null;
  totalLessons: number;
}
interface Stats { total: number; active: number; completed: number; onLeave: number; atRisk: number; }

const PROGRAM_COLORS: Record<string,{bg:string;color:string;label:string}> = {
  HIFZ:    { bg: colors.green50,  color: colors.primary,     label: "Hifz" },
  NAZRA:   { bg: "#f5f3ff",       color: "#7c3aed",          label: "Nazrah" },
  TAJWEED: { bg: "#fffbeb",       color: "#b45309",          label: "Tajweed" },
  GIRDAAN: { bg: "#f0fdfa",       color: "#0f766e",          label: "Girdaan" },
};
const STATUS_COLORS: Record<string,{bg:string;color:string}> = {
  ACTIVE:    { bg: colors.successBg, color: colors.successText },
  ON_LEAVE:  { bg: colors.warningBg, color: colors.warningText },
  COMPLETED: { bg: "#f0f9ff",        color: "#0369a1" },
  SUSPENDED: { bg: colors.errorBg,   color: colors.errorText },
  WITHDRAWN: { bg: colors.n100,      color: colors.n500 },
};

function HealthDot({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: colors.n300, fontSize: 11 }}>—</span>;
  const color = score >= 75 ? colors.success : score >= 55 ? colors.warning : colors.error;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
      <span style={{ fontFamily: fonts.mono, fontSize: 11, color, fontWeight: 700 }}>{Math.round(score)}%</span>
    </div>
  );
}

// ── CSV template content ──
const STUDENT_CSV_TEMPLATE = `name,program,dateOfBirth,guardianName,guardianPhone,guardianRelation
Muhammad Ali,HIFZ,2010-05-15,Hassan Ali,03001234567,Father
Fatima Siddiq,NAZRA,2012-03-22,Abdul Siddiq,03111234567,Father
Ahmed Raza,TAJWEED,,Raza Khan,03211234567,Father`;

// ── Simple CSV parser ──
function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(",").map(v => v.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ""; });
    return row;
  });
}

// ── Bulk Import Modal ──
function BulkImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [step,     setStep]    = useState<"upload"|"preview"|"results">("upload");
  const [rows,     setRows]    = useState<Record<string,string>[]>([]);
  const [loading,  setLoading] = useState(false);
  const [results,  setResults] = useState<any>(null);
  const [error,    setError]   = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) { setError("Could not parse CSV. Make sure it matches the template format."); return; }
      if (parsed.length > 200) { setError("Maximum 200 rows allowed per import."); return; }
      setRows(parsed);
      setStep("preview");
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ students: rows }),
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
    const blob = new Blob([STUDENT_CSV_TEMPLATE], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "students_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:200, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:colors.white, borderRadius:20, width:"100%", maxWidth:760, maxHeight:"90vh", overflow:"auto", boxShadow:"0 24px 80px rgba(0,0,0,0.3)" }}>

        {/* Header */}
        <div style={{ padding:"22px 28px", borderBottom:`1px solid ${colors.n100}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:fonts.display, fontSize:18, fontWeight:700, color:colors.n800 }}>📥 Bulk Import Students</div>
            <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n400, marginTop:2 }}>Upload a CSV file to enrol multiple students at once</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:`1px solid ${colors.n200}`, background:colors.n50, cursor:"pointer", fontSize:16, color:colors.n500 }}>✕</button>
        </div>

        {/* Step indicator */}
        <div style={{ display:"flex", padding:"16px 28px", gap:0, borderBottom:`1px solid ${colors.n100}` }}>
          {[["upload","1. Upload"],["preview","2. Preview"],["results","3. Results"]].map(([s,label],i) => (
            <div key={s} style={{ display:"flex", alignItems:"center", gap:0 }}>
              <div style={{ padding:"4px 14px", borderRadius:20, background:step===s?colors.primary:colors.n100, color:step===s?colors.white:colors.n400, fontSize:11, fontWeight:700, fontFamily:fonts.heading }}>
                {label}
              </div>
              {i<2 && <div style={{ width:20, height:1, background:colors.n200 }}/>}
            </div>
          ))}
        </div>

        <div style={{ padding:"24px 28px" }}>

          {/* ── STEP 1: Upload ── */}
          {step === "upload" && (
            <div>
              {/* Download template */}
              <div style={{ background:colors.green50, borderRadius:12, padding:"16px 20px", border:`1px solid ${colors.green200}`, marginBottom:20, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div>
                  <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.primary, marginBottom:2 }}>📋 Download CSV Template</div>
                  <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500 }}>Columns: name, program, dateOfBirth, guardianName, guardianPhone, guardianRelation</div>
                </div>
                <button onClick={downloadTemplate} style={{ padding:"8px 18px", borderRadius:8, background:colors.primary, color:colors.white, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:fonts.heading, whiteSpace:"nowrap" }}>
                  ↓ Template
                </button>
              </div>

              {/* Program values note */}
              <div style={{ background:"#fffbeb", borderRadius:10, padding:"12px 16px", border:"1px solid #fde68a", marginBottom:20 }}>
                <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:"#b45309", marginBottom:4 }}>Valid program values</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {["HIFZ","NAZRA","TAJWEED","GIRDAAN"].map(p => (
                    <span key={p} style={{ fontFamily:fonts.mono, fontSize:11, background:"#fef3c7", color:"#92400e", padding:"2px 8px", borderRadius:5 }}>{p}</span>
                  ))}
                </div>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if(f) handleFile(f); }}
                style={{ border:`2px dashed ${colors.n200}`, borderRadius:14, padding:"40px 20px", textAlign:"center", cursor:"pointer", transition:"border-color 0.2s" }}>
                <div style={{ fontSize:36, marginBottom:10 }}>📂</div>
                <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:colors.n700, marginBottom:4 }}>Drop CSV here or click to browse</div>
                <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n400 }}>Supports .csv files · max 200 rows</div>
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
                  {rows.length} student{rows.length !== 1 ? "s" : ""} ready to import
                </div>
                <button onClick={() => setStep("upload")} style={{ padding:"6px 14px", borderRadius:7, border:`1px solid ${colors.n200}`, background:colors.white, color:colors.n600, fontSize:11, cursor:"pointer", fontFamily:fonts.heading }}>
                  ← Change File
                </button>
              </div>

              <div style={{ border:`1px solid ${colors.n200}`, borderRadius:10, overflow:"auto", maxHeight:340, marginBottom:20 }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12, fontFamily:fonts.body }}>
                  <thead>
                    <tr style={{ background:colors.n50 }}>
                      {["#","Name","Program","Date of Birth","Guardian","Phone","Relation"].map(h => (
                        <th key={h} style={{ padding:"10px 12px", textAlign:"left", fontFamily:fonts.heading, fontSize:10, fontWeight:700, color:colors.n500, borderBottom:`1px solid ${colors.n200}`, whiteSpace:"nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const validProg = ["HIFZ","NAZRA","TAJWEED","GIRDAAN"].includes((row.program||"").toUpperCase());
                      const hasName   = !!row.name?.trim();
                      const hasGuard  = !!row.guardianName?.trim() && !!row.guardianPhone?.trim();
                      const rowOk     = validProg && hasName && hasGuard;
                      return (
                        <tr key={i} style={{ background: rowOk ? "transparent" : "#fff5f5", borderBottom:`1px solid ${colors.n100}` }}>
                          <td style={{ padding:"8px 12px", color:colors.n400, fontFamily:fonts.mono, fontSize:11 }}>{i+1}</td>
                          <td style={{ padding:"8px 12px", fontWeight:600, color: hasName ? colors.n800 : colors.errorText }}>{row.name || "⚠ Missing"}</td>
                          <td style={{ padding:"8px 12px" }}>
                            <span style={{ background: validProg ? colors.green50 : colors.errorBg, color: validProg ? colors.primary : colors.errorText, padding:"2px 7px", borderRadius:5, fontSize:10, fontWeight:700 }}>
                              {(row.program||"").toUpperCase() || "⚠ Missing"}
                            </span>
                          </td>
                          <td style={{ padding:"8px 12px", color:colors.n500 }}>{row.dateOfBirth || "—"}</td>
                          <td style={{ padding:"8px 12px", color: row.guardianName ? colors.n700 : colors.errorText }}>{row.guardianName || "⚠ Missing"}</td>
                          <td style={{ padding:"8px 12px", color: row.guardianPhone ? colors.n700 : colors.errorText, fontFamily:fonts.mono }}>{row.guardianPhone || "⚠ Missing"}</td>
                          <td style={{ padding:"8px 12px", color:colors.n500 }}>{row.guardianRelation || "Father"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {error && <div style={{ marginBottom:14, padding:"10px 14px", borderRadius:8, background:colors.errorBg, color:colors.errorText, fontFamily:fonts.body, fontSize:12 }}>⚠ {error}</div>}

              <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
                <button onClick={() => setStep("upload")} style={{ padding:"10px 20px", borderRadius:9, border:`1px solid ${colors.n200}`, background:colors.white, color:colors.n600, fontSize:13, cursor:"pointer", fontFamily:fonts.heading }}>
                  Back
                </button>
                <button onClick={handleImport} disabled={loading} style={{ padding:"10px 28px", borderRadius:9, background: loading ? colors.n300 : colors.primary, color:colors.white, fontSize:13, fontWeight:700, border:"none", cursor: loading ? "not-allowed" : "pointer", fontFamily:fonts.heading }}>
                  {loading ? "Importing..." : `Import ${rows.length} Students →`}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Results ── */}
          {step === "results" && results && (
            <div>
              {/* Summary */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }}>
                <div style={{ background:colors.successBg, borderRadius:12, padding:"18px 20px", border:`1px solid ${colors.success}44`, textAlign:"center" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:32, fontWeight:700, color:colors.successText }}>{results.succeeded}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.successText }}>✓ Successfully Imported</div>
                </div>
                <div style={{ background: results.failed > 0 ? colors.errorBg : colors.n50, borderRadius:12, padding:"18px 20px", border:`1px solid ${results.failed > 0 ? colors.error+"44" : colors.n200}`, textAlign:"center" }}>
                  <div style={{ fontFamily:fonts.heading, fontSize:32, fontWeight:700, color: results.failed > 0 ? colors.errorText : colors.n400 }}>{results.failed}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:12, color: results.failed > 0 ? colors.errorText : colors.n400 }}>✕ Failed</div>
                </div>
              </div>

              {/* Error rows */}
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
                  <button onClick={() => { setStep("upload"); setRows([]); setResults(null); }}
                    style={{ padding:"10px 20px", borderRadius:9, border:`1px solid ${colors.n200}`, background:colors.white, color:colors.n600, fontSize:13, cursor:"pointer", fontFamily:fonts.heading }}>
                    Import More
                  </button>
                )}
                <button onClick={onClose} style={{ padding:"10px 28px", borderRadius:9, background:colors.primary, color:colors.white, fontSize:13, fontWeight:700, border:"none", cursor:"pointer", fontFamily:fonts.heading }}>
                  Done ✓
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students,      setStudents]      = useState<Student[]>([]);
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [program,       setProgram]       = useState("");
  const [status,        setStatus]        = useState("");
  const [health,        setHealth]        = useState("");
  const [page,          setPage]          = useState(1);
  const [pages,         setPages]         = useState(1);
  const [total,         setTotal]         = useState(0);
  const [selected,      setSelected]      = useState<Set<string>>(new Set());
  const [showBulkModal, setShowBulkModal] = useState(false);

  const fetchStudents = () => {
    setLoading(true);
    const params = new URLSearchParams({ search, program, status, health, page: String(page), limit: "15" });
    fetch(`/api/admin/students?${params}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setStudents(d.data.students);
          setStats(d.data.stats);
          setPages(d.data.pagination.pages);
          setTotal(d.data.pagination.total);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, [search, program, status, health, page]);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Bulk Import Modal */}
      {showBulkModal && (
        <BulkImportModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => { fetchStudents(); }}
        />
      )}

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <HifzMark size={32} primary="#10B981" gold={colors.gold} />
            <div>
              <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: colors.white, lineHeight: 1 }}>HifzPro</div>
              <div style={{ fontSize: 8, color: colors.gold, fontFamily: fonts.mono, opacity: 0.8, letterSpacing: 1 }}>ADMIN</div>
            </div>
          </Link>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 18 }}>›</span>
          <span style={{ fontFamily: fonts.heading, fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Student Management</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setShowBulkModal(true)}
            style={{ padding: "8px 16px", borderRadius: 8, background: "rgba(196,136,42,0.15)", border: "1px solid rgba(196,136,42,0.4)", color: colors.gold, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
            📥 Bulk Import
          </button>
          <Link href="/dashboard/admin/students/new" style={{ padding: "8px 18px", borderRadius: 8, background: colors.gold, color: colors.white, fontSize: 12, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
            + Enrol Student
          </Link>
          <button onClick={handleSignOut} style={{ padding: "6px 14px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 6 }}>STUDENT MANAGEMENT</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, margin: 0 }}>All Students</h1>
          <p style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n500, marginTop: 4 }}>{total} students enrolled · manage enrolment, track progress, view profiles</p>
        </div>

        {/* Stats cards */}
        {stats && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }}>
            {[
              { val: stats.total,     label: "Total Enrolled", color: colors.primary,     bg: colors.green50,   border: colors.green200 },
              { val: stats.active,    label: "Active",         color: colors.successText, bg: colors.successBg, border: `${colors.success}44` },
              { val: stats.completed, label: "Completed",      color: "#0369a1",           bg: "#f0f9ff",         border: "#bae6fd" },
              { val: stats.onLeave,   label: "On Leave",       color: colors.warningText, bg: colors.warningBg,  border: `${colors.warning}44` },
              { val: stats.atRisk,    label: "At Risk",        color: colors.errorText,   bg: colors.errorBg,    border: `${colors.error}44` },
            ].map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "16px 14px", border: `1px solid ${s.border}`, textAlign: "center" }}>
                <div style={{ fontFamily: fonts.heading, fontSize: 28, fontWeight: 700, color: s.color }}>{s.val}</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: s.color, opacity: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Search + filters */}
        <div style={{ background: colors.white, borderRadius: 14, padding: 16, border: `1px solid ${colors.n200}`, marginBottom: 16, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 2, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: colors.n400 }}>🔍</span>
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or enrollment number..."
              style={{ width: "100%", padding: "10px 10px 10px 36px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n800, outline: "none" }}
            />
          </div>

          {[
            { val: program, set: setProgram, label: "All Programs", opts: [
              {v:"HIFZ",l:"Hifz ul Quran"},{v:"NAZRA",l:"Nazrah"},{v:"TAJWEED",l:"Tajweed/Qaida"},{v:"GIRDAAN",l:"Girdaan"},
            ]},
            { val: status,  set: setStatus,  label: "All Status",   opts: [
              {v:"ACTIVE",l:"Active"},{v:"ON_LEAVE",l:"On Leave"},{v:"COMPLETED",l:"Completed"},{v:"SUSPENDED",l:"Suspended"},{v:"WITHDRAWN",l:"Withdrawn"},
            ]},
            { val: health,  set: setHealth,  label: "All Health",   opts: [
              {v:"at_risk",l:"At Risk (<60%)"},{v:"good",l:"Good (≥75%)"},
            ]},
          ].map((f, i) => (
            <select key={i} value={f.val} onChange={e => { f.set(e.target.value); setPage(1); }}
              style={{ padding: "10px 12px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 12, fontFamily: fonts.heading, color: colors.n700, background: colors.white, outline: "none", minWidth: 140 }}>
              <option value="">{f.label}</option>
              {f.opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          ))}

          {(search || program || status || health) && (
            <button onClick={() => { setSearch(""); setProgram(""); setStatus(""); setHealth(""); setPage(1); }}
              style={{ padding: "10px 14px", borderRadius: 8, background: colors.n100, border: `1px solid ${colors.n200}`, color: colors.n600, fontSize: 12, cursor: "pointer", fontFamily: fonts.heading }}>
              Clear
            </button>
          )}

          {selected.size > 0 && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500, alignSelf: "center" }}>{selected.size} selected</span>
              <button style={{ padding: "8px 14px", borderRadius: 8, background: colors.warningBg, border: `1px solid ${colors.warning}44`, color: colors.warningText, fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>
                Transfer Batch
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div style={{ background: colors.white, borderRadius: 14, border: `1px solid ${colors.n200}`, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "40px 180px 100px 100px 100px 90px 80px 80px 80px 100px", gap: 0, padding: "12px 16px", background: colors.n50, borderBottom: `1px solid ${colors.n200}` }}>
            {["", "Student", "Program", "Batch", "Progress", "Manzil", "Lessons", "Last Entry", "Status", "Actions"].map((h, i) => (
              <div key={i} style={{ fontFamily: fonts.heading, fontSize: 10, fontWeight: 700, color: colors.n500, letterSpacing: 0.5, textAlign: i > 3 ? "center" : "left" }}>{h}</div>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "48px 0", color: colors.n400, fontFamily: fonts.body }}>Loading students...</div>
          ) : students.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>👨‍🎓</div>
              <div style={{ fontFamily: fonts.heading, fontSize: 16, fontWeight: 700, color: colors.n700, marginBottom: 6 }}>No students found</div>
              <div style={{ fontFamily: fonts.body, fontSize: 13, color: colors.n400, marginBottom: 16 }}>Try adjusting your search or filters</div>
              <button onClick={() => setShowBulkModal(true)} style={{ padding:"10px 22px", borderRadius:9, background:colors.primary, color:colors.white, fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:fonts.heading }}>
                📥 Import from CSV
              </button>
            </div>
          ) : (
            students.map((s, idx) => {
              const prog = PROGRAM_COLORS[s.program] || PROGRAM_COLORS.HIFZ;
              const stat = STATUS_COLORS[s.status]   || STATUS_COLORS.ACTIVE;
              const isSelected = selected.has(s.id);
              const lastDays = s.lastLesson
                ? Math.floor((Date.now() - new Date(s.lastLesson.date).getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={s.id} style={{
                  display: "grid", gridTemplateColumns: "40px 180px 100px 100px 100px 90px 80px 80px 80px 100px",
                  padding: "12px 16px", borderBottom: idx < students.length-1 ? `1px solid ${colors.n100}` : "none",
                  background: isSelected ? `${colors.primary}08` : "transparent",
                  alignItems: "center",
                }}>
                  <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(s.id)}
                    style={{ width: 16, height: 16, cursor: "pointer", accentColor: colors.primary }} />

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: colors.green50, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.primary }}>{s.name.charAt(0)}</span>
                      </div>
                      <div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800, lineHeight: 1.2 }}>{s.name}</div>
                        <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 1 }}>{s.enrollmentNumber}</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <span style={{ background: prog.bg, color: prog.color, padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, fontFamily: fonts.heading }}>{prog.label}</span>
                  </div>

                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, textAlign: "center" }}>{s.batch?.name || "—"}</div>

                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: fonts.mono, fontSize: 11, fontWeight: 700, color: colors.primary, marginBottom: 3 }}>Juz {s.progress?.currentJuz || "—"}</div>
                    <div style={{ height: 4, background: colors.n100, borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${s.progress?.percentComplete || 0}%`, background: `linear-gradient(90deg,${colors.primary},${colors.success})`, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 2 }}>{Math.round(s.progress?.percentComplete || 0)}%</div>
                  </div>

                  <div style={{ textAlign: "center" }}><HealthDot score={s.manzilHealth} /></div>
                  <div style={{ textAlign: "center", fontFamily: fonts.mono, fontSize: 12, color: colors.n600 }}>{s.totalLessons}</div>

                  <div style={{ textAlign: "center" }}>
                    {lastDays === null ? <span style={{ color: colors.n300, fontSize: 11 }}>—</span> :
                     lastDays === 0 ? <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.successText }}>Today</span> :
                     lastDays === 1 ? <span style={{ fontFamily: fonts.mono, fontSize: 10, color: colors.warningText }}>Yesterday</span> :
                     <span style={{ fontFamily: fonts.mono, fontSize: 10, color: lastDays > 7 ? colors.errorText : colors.n500 }}>{lastDays}d ago</span>}
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <span style={{ background: stat.bg, color: stat.color, padding: "3px 8px", borderRadius: 6, fontSize: 9, fontWeight: 700, fontFamily: fonts.mono }}>{s.status.replace("_"," ")}</span>
                  </div>

                  <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                    <Link href={`/dashboard/admin/students/${s.id}`} style={{ padding: "5px 10px", borderRadius: 6, background: colors.green50, color: colors.primary, fontSize: 10, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>View</Link>
                    <Link href={`/dashboard/admin/students/${s.id}/edit`} style={{ padding: "5px 10px", borderRadius: 6, background: colors.n100, color: colors.n600, fontSize: 10, fontWeight: 600, textDecoration: "none", fontFamily: fonts.heading }}>Edit</Link>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 20 }}>
            <button onClick={() => setPage(Math.max(1, page-1))} disabled={page===1}
              style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${colors.n200}`, background: colors.white, color: page===1?colors.n300:colors.n700, cursor: page===1?"not-allowed":"pointer", fontFamily: fonts.heading, fontSize: 12 }}>
              ← Prev
            </button>
            {Array.from({length: Math.min(5, pages)}, (_,i) => {
              const p = Math.max(1, Math.min(page-2, pages-4)) + i;
              return (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${p===page?colors.primary:colors.n200}`, background: p===page?colors.primary:colors.white, color: p===page?colors.white:colors.n700, cursor: "pointer", fontFamily: fonts.heading, fontSize: 12, fontWeight: p===page?700:400 }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(Math.min(pages, page+1))} disabled={page===pages}
              style={{ padding: "8px 14px", borderRadius: 8, border: `1px solid ${colors.n200}`, background: colors.white, color: page===pages?colors.n300:colors.n700, cursor: page===pages?"not-allowed":"pointer", fontFamily: fonts.heading, fontSize: 12 }}>
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
