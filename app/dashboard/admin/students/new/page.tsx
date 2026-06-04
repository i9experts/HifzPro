"use client";
import { useState } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import PhotoUpload from "@/components/ui/PhotoUpload";
import DocumentUpload, { UploadedDoc } from "@/components/ui/DocumentUpload";
import { colors, fonts } from "@/lib/tokens";

const STEPS = [
  { num: 1, label: "Personal Info",    icon: "👤" },
  { num: 2, label: "Program & Batch",  icon: "📖" },
  { num: 3, label: "Quran Position",   icon: "🕋" },
  { num: 4, label: "Guardian Details", icon: "👨‍👩‍👦" },
  { num: 5, label: "Documents",        icon: "📁" },
  { num: 6, label: "Review & Enrol",   icon: "✅" },
];

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const RELATIONS    = ["Father","Mother","Grandfather","Grandmother","Uncle","Aunt","Brother","Sister","Guardian","Other"];
const PROGRAMS     = [
  { id:"HIFZ",    label:"Hifz ul Quran",   arabic:"حفظ القرآن",   desc:"Full Quran memorization — Sabaq, Sabqi, Manzil" },
  { id:"NAZRA",   label:"Nazrah",           arabic:"ناظرہ",         desc:"Recitation with Tajweed, Surah by Surah" },
  { id:"TAJWEED", label:"Tajweed / Qaida",  arabic:"تجوید / قاعدہ", desc:"Tajweed rules & Qaida lessons" },
  { id:"GIRDAAN", label:"Girdaan",          arabic:"گردان",         desc:"Intensive revision for existing Huffaz" },
];

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 6 }}>
        {label}{required && <span style={{ color: colors.error }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inp = { width: "100%", padding: "10px 12px", border: `1.5px solid ${colors.n200}`, borderRadius: 8, fontSize: 13, fontFamily: fonts.body, color: colors.n800, background: colors.white, outline: "none" };

export default function NewStudentPage() {
  const [step,    setStep]    = useState(1);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [result,  setResult]  = useState<{ id:string; enrollmentNumber:string; name:string } | null>(null);

  const [form, setForm] = useState({
    // Personal
    name:"", nameArabic:"", dateOfBirth:"", gender:"MALE",
    bloodGroup:"", medicalNotes:"", address:"", city:"",
    transport:"", hostel:false, previousInstitution:"", specialNeeds:"",
    photo:"",
    // Program
    program:"HIFZ", batchId:"", enrolledAt:new Date().toISOString().split("T")[0], expectedKhatmAt:"",
    // Quran
    startingJuz:1, startingSurah:1, startingAyah:1, startingPage:1, previousHifzJuz:0,
    // Guardian
    guardianName:"", guardianRelation:"Father", guardianCnic:"",
    guardianPhone:"", guardianWhatsapp:"", guardianEmail:"",
    guardianOccupation:"", guardianAddress:"",
    guardian2Name:"", guardian2Relation:"", guardian2Phone:"",
    receiveUpdates:true,
    // Documents
    documents:[] as UploadedDoc[],
    guardianDocuments:[] as UploadedDoc[],
    notes:"",
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const validate = () => {
    if (step === 1 && !form.name)         { setError("Student name is required"); return false; }
    if (step === 4 && (!form.guardianName || !form.guardianPhone)) { setError("Guardian name and phone required"); return false; }
    setError(""); return true;
  };

  const handleSubmit = async () => {
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/students", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, photo: form.photo || undefined }),
      });
      const data = await res.json();
      if (data.success) setResult(data.data.student);
      else setError(data.error || "Failed to enrol student");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if (saved && result) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:480, width:"100%", background:colors.white, borderRadius:20, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
        <h2 style={{ fontFamily:fonts.display, fontSize:"2rem", fontWeight:700, color:colors.n800, margin:"0 0 8px" }}>{result.name}</h2>
        <div style={{ fontFamily:fonts.mono, fontSize:16, color:colors.primary, marginBottom:24 }}>{result.enrollmentNumber}</div>
        <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
          <Link href={`/dashboard/admin/students/${result.id}`} style={{ padding:"12px 24px", borderRadius:10, background:colors.primary, color:colors.white, fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>View Profile →</Link>
          <Link href="/dashboard/admin/students" style={{ padding:"12px 20px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:13, textDecoration:"none", fontFamily:fonts.heading }}>All Students</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      {/* Nav */}
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/students" style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", color:colors.white, fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold} />
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Enrol New Student</div>
      </nav>

      {/* Steps */}
      <div style={{ background:colors.white, borderBottom:`1px solid ${colors.n200}`, padding:"12px 24px", overflowX:"auto" }}>
        <div style={{ maxWidth:900, margin:"0 auto", display:"flex", alignItems:"center" }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{ display:"flex", alignItems:"center", flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:step>s.num?colors.success:step===s.num?colors.primary:colors.n100, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${step>=s.num?(step>s.num?colors.success:colors.primary):colors.n200}` }}>
                  <span style={{ fontSize:step>s.num?12:11 }}>{step>s.num?"✓":s.icon}</span>
                </div>
                <div style={{ display:"flex", flexDirection:"column" }}>
                  <div style={{ fontFamily:fonts.mono, fontSize:7, color:step===s.num?colors.primary:colors.n400, letterSpacing:1 }}>STEP {s.num}</div>
                  <div style={{ fontFamily:fonts.heading, fontSize:10, fontWeight:600, color:step>=s.num?colors.n800:colors.n400 }}>{s.label}</div>
                </div>
              </div>
              {i < STEPS.length-1 && <div style={{ flex:1, height:2, background:step>s.num?colors.success:colors.n200, margin:"0 6px" }}/>}
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"24px 20px" }}>
        <div style={{ background:colors.white, borderRadius:16, padding:"28px", border:`1px solid ${colors.n200}` }}>

          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP 1 OF 6</div>
                <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Personal Information</h2>
              </div>

              {/* Photo upload */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:24 }}>
                <PhotoUpload
                  value={form.photo}
                  onChange={url => set("photo", url)}
                  label="Student Photo"
                  size={100}
                  shape="square"
                  initials={form.name ? form.name.charAt(0).toUpperCase() : "?"}
                />
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{ gridColumn:"1/-1" }}>
                  <FieldRow label="Full Name (English)" required>
                    <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. Muhammad Ahmed" style={inp}/>
                  </FieldRow>
                </div>
                <FieldRow label="Full Name (Arabic / Urdu)">
                  <input value={form.nameArabic} onChange={e=>set("nameArabic",e.target.value)} placeholder="e.g. محمد احمد" style={{...inp,direction:"rtl",fontFamily:"'Cormorant Garamond',serif",fontSize:15}}/>
                </FieldRow>
                <FieldRow label="Date of Birth">
                  <input type="date" value={form.dateOfBirth} onChange={e=>set("dateOfBirth",e.target.value)} style={inp}/>
                </FieldRow>
                <FieldRow label="Gender">
                  <select value={form.gender} onChange={e=>set("gender",e.target.value)} style={inp}>
                    <option value="MALE">Male</option><option value="FEMALE">Female</option>
                  </select>
                </FieldRow>
                <FieldRow label="Blood Group">
                  <select value={form.bloodGroup} onChange={e=>set("bloodGroup",e.target.value)} style={inp}>
                    <option value="">Select</option>{BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
                  </select>
                </FieldRow>
                <div style={{ gridColumn:"1/-1" }}>
                  <FieldRow label="Home Address">
                    <input value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Street address" style={inp}/>
                  </FieldRow>
                </div>
                <FieldRow label="City">
                  <input value={form.city} onChange={e=>set("city",e.target.value)} placeholder="e.g. Karachi" style={inp}/>
                </FieldRow>
                <FieldRow label="Transport">
                  <select value={form.transport} onChange={e=>set("transport",e.target.value)} style={inp}>
                    <option value="">Select</option>
                    <option value="self">Self / Family</option>
                    <option value="institute_van">Institute Van</option>
                    <option value="rickshaw">Rickshaw</option>
                    <option value="walking">Walking</option>
                    <option value="hostel">Hostel Resident</option>
                  </select>
                </FieldRow>
                <FieldRow label="Previous Institution">
                  <input value={form.previousInstitution} onChange={e=>set("previousInstitution",e.target.value)} placeholder="If transferred" style={inp}/>
                </FieldRow>
                <div style={{ gridColumn:"1/-1" }}>
                  <FieldRow label="Medical Notes / Special Needs">
                    <textarea value={form.medicalNotes} onChange={e=>set("medicalNotes",e.target.value)} rows={2} placeholder="Any medical conditions the Ustadh should know..." style={{...inp,resize:"none"}}/>
                  </FieldRow>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP 2 OF 6</div>
                <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Program & Batch</h2>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
                {PROGRAMS.map(p=>(
                  <button key={p.id} onClick={()=>set("program",p.id)} style={{ padding:16, borderRadius:12, border:`2px solid ${form.program===p.id?colors.primary:colors.n200}`, background:form.program===p.id?colors.green50:colors.white, cursor:"pointer", textAlign:"left" }}>
                    <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:form.program===p.id?colors.primary:colors.n800, marginBottom:2 }}>{p.label}</div>
                    <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:colors.n400, marginBottom:4 }}>{p.arabic}</div>
                    <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, lineHeight:1.5 }}>{p.desc}</div>
                  </button>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <FieldRow label="Enrolment Date" required><input type="date" value={form.enrolledAt} onChange={e=>set("enrolledAt",e.target.value)} style={inp}/></FieldRow>
                <FieldRow label="Expected Khatm Date"><input type="date" value={form.expectedKhatmAt} onChange={e=>set("expectedKhatmAt",e.target.value)} style={inp}/></FieldRow>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP 3 OF 6</div>
                <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Quran Starting Point</h2>
              </div>
              <FieldRow label="Previously Memorized (Juz)">
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <button onClick={()=>set("previousHifzJuz",Math.max(0,form.previousHifzJuz-1))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:18 }}>−</button>
                  <div style={{ textAlign:"center", minWidth:60 }}>
                    <div style={{ fontFamily:fonts.heading,fontSize:24,fontWeight:700,color:colors.primary }}>{form.previousHifzJuz}</div>
                    <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n400 }}>Juz memorized</div>
                  </div>
                  <button onClick={()=>set("previousHifzJuz",Math.min(30,form.previousHifzJuz+1))} style={{ width:36,height:36,borderRadius:8,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:18 }}>+</button>
                </div>
              </FieldRow>
              <FieldRow label="Starting Juz" required>
                <div style={{ display:"flex",flexWrap:"wrap",gap:6 }}>
                  {Array.from({length:30},(_,i)=>i+1).map(j=>(
                    <button key={j} onClick={()=>set("startingJuz",j)} style={{ width:40,height:40,borderRadius:8,border:`2px solid ${form.startingJuz===j?colors.primary:colors.n200}`,background:form.startingJuz===j?colors.primary:colors.n50,cursor:"pointer",fontFamily:fonts.mono,fontSize:12,fontWeight:700,color:form.startingJuz===j?"white":colors.n600 }}>{j}</button>
                  ))}
                </div>
              </FieldRow>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginTop:8 }}>
                <FieldRow label="Starting Page"><input type="number" value={form.startingPage} min={1} max={604} onChange={e=>set("startingPage",parseInt(e.target.value)||1)} style={{...inp,fontFamily:fonts.mono,fontWeight:700,color:colors.primary}}/></FieldRow>
                <FieldRow label="Starting Ayah"><input type="number" value={form.startingAyah} min={1} onChange={e=>set("startingAyah",parseInt(e.target.value)||1)} style={{...inp,fontFamily:fonts.mono,fontWeight:700,color:colors.primary}}/></FieldRow>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP 4 OF 6</div>
                <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Guardian Details</h2>
              </div>

              {/* Guardian photo */}
              <div style={{ background:colors.n50,borderRadius:12,padding:16,border:`1px solid ${colors.n200}`,marginBottom:20 }}>
                <div style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:700,color:colors.n700,marginBottom:12 }}>Primary Guardian</div>
                <div style={{ display:"flex",gap:20,alignItems:"flex-start" }}>
                  <PhotoUpload
                    value={undefined}
                    onChange={()=>{}}
                    label="Guardian Photo"
                    size={64}
                    shape="circle"
                    initials={form.guardianName?form.guardianName.charAt(0):"G"}
                  />
                  <div style={{ flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
                    <div style={{ gridColumn:"1/-1" }}><FieldRow label="Full Name" required><input value={form.guardianName} onChange={e=>set("guardianName",e.target.value)} placeholder="e.g. Muhammad Abdullah" style={inp}/></FieldRow></div>
                    <FieldRow label="Relation"><select value={form.guardianRelation} onChange={e=>set("guardianRelation",e.target.value)} style={inp}>{RELATIONS.map(r=><option key={r} value={r}>{r}</option>)}</select></FieldRow>
                    <FieldRow label="CNIC"><input value={form.guardianCnic} onChange={e=>set("guardianCnic",e.target.value)} placeholder="42101-1234567-1" style={inp}/></FieldRow>
                    <FieldRow label="Phone" required><input value={form.guardianPhone} onChange={e=>set("guardianPhone",e.target.value)} placeholder="+92 300 0000000" style={inp}/></FieldRow>
                    <FieldRow label="WhatsApp"><input value={form.guardianWhatsapp} onChange={e=>set("guardianWhatsapp",e.target.value)} placeholder="If different from phone" style={inp}/></FieldRow>
                    <div style={{ gridColumn:"1/-1" }}><FieldRow label="Email"><input type="email" value={form.guardianEmail} onChange={e=>set("guardianEmail",e.target.value)} placeholder="guardian@email.com" style={inp}/></FieldRow></div>
                  </div>
                </div>
                <label style={{ display:"flex",alignItems:"center",gap:8,cursor:"pointer",marginTop:8 }}>
                  <input type="checkbox" checked={form.receiveUpdates} onChange={e=>set("receiveUpdates",e.target.checked)} style={{ width:16,height:16,accentColor:colors.primary }}/>
                  <span style={{ fontFamily:fonts.body,fontSize:13,color:colors.n700 }}>Send daily Sabaq updates via WhatsApp</span>
                </label>
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
                <FieldRow label="2nd Guardian Name"><input value={form.guardian2Name} onChange={e=>set("guardian2Name",e.target.value)} placeholder="Optional" style={inp}/></FieldRow>
                <FieldRow label="Relation"><input value={form.guardian2Relation} onChange={e=>set("guardian2Relation",e.target.value)} placeholder="e.g. Uncle" style={inp}/></FieldRow>
                <FieldRow label="Phone"><input value={form.guardian2Phone} onChange={e=>set("guardian2Phone",e.target.value)} placeholder="+92 300 0000000" style={inp}/></FieldRow>
              </div>
            </div>
          )}

          {/* STEP 5 — DOCUMENTS */}
          {step === 5 && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP 5 OF 6</div>
                <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Documents & Files</h2>
                <p style={{ fontFamily:fonts.body, fontSize:13, color:colors.n500, marginTop:4 }}>Upload student and guardian documents. You can also add these later from the student profile.</p>
              </div>

              <div style={{ background:colors.n50,borderRadius:12,padding:20,border:`1px solid ${colors.n200}`,marginBottom:16 }}>
                <DocumentUpload
                  documents={form.documents}
                  onChange={docs=>set("documents",docs)}
                  label="Student Documents"
                  maxFiles={8}
                />
              </div>

              <div style={{ background:colors.n50,borderRadius:12,padding:20,border:`1px solid ${colors.n200}` }}>
                <DocumentUpload
                  documents={form.guardianDocuments}
                  onChange={docs=>set("guardianDocuments",docs)}
                  label="Guardian Documents (CNIC, etc.)"
                  maxFiles={5}
                />
              </div>

              <div style={{ background:colors.warningBg,borderRadius:10,padding:12,border:`1px solid ${colors.warning}44`,marginTop:14 }}>
                <span style={{ fontFamily:fonts.body,fontSize:12,color:colors.warningText }}>
                  ℹ️ Documents are stored securely on Cloudinary. You can skip this step and add documents later from the student profile.
                </span>
              </div>
            </div>
          )}

          {/* STEP 6 — REVIEW */}
          {step === 6 && (
            <div>
              <div style={{ marginBottom:24 }}>
                <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>STEP 6 OF 6</div>
                <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Review & Enrol</h2>
              </div>

              {/* Photo preview */}
              {form.photo && (
                <div style={{ display:"flex",alignItems:"center",gap:14,background:colors.green50,borderRadius:12,padding:14,border:`1px solid ${colors.green200}`,marginBottom:16 }}>
                  <img src={form.photo} alt="Student" style={{ width:56,height:56,borderRadius:10,objectFit:"cover" }}/>
                  <div>
                    <div style={{ fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800 }}>{form.name}</div>
                    <div style={{ fontFamily:fonts.body,fontSize:12,color:colors.n500 }}>{form.program} · {form.city}</div>
                  </div>
                </div>
              )}

              {[
                { title:"Personal", icon:"👤", step:1, items:[["Name",form.name],["Arabic Name",form.nameArabic||"—"],["DOB",form.dateOfBirth||"—"],["City",form.city||"—"],["Blood Group",form.bloodGroup||"—"]] },
                { title:"Program",  icon:"📖", step:2, items:[["Program",PROGRAMS.find(p=>p.id===form.program)?.label||form.program],["Enrolled",form.enrolledAt],["Exp. Khatm",form.expectedKhatmAt||"Not set"]] },
                { title:"Quran",    icon:"🕋", step:3, items:[["Starting Juz",`Juz ${form.startingJuz}`],["Page",`${form.startingPage}`],["Previous Hifz",`${form.previousHifzJuz} Juz`]] },
                { title:"Guardian", icon:"👨‍👩‍👦", step:4, items:[["Name",form.guardianName],["Relation",form.guardianRelation],["Phone",form.guardianPhone],["WhatsApp Updates",form.receiveUpdates?"Enabled":"Disabled"]] },
                { title:"Documents",icon:"📁", step:5, items:[["Student Docs",`${form.documents.length} uploaded`],["Guardian Docs",`${form.guardianDocuments.length} uploaded`]] },
              ].map(section=>(
                <div key={section.title} style={{ background:colors.n50,borderRadius:12,padding:14,border:`1px solid ${colors.n200}`,marginBottom:10 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
                    <div style={{ fontFamily:fonts.heading,fontSize:13,fontWeight:700,color:colors.n800 }}>{section.icon} {section.title}</div>
                    <button onClick={()=>setStep(section.step)} style={{ fontFamily:fonts.heading,fontSize:11,color:colors.primary,background:"none",border:"none",cursor:"pointer" }}>Edit</button>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:6 }}>
                    {section.items.map(([lbl,val])=>(
                      <div key={lbl}>
                        <div style={{ fontFamily:fonts.body,fontSize:10,color:colors.n400 }}>{lbl}</div>
                        <div style={{ fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700 }}>{val||"—"}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <FieldRow label="Additional Notes">
                <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={2} placeholder="Any additional notes..." style={{...inp,resize:"none"}}/>
              </FieldRow>
            </div>
          )}

          {error&&<div style={{ background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginTop:16 }}><span style={{ fontFamily:fonts.body,fontSize:13,color:colors.errorText }}>⚠ {error}</span></div>}

          {/* Navigation */}
          <div style={{ display:"flex",justifyContent:"space-between",marginTop:24,paddingTop:20,borderTop:`1px solid ${colors.n100}` }}>
            <button onClick={()=>setStep(s=>Math.max(1,s-1))} disabled={step===1}
              style={{ padding:"12px 24px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:step===1?colors.n300:colors.n700,fontSize:13,cursor:step===1?"not-allowed":"pointer",fontFamily:fonts.heading }}>
              ← Back
            </button>
            <div style={{ fontFamily:fonts.mono,fontSize:11,color:colors.n400,alignSelf:"center" }}>Step {step} of {STEPS.length}</div>
            {step < STEPS.length ? (
              <button onClick={()=>{ if(validate()) setStep(s=>s+1); }} style={{ padding:"12px 28px",borderRadius:10,background:colors.primary,color:colors.white,fontSize:13,fontWeight:700,border:"none",cursor:"pointer",fontFamily:fonts.heading }}>Continue →</button>
            ) : (
              <button onClick={()=>{ handleSubmit(); setSaved(true); }} disabled={saving} style={{ padding:"12px 28px",borderRadius:10,background:saving?colors.n300:colors.gold,color:colors.white,fontSize:13,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading }}>
                {saving?"Enrolling...":"🎓 Enrol Student"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
