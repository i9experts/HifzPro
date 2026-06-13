"use client";
// app/dashboard/admin/finance/export/page.tsx
// HifzPro Finance Data Bridge — ERP Export Module

import { useState } from "react";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

const EMERALD = "#0D5C3A";
const GOLD    = "#C4882A";

// ─── Types ───────────────────────────────────────────────────
type ExportType   = "fee_collection" | "outstanding" | "scholarships" | "student_ledger" | "journal_entries";
type ExportFormat = "csv" | "excel" | "json";
type ERPTarget    = "generic" | "erpnext" | "tally" | "peachtree";

interface ExportConfig {
  type:   ExportType;
  format: ExportFormat;
  erp:    ERPTarget;
  from:   string;
  to:     string;
}

// ─── Constants ───────────────────────────────────────────────
const EXPORT_TYPES: { id: ExportType; icon: string; title: string; desc: string; color: string }[] = [
  {
    id: "fee_collection", icon: "💰", title: "Fee Collection",
    desc: "All paid fees within the date range — receipts, amounts, payment methods",
    color: "#166534",
  },
  {
    id: "outstanding", icon: "⏳", title: "Outstanding Dues",
    desc: "Pending and overdue fee records — follow up list for accountant",
    color: "#92400e",
  },
  {
    id: "scholarships", icon: "🎓", title: "Scholarship Ledger",
    desc: "All active scholarships, coverage amounts, donor details",
    color: "#6d28d9",
  },
  {
    id: "student_ledger", icon: "📒", title: "Student Ledger",
    desc: "Per-student summary — total fees, paid, discounts, outstanding balance",
    color: "#0369a1",
  },
  {
    id: "journal_entries", icon: "📋", title: "Journal Entries",
    desc: "Double-entry bookkeeping format — debit/credit ready for any accounting system",
    color: "#0f766e",
  },
];

const ERP_TARGETS: { id: ERPTarget; name: string; logo: string; desc: string }[] = [
  { id: "generic",   name: "Generic CSV/Excel", logo: "📊", desc: "Standard format — works with any software or spreadsheet" },
  { id: "erpnext",   name: "ERPNext",           logo: "🔷", desc: "Column names match ERPNext Sales Invoice & Journal Entry import" },
  { id: "tally",     name: "Tally Prime",       logo: "🟦", desc: "Ledger and voucher format compatible with Tally import" },
  { id: "peachtree", name: "Peachtree / Sage",  logo: "🍑", desc: "Transaction format for Peachtree/Sage 50 import" },
];

const FORMAT_OPTIONS: { id: ExportFormat; label: string; ext: string; desc: string }[] = [
  { id: "csv",   label: "CSV",   ext: ".csv", desc: "Universal — opens in Excel, Google Sheets, any ERP" },
  { id: "excel", label: "Excel", ext: ".xls", desc: "Opens directly in Microsoft Excel with correct encoding" },
  { id: "json",  label: "JSON",  ext: ".json", desc: "For developers — API-ready structured data" },
];

