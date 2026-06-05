"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PROGRAMS = [
  { id:"HIFZ",    label:"Hifz ul Quran",  arabic:"حفظ القرآن الكريم", icon:"🏆", color:"#166534",       desc:"Full Quran memorization — 30 Juz" },
  { id:"NAZRA",   label:"Nazrah",          arabic:"ناظرہ",             icon:"📖", color:"#7c3aed",       desc:"Recitation with Tajweed" },
  { id:"TAJWEED", label:"Tajweed",         arabic:"تجوید",             icon:"✏️", color:"#b45309",       desc:"Tajweed rules mastery" },
  { id:"GIRDAAN", label:"Girdaan",         arabic:"گردان",             icon:"🔄", color:"#0f766e",       desc:"Intensive Hifz revision" },
];

const TEMPLATES = [
  { id:"CLASSIC",     label:"Classic Islamic",      desc:"Ornate gold borders, Arabic calligraphy style",       preview:"🌟" },
  { id:"MODERN",      label:"Modern Professional",  desc:"Clean, minimal bilingual — globally recognized",      preview:"💼" },
  { id:"TRADITIONAL", label:"Traditional Green",    desc:"Deep emerald, white Arabic — classic Pakistani look", preview:"🌿" },
];

const LANGUAGES = [
  { id:"BILINGUAL", label:"Bilingual",    sub:"Arabic + English" },
  { id:"ARABIC",    label:"Arabic Only",  sub:"عربي فقط" },
  { id:"URDU",      label:"Urdu + Arabic",sub:"اردو + عربي" },
  { id:"ENGLISH",   label:"English Only", sub:"International" },
];

const BORDERS = [
  { id:"ORNATE",  label:"Ornate",  icon:"🔶" },
  { id:"SIMPLE",  label:"Simple",  icon:"▭" },
  { id:"MODERN",  label:"Modern",  icon:"◻" },
  { id:"NONE",    label:"No Border",icon:"⬜" },
];

const COLOR_THEMES = [
  { id:"#0D5C3A", label:"Emerald",  preview:"#0D5C3A" },
  { id:"#1e3a5f", label:"Royal Blue",preview:"#1e3a5f" },
  { id:"#2d1b69", label:"Royal Purple",preview:"#2d1b69" },
  { id:"#7c2d12", label:"Deep Brown",preview:"#7c2d12" },
  { id:"#1a1a1a", label:"Black",    preview:"#1a1a1a" },
  { id:"C4882A",  label:"Gold",     preview:"#C4882A" },
];

const DEFAULT_SILSILA = (ustadh: string) =>
  `الطالب ← ${ustadh} ← [شيخ الأستاذ] ← [شيخ شيخ الأستاذ] ← ... ← سيدنا محمد ﷺ ← جبريل عليه السلام ← الله سبحانه وتعالى`;

interface Student {
  id: string; name: string; nameArabic: string | null; enrollmentNumber: string; program: string;
  progress: { currentJuz: number; percentComplete: number } | null;
  batch: { name: string; ustadh: { user: { name: string } } | null } | null;
  campus: { name: string; institution: { name: string; city: string | null } } | null;
}

