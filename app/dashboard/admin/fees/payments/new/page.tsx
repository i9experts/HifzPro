"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const MONTHS_FULL = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const METHODS = [
  { id:"CASH",          label:"Cash",          labelUr:"نقد",     icon:"💵" },
  { id:"BANK_TRANSFER", label:"Bank Transfer", labelUr:"بینک",    icon:"🏦" },
  { id:"JAZZCASE",      label:"JazzCash",      labelUr:"جاز کیش", icon:"📱" },
  { id:"EASYPAISA",     label:"EasyPaisa",     labelUr:"ایزی پیسہ",icon:"💚" },
  { id:"CHEQUE",        label:"Cheque",        labelUr:"چیک",     icon:"📄" },
  { id:"ONLINE",        label:"Online",        labelUr:"آنلائن",  icon:"🌐" },
];

const inp = { width:"100%", padding:"10px 12px", border:`1.5px solid ${colors.n200}`, borderRadius:8, fontSize:13, fontFamily:fonts.body, color:colors.n800, background:colors.white, outline:"none" };

interface Student { id:string; name:string; enrollmentNumber:string; program:string; }
interface FeeStructure { id:string; name:string; amount:number; feeType:string; frequency:string; }

export default function RecordPaymentPage() {
  const [students,   setStudents]   = useState<Student[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState<any>(null);
  const [error,      setError]      = useState("");

  const now = new Date();
  const [form, setForm] = useState({
    studentId: prefilledStudentId,
    feeStructureId: "",
    amount:         0,
    paidAmount:     0,
    discountAmount: 0,
    month:          now.getMonth() + 1,
    year:           now.getFullYear(),
    paymentMethod:  "CASH",
    paymentDate:    now.toISOString().split("T")[0],
    notes:          "",
    sendReceipt:    true,
    const searchParams = useSearchParams();
const prefilledStudentId = searchParams.get("studentId") || "";
  });

  const set = (key: string, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetch("/api/admin/students?limit=200&status=ACTIVE")
      .then(r=>r.json()).then(d=>{ if(d.success) setStudents(d.data.students); });
    fetch("/api/admin/fees/structures")
      .then(r=>r.json()).then(d=>{ if(d.success) setStructures(d.data.structures); });
  }, []);

  // Auto-fill amount from selected fee structure
  useEffect(() => {
    const s = structures.find(s => s.id === form.feeStructureId);
    if (s) {
      const disc = form.discountAmount || 0;
      set("amount", s.amount);
      set("paidAmount", Math.max(0, s.amount - disc));
    }
  }, [form.feeStructureId]);

  useEffect(() => {
    if (form.amount > 0) {
      set("paidAmount", Math.max(0, form.amount - (form.discountAmount || 0)));
    }
  }, [form.discountAmount]);

  const balance = form.amount - form.paidAmount - (form.discountAmount || 0);
  const status  = form.paidAmount >= form.amount ? "PAID" : form.paidAmount > 0 ? "PARTIAL" : "PENDING";

  const handleSubmit = async () => {
    if (!form.studentId) { setError("Please select a student"); return; }
    if (form.amount <= 0) { setError("Amount must be greater than zero"); return; }
    setSaving(true); setError("");
    try {
      const res  = await fetch("/api/admin/fees/payments", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) setSaved(data.data);
      else setError(data.error || "Failed to record payment");
    } catch { setError("Connection error"); } finally { setSaving(false); }
  };

  if (saved) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ maxWidth:460, width:"100%", background:colors.white, borderRadius:20, padding:40, textAlign:"center" }}>
        <div style={{ fontSize:56, marginBottom:16 }}>🧾</div>
        <div style={{ fontFamily:fonts.mono,fontSize:9,letterSpacing:3,color:colors.gold,marginBottom:8 }}>PAYMENT RECORDED</div>
        <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:"0 0 4px" }}>PKR {saved.payment.paidAmount.toLocaleString()}</h2>
        <div style={{ fontFamily:fonts.mono, fontSize:14, color:colors.primary, marginBottom:20 }}>{saved.receiptNumber}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          <Link href={`/dashboard/admin/fees/receipts/${saved.payment.id}`} style={{ padding:"13px", borderRadius:10, background:colors.primary, color:"white", fontSize:13, fontWeight:700, textDecoration:"none", fontFamily:fonts.heading }}>🧾 View & Print Receipt →</Link>
          <Link href="/dashboard/admin/fees" style={{ padding:"12px", borderRadius:10, background:colors.n100, border:`1px solid ${colors.n200}`, color:colors.n700, fontSize:13, textDecoration:"none", fontFamily:fonts.heading }}>← Back to Fee Dashboard</Link>
          <button onClick={()=>{ setSaved(null); setForm(f=>({...f,studentId:"",feeStructureId:"",amount:0,paidAmount:0,discountAmount:0,notes:""})); }} style={{ padding:"12px", borderRadius:10, background:colors.gold, color:"white", border:"none", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:fonts.heading }}>Record Another Payment</button>
        </div>
      </div>
    </div>
  );

  const selectedStudent   = students.find(s => s.id === form.studentId);
  const selectedStructure = structures.find(s => s.id === form.feeStructureId);

  return (
    <div style={{ minHeight:"100vh", background:colors.n50 }}>
      <nav style={{ background:colors.deep, padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, zIndex:50 }}>
        <Link href="/dashboard/admin/fees" style={{ width:32,height:32,borderRadius:8,background:"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",textDecoration:"none",color:colors.white,fontSize:16 }}>←</Link>
        <HifzMark size={28} primary="#10B981" gold={colors.gold}/>
        <div style={{ fontFamily:fonts.heading, fontSize:15, fontWeight:700, color:colors.white }}>Record Payment</div>
      </nav>

      <div style={{ maxWidth:700, margin:"0 auto", padding:"28px 20px" }}>
        <div style={{ background:colors.white, borderRadius:16, padding:28, border:`1px solid ${colors.n200}` }}>

          <div style={{ marginBottom:24 }}>
            <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:3, color:colors.gold, marginBottom:4 }}>RECORD FEE PAYMENT</div>
            <h2 style={{ fontFamily:fonts.display, fontSize:"1.6rem", fontWeight:700, color:colors.n800, margin:0 }}>Record Fee Payment</h2>
          </div>

          {/* Student */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Student *</label>
            <select value={form.studentId} onChange={e=>set("studentId",e.target.value)} style={inp}>
              <option value="">Select student...</option>
              {students.map(s=><option key={s.id} value={s.id}>{s.name} — {s.enrollmentNumber} ({s.program})</option>)}
            </select>
          </div>

          {/* Fee structure + Month/Year */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Fee Type</label>
              <select value={form.feeStructureId} onChange={e=>set("feeStructureId",e.target.value)} style={inp}>
                <option value="">— Custom amount —</option>
                {structures.map(s=><option key={s.id} value={s.id}>{s.name} — PKR {s.amount.toLocaleString()}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Month</label>
              <select value={form.month} onChange={e=>set("month",parseInt(e.target.value))} style={inp}>
                {MONTHS_FULL.slice(1).map((m,i)=><option key={i+1} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Year</label>
              <select value={form.year} onChange={e=>set("year",parseInt(e.target.value))} style={inp}>
                {[2024,2025,2026,2027].map(y=><option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Amount breakdown */}
          <div style={{ background:colors.n50, borderRadius:12, padding:16, marginBottom:16, border:`1px solid ${colors.n200}` }}>
            <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800, marginBottom:12 }}>💰 Amount Details</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:colors.n700, marginBottom:4 }}>Fee Amount (PKR) *</label>
                <input type="number" value={form.amount || ""} min={0} onChange={e=>set("amount",parseFloat(e.target.value)||0)}
                  style={{ ...inp, fontFamily:fonts.mono, fontWeight:700, color:colors.n800 }}/>
              </div>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:colors.n700, marginBottom:4 }}>Discount / Scholarship</label>
                <input type="number" value={form.discountAmount || ""} min={0} onChange={e=>set("discountAmount",parseFloat(e.target.value)||0)}
                  style={{ ...inp, fontFamily:fonts.mono, fontWeight:700, color:"#7c3aed" }}/>
              </div>
              <div>
                <label style={{ display:"block", fontFamily:fonts.heading, fontSize:11, fontWeight:600, color:colors.n700, marginBottom:4 }}>Amount Paid (PKR) *</label>
                <input type="number" value={form.paidAmount || ""} min={0} max={form.amount} onChange={e=>set("paidAmount",parseFloat(e.target.value)||0)}
                  style={{ ...inp, fontFamily:fonts.mono, fontWeight:700, color:colors.primary }}/>
              </div>
            </div>
            {/* Summary strip */}
            <div style={{ display:"flex", gap:16, marginTop:12, padding:"10px 12px", background:colors.white, borderRadius:8, border:`1px solid ${colors.n200}` }}>
              {[
                {label:"Total Fee",   val:`PKR ${form.amount.toLocaleString()}`,                 color:colors.n700},
                {label:"Discount",    val:`PKR ${(form.discountAmount||0).toLocaleString()}`,     color:"#7c3aed"},
                {label:"Paid",        val:`PKR ${form.paidAmount.toLocaleString()}`,              color:colors.successText},
                {label:"Balance",     val:`PKR ${Math.max(0,balance).toLocaleString()}`,          color:balance>0?colors.errorText:colors.successText},
                {label:"Status",      val:status==="PAID"?"✅ PAID":status==="PARTIAL"?"⚠️ PARTIAL":"⏳ PENDING", color:status==="PAID"?colors.successText:status==="PARTIAL"?colors.warningText:colors.errorText},
              ].map((s,i)=>(
                <div key={i} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontFamily:fonts.mono, fontSize:10, fontWeight:700, color:s.color }}>{s.val}</div>
                  <div style={{ fontFamily:fonts.body, fontSize:9, color:colors.n400 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment method */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:8 }}>Payment Method *</label>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {METHODS.map(m=>(
                <button key={m.id} onClick={()=>set("paymentMethod",m.id)} style={{ padding:"10px 8px", borderRadius:10, border:`2px solid ${form.paymentMethod===m.id?colors.primary:colors.n200}`, background:form.paymentMethod===m.id?colors.green50:colors.n50, cursor:"pointer", textAlign:"center" }}>
                  <span style={{ fontSize:18 }}>{m.icon}</span>
                  <div style={{ fontFamily:fonts.heading, fontSize:11, fontWeight:700, color:form.paymentMethod===m.id?colors.primary:colors.n700 }}>{m.label}</div>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:9, color:colors.n400 }}>{m.labelUr}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date + Notes */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Payment Date</label>
              <input type="date" value={form.paymentDate} onChange={e=>set("paymentDate",e.target.value)} style={inp}/>
            </div>
            <div>
              <label style={{ display:"block", fontFamily:fonts.heading, fontSize:12, fontWeight:600, color:colors.n700, marginBottom:6 }}>Notes</label>
              <input value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder="Any notes..." style={inp}/>
            </div>
          </div>

          {/* WhatsApp receipt */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:colors.green50, borderRadius:10, border:`1px solid ${colors.green200}`, marginBottom:20 }}>
            <span style={{ fontSize:20 }}>💬</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.primary }}>Send WhatsApp Receipt to Parent</div>
              <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n600 }}>Auto-sends payment confirmation in Urdu when fully paid</div>
            </div>
            <div onClick={()=>set("sendReceipt",!form.sendReceipt)} style={{ width:44,height:24,borderRadius:12,background:form.sendReceipt?colors.success:colors.n300,position:"relative",cursor:"pointer",transition:"background 0.2s" }}>
              <div style={{ width:18,height:18,borderRadius:"50%",background:"white",position:"absolute",top:3,left:form.sendReceipt?23:3,transition:"left 0.2s",boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }}/>
            </div>
          </div>

          {error && <div style={{ background:colors.errorBg,borderRadius:10,padding:"12px 16px",marginBottom:16 }}><span style={{ fontFamily:fonts.body,fontSize:13,color:colors.errorText }}>⚠ {error}</span></div>}

          <div style={{ display:"flex", gap:10 }}>
            <Link href="/dashboard/admin/fees" style={{ flex:1,padding:"13px",borderRadius:10,background:colors.n100,border:`1px solid ${colors.n200}`,color:colors.n700,fontSize:14,textDecoration:"none",fontFamily:fonts.heading,textAlign:"center" }}>Cancel</Link>
            <button onClick={handleSubmit} disabled={saving||!form.studentId||form.amount<=0} style={{ flex:2,padding:"13px",borderRadius:10,fontSize:14,fontWeight:700,border:"none",background:!form.studentId||form.amount<=0?colors.n300:saving?colors.primaryLight:colors.gold,color:"white",cursor:!form.studentId||form.amount<=0||saving?"not-allowed":"pointer",fontFamily:fonts.heading,boxShadow:form.studentId&&form.amount>0?"0 4px 14px rgba(196,136,42,0.3)":"none" }}>
              {saving?"Recording...":"Record Payment 🧾"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
