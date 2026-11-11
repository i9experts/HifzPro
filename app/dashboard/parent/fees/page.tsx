"use client";
import { useState, useEffect } from "react";
import { useParent } from "../layout";
import { colors, fonts } from "@/lib/tokens";

interface Payment {
  id: string; amount: number; paidAmount: number; discountAmount: number; balance: number;
  status: string; month: number; year: number; paymentMethod: string | null; paymentDate: string | null;
  receiptNumber: string; feeStructure: { name: string; feeType: string } | null;
}
interface Scholarship { name: string; type: string; percentage: number | null; fixedAmount: number | null; reason: string | null; }

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];
const STATUS_INFO: Record<string,{label:string;color:string;bg:string}> = {
  PAID:    { label:"Paid",    color:colors.successText, bg:colors.successBg },
  PARTIAL: { label:"Partial", color:colors.warningText, bg:colors.warningBg },
  PENDING: { label:"Pending", color:"#d97706",          bg:"#fffbeb" },
  OVERDUE: { label:"Overdue", color:colors.errorText,   bg:colors.errorBg },
  WAIVED:  { label:"Waived",  color:"#7c3aed",          bg:"#f5f3ff" },
};
const METHOD_LABELS: Record<string,string> = {
  CASH:"Cash", BANK_TRANSFER:"Bank Transfer", JAZZCASE:"JazzCash", EASYPAISA:"EasyPaisa", CHEQUE:"Cheque", ONLINE:"Online", OTHER:"Other",
};

function PKR(n: number) { return `PKR ${n.toLocaleString("en-PK")}`; }

function scholarshipLabel(sch: Scholarship): string {
  if (sch.type === "FULL") return "Full Scholarship";
  if (sch.type === "PARTIAL_PERCENT") return `${sch.percentage}% Off`;
  if (sch.type === "PARTIAL_AMOUNT") return `${PKR(sch.fixedAmount || 0)} Off`;
  return sch.type;
}

export default function ParentFeesPage() {
  const { student, loading: parentLoading } = useParent();
  const [payments,    setPayments]    = useState<Payment[]>([]);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");

  useEffect(() => {
    if (!student?.id) return;
    setLoading(true);
    fetch(`/api/parent/fees?studentId=${student.id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setPayments(d.data.payments);
          setScholarship(d.data.scholarship);
          setTotalOutstanding(d.data.summary.totalOutstanding);
        } else setError(d.error || "Failed to load fee history");
      })
      .catch(() => setError("Failed to load fee history"))
      .finally(() => setLoading(false));
  }, [student?.id]);

  if (parentLoading) return <div style={{ padding:40, textAlign:"center", color:colors.n400, fontFamily:fonts.body }}>Loading...</div>;
  if (!student) return null;

  return (
    <div style={{ padding:"16px" }}>
      {/* Header */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:fonts.mono, fontSize:9, letterSpacing:2, color:colors.gold, marginBottom:4 }}>فیس · FEES</div>
        <div style={{ fontFamily:fonts.display, fontSize:"1.4rem", fontWeight:700, color:colors.n800 }}>Fee History</div>
        <div style={{ fontFamily:fonts.body, fontSize:12, color:colors.n500 }}>{student.name}'s payment history & balance</div>
      </div>

      {/* Outstanding balance hero */}
      <div style={{
        background: totalOutstanding > 0 ? `linear-gradient(135deg,#7f1d1d,#991b1b)` : `linear-gradient(135deg,${colors.deep},${colors.primary})`,
        borderRadius:20, padding:20, marginBottom:16,
      }}>
        <div style={{ fontFamily:fonts.mono, fontSize:8, color:"rgba(255,255,255,0.5)", letterSpacing:2, marginBottom:8 }}>
          {totalOutstanding > 0 ? "OUTSTANDING BALANCE" : "ACCOUNT STATUS"}
        </div>
        <div style={{ fontFamily:fonts.heading, fontSize:32, fontWeight:700, color:"white" }}>
          {totalOutstanding > 0 ? PKR(totalOutstanding) : "✅ All Paid Up"}
        </div>
        {totalOutstanding > 0 && (
          <div style={{ fontFamily:fonts.body, fontSize:12, color:"rgba(255,255,255,0.7)", marginTop:6 }}>
            Please contact the office to settle this balance
          </div>
        )}
      </div>

      {/* Scholarship */}
      {scholarship && (
        <div style={{ background:"#f5f3ff", borderRadius:14, padding:16, border:"1px solid #ddd6fe", marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:"#6d28d9" }}>🎓 {scholarship.name}</div>
              {scholarship.reason && <div style={{ fontFamily:fonts.body, fontSize:11, color:"#7c3aed", marginTop:2 }}>{scholarship.reason}</div>}
            </div>
            <div style={{ fontFamily:fonts.heading, fontSize:14, fontWeight:700, color:"#6d28d9" }}>{scholarshipLabel(scholarship)}</div>
          </div>
        </div>
      )}

      {error && <div style={{ background:colors.errorBg, borderRadius:10, padding:"10px 14px", marginBottom:16, color:colors.errorText, fontFamily:fonts.body, fontSize:12 }}>{error}</div>}

      {/* Payment history */}
      <div style={{ background:colors.white, borderRadius:16, padding:16, border:`1px solid ${colors.n200}` }}>
        <div style={{ fontFamily:fonts.heading, fontSize:13, fontWeight:700, color:colors.n800, marginBottom:4 }}>🧾 Payment History</div>
        <div style={{ fontFamily:fonts.body, fontSize:11, color:colors.n500, marginBottom:12 }}>Every fee payment recorded for {student.name}</div>

        {loading ? (
          <div style={{ textAlign:"center", padding:24, color:colors.n400, fontFamily:fonts.body, fontSize:12 }}>Loading...</div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign:"center", padding:24, color:colors.n400, fontFamily:fonts.body, fontSize:12 }}>No fee payments recorded yet</div>
        ) : (
          payments.map((p, i) => {
            const st = STATUS_INFO[p.status] || STATUS_INFO.PENDING;
            return (
              <div key={p.id} style={{ padding:"12px 0", borderBottom:i<payments.length-1?`1px solid ${colors.n100}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                  <div>
                    <div style={{ fontFamily:fonts.heading, fontSize:12, fontWeight:700, color:colors.n800 }}>
                      {p.feeStructure?.name || "Fee"} · {MONTHS[p.month]} {p.year}
                    </div>
                    <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.n400, marginTop:2 }}>{p.receiptNumber}</div>
                  </div>
                  <span style={{ background:st.bg, color:st.color, padding:"3px 9px", borderRadius:6, fontSize:9, fontFamily:fonts.mono, fontWeight:700, flexShrink:0 }}>{st.label}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:8 }}>
                  <div style={{ fontFamily:fonts.body, fontSize:10, color:colors.n500 }}>
                    {p.paymentDate && new Date(p.paymentDate).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}
                    {p.paymentMethod && ` · ${METHOD_LABELS[p.paymentMethod] || p.paymentMethod}`}
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:fonts.mono, fontSize:13, fontWeight:700, color:colors.n800 }}>{PKR(p.paidAmount)}</div>
                    {p.discountAmount > 0 && <div style={{ fontFamily:fonts.mono, fontSize:9, color:"#7c3aed" }}>−{PKR(p.discountAmount)} discount</div>}
                    {p.balance > 0 && <div style={{ fontFamily:fonts.mono, fontSize:9, color:colors.errorText }}>{PKR(p.balance)} due</div>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
