"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import PhotoUpload from "@/components/ui/PhotoUpload";
import DocumentUpload, { UploadedDoc } from "@/components/ui/DocumentUpload";
import { colors, fonts } from "@/lib/tokens";

const BLOOD_GROUPS = ["A+","A-","B+","B-","AB+","AB-","O+","O-"];
const RELATIONS    = ["Father","Mother","Grandfather","Grandmother","Uncle","Aunt","Brother","Sister","Guardian","Other"];
const PROGRAMS     = ["HIFZ","NAZRA","TAJWEED","GIRDAAN"];
const STATUSES     = ["ACTIVE","ON_LEAVE","SUSPENDED","COMPLETED","WITHDRAWN"];

const inp: React.CSSProperties = {
  width:"100%", padding:"10px 12px",
  border:`1.5px solid ${colors.n200}`, borderRadius:8,
  fontSize:13, fontFamily:fonts.body,
  color:colors.n800, background:colors.white, outline:"none",
};

function FieldRow({label,required,children}:{label:string;required?:boolean;children:React.ReactNode}) {
  return (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontFamily:fonts.heading,fontSize:12,fontWeight:600,color:colors.n700,marginBottom:6}}>
        {label}{required&&<span style={{color:colors.error}}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Section({icon,title,children}:{icon:string;title:string;children:React.ReactNode}) {
  return (
    <div style={{background:colors.white,borderRadius:14,padding:24,border:`1px solid ${colors.n200}`,marginBottom:16}}>
      <div style={{fontFamily:fonts.heading,fontSize:14,fontWeight:700,color:colors.n800,marginBottom:18}}>
        {icon} {title}
      </div>
      {children}
    </div>
  );
}

export default function EditStudentPage({params}:{params:Promise<{id:string}>}) {
  const {id} = use(params);
  const [loading,           setLoading]           = useState(true);
  const [saving,            setSaving]            = useState(false);
  const [saved,             setSaved]             = useState(false);
  const [error,             setError]             = useState("");
  const [photo,             setPhoto]             = useState("");
  const [documents,         setDocuments]         = useState<UploadedDoc[]>([]);
  const [guardianDocuments, setGuardianDocuments] = useState<UploadedDoc[]>([]);

  const [form, setForm] = useState({
    // Personal
    name:"", nameArabic:"", dateOfBirth:"",
    gender:"MALE", bloodGroup:"",
    address:"", city:"", transport:"",
    previousInstitution:"", medicalNotes:"", specialNeeds:"",
    // Program
    program:"HIFZ", status:"ACTIVE",
    batchId:"", enrolledAt:"", expectedKhatmAt:"",
    // Quran
    startingJuz:1, startingPage:1, startingAyah:1, previousHifzJuz:0,
    // Primary guardian
    guardianName:"", guardianRelation:"Father", guardianCnic:"",
    guardianPhone:"", guardianWhatsapp:"", guardianEmail:"",
    guardianOccupation:"", receiveUpdates:true,
    // Secondary guardian
    guardian2Name:"", guardian2Relation:"", guardian2Phone:"",
    // Notes
    notes:"",
  });

  const set = (key:string, val:any) => setForm(prev=>({...prev,[key]:val}));

  useEffect(()=>{
    fetch(`/api/admin/students/${id}`)
      .then(r=>r.json())
      .then(d=>{
        if (!d.success) return;
        const s  = d.data.student;
        const g  = s.guardians?.find((g:any)=>g.isEmergency) || s.guardians?.[0];
        const g2 = s.guardians?.find((g:any)=>!g.isEmergency);
        setPhoto(s.photo || "");
        setForm({
          // Personal
          name:               s.name            || "",
          nameArabic:         s.nameArabic      || "",
          dateOfBirth:        s.dateOfBirth     ? s.dateOfBirth.split("T")[0] : "",
          gender:             s.gender          || "MALE",
          bloodGroup:         s.bloodGroup      || "",
          address:            s.address         || "",
          city:               s.city            || "",
          transport:          s.transport       || "",
          previousInstitution:s.previousInstitution || "",
          medicalNotes:       s.medicalNotes    || "",
          specialNeeds:       s.specialNeeds    || "",
          // Program
          program:            s.program         || "HIFZ",
          status:             s.status          || "ACTIVE",
          batchId:            s.batchId         || "",
          enrolledAt:         s.enrolledAt      ? s.enrolledAt.split("T")[0] : "",
          expectedKhatmAt:    s.expectedKhatmAt ? s.expectedKhatmAt.split("T")[0] : "",
          // Quran
          startingJuz:        s.startingJuz     || 1,
          startingPage:       s.progress?.currentPage || 1,
          startingAyah:       s.startingAyah    || 1,
          previousHifzJuz:    s.previousHifzJuz || 0,
          // Primary guardian
          guardianName:       g?.name           || "",
          guardianRelation:   g?.relation       || "Father",
          guardianCnic:       g?.cnic           || "",
          guardianPhone:      g?.phone          || "",
          guardianWhatsapp:   g?.whatsapp       || "",
          guardianEmail:      g?.email          || "",
          guardianOccupation: g?.occupation     || "",
          receiveUpdates:     g?.receiveUpdates ?? true,
          // Secondary guardian
          guardian2Name:      g2?.name          || "",
          guardian2Relation:  g2?.relation      || "",
          guardian2Phone:     g2?.phone         || "",
          // Notes
          notes:              s.notes           || "",
        });
      })
      .finally(()=>setLoading(false));
  },[id]);

  const handleSave = async () => {
    if (!form.name)          { setError("Student name is required"); return; }
    if (!form.guardianPhone) { setError("Guardian phone is required"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch(`/api/admin/students/${id}`, {
        method:  "PUT",
        headers: {"Content-Type":"application/json"},
        body:    JSON.stringify({ ...form, photo: photo || undefined }),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setTimeout(()=>window.location.href=`/dashboard/admin/students/${id}`, 1500);
      } else {
        setError(data.error || "Failed to update student");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm("Are you sure you want to withdraw this student? This can be reversed.")) return;
    const res  = await fetch(`/api/admin/students/${id}?action=withdraw`, { method:"DELETE" });
    const data = await res.json();
    if (data.success) window.location.href = "/dashboard/admin/students";
  };

  if (loading) return (
    <div style={{minHeight:"100vh",background:colors.deep,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{fontFamily:fonts.body,color:"rgba(255,255,255,0.4)"}}>Loading student...</div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:colors.n50}}>

      {/* Nav */}
      <nav style={{background:colors.deep,padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Link href={`/dashboard/admin/students/${id}`} style={{width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16}}>←</Link>
        <div style={{fontFamily:fonts.heading,fontSize:15,fontWeight:700,color:colors.white}}>Edit Student</div>
        <div style={{marginLeft:"auto",display:"flex",gap:8}}>
          <button onClick={handleWithdraw} style={{padding:"8px 16px",borderRadius:8,background:colors.errorBg,border:`1px solid ${colors.error}44`,color:colors.errorText,fontSize:12,cursor:"pointer",fontFamily:fonts.heading}}>
            Withdraw Student
          </button>
          <button onClick={handleSave} disabled={saving} style={{padding:"8px 20px",borderRadius:8,background:saving?colors.n300:colors.primary,color:colors.white,fontSize:12,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </nav>

      <div style={{maxWidth:800,margin:"0 auto",padding:"28px 20px"}}>

        {saved && (
          <div style={{background:colors.successBg,borderRadius:10,padding:"12px 16px",marginBottom:16,textAlign:"center"}}>
            <span style={{fontFamily:fonts.heading,fontSize:13,fontWeight:600,color:colors.successText}}>✓ Student updated successfully! Redirecting...</span>
          </div>
        )}
        {error && (
          <div style={{background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginBottom:16}}>
            <span style={{fontFamily:fonts.body,fontSize:13,color:colors.errorText}}>⚠ {error}</span>
          </div>
        )}

        {/* ── Photo ── */}
        <Section icon="📷" title="Student Photo">
          <div style={{display:"flex",justifyContent:"center"}}>
            <PhotoUpload
              value={photo} onChange={url=>setPhoto(url)}
              label="Student Photo" size={100} shape="square"
              initials={form.name ? form.name.charAt(0).toUpperCase() : "?"}
            />
          </div>
          <p style={{fontFamily:fonts.body,fontSize:11,color:colors.n400,textAlign:"center",marginTop:10}}>
            Click the photo to upload a new one. Stored securely on Cloudinary.
          </p>
        </Section>

        {/* ── Personal ── */}
        <Section icon="👤" title="Personal Information">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{gridColumn:"1/-1"}}>
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
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </FieldRow>
            <FieldRow label="Blood Group">
              <select value={form.bloodGroup} onChange={e=>set("bloodGroup",e.target.value)} style={inp}>
                <option value="">Select</option>
                {BLOOD_GROUPS.map(b=><option key={b} value={b}>{b}</option>)}
              </select>
            </FieldRow>
            <div style={{gridColumn:"1/-1"}}>
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
            <div style={{gridColumn:"1/-1"}}>
              <FieldRow label="Medical Notes / Special Needs">
                <textarea value={form.medicalNotes} onChange={e=>set("medicalNotes",e.target.value)} rows={2} placeholder="Any medical conditions the Ustadh should know..." style={{...inp,resize:"none"}}/>
              </FieldRow>
            </div>
          </div>
        </Section>

        {/* ── Program ── */}
        <Section icon="📖" title="Program Details">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <FieldRow label="Program" required>
              <select value={form.program} onChange={e=>set("program",e.target.value)} style={inp}>
                {PROGRAMS.map(p=><option key={p} value={p}>{p.replace("_"," ")}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Status">
              <select value={form.status} onChange={e=>set("status",e.target.value)} style={inp}>
                {STATUSES.map(s=><option key={s} value={s}>{s.replace("_"," ")}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="Enrolment Date">
              <input type="date" value={form.enrolledAt} onChange={e=>set("enrolledAt",e.target.value)} style={inp}/>
            </FieldRow>
            <FieldRow label="Expected Khatm Date">
              <input type="date" value={form.expectedKhatmAt} onChange={e=>set("expectedKhatmAt",e.target.value)} style={inp}/>
            </FieldRow>
          </div>
        </Section>

        {/* ── Quran Position ── */}
        <Section icon="🕋" title="Quran Starting Point">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <FieldRow label="Starting Juz">
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {Array.from({length:30},(_,i)=>i+1).map(j=>(
                  <button key={j} onClick={()=>set("startingJuz",j)} style={{width:38,height:38,borderRadius:7,border:`2px solid ${form.startingJuz===j?colors.primary:colors.n200}`,background:form.startingJuz===j?colors.primary:colors.n50,cursor:"pointer",fontFamily:fonts.mono,fontSize:11,fontWeight:700,color:form.startingJuz===j?"white":colors.n600}}>
                    {j}
                  </button>
                ))}
              </div>
            </FieldRow>
            <div>
              <FieldRow label="Starting Page">
                <input type="number" min={1} max={604} value={form.startingPage} onChange={e=>set("startingPage",parseInt(e.target.value)||1)} style={{...inp,fontFamily:fonts.mono,fontWeight:700,color:colors.primary}}/>
              </FieldRow>
              <FieldRow label="Starting Ayah">
                <input type="number" min={1} value={form.startingAyah} onChange={e=>set("startingAyah",parseInt(e.target.value)||1)} style={{...inp,fontFamily:fonts.mono,fontWeight:700,color:colors.primary}}/>
              </FieldRow>
              <FieldRow label="Previously Memorized (Juz)">
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <button onClick={()=>set("previousHifzJuz",Math.max(0,form.previousHifzJuz-1))} style={{width:34,height:34,borderRadius:7,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16}}>−</button>
                  <div style={{textAlign:"center",minWidth:48}}>
                    <div style={{fontFamily:fonts.heading,fontSize:20,fontWeight:700,color:colors.primary}}>{form.previousHifzJuz}</div>
                    <div style={{fontFamily:fonts.body,fontSize:9,color:colors.n400}}>Juz</div>
                  </div>
                  <button onClick={()=>set("previousHifzJuz",Math.min(30,form.previousHifzJuz+1))} style={{width:34,height:34,borderRadius:7,border:`1px solid ${colors.n200}`,background:colors.n50,cursor:"pointer",fontSize:16}}>+</button>
                </div>
              </FieldRow>
            </div>
          </div>
        </Section>

        {/* ── Guardian ── */}
        <Section icon="👨‍👩‍👦" title="Primary Guardian">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
            <div style={{gridColumn:"1/-1"}}>
              <FieldRow label="Full Name" required>
                <input value={form.guardianName} onChange={e=>set("guardianName",e.target.value)} style={inp}/>
              </FieldRow>
            </div>
            <FieldRow label="Relation">
              <select value={form.guardianRelation} onChange={e=>set("guardianRelation",e.target.value)} style={inp}>
                {RELATIONS.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </FieldRow>
            <FieldRow label="CNIC">
              <input value={form.guardianCnic} onChange={e=>set("guardianCnic",e.target.value)} placeholder="42101-1234567-1" style={inp}/>
            </FieldRow>
            <FieldRow label="Phone" required>
              <input value={form.guardianPhone} onChange={e=>set("guardianPhone",e.target.value)} style={inp}/>
            </FieldRow>
            <FieldRow label="WhatsApp">
              <input value={form.guardianWhatsapp} onChange={e=>set("guardianWhatsapp",e.target.value)} placeholder="If different from phone" style={inp}/>
            </FieldRow>
            <FieldRow label="Email">
              <input type="email" value={form.guardianEmail} onChange={e=>set("guardianEmail",e.target.value)} style={inp}/>
            </FieldRow>
            <FieldRow label="Occupation">
              <input value={form.guardianOccupation} onChange={e=>set("guardianOccupation",e.target.value)} placeholder="e.g. Teacher, Business" style={inp}/>
            </FieldRow>
            <div style={{gridColumn:"1/-1"}}>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={form.receiveUpdates} onChange={e=>set("receiveUpdates",e.target.checked)} style={{width:16,height:16,accentColor:colors.primary}}/>
                <span style={{fontFamily:fonts.body,fontSize:13,color:colors.n700}}>Send daily Sabaq updates via WhatsApp</span>
              </label>
            </div>
          </div>
        </Section>

        {/* ── Secondary Guardian ── */}
        <Section icon="👥" title="Secondary Guardian (Optional)">
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
            <FieldRow label="Full Name">
              <input value={form.guardian2Name} onChange={e=>set("guardian2Name",e.target.value)} placeholder="Optional" style={inp}/>
            </FieldRow>
            <FieldRow label="Relation">
              <input value={form.guardian2Relation} onChange={e=>set("guardian2Relation",e.target.value)} placeholder="e.g. Uncle" style={inp}/>
            </FieldRow>
            <FieldRow label="Phone">
              <input value={form.guardian2Phone} onChange={e=>set("guardian2Phone",e.target.value)} placeholder="+92 300 0000000" style={inp}/>
            </FieldRow>
          </div>
        </Section>

        {/* ── Documents ── */}
        <Section icon="📁" title="Documents">
          <p style={{fontFamily:fonts.body,fontSize:12,color:colors.n400,marginBottom:16}}>
            Upload or update student and guardian documents.
          </p>
          <div style={{background:colors.n50,borderRadius:12,padding:16,border:`1px solid ${colors.n200}`,marginBottom:12}}>
            <DocumentUpload documents={documents} onChange={docs=>setDocuments(docs)} label="Student Documents" maxFiles={8}/>
          </div>
          <div style={{background:colors.n50,borderRadius:12,padding:16,border:`1px solid ${colors.n200}`}}>
            <DocumentUpload documents={guardianDocuments} onChange={docs=>setGuardianDocuments(docs)} label="Guardian Documents (CNIC, etc.)" maxFiles={5}/>
          </div>
        </Section>

        {/* ── Notes ── */}
        <Section icon="📝" title="Additional Notes">
          <FieldRow label="Notes">
            <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Any additional notes about this student..." style={{...inp,resize:"none"}}/>
          </FieldRow>
        </Section>

        {/* ── Footer ── */}
        <div style={{display:"flex",justifyContent:"space-between",gap:10,marginBottom:40}}>
          <button onClick={handleWithdraw} style={{padding:"12px 20px",borderRadius:10,background:colors.errorBg,border:`1px solid ${colors.error}44`,color:colors.errorText,fontSize:13,cursor:"pointer",fontFamily:fonts.heading}}>
            Withdraw Student
          </button>
          <div style={{display:"flex",gap:10}}>
            <Link href={`/dashboard/admin/students/${id}`} style={{padding:"12px 24px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:13,textDecoration:"none",fontFamily:fonts.heading}}>
              Cancel
            </Link>
            <button onClick={handleSave} disabled={saving} style={{padding:"12px 28px",borderRadius:10,background:saving?colors.n300:colors.primary,color:colors.white,fontSize:13,fontWeight:700,border:"none",cursor:saving?"not-allowed":"pointer",fontFamily:fonts.heading}}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
