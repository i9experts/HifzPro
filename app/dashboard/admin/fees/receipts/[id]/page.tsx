"use client";
// app/dashboard/admin/fees/receipts/[id]/page.tsx
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";
import { formatHijri } from "@/lib/hijri";

const MONTHS = ["","January","February","March","April","May","June","July","August","September","October","November","December"];

const METHOD_INFO: Record<string,{label:string;icon:string}> = {
  CASH:          { label:"Cash",          icon:"💵" },
  BANK_TRANSFER: { label:"Bank Transfer", icon:"🏦" },
  JAZZCASE:      { label:"JazzCash",      icon:"📱" },
  EASYPAISA:     { label:"EasyPaisa",     icon:"💚" },
  CHEQUE:        { label:"Cheque",        icon:"📄" },
  ONLINE:        { label:"Online",        icon:"🌐" },
  OTHER:         { label:"Other",         icon:"💳" },
};

const STATUS_INFO: Record<string,{label:string;labelUr:string;color:string;bg:string}> = {
  PAID:    { label:"PAID",    labelUr:"ادا شدہ",    color:"#166534", bg:"#dcfce7" },
  PARTIAL: { label:"PARTIAL", labelUr:"جزوی",       color:"#92400e", bg:"#fef3c7" },
  PENDING: { label:"PENDING", labelUr:"زیر التواء", color:"#1d4ed8", bg:"#eff6ff" },
  OVERDUE: { label:"OVERDUE", labelUr:"باقی",       color:"#991b1b", bg:"#fee2e2" },
};

const FEE_TYPE_LABELS: Record<string,string> = {
  TUITION:      "Tuition Fee",
  REGISTRATION: "Registration Fee",
  TRANSPORT:    "Transport Fee",
  HOSTEL:       "Hostel Fee",
  EXAM:         "Exam Fee",
  BOOKS:        "Books Fee",
  OTHER:        "Other Fee",
};

function PKR(n: number) { return `PKR ${n.toLocaleString("en-PK")}`; }

