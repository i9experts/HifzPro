// ============================================================
// app/admin/settings/whatsapp/page.tsx
// Admin UI: connect the institute's own WhatsApp number.
// Emerald Manuscript theme (#0D5C3A primary, #C4882A gold).
// Tailwind, client component, no external deps.
// ============================================================

"use client";

import { useEffect, useState } from "react";

type Provider = "ultramsg" | "meta";

interface WhatsAppConfigDto {
  provider: Provider;
  instanceId: string | null;
  apiToken: string | null; // masked from API
  phoneNumberId: string | null;
  wabaId: string | null;
  displayNumber: string;
  status: "pending" | "connected" | "disabled";
  lastTestedAt: string | null;
}

const EMERALD = "#0D5C3A";
const GOLD = "#C4882A";

export default function WhatsAppSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [provider, setProvider] = useState<Provider>("ultramsg");
  const [displayNumber, setDisplayNumber] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [apiToken, setApiToken] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [wabaId, setWabaId] = useState("");

  const [status, setStatus] = useState<string>("none");
  const [lastTestedAt, setLastTestedAt] = useState<string | null>(null);
  const [testNumber, setTestNumber] = useState("");

  const [banner, setBanner] = useState<{
    kind: "success" | "error" | "info";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/whatsapp")
      .then((r) => r.json())
      .then((json) => {
        const data = json?.data ?? json; // tolerate { success, data } wrapper
        const cfg: WhatsAppConfigDto | null = data?.config ?? null;
        if (cfg) {
          setProvider(cfg.provider);
          setDisplayNumber(cfg.displayNumber || "");
          setInstanceId(cfg.instanceId || "");
          setApiToken(cfg.apiToken || "");
          setPhoneNumberId(cfg.phoneNumberId || "");
          setWabaId(cfg.wabaId || "");
          setStatus(cfg.status);
          setLastTestedAt(cfg.lastTestedAt);
        }
      })
      .catch(() => setBanner({ kind: "error", text: "Failed to load WhatsApp settings." }))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setBanner(null);
    try {
      const res = await fetch("/api/admin/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          displayNumber,
          instanceId,
          apiToken,
          phoneNumberId,
          wabaId,
        }),
      });
      const json = await res.json();
      const data = json?.data ?? json; // tolerate { success, data } wrapper
      if (!res.ok) {
        setBanner({ kind: "error", text: json?.error || json?.message || "Failed to save settings." });
      } else {
        setStatus(data.status);
        if (data.status === "connected") {
          setBanner({
            kind: "success",
            text: "✅ Number connected successfully! Send a test message below to confirm delivery.",
          });
        } else {
          setBanner({
            kind: "info",
            text:
              data.verifyError ||
              "Settings saved, but the number is not verified yet.",
          });
        }
      }
    } catch {
      setBanner({ kind: "error", text: "Network error while saving." });
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!testNumber.trim()) {
      setBanner({ kind: "error", text: "Enter a recipient number for the test message." });
      return;
    }
    setTesting(true);
    setBanner(null);
    try {
      const res = await fetch("/api/admin/whatsapp/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: testNumber }),
      });
      const json = await res.json();
      const data = json?.data ?? json; // tolerate { success, data } wrapper
      if (res.ok && (data?.ok || json?.success)) {
        setStatus("connected");
        setLastTestedAt(new Date().toISOString());
        setBanner({
          kind: "success",
          text: `✅ Test message sent via ${data.provider}. Check WhatsApp on ${testNumber}.`,
        });
      } else {
        setBanner({ kind: "error", text: json?.error || json?.message || data?.error || "Test message failed." });
      }
    } catch {
      setBanner({ kind: "error", text: "Network error while sending test." });
    } finally {
      setTesting(false);
    }
  }

  const statusBadge = {
    connected: { label: "Connected", bg: "#E6F4EC", color: EMERALD, dot: "#16A34A" },
    pending: { label: "Pending verification", bg: "#FBF3E4", color: GOLD, dot: GOLD },
    disabled: { label: "Disabled", bg: "#FDECEC", color: "#B91C1C", dot: "#DC2626" },
    none: { label: "Not configured", bg: "#F3F4F6", color: "#6B7280", dot: "#9CA3AF" },
  }[status as "connected" | "pending" | "disabled" | "none"] ?? {
    label: status,
    bg: "#F3F4F6",
    color: "#6B7280",
    dot: "#9CA3AF",
  };

  if (loading) {
    return (
      <div className="p-8 text-gray-500">Loading WhatsApp settings…</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: EMERALD }}>
            WhatsApp Connection
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Connect your institute&apos;s own WhatsApp number to send attendance,
            fee, and progress notifications to parents.
          </p>
        </div>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
          style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusBadge.dot }}
          />
          {statusBadge.label}
        </span>
      </div>

      {/* Banner */}
      {banner && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{
            backgroundColor:
              banner.kind === "success"
                ? "#E6F4EC"
                : banner.kind === "error"
                ? "#FDECEC"
                : "#FBF3E4",
            color:
              banner.kind === "success"
                ? EMERALD
                : banner.kind === "error"
                ? "#B91C1C"
                : "#92660F",
          }}
        >
          {banner.text}
        </div>
      )}

      {/* Provider card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connection method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setProvider("ultramsg")}
              className="text-left rounded-lg border-2 p-4 transition"
              style={{
                borderColor: provider === "ultramsg" ? EMERALD : "#E5E7EB",
                backgroundColor: provider === "ultramsg" ? "#F0F9F4" : "white",
              }}
            >
              <div className="font-semibold text-gray-800">QR Link (UltraMsg)</div>
              <div className="text-xs text-gray-500 mt-1">
                Quick setup — scan a QR code with the institute&apos;s WhatsApp.
                Live in minutes.
              </div>
            </button>
            <button
              type="button"
              onClick={() => setProvider("meta")}
              className="text-left rounded-lg border-2 p-4 transition"
              style={{
                borderColor: provider === "meta" ? EMERALD : "#E5E7EB",
                backgroundColor: provider === "meta" ? "#F0F9F4" : "white",
              }}
            >
              <div className="font-semibold text-gray-800">
                Official API (Meta){" "}
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1 align-middle"
                  style={{ backgroundColor: "#FBF3E4", color: GOLD }}
                >
                  RECOMMENDED FOR SCALE
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                WhatsApp Business Cloud API — requires Meta business setup.
              </div>
            </button>
          </div>
        </div>

        {/* Display number (both providers) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Institute WhatsApp number
          </label>
          <input
            type="text"
            value={displayNumber}
            onChange={(e) => setDisplayNumber(e.target.value)}
            placeholder="+92 300 1234567"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
          />
          <p className="text-xs text-gray-400 mt-1">
            The number parents will receive messages from.
          </p>
        </div>

        {/* UltraMsg fields */}
        {provider === "ultramsg" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance ID
              </label>
              <input
                type="text"
                value={instanceId}
                onChange={(e) => setInstanceId(e.target.value)}
                placeholder="instance123456"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <input
                type="text"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="UltraMsg token"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
              <strong>Setup:</strong> Create an instance at ultramsg.com → open
              its dashboard → scan the QR code with the institute&apos;s WhatsApp
              app → paste the Instance ID and Token here → Save. The connection
            is verified automatically.
            </div>
          </div>
        )}

        {/* Meta fields */}
        {provider === "meta" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number ID
              </label>
              <input
                type="text"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                placeholder="1234567890123456"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                WABA ID <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                placeholder="WhatsApp Business Account ID"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Access Token
              </label>
              <input
                type="text"
                value={apiToken}
                onChange={(e) => setApiToken(e.target.value)}
                placeholder="EAAxxxxxxxx… (permanent System User token)"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use a permanent System User token, not the 24-hour temporary one.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg text-white text-sm font-semibold transition disabled:opacity-60"
          style={{ backgroundColor: EMERALD }}
        >
          {saving ? "Verifying & saving…" : "Save & Verify Connection"}
        </button>
      </div>

      {/* Test message card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            Send a test message
          </h2>
          {lastTestedAt && (
            <span className="text-xs text-gray-400">
              Last tested: {new Date(lastTestedAt).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testNumber}
            onChange={(e) => setTestNumber(e.target.value)}
            placeholder="Recipient e.g. +92 300 1234567"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2"
          />
          <button
            onClick={handleTest}
            disabled={testing || status === "none"}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            style={{ backgroundColor: GOLD, color: "white" }}
          >
            {testing ? "Sending…" : "Send Test"}
          </button>
        </div>
        <p className="text-xs text-gray-400">
          Tip: send it to your own number first. For UltraMsg the recipient can
          be anyone; for Meta test numbers, the recipient must be in your
          verified list.
        </p>
      </div>
    </div>
  );
}