// ─── Helpers ─────────────────────────────────────────────────
function getMonthRange(monthsAgo: number) {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const from = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-01`;
  const last = new Date(d.getFullYear(), d.getMonth()+1, 0);
  const to   = `${last.getFullYear()}-${String(last.getMonth()+1).padStart(2,"0")}-${String(last.getDate()).padStart(2,"0")}`;
  return { from, to };
}

const QUICK_RANGES = [
  { label: "This Month",     ...getMonthRange(0) },
  { label: "Last Month",     ...getMonthRange(1) },
  { label: "Last 3 Months",  from: getMonthRange(2).from, to: getMonthRange(0).to },
  { label: "This Year",      from: `${new Date().getFullYear()}-01-01`, to: new Date().toISOString().split("T")[0] },
];

// ─── Main Page ────────────────────────────────────────────────
export default function FinanceExportPage() {
  const today = new Date().toISOString().split("T")[0];
  const firstOfMonth = `${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,"0")}-01`;

  const [config, setConfig] = useState<ExportConfig>({
    type: "fee_collection", format: "excel", erp: "generic",
    from: firstOfMonth, to: today,
  });
  const [exporting,  setExporting]  = useState(false);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [error,      setError]      = useState("");

  const set = (key: keyof ExportConfig, val: any) =>
    setConfig(prev => ({ ...prev, [key]: val }));

  const handleExport = async () => {
    setExporting(true); setError("");
    try {
      const params = new URLSearchParams({
        type:   config.type,
        format: config.format,
        erp:    config.erp,
        from:   config.from,
        to:     config.to,
      });

      const res = await fetch(`/api/admin/finance/export?${params}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data?.error || `Export failed (HTTP ${res.status})`);
        return;
      }

      // Trigger browser download
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      const cd   = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="(.+?)"/);
      a.href     = url;
      a.download = match?.[1] ?? `HifzPro_export.${config.format === "excel" ? "xls" : config.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastExport(new Date().toLocaleString("en-PK"));
    } catch (err) {
      setError("Network error — please try again.");
    } finally {
      setExporting(false);
    }
  };

  const selectedType = EXPORT_TYPES.find(t => t.id === config.type)!;
  const selectedERP  = ERP_TARGETS.find(e => e.id === config.erp)!;

  const inp = {
    padding: "9px 12px", border: `1.5px solid ${colors.n200}`,
    borderRadius: 8, fontSize: 13, fontFamily: fonts.body,
    color: colors.n800, outline: "none", width: "100%",
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>
      {/* Nav */}
      <nav style={{ background: EMERALD, padding: "0 24px", height: 60, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 50, boxShadow: "0 2px 12px rgba(0,0,0,0.2)" }}>
        <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", fontSize: 16 }}>←</Link>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, fontWeight: 700, color: "white", lineHeight: 1 }}>Finance Data Bridge</div>
          <div style={{ fontFamily: "monospace", fontSize: 7, color: GOLD, letterSpacing: 2 }}>ERP EXPORT · ERPNext · Tally · Peachtree · Generic</div>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px", display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}>

        {/* ── Left: configuration ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Export type */}
          <Section title="📦 What to Export">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {EXPORT_TYPES.map(t => (
                <button key={t.id} onClick={() => set("type", t.id)}
                  style={{
                    padding: 14, borderRadius: 12, textAlign: "left", cursor: "pointer",
                    border: `2px solid ${config.type === t.id ? t.color : colors.n200}`,
                    background: config.type === t.id ? `${t.color}10` : "white",
                    transition: "all 0.15s",
                  }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: config.type === t.id ? t.color : colors.n800 }}>{t.title}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, marginTop: 4, lineHeight: 1.5 }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Target ERP */}
          <Section title="🔌 Target ERP / System">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {ERP_TARGETS.map(e => (
                <button key={e.id} onClick={() => set("erp", e.id)}
                  style={{
                    padding: 14, borderRadius: 12, textAlign: "left", cursor: "pointer",
                    border: `2px solid ${config.erp === e.id ? EMERALD : colors.n200}`,
                    background: config.erp === e.id ? "#f0f9f4" : "white",
                    transition: "all 0.15s",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 20 }}>{e.logo}</span>
                    <span style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: config.erp === e.id ? EMERALD : colors.n800 }}>{e.name}</span>
                  </div>
                  <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500, lineHeight: 1.5 }}>{e.desc}</div>
                </button>
              ))}
            </div>
          </Section>

          {/* Date range */}
          <Section title="📅 Date Range">
            {/* Quick range buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
              {QUICK_RANGES.map(r => (
                <button key={r.label}
                  onClick={() => { set("from", r.from); set("to", r.to); }}
                  style={{
                    padding: "6px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                    border: `1.5px solid ${config.from === r.from && config.to === r.to ? EMERALD : colors.n200}`,
                    background: config.from === r.from && config.to === r.to ? "#f0f9f4" : "white",
                    color: config.from === r.from && config.to === r.to ? EMERALD : colors.n600,
                    fontFamily: fonts.heading, fontWeight: 600,
                  }}>
                  {r.label}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: colors.n700, fontFamily: fonts.heading, marginBottom: 4 }}>From</label>
                <input type="date" value={config.from} onChange={e => set("from", e.target.value)} style={inp}/>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: colors.n700, fontFamily: fonts.heading, marginBottom: 4 }}>To</label>
                <input type="date" value={config.to} onChange={e => set("to", e.target.value)} style={inp}/>
              </div>
            </div>
          </Section>

          {/* Format */}
          <Section title="💾 File Format">
            <div style={{ display: "flex", gap: 10 }}>
              {FORMAT_OPTIONS.map(f => (
                <button key={f.id} onClick={() => set("format", f.id)}
                  style={{
                    flex: 1, padding: "12px 8px", borderRadius: 10, cursor: "pointer",
                    border: `2px solid ${config.format === f.id ? EMERALD : colors.n200}`,
                    background: config.format === f.id ? "#f0f9f4" : "white",
                    textAlign: "center",
                  }}>
                  <div style={{ fontFamily: fonts.mono, fontSize: 14, fontWeight: 700, color: config.format === f.id ? EMERALD : colors.n600, marginBottom: 2 }}>{f.ext}</div>
                  <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: config.format === f.id ? EMERALD : colors.n700 }}>{f.label}</div>
                  <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400, marginTop: 3, lineHeight: 1.4 }}>{f.desc}</div>
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* ── Right: summary + export button ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Export summary card */}
          <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, padding: 24, position: "sticky", top: 80 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 14, fontWeight: 700, color: colors.n800, marginBottom: 20 }}>Export Summary</div>

            {/* What */}
            <SummaryRow icon={selectedType.icon} label="Data" value={selectedType.title} color={selectedType.color}/>
            <SummaryRow icon={selectedERP.logo}  label="Target ERP" value={selectedERP.name} color={EMERALD}/>
            <SummaryRow icon="📅" label="Period" value={`${config.from} → ${config.to}`} color={colors.n600}/>
            <SummaryRow icon="💾" label="Format" value={FORMAT_OPTIONS.find(f=>f.id===config.format)?.label ?? config.format} color={colors.n600}/>

            <div style={{ height: 1, background: colors.n100, margin: "16px 0" }}/>

            {error && (
              <div style={{ background: "#FDECEC", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                <div style={{ fontFamily: fonts.body, fontSize: 12, color: "#B91C1C" }}>⚠ {error}</div>
              </div>
            )}

            {lastExport && (
              <div style={{ background: "#E6F4EC", borderRadius: 8, padding: "10px 12px", marginBottom: 12 }}>
                <div style={{ fontFamily: fonts.body, fontSize: 11, color: EMERALD }}>✅ Last exported: {lastExport}</div>
              </div>
            )}

            <button onClick={handleExport} disabled={exporting}
              style={{
                width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
                background: exporting ? colors.n300 : EMERALD,
                color: "white", fontSize: 14, fontWeight: 700,
                cursor: exporting ? "not-allowed" : "pointer",
                fontFamily: fonts.heading, transition: "background 0.15s",
              }}>
              {exporting ? "Generating…" : `⬇ Export ${FORMAT_OPTIONS.find(f=>f.id===config.format)?.ext ?? ""}`}
            </button>

            <p style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n400, textAlign: "center", marginTop: 10 }}>
              File downloads automatically to your device
            </p>
          </div>

          {/* ERP import guides */}
          <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, padding: 20 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800, marginBottom: 14 }}>📖 Import Guide</div>
            {config.erp === "erpnext" && (
              <GuideSteps steps={[
                "Export as Excel from HifzPro",
                "In ERPNext → Accounts → Journal Entry → Import",
                "Upload the .xls file",
                "Map columns if prompted → Submit",
              ]}/>
            )}
            {config.erp === "tally" && (
              <GuideSteps steps={[
                "Export as CSV from HifzPro",
                "In Tally → Gateway → Import Data → Vouchers",
                "Select the CSV file",
                "Review ledger mapping → Accept",
              ]}/>
            )}
            {config.erp === "peachtree" && (
              <GuideSteps steps={[
                "Export as Excel from HifzPro",
                "In Peachtree → File → Select Import/Export",
                "Choose Sales Invoices → Import",
                "Map fields → Finish",
              ]}/>
            )}
            {config.erp === "generic" && (
              <GuideSteps steps={[
                "Export as Excel or CSV",
                "Open in Microsoft Excel or Google Sheets",
                "Copy/paste into your accounting software",
                "Or import directly via File → Import",
              ]}/>
            )}
          </div>

          {/* Tier 2 teaser */}
          <div style={{ background: `linear-gradient(135deg, ${EMERALD}, #065f46)`, borderRadius: 16, padding: 20 }}>
            <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: "white", marginBottom: 6 }}>
              🚀 Want automatic sync?
            </div>
            <div style={{ fontFamily: fonts.body, fontSize: 12, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 12 }}>
              Upgrade to Webhook Integration — HifzPro pushes every fee payment directly to your ERP in real time. Zero manual exports needed.
            </div>
            <div style={{ fontFamily: fonts.mono, fontSize: 10, color: GOLD, letterSpacing: 1 }}>COMING SOON — TIER 2</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: 16, border: `1px solid ${colors.n200}`, padding: 22 }}>
      <div style={{ fontFamily: fonts.heading, fontSize: 13, fontWeight: 700, color: colors.n800, marginBottom: 16 }}>{title}</div>
      {children}
    </div>
  );
}

function SummaryRow({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: colors.n400, letterSpacing: 1, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 700, color, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  );
}

function GuideSteps({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: EMERALD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, fontWeight: 700, color: "white" }}>{i+1}</span>
          </div>
          <div style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n600, lineHeight: 1.5 }}>{step}</div>
        </div>
      ))}
    </div>
  );
}