export default function FeeReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }    = use(params);
  const [data,    setData]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    fetch(`/api/admin/fees/payments/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setData(d.data.payment);
        else setError(d.error || "Payment not found");
      })
      .catch(() => setError("Failed to load receipt"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: fonts.body, color: colors.n400, fontSize: 14 }}>Loading receipt...</div>
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: "100vh", background: colors.n50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 16, color: colors.n700, marginBottom: 8 }}>{error || "Receipt not found"}</div>
        <Link href="/dashboard/admin/fees" style={{ color: colors.primary, fontFamily: fonts.heading, fontSize: 13 }}>← Back to Fees</Link>
      </div>
    </div>
  );

  const payment     = data;
  const student     = payment.student;
  const institution = student?.campus?.institution;
  const guardian    = student?.guardians?.[0];
  const method      = METHOD_INFO[payment.paymentMethod] || { label: payment.paymentMethod, icon: "💳" };
  const status      = STATUS_INFO[payment.status] || STATUS_INFO.PENDING;
  const balance     = payment.amount - payment.paidAmount - (payment.discountAmount || 0);
  const payDate     = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.createdAt);
  const hijriDate   = formatHijri(payDate, "ar");
  const gregDate    = payDate.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" });

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          .receipt-page { box-shadow: none !important; margin: 0 !important; }
          @page { margin: 10mm; size: A5; }
        }
        @media screen {
          body { background: #f0fdf4; }
        }
      `}</style>

      {/* Screen toolbar */}
      <div className="no-print" style={{ background: colors.deep, padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link href="/dashboard/admin/fees" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", fontSize: 16 }}>←</Link>
          <div>
            <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: "white" }}>Fee Receipt</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.gold, letterSpacing: 1 }}>{payment.receiptNumber}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => window.print()}
            style={{ padding: "8px 20px", borderRadius: 8, background: colors.gold, color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
            🖨️ Print / Save PDF
          </button>
          <button
            onClick={() => {
              // Share via WhatsApp
              const msg = `🧾 Fee Receipt\nStudent: ${student.name}\nReceipt: ${payment.receiptNumber}\nAmount: ${PKR(payment.paidAmount)}\nMonth: ${MONTHS[payment.month]} ${payment.year}\nStatus: ${status.label}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
            }}
            style={{ padding: "8px 16px", borderRadius: 8, background: "#16a34a", color: "white", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: fonts.heading }}>
            💬 Share
          </button>
        </div>
      </div>

      {/* Receipt */}
      <div style={{ padding: "24px 16px", display: "flex", justifyContent: "center", minHeight: "calc(100vh - 57px)" }}>
        <div
          className="receipt-page"
          style={{
            width: "100%", maxWidth: 520,
            background: "white",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 4px 40px rgba(0,0,0,0.12)",
          }}>

          {/* Header */}
          <div style={{ background: "linear-gradient(135deg,#0D5C3A,#065f46)", padding: "20px 24px", position: "relative", overflow: "hidden" }}>
            {/* Islamic pattern */}
            <svg style={{ position: "absolute", right: -10, top: -10, opacity: 0.06 }} width="120" height="120" viewBox="0 0 80 80">
              {[0,1,2,3].map(i => <polygon key={i} points={`24,${4+i*5} ${56-i*5},4 76,${24+i*5} ${76-i*5},${56} ${56},${76-i*5} 24,${76-i*5} 4,${56-i*5} ${4+i*5},24`} fill="none" stroke="white" strokeWidth="0.5"/>)}
            </svg>

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 700, color: "white", lineHeight: 1 }}>
                    {institution?.name || "HifzPro Institute"}
                  </div>
                  {institution?.nameArabic && (
                    <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 13, color: "#C4882A", marginTop: 2 }}>
                      {institution.nameArabic}
                    </div>
                  )}
                  <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 2, marginTop: 4 }}>
                    FEE RECEIPT · رسید
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 14, color: "#C4882A" }}>{hijriDate}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>{gregDate}</div>
                </div>
              </div>

              {/* Receipt number + status */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, padding: "10px 14px", background: "rgba(255,255,255,0.08)", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)" }}>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.4)", letterSpacing: 1, marginBottom: 2 }}>RECEIPT NO.</div>
                  <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "white" }}>{payment.receiptNumber}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ background: status.bg, color: status.color, padding: "4px 12px", borderRadius: 20, fontSize: 10, fontFamily: "monospace", fontWeight: 700 }}>
                    {status.label}
                  </span>
                  <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 11, color: "#C4882A", marginTop: 3 }}>{status.labelUr}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Student info */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0fdf4", background: "#fafffe" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 2, marginBottom: 10 }}>STUDENT DETAILS · طالب علم</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Name",           value: student?.name },
                { label: "Enrollment No.", value: student?.enrollmentNumber, mono: true },
                { label: "Program",        value: student?.program },
                { label: "Batch / Halqa",  value: student?.batch?.name || "—" },
                { label: "Guardian",       value: guardian?.name || "—" },
                { label: "Phone",          value: guardian?.phone || "—", mono: true },
              ].map((f, i) => (
                <div key={i}>
                  <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 0.5, textTransform: "uppercase" }}>{f.label}</div>
                  <div style={{ fontFamily: f.mono ? "monospace" : fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800, marginTop: 1 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Fee details */}
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f0fdf4" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 2, marginBottom: 12 }}>FEE DETAILS · تفصیل</div>

            {/* Fee period */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #e5e7eb" }}>
              <div>
                <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800 }}>
                  {payment.feeStructure?.name || "Monthly Fee"}
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n500, marginTop: 1 }}>
                  {FEE_TYPE_LABELS[payment.feeStructure?.feeType] || "Fee"} · {MONTHS[payment.month]} {payment.year}
                </div>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: colors.n800 }}>
                {PKR(payment.amount)}
              </div>
            </div>

            {/* Discount if any */}
            {payment.discountAmount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px dashed #e5e7eb" }}>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: "#7c3aed" }}>🎓 Scholarship / Discount</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: "#7c3aed" }}>— {PKR(payment.discountAmount)}</div>
              </div>
            )}

            {/* Amount paid */}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px dashed #e5e7eb" }}>
              <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.successText }}>Amount Paid · ادا شدہ رقم</div>
              <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 800, color: colors.successText }}>{PKR(payment.paidAmount)}</div>
            </div>

            {/* Balance if partial */}
            {balance > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0" }}>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.errorText }}>⚠️ Remaining Balance · باقی رقم</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: colors.errorText }}>{PKR(Math.max(0, balance))}</div>
              </div>
            )}
          </div>

          {/* Payment info */}
          <div style={{ padding: "14px 24px", borderBottom: "1px solid #f0fdf4", background: "#fafffe" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 1 }}>METHOD</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800, marginTop: 2 }}>
                  {method.icon} {method.label}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 1 }}>DATE</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800, marginTop: 2 }}>
                  {payDate.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              </div>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 1 }}>COLLECTED BY</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800, marginTop: 2 }}>
                  {payment.collectedBy?.name || "Admin"}
                </div>
              </div>
            </div>
            {payment.notes && (
              <div style={{ marginTop: 10, padding: "8px 10px", background: colors.n100, borderRadius: 6 }}>
                <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n400, letterSpacing: 1, marginBottom: 2 }}>NOTES</div>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n600 }}>{payment.notes}</div>
              </div>
            )}
          </div>

          {/* Amount in words */}
          <div style={{ padding: "12px 24px", borderBottom: "1px solid #f0fdf4", background: "#f0fdf4" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: colors.n500, letterSpacing: 1, marginBottom: 4 }}>AMOUNT IN WORDS</div>
            <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.primary, fontStyle: "italic" }}>
              {numberToWords(payment.paidAmount)} Rupees Only
            </div>
          </div>

          {/* Signature line */}
          <div style={{ padding: "16px 24px 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <div style={{ borderTop: "1.5px solid #374151", paddingTop: 6, textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: colors.n500, letterSpacing: 1 }}>RECEIVED BY · وصول کنندہ</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 11, color: colors.n700, marginTop: 3 }}>{payment.collectedBy?.name || "Admin"}</div>
              </div>
            </div>
            <div>
              <div style={{ borderTop: "1.5px solid #374151", paddingTop: 6, textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: colors.n500, letterSpacing: 1 }}>PARENT / GUARDIAN · والدین</div>
                <div style={{ fontFamily: fonts.heading, fontSize: 11, color: colors.n700, marginTop: 3 }}>{guardian?.name || ""}</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ background: colors.deep, padding: "10px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
              HIFZPRO · WWW.HIFZPRO.COM
            </div>
            <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 12, color: "#C4882A", opacity: 0.7 }}>
              جزاك اللهُ خيراً
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 8, color: "rgba(255,255,255,0.3)", letterSpacing: 1 }}>
              {payment.receiptNumber}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Simple number to words (PKR amounts) ──
function numberToWords(num: number): string {
  const n = Math.round(num);
  if (n === 0) return "Zero";

  const ones  = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens  = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  function below100(n: number): string {
    if (n < 20) return ones[n];
    return tens[Math.floor(n/10)] + (n%10 ? " " + ones[n%10] : "");
  }
  function below1000(n: number): string {
    if (n < 100) return below100(n);
    return ones[Math.floor(n/100)] + " Hundred" + (n%100 ? " " + below100(n%100) : "");
  }

  if (n < 1000)        return below1000(n);
  if (n < 100000)      return below1000(Math.floor(n/1000)) + " Thousand" + (n%1000 ? " " + below1000(n%1000) : "");
  if (n < 10000000)    return below1000(Math.floor(n/100000)) + " Lakh" + (n%100000 ? " " + numberToWords(n%100000) : "");
  return below1000(Math.floor(n/10000000)) + " Crore" + (n%10000000 ? " " + numberToWords(n%10000000) : "");
}