const inp = { width: "100%", padding: "10px 12px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n800, background: colors.white, outline: "none" };

export default function NewSanadPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [result,   setResult]   = useState<any>(null);
  const [error,    setError]    = useState("");
  const [step,     setStep]     = useState(1);

  const [form, setForm] = useState({
    studentId:      "",
    program:        "HIFZ",
    issuedAt:       new Date().toISOString().split("T")[0],
    hijriDate:      "",
    template:       "CLASSIC",
    language:       "BILINGUAL",
    colorTheme:     "#0D5C3A",
    borderStyle:    "ORNATE",
    orientation:    "PORTRAIT",
    includeSilsila: true,
    includeQR:      true,
    silsila:        "",
    examinerName:   "",
    principalName:  "",
    customText:     "",
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const selectedStudent = students.find(s => s.id === form.studentId);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/students?limit=200&status=ACTIVE")
      .then(r => r.json())
      .then(d => { if (d.success) setStudents(d.data.students); })
      .finally(() => setLoading(false));
  }, []);

  // Auto-fill when student selected
  useEffect(() => {
    if (selectedStudent) {
      const ustadh = selectedStudent.batch?.ustadh?.user?.name || "الأستاذ";
      set("silsila",      DEFAULT_SILSILA(ustadh));
      set("examinerName", ustadh);
      set("program",      selectedStudent.program || "HIFZ");
    }
  }, [form.studentId]);

  const handleSubmit = async () => {
    if (!form.studentId) { setError("Please select a student"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/sanads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setResult(data.data.sanad);
      else setError(data.error || "Failed to issue Sanad");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if (result) return (
    <div style={{ minHeight: "100vh", background: colors.deep, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 500, width: "100%", background: colors.white, borderRadius: 20, padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
        <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 8 }}>SANAD ISSUED</div>
        <h2 style={{ fontFamily: fonts.display, fontSize: "1.8rem", fontWeight: 700, color: colors.n800, margin: "0 0 4px" }}>{result.student?.name}</h2>
        <div style={{ fontFamily: fonts.mono, fontSize: 16, color: colors.primary, marginBottom: 6 }}>{result.sanadNumber}</div>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: colors.gold, marginBottom: 24, direction: "rtl" }}>
          بارك الله فيه وجعله حافظاً للقرآن الكريم
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <a href={`/certificates/${result.sanadNumber}`} target="_blank" rel="noopener noreferrer"
            style={{ padding: "13px", borderRadius: 10, background: colors.primary, color: "white", fontSize: 13, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
            🏆 View & Download Certificate →
          </a>
          <Link href="/dashboard/admin/sanads" style={{ padding: "12px", borderRadius: 10, background: colors.n100, border: `1px solid ${colors.n200}`, color: colors.n700, fontSize: 13, textDecoration: "none", fontFamily: fonts.heading }}>
            All Sanads
          </Link>
        </div>
      </div>
    </div>
  );

  const STEPS = [
    { num: 1, label: "Student & Program" },
    { num: 2, label: "Certificate Design" },
    { num: 3, label: "Content & Silsila" },
    { num: 4, label: "Review & Issue" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50 }}>
        <Link href="/dashboard/admin/sanads" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: colors.white, fontSize: 16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold} />
        <div style={{ fontFamily: fonts.heading, fontSize: 15, fontWeight: 700, color: colors.white }}>Issue New Sanad</div>
      </nav>

      {/* Step progress */}
      <div style={{ background: colors.white, borderBottom: `1px solid ${colors.n200}`, padding: "12px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", alignItems: "center" }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <div onClick={() => step > s.num && setStep(s.num)} style={{ width: 30, height: 30, borderRadius: 8, background: step > s.num ? colors.success : step === s.num ? colors.primary : colors.n100, display: "flex", alignItems: "center", justifyContent: "center", cursor: step > s.num ? "pointer" : "default" }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: step >= s.num ? "white" : colors.n400 }}>{step > s.num ? "✓" : s.num}</span>
                </div>
                <span style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: step >= s.num ? colors.n800 : colors.n400 }}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: step > s.num ? colors.success : colors.n200, margin: "0 8px" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 20px" }}>
        <div style={{ background: colors.white, borderRadius: 16, padding: 28, border: `1px solid ${colors.n200}` }}>

          {/* STEP 1: Student & Program */}
          {step === 1 && (
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>STEP 1 OF 4</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.6rem", fontWeight: 700, color: colors.n800, margin: "0 0 20px" }}>Select Student & Program</h2>

              {/* Student selector */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Student *</label>
                <select value={form.studentId} onChange={e => set("studentId", e.target.value)} style={inp}>
                  <option value="">Select student...</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.enrollmentNumber} ({s.program}){s.progress ? ` — Juz ${s.progress.currentJuz}` : ""}
                    </option>
                  ))}
                </select>
                {selectedStudent && (
                  <div style={{ marginTop: 10, padding: "14px 16px", background: colors.green50, borderRadius: 10, border: `1px solid ${colors.green200}`, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    {[
                      { label: "Name (Arabic)", val: selectedStudent.nameArabic || "—" },
                      { label: "Enrollment #",  val: selectedStudent.enrollmentNumber },
                      { label: "Batch",         val: selectedStudent.batch?.name || "—" },
                      { label: "Ustadh",        val: selectedStudent.batch?.ustadh?.user?.name || "—" },
                      { label: "Current Juz",   val: selectedStudent.progress ? `Juz ${selectedStudent.progress.currentJuz}` : "—" },
                      { label: "Completion",    val: selectedStudent.progress ? `${Math.round(selectedStudent.progress.percentComplete)}%` : "—" },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.n500, letterSpacing: 1 }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: colors.n800 }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Program */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 8 }}>Program / Certificate Type *</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {PROGRAMS.map(p => (
                    <button key={p.id} onClick={() => set("program", p.id)} style={{ padding: "14px 12px", borderRadius: 12, border: `2px solid ${form.program === p.id ? p.color : colors.n200}`, background: form.program === p.id ? `${p.color}12` : colors.n50, cursor: "pointer", textAlign: "left" }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontSize: 22 }}>{p.icon}</span>
                        <div>
                          <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: form.program === p.id ? p.color : colors.n800 }}>{p.label}</div>
                          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 12, color: form.program === p.id ? p.color : colors.n400 }}>{p.arabic}</div>
                        </div>
                      </div>
                      <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500 }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Issue date */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Issue Date</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n500, marginBottom: 4 }}>GREGORIAN</div>
                    <input type="date" value={form.issuedAt} onChange={e => set("issuedAt", e.target.value)} style={inp} />
                  </div>
                  <div>
                    <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n500, marginBottom: 4 }}>HIJRI (optional)</div>
                    <input value={form.hijriDate} onChange={e => set("hijriDate", e.target.value)} placeholder="e.g. ١٥ ذو الحجة ١٤٤٦" style={inp} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Certificate Design */}
          {step === 2 && (
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>STEP 2 OF 4</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.6rem", fontWeight: 700, color: colors.n800, margin: "0 0 20px" }}>Certificate Design</h2>

              {/* Template */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 10 }}>Template Style</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {TEMPLATES.map(t => (
                    <button key={t.id} onClick={() => set("template", t.id)} style={{ flex: 1, padding: "16px 12px", borderRadius: 12, border: `2px solid ${form.template === t.id ? colors.primary : colors.n200}`, background: form.template === t.id ? colors.green50 : colors.n50, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{t.preview}</div>
                      <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: form.template === t.id ? colors.primary : colors.n800 }}>{t.label}</div>
                      <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n500, marginTop: 3 }}>{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 10 }}>Language</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
                  {LANGUAGES.map(l => (
                    <button key={l.id} onClick={() => set("language", l.id)} style={{ padding: "12px 8px", borderRadius: 10, border: `2px solid ${form.language === l.id ? colors.primary : colors.n200}`, background: form.language === l.id ? colors.green50 : colors.n50, cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: form.language === l.id ? colors.primary : colors.n800 }}>{l.label}</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 11, color: colors.n400, marginTop: 2 }}>{l.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Theme */}
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 10 }}>Color Theme</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {COLOR_THEMES.map(c => (
                    <button key={c.id} onClick={() => set("colorTheme", c.id)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: 8, border: `2px solid ${form.colorTheme === c.id ? c.preview : colors.n200}`, background: form.colorTheme === c.id ? `${c.preview}15` : colors.n50, cursor: "pointer" }}>
                      <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.preview }} />
                      <span style={{ fontFamily: fonts.heading, fontSize: 11, color: form.colorTheme === c.id ? c.preview : colors.n700 }}>{c.label}</span>
                    </button>
                  ))}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 8px", borderRadius: 8, border: `1px solid ${colors.n200}`, background: colors.n50 }}>
                    <input type="color" value={form.colorTheme} onChange={e => set("colorTheme", e.target.value)} style={{ width: 28, height: 28, borderRadius: "50%", border: "none", cursor: "pointer", padding: 2 }} />
                    <span style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n500 }}>Custom</span>
                  </div>
                </div>
              </div>

              {/* Border + Orientation */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
                <div>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 8 }}>Border Style</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {BORDERS.map(b => (
                      <button key={b.id} onClick={() => set("borderStyle", b.id)} style={{ padding: "8px", borderRadius: 8, border: `2px solid ${form.borderStyle === b.id ? colors.primary : colors.n200}`, background: form.borderStyle === b.id ? colors.green50 : colors.n50, cursor: "pointer", textAlign: "center" }}>
                        <div style={{ fontSize: 16 }}>{b.icon}</div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 10, color: form.borderStyle === b.id ? colors.primary : colors.n700, marginTop: 2 }}>{b.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 8 }}>Orientation</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {[{ id: "PORTRAIT", label: "Portrait", icon: "📄" }, { id: "LANDSCAPE", label: "Landscape", icon: "🗒️" }].map(o => (
                      <button key={o.id} onClick={() => set("orientation", o.id)} style={{ padding: "12px", borderRadius: 10, border: `2px solid ${form.orientation === o.id ? colors.primary : colors.n200}`, background: form.orientation === o.id ? colors.green50 : colors.n50, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{o.icon}</span>
                        <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, color: form.orientation === o.id ? colors.primary : colors.n800 }}>{o.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Toggle options */}
                  <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { key: "includeSilsila", label: "Include Silsila" },
                      { key: "includeQR",      label: "Include QR Code" },
                    ].map(opt => (
                      <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "8px 10px", background: colors.n50, borderRadius: 8 }}>
                        <input type="checkbox" checked={(form as any)[opt.key]} onChange={e => set(opt.key, e.target.checked)} style={{ width: 15, height: 15, accentColor: colors.primary }} />
                        <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n700 }}>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Content & Silsila */}
          {step === 3 && (
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>STEP 3 OF 4</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.6rem", fontWeight: 700, color: colors.n800, margin: "0 0 20px" }}>Content & Signatures</h2>

              {/* Signatories */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                <div>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Ustadh / Examiner Name</label>
                  <input value={form.examinerName} onChange={e => set("examinerName", e.target.value)} placeholder="e.g. Qari Muhammad Saleem" style={inp} />
                </div>
                <div>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Principal / Muhtamim Name</label>
                  <input value={form.principalName} onChange={e => set("principalName", e.target.value)} placeholder="e.g. Maulana Abdullah Farooqi" style={inp} />
                </div>
              </div>

              {/* Silsila */}
              {form.includeSilsila && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 4 }}>Silsila — Chain of Transmission (سند)</label>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginBottom: 6 }}>The chain from this student back to the Prophet ﷺ. Edit to match your institute's actual Silsila.</div>
                  <textarea value={form.silsila} onChange={e => set("silsila", e.target.value)} rows={4}
                    placeholder="Student Name ← Ustadh Name ← ..."
                    style={{ ...inp, resize: "vertical", direction: "rtl", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, lineHeight: 2 }} />
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 4 }}>Use ← to separate each link in the chain. The chain goes right to left (student → ... → Prophet ﷺ)</div>
                </div>
              )}

              {/* Custom text */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>Additional Dua / Custom Text (optional)</label>
                <textarea value={form.customText} onChange={e => set("customText", e.target.value)} rows={2}
                  placeholder="e.g. بارك الله فيه وجعله حافظاً للقرآن الكريم آمين"
                  style={{ ...inp, resize: "none", fontFamily: "'Cormorant Garamond',serif", fontSize: 14, direction: "rtl" }} />
              </div>
            </div>
          )}

          {/* STEP 4: Review */}
          {step === 4 && (
            <div>
              <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 4 }}>STEP 4 OF 4</div>
              <h2 style={{ fontFamily: fonts.display, fontSize: "1.6rem", fontWeight: 700, color: colors.n800, margin: "0 0 20px" }}>Review & Issue</h2>

              {selectedStudent && (
                <div style={{ background: `linear-gradient(135deg,${colors.deep},${form.colorTheme})`, borderRadius: 14, padding: 20, marginBottom: 20, position: "relative", overflow: "hidden" }}>
                  <svg style={{ position: "absolute", right: -20, top: -20, opacity: 0.08 }} width="120" height="120" viewBox="0 0 80 80">
                    <polygon points="24,4 56,4 76,24 76,56 56,76 24,76 4,56 4,24" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                  <div style={{ fontFamily: fonts.mono, fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginBottom: 8 }}>CERTIFICATE PREVIEW</div>
                  <div style={{ fontFamily: fonts.display, fontSize: 20, fontWeight: 700, color: "white", marginBottom: 4 }}>{selectedStudent.name}</div>
                  {selectedStudent.nameArabic && <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: colors.gold, marginBottom: 8, direction: "rtl" }}>{selectedStudent.nameArabic}</div>}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                    {[
                      { label: "Program",     val: PROGRAMS.find(p => p.id === form.program)?.label || form.program },
                      { label: "Template",    val: form.template },
                      { label: "Language",    val: form.language },
                      { label: "Date",        val: new Date(form.issuedAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" }) },
                    ].map((s, i) => (
                      <div key={i}>
                        <div style={{ fontFamily: fonts.mono, fontSize: 8, color: "rgba(255,255,255,0.4)" }}>{s.label.toUpperCase()}</div>
                        <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: "white" }}>{s.val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ background: colors.n50, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                {[
                  { label: "Examiner",     val: form.examinerName || "—" },
                  { label: "Principal",    val: form.principalName || "—" },
                  { label: "Template",     val: form.template },
                  { label: "Language",     val: form.language },
                  { label: "Border",       val: form.borderStyle },
                  { label: "Orientation",  val: form.orientation },
                  { label: "QR Code",      val: form.includeQR ? "Yes" : "No" },
                  { label: "Silsila",      val: form.includeSilsila ? "Included" : "Not included" },
                ].map((s, i, arr) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < arr.length - 1 ? `1px solid ${colors.n200}` : "none" }}>
                    <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>{s.label}</span>
                    <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800 }}>{s.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: `${colors.gold}15`, borderRadius: 10, padding: "12px 14px", border: `1px solid ${colors.gold}44`, marginBottom: 20 }}>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n700, lineHeight: 1.7 }}>
                  ℹ️ After issuing, you will be taken to the certificate page where you can <strong>Download as PDF</strong> and <strong>Share with parents</strong>. The certificate will also be permanently accessible via QR code.
                  {form.program === "HIFZ" && <span style={{ display: "block", marginTop: 4, color: colors.primary, fontWeight: 600 }}>🏆 The student's status will be updated to <strong>COMPLETED</strong>.</span>}
                </div>
              </div>
            </div>
          )}

          {error && <div style={{ background: colors.errorBg, borderRadius: 10, padding: "12px 16px", marginTop: 16 }}><span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.errorText }}>⚠ {error}</span></div>}

          {/* Navigation */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28, paddingTop: 20, borderTop: `1px solid ${colors.n100}` }}>
            <button onClick={() => setStep(s => Math.max(1, s - 1))} disabled={step === 1}
              style={{ padding: "12px 24px", borderRadius: 10, background: colors.n100, border: `1px solid ${colors.n200}`, color: step === 1 ? colors.n300 : colors.n700, fontSize: 13, cursor: step === 1 ? "not-allowed" : "pointer", fontFamily: fonts.heading }}>
              ← Back
            </button>
            <div style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.n400, alignSelf: "center" }}>Step {step} of 4</div>
            {step < 4 ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{ padding: "12px 28px", borderRadius: 10, background: colors.primary, color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
                Continue →
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={saving || !form.studentId}
                style={{ padding: "12px 28px", borderRadius: 10, background: saving || !form.studentId ? colors.n300 : colors.gold, color: "white", fontSize: 13, fontWeight: 700, border: "none", cursor: saving || !form.studentId ? "not-allowed" : "pointer", fontFamily: fonts.heading, boxShadow: form.studentId ? "0 4px 14px rgba(196,136,42,0.35)" : "none" }}>
                {saving ? "Issuing..." : "🏆 Issue Sanad"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
