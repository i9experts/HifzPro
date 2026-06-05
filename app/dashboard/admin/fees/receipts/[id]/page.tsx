"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const MONTHS_FULL = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

const METHOD_LABELS: Record<string,{label:string;icon:string}> = {
  CASH:          {label:"Cash",          icon:"💵"},
  BANK_TRANSFER: {label:"Bank Transfer", icon:"🏦"},
  JAZZCASE:      {label:"JazzCash",      icon:"📱"},
  EASYPAISA:     {label:"EasyPaisa",     icon:"💚"},
  CHEQUE:        {label:"Cheque",        icon:"📄"},
  ONLINE:        {label:"Online",        icon:"🌐"},
  OTHER:         {label:"Other",         icon:"💳"},
};

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params);
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch payment by ID
    fetch(`/api/admin/fees/payments?limit=200`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          const p = d.data.payments.find((p: any) => p.id === id);
          setPayment(p || null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:colors.deep, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontFamily:fonts.body, color:"rgba(255,255,255,0.4)" }}>Loading receipt...</div>
    </div>
  );

  if (!payment) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>❌</div>
        <div style={{ fontFamily:fonts.heading, fontSize:16, color:colors.n700 }}>Receipt not found</div>
        <Link href="/dashboard/admin/fees" style={{ display:"block", marginTop:12, color:colors.primary, fontFamily:fonts.heading }}>← Back</Link>
      </div>
    </div>
  );

  const isPaid   = payment.status === "PAID";
  const method   = METHOD_LABELS[payment.paymentMethod] || METHOD_LABELS.CASH;
  const issuedAt = new Date(payment.createdAt).toLocaleDateString("en-PK", { day:"numeric", month:"long", year:"numeric" });
  const issuedTime = new Date(payment.createdAt).toLocaleTimeString("en-PK", { hour:"2-digit", minute:"2-digit" });

  const STATUS_COLORS: Record<string,{color:string;bg:string;label:string}> = {
    PAID:    {color:"#166534", bg:"#dcfce7", label:"PAID IN FULL"},
    PARTIAL: {color:"#d97706", bg:"#fffbeb", label:"PARTIAL PAYMENT"},
    PENDING: {color:"#dc2626", bg:"#fef2f2", label:"PAYMENT PENDING"},
    WAIVED:  {color:"#7c3aed", bg:"#f5f3ff", label:"WAIVED"},
  };
  const sc = STATUS_COLORS[payment.status] || STATUS_COLORS.PENDING;

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          #receipt { box-shadow: none !important; margin: 0 !important; }
        }
      `}</style>

      {/* Toolbar */}
      <div className="no-print" style={{ background:"#1a1a1a", padding:"12px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Link href="/dashboard/admin/fees" style={{ color:"#888", textDecoration:"none", fontFamily:"monospace", fontSize:13 }}>← Back to Fees</Link>
        <button onClick={()=>window.print()} style={{ padding:"9px 20px", borderRadius:8, background:"#4ade80", color:"#1a1a1a", fontSize:12, fontWeight:700, border:"none", cursor:"pointer", fontFamily:"monospace" }}>
          🖨️ Print / Save PDF
        </button>
      </div>

      {/* Receipt */}
      <div style={{ minHeight:"100vh", background:"#f0f0f0", display:"flex", justifyContent:"center", padding:"32px 20px" }}>
        <div id="receipt" style={{ width:480, background:"white", boxShadow:"0 4px 24px rgba(0,0,0,0.12)", borderRadius:4 }}>

          {/* Header */}
          <div style={{ background:colors.primary, padding:"20px 24px", textAlign:"center" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontWeight:700, color:"white", letterSpacing:2 }}>
              {payment.student?.campus?.institution?.name || "Al-Noor Hifz Institute"}
            </div>
            {payment.student?.campus?.institution?.city && (
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"rgba(255,255,255,0.6)", marginTop:2 }}>
                {payment.student.campus.institution.city}
              </div>
            )}
            <div style={{ fontFamily:"monospace", fontSize:11, color:"rgba(255,255,255,0.5)", marginTop:6, letterSpacing:1 }}>FEE RECEIPT</div>
          </div>

          {/* Status badge */}
          <div style={{ background:sc.bg, padding:"8px 24px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color:sc.color, letterSpacing:1 }}>
              {sc.label}
            </span>
            <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:700, color:sc.color }}>{payment.receiptNumber}</span>
          </div>

          {/* Student info */}
          <div style={{ padding:"18px 24px", borderBottom:"1px solid #f0f0f0" }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:10, color:"#aaa", letterSpacing:2, marginBottom:4 }}>STUDENT</div>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:20, fontWeight:700, color:"#1a1a1a" }}>{payment.student?.name}</div>
            <div style={{ fontFamily:"monospace", fontSize:11, color:"#888", marginTop:2 }}>{payment.student?.enrollmentNumber} · {payment.student?.program}</div>
          </div>

          {/* Payment details */}
          <div style={{ padding:"18px 24px" }}>
            {[
              { label:"Fee Month",        val:`${MONTHS_FULL[payment.month]} ${payment.year}` },
              { label:"Fee Type",         val:payment.feeStructure?.name || "Monthly Fee" },
              { label:"Payment Method",   val:`${method.icon} ${method.label}` },
              { label:"Payment Date",     val:issuedAt },
              { label:"Issued At",        val:issuedTime },
              { label:"Collected By",     val:payment.collectedBy?.name || "Admin" },
            ].map((s,i,arr)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:i<arr.length-1?"1px solid #f8f8f8":"none" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"#888" }}>{s.label}</span>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, fontWeight:600, color:"#1a1a1a" }}>{s.val}</span>
              </div>
            ))}
          </div>

          {/* Amount breakdown */}
          <div style={{ margin:"0 24px", background:"#f8f8f8", borderRadius:8, padding:"16px" }}>
            {[
              { label:"Fee Amount",        val:payment.amount,        color:"#1a1a1a",        bold:false },
              ...(payment.discountAmount>0 ? [{ label:"Discount / Scholarship", val:-payment.discountAmount, color:"#7c3aed", bold:false }] : []),
              { label:"Amount Paid",       val:payment.paidAmount,    color:colors.primary,  bold:true  },
              ...(payment.paidAmount < (payment.amount - (payment.discountAmount||0)) ? [{ label:"Balance Due", val:(payment.amount-(payment.discountAmount||0)-payment.paidAmount), color:"#dc2626", bold:true }] : []),
            ].map((s:any,i)=>(
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"4px 0" }}>
                <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"#888" }}>{s.label}</span>
                <span style={{ fontFamily:"monospace", fontSize:14, fontWeight:s.bold?700:400, color:s.color }}>
                  {s.val < 0 ? `- PKR ${Math.abs(s.val).toLocaleString()}` : `PKR ${s.val.toLocaleString()}`}
                </span>
              </div>
            ))}
            <div style={{ borderTop:"1px solid #e0e0e0", marginTop:8, paddingTop:8, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:15, fontWeight:700 }}>TOTAL PAID</span>
              <span style={{ fontFamily:"monospace", fontSize:18, fontWeight:700, color:colors.primary }}>PKR {payment.paidAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Notes */}
          {payment.notes && (
            <div style={{ padding:"12px 24px 0" }}>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:11, color:"#aaa", marginBottom:2 }}>NOTES</div>
              <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:13, color:"#555" }}>{payment.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div style={{ padding:"20px 24px", textAlign:"center", borderTop:"1px solid #f0f0f0", marginTop:20 }}>
            <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:11, color:"#aaa", letterSpacing:1, marginBottom:4 }}>
              THANK YOU — جزاكم الله خيراً
            </div>
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#ccc" }}>
              HifzPro · www.hifzpro.com · {payment.receiptNumber}
            </div>
          </div>

          {/* Signature lines */}
          <div style={{ padding:"0 24px 24px", display:"flex", gap:40, justifyContent:"center" }}>
            {["Received By","Authorized By"].map((label,i)=>(
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ height:30 }}/>
                <div style={{ width:120, borderTop:"1px solid #ddd", paddingTop:4 }}>
                  <div style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:11, color:"#aaa" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
