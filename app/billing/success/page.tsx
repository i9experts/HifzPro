"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

function BillingSuccessContent() {
  const params  = useSearchParams();
  const session = params.get("session_id");
  const [sub, setSub] = useState<any>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then(r => r.json())
      .then(d => { if (d.success) setSub(d.data); });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#050D0A,#052e16)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 24, padding: "48px 40px", maxWidth: 480, width: "100%", textAlign: "center" }}>

        {/* Success animation */}
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(16,185,129,0.15)", border: "2px solid #10B981", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 36 }}>
          ✅
        </div>

        <div style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 3, color: "#10B981", marginBottom: 8 }}>SUBSCRIPTION ACTIVATED</div>
        <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: "white", margin: "0 0 12px" }}>JazakAllah Khair!</h1>
        <div style={{ fontFamily: "Scheherazade New,serif", fontSize: 20, color: "#C4882A", marginBottom: 16, opacity: 0.85 }}>
          جزاك اللهُ خيراً
        </div>
        <p style={{ fontFamily: fonts.body, fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 28 }}>
          Your HifzPro subscription is now active. All features are unlocked and your institution's dashboard is ready.
        </p>

        {sub && (
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 20px", marginBottom: 28, textAlign: "left" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Plan</span>
              <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: "white" }}>{sub.plan}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Billing</span>
              <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: "white" }}>{sub.billingCycle}</span>
            </div>
            {sub.nextBillingAt && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Next billing</span>
                <span style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color: "#10B981" }}>
                  {new Date(sub.nextBillingAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              </div>
            )}
          </div>
        )}

        <Link href="/dashboard/admin" style={{ display: "block", padding: "14px", borderRadius: 12, background: "#10B981", color: "#050D0A", fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 12 }}>
          Go to Dashboard →
        </Link>
        <Link href="/billing" style={{ display: "block", padding: "12px", borderRadius: 12, background: "transparent", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
          View Billing Details
        </Link>
      </div>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#050D0A,#052e16)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14 }}>Loading...</div>
      </div>
    }>
      <BillingSuccessContent />
    </Suspense>
  );
}
