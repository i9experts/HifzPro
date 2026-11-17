"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import PhotoUpload from "@/components/ui/PhotoUpload";
import DocumentUpload, { type UploadedDoc } from "@/components/ui/DocumentUpload";
import { colors, fonts } from "@/lib/tokens";

interface AvailabilitySlot {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
}
interface Profile {
  user: { name: string; avatar: string | null };
  gender: "MALE" | "FEMALE";
  residenceCountry: string;
  bio: string | null;
  qualification: string | null;
  qiraat: string | null;
  yearsExperience: number | null;
  languages: string[];
  countriesServed: string[];
  ageGroupsTaught: string[];
  programsOffered: string[];
  hourlyRate: number | null;
  currency: string;
  isListed: boolean;
  availabilitySlots: AvailabilitySlot[];
  verificationTier: "UNVERIFIED" | "ID_VERIFIED" | "CREDENTIAL_VERIFIED" | "BACKGROUND_CHECKED";
  verificationStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  verificationRequestedTier: string | null;
  verificationRejectionReason: string | null;
  avgResponseMinutes: number | null;
  responseSampleCount: number;
}

const PROGRAM_OPTIONS = [
  { id: "HIFZ", label: "Hifz" },
  { id: "NAZRA", label: "Nazrah" },
  { id: "TAJWEED", label: "Tajweed" },
  { id: "GIRDAAN", label: "Girdaan" },
];
const AGE_GROUP_OPTIONS = ["5-8", "9-12", "13-17", "Adult"];
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function inputStyle(): React.CSSProperties {
  return {
    width: "100%", padding: "10px 12px", borderRadius: 10,
    border: `1.5px solid ${colors.n200}`, fontSize: 14, fontFamily: fonts.body,
    outline: "none", background: colors.white,
  };
}
function labelStyle(): React.CSSProperties {
  return { fontFamily: fonts.heading, fontWeight: 600, fontSize: 13, color: colors.n700, marginBottom: 6, display: "block" };
}
function chip(active: boolean): React.CSSProperties {
  return {
    padding: "7px 14px", borderRadius: 999, fontSize: 13, cursor: "pointer",
    border: `1.5px solid ${active ? colors.primary : colors.n200}`,
    background: active ? colors.green50 : colors.white,
    color: active ? colors.primary : colors.n600,
    fontWeight: active ? 700 : 500,
  };
}

function toggleInArray(arr: string[], val: string): string[] {
  return arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];
}

// Mirrors lib-side minimumFieldsMissing() in app/api/marketplace/teacher/profile/route.ts —
// the API only ever returns the ones still missing, so diffing against this
// full list turns that into a real done/not-done checklist.
const REQUIRED_FOR_LISTING = [
  "a bio (at least 20 characters)",
  "qiraat specialization",
  "hourly rate",
  "at least one language",
  "at least one country you'll teach students in",
  "at least one age group",
  "at least one program you teach",
];

const STRIPE_COUNTRIES = [
  { code: "PK", label: "Pakistan" }, { code: "GB", label: "United Kingdom" }, { code: "US", label: "United States" },
  { code: "AE", label: "United Arab Emirates" }, { code: "SA", label: "Saudi Arabia" }, { code: "CA", label: "Canada" },
  { code: "AU", label: "Australia" }, { code: "MY", label: "Malaysia" }, { code: "IN", label: "India" }, { code: "EG", label: "Egypt" },
];

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [missing, setMissing] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [langInput, setLangInput] = useState("");
  const [countryInput, setCountryInput] = useState("");
  const [newSlot, setNewSlot] = useState({ dayOfWeek: 0, startTime: "16:00", endTime: "17:00", timezone: "Asia/Karachi" });

  const [verifDocs, setVerifDocs] = useState<UploadedDoc[]>([]);
  const [verifTier, setVerifTier] = useState("ID_VERIFIED");
  const [submittingVerif, setSubmittingVerif] = useState(false);

  const [stripeStatus, setStripeStatus] = useState<{ connected: boolean; onboardingComplete: boolean } | null>(null);
  const [stripeCountry, setStripeCountry] = useState("PK");
  const [connecting, setConnecting] = useState(false);

  const loadStripeStatus = () => {
    fetch("/api/marketplace/teacher/stripe/status")
      .then(r => r.json())
      .then(d => { if (d.success) setStripeStatus(d.data); });
  };

  const load = () => {
    setLoading(true);
    fetch("/api/marketplace/teacher/profile")
      .then(r => r.json())
      .then(d => {
        if (d.success) { setProfile(d.data.profile); setMissing(d.data.missingForListing); }
        else setError(d.error || "Failed to load profile");
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);
  useEffect(loadStripeStatus, []);

  const connectPayouts = async () => {
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace/teacher/stripe/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: stripeCountry }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to start payout setup"); return; }
      window.location.href = data.data.url;
    } catch {
      setError("Failed to start payout setup");
    } finally {
      setConnecting(false);
    }
  };

  const save = async (patch: Partial<Profile>) => {
    if (!profile) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const res = await fetch("/api/marketplace/teacher/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to save"); return; }
      setProfile(p => p ? { ...p, ...patch } as Profile : p);
      setMessage("Saved");
      load();
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const addSlot = async () => {
    setError("");
    try {
      const res = await fetch("/api/marketplace/teacher/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newSlot),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to add slot"); return; }
      load();
    } catch {
      setError("Failed to add slot");
    }
  };

  const removeSlot = async (id: string) => {
    await fetch(`/api/marketplace/teacher/availability/${id}`, { method: "DELETE" });
    load();
  };

  const submitVerification = async () => {
    if (!verifDocs[0]) { setError("Upload a document first"); return; }
    setSubmittingVerif(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace/teacher/verification", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentUrl: verifDocs[0].url, requestedTier: verifTier }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to submit"); return; }
      setVerifDocs([]);
      setMessage("Verification request submitted — we'll review it soon.");
      load();
    } catch {
      setError("Failed to submit verification request");
    } finally {
      setSubmittingVerif(false);
    }
  };

  const saveAvatar = async (avatarUrl: string) => {
    setError("");
    try {
      const res = await fetch("/api/marketplace/teacher/avatar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to save photo"); return; }
      setProfile(p => p ? { ...p, user: { ...p.user, avatar: data.data.avatar } } : p);
    } catch {
      setError("Failed to save photo");
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: colors.n500 }}>Loading…</div>;
  if (!profile) return <div style={{ padding: 40, textAlign: "center", color: colors.errorText }}>{error || "Profile not found"}</div>;

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body, paddingBottom: 60 }}>
      <header style={{ background: colors.primary, padding: "18px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/dashboard/teacher" style={{ textDecoration: "none" }}><HifzMark size={28} /></Link>
        <div>
          <div style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700, fontSize: 16 }}>My Teacher Profile</div>
          <div style={{ color: colors.green100, fontSize: 12 }}>Fill this in so parents can find and book you</div>
        </div>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 16px", display: "grid", gap: 20 }}>
        {/* Photo */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <PhotoUpload
            value={profile.user.avatar}
            onChange={saveAvatar}
            label="Your photo"
            size={96}
            shape="circle"
            initials={profile.user.name.charAt(0).toUpperCase()}
            folder="hifzpro/teachers"
          />
        </div>

        {/* Listing status + onboarding checklist */}
        <div style={{ background: profile.isListed ? colors.successBg : colors.warningBg, borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, color: profile.isListed ? colors.successText : colors.warningText, fontFamily: fonts.heading }}>
            {profile.isListed ? "✅ You're listed publicly" : "⚠️ Not listed yet"}
          </div>
          {!profile.isListed && (() => {
            const required = REQUIRED_FOR_LISTING.map(label => ({ label, done: !missing.includes(label) }));
            const recommended = [
              { label: "Profile photo", done: !!profile.user.avatar },
              { label: "Payout account connected", done: !!stripeStatus?.onboardingComplete },
            ];
            const doneCount = required.filter(r => r.done).length;
            return (
              <div style={{ marginTop: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.warningText, marginBottom: 4 }}>
                  <span>Required to list</span><span>{doneCount}/{required.length}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "rgba(0,0,0,0.08)", overflow: "hidden", marginBottom: 10 }}>
                  <div style={{ height: "100%", width: `${(doneCount / required.length) * 100}%`, background: colors.warning, transition: "width 0.3s" }} />
                </div>
                <div style={{ display: "grid", gap: 4 }}>
                  {required.map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.done ? colors.successText : colors.n700 }}>
                      <span>{item.done ? "✅" : "⬜"}</span>{item.label}
                    </div>
                  ))}
                  {recommended.map(item => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: item.done ? colors.successText : colors.n500 }}>
                      <span>{item.done ? "✅" : "⬜"}</span>{item.label} <span style={{ fontSize: 11, color: colors.n400 }}>(recommended)</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
          <button
            disabled={saving}
            onClick={() => save({ isListed: !profile.isListed })}
            style={{
              marginTop: 10, padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: 700, fontSize: 13,
              background: profile.isListed ? colors.n200 : colors.primary,
              color: profile.isListed ? colors.n700 : "white",
            }}
          >
            {profile.isListed ? "Unlist me" : "List me publicly"}
          </button>
        </div>

        {/* Payout setup */}
        <div style={{ background: stripeStatus?.onboardingComplete ? colors.successBg : colors.warningBg, borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, color: stripeStatus?.onboardingComplete ? colors.successText : colors.warningText, fontFamily: fonts.heading }}>
            {stripeStatus?.onboardingComplete ? "✅ Payout account connected" : "⚠️ Payout setup needed"}
          </div>
          {!stripeStatus?.onboardingComplete && (
            <>
              <div style={{ fontSize: 13, color: colors.warningText, marginTop: 6 }}>
                Parents can't pay you for a booking until you've connected a Stripe payout account. This takes a couple of minutes.
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
                <select value={stripeCountry} onChange={e => setStripeCountry(e.target.value)} style={{ ...inputStyle(), width: "auto" }}>
                  {STRIPE_COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <button
                  disabled={connecting}
                  onClick={connectPayouts}
                  style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: connecting ? "not-allowed" : "pointer", fontWeight: 700, fontSize: 13, background: colors.primary, color: "white" }}
                >
                  {connecting ? "Redirecting…" : stripeStatus?.connected ? "Finish payout setup" : "Connect payout account"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Verification */}
        <div style={{ background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 14, padding: "16px" }}>
          <div style={{ fontFamily: fonts.heading, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Verification</div>
          <div style={{ fontSize: 12, color: colors.n500, marginBottom: 12 }}>
            Current badge: <strong>{profile.verificationTier === "UNVERIFIED" ? "None yet" : profile.verificationTier.replace("_", " ")}</strong>
          </div>

          {profile.verificationStatus === "PENDING" && (
            <div style={{ background: colors.warningBg, color: colors.warningText, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
              ⏳ Your request for <strong>{(profile.verificationRequestedTier || "").replace("_", " ")}</strong> is under review.
            </div>
          )}
          {profile.verificationStatus === "REJECTED" && (
            <div style={{ background: colors.errorBg, color: colors.errorText, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
              Your last request wasn't approved. Reason: {profile.verificationRejectionReason}
            </div>
          )}
          {profile.verificationStatus === "APPROVED" && (
            <div style={{ background: colors.successBg, color: colors.successText, borderRadius: 10, padding: "10px 12px", fontSize: 13, marginBottom: 12 }}>
              ✅ Approved — this badge now shows on your public profile.
            </div>
          )}

          {profile.verificationStatus !== "PENDING" && (
            <>
              <label style={labelStyle()}>Requesting</label>
              <select value={verifTier} onChange={e => setVerifTier(e.target.value)} style={{ ...inputStyle(), marginBottom: 12 }}>
                <option value="ID_VERIFIED">ID Verified — government ID</option>
                <option value="CREDENTIAL_VERIFIED">Credential Verified — ijazah/sanad</option>
                <option value="BACKGROUND_CHECKED">Background Checked</option>
              </select>
              <DocumentUpload documents={verifDocs} onChange={setVerifDocs} label="Upload your ID or credential" maxFiles={1} />
              <button
                disabled={submittingVerif || !verifDocs[0]}
                onClick={submitVerification}
                style={{ marginTop: 10, padding: "8px 16px", borderRadius: 8, border: "none", cursor: verifDocs[0] ? "pointer" : "not-allowed", opacity: verifDocs[0] ? 1 : 0.6, fontWeight: 700, fontSize: 13, background: colors.primary, color: "white" }}
              >
                {submittingVerif ? "Submitting…" : "Submit for review"}
              </button>
            </>
          )}
        </div>

        {error && <div style={{ color: colors.errorText, background: colors.errorBg, padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>{error}</div>}
        {message && <div style={{ color: colors.successText, background: colors.successBg, padding: "10px 14px", borderRadius: 10, fontSize: 13 }}>{message}</div>}

        {/* Basics */}
        <section>
          <label style={labelStyle()}>Bio</label>
          <textarea
            defaultValue={profile.bio ?? ""}
            onBlur={e => save({ bio: e.target.value })}
            rows={4}
            placeholder="Tell parents about your teaching style, experience, and what makes you a good fit…"
            style={{ ...inputStyle(), resize: "vertical" }}
          />
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle()}>Qiraat specialization</label>
            <input defaultValue={profile.qiraat ?? ""} onBlur={e => save({ qiraat: e.target.value })}
              placeholder="e.g. Hafs 'an 'Asim" style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Years of experience</label>
            <input type="number" min={0} defaultValue={profile.yearsExperience ?? ""} onBlur={e => save({ yearsExperience: e.target.value ? Number(e.target.value) : undefined })}
              style={inputStyle()} />
          </div>
        </section>

        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle()}>Hourly rate</label>
            <input type="number" min={0} defaultValue={profile.hourlyRate ?? ""} onBlur={e => save({ hourlyRate: e.target.value ? Number(e.target.value) : undefined })}
              style={inputStyle()} />
          </div>
          <div>
            <label style={labelStyle()}>Currency</label>
            <select defaultValue={profile.currency} onChange={e => save({ currency: e.target.value })} style={inputStyle()}>
              {["USD", "GBP", "PKR", "AED", "SAR"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </section>

        {/* Programs */}
        <section>
          <label style={labelStyle()}>Programs you teach</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {PROGRAM_OPTIONS.map(p => (
              <div key={p.id} style={chip(profile.programsOffered.includes(p.id))}
                onClick={() => save({ programsOffered: toggleInArray(profile.programsOffered, p.id) })}>
                {p.label}
              </div>
            ))}
          </div>
        </section>

        {/* Age groups */}
        <section>
          <label style={labelStyle()}>Age groups</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {AGE_GROUP_OPTIONS.map(a => (
              <div key={a} style={chip(profile.ageGroupsTaught.includes(a))}
                onClick={() => save({ ageGroupsTaught: toggleInArray(profile.ageGroupsTaught, a) })}>
                {a}
              </div>
            ))}
          </div>
        </section>

        {/* Languages */}
        <section>
          <label style={labelStyle()}>Languages you teach in</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {profile.languages.map(l => (
              <div key={l} style={chip(true)} onClick={() => save({ languages: toggleInArray(profile.languages, l) })}>{l} ✕</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="e.g. English"
              style={{ ...inputStyle(), flex: 1 }}
              onKeyDown={e => { if (e.key === "Enter" && langInput.trim()) { save({ languages: [...profile.languages, langInput.trim()] }); setLangInput(""); } }} />
            <button onClick={() => { if (langInput.trim()) { save({ languages: [...profile.languages, langInput.trim()] }); setLangInput(""); } }}
              style={{ padding: "0 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700 }}>Add</button>
          </div>
        </section>

        {/* Countries served */}
        <section>
          <label style={labelStyle()}>Countries you'll teach students in</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
            {profile.countriesServed.map(c => (
              <div key={c} style={chip(true)} onClick={() => save({ countriesServed: toggleInArray(profile.countriesServed, c) })}>{c} ✕</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={countryInput} onChange={e => setCountryInput(e.target.value)} placeholder="e.g. US, UK, UAE"
              style={{ ...inputStyle(), flex: 1 }}
              onKeyDown={e => { if (e.key === "Enter" && countryInput.trim()) { save({ countriesServed: [...profile.countriesServed, countryInput.trim()] }); setCountryInput(""); } }} />
            <button onClick={() => { if (countryInput.trim()) { save({ countriesServed: [...profile.countriesServed, countryInput.trim()] }); setCountryInput(""); } }}
              style={{ padding: "0 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700 }}>Add</button>
          </div>
        </section>

        {/* Availability */}
        <section>
          <label style={labelStyle()}>Weekly availability</label>
          <div style={{ display: "grid", gap: 8, marginBottom: 10 }}>
            {profile.availabilitySlots.map(s => (
              <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: colors.white, border: `1px solid ${colors.n200}`, borderRadius: 10, padding: "8px 12px" }}>
                <span style={{ fontSize: 13 }}>{DAYS[s.dayOfWeek]} · {s.startTime}–{s.endTime} ({s.timezone})</span>
                <button onClick={() => removeSlot(s.id)} style={{ border: "none", background: "none", color: colors.errorText, cursor: "pointer", fontSize: 13 }}>Remove</button>
              </div>
            ))}
            {profile.availabilitySlots.length === 0 && <div style={{ fontSize: 13, color: colors.n500 }}>No slots added yet.</div>}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <select value={newSlot.dayOfWeek} onChange={e => setNewSlot(s => ({ ...s, dayOfWeek: Number(e.target.value) }))} style={{ ...inputStyle(), width: 130 }}>
              {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
            </select>
            <input type="time" value={newSlot.startTime} onChange={e => setNewSlot(s => ({ ...s, startTime: e.target.value }))} style={{ ...inputStyle(), width: 110 }} />
            <input type="time" value={newSlot.endTime} onChange={e => setNewSlot(s => ({ ...s, endTime: e.target.value }))} style={{ ...inputStyle(), width: 110 }} />
            <input value={newSlot.timezone} onChange={e => setNewSlot(s => ({ ...s, timezone: e.target.value }))} placeholder="Asia/Karachi" style={{ ...inputStyle(), width: 150 }} />
            <button onClick={addSlot} style={{ padding: "10px 16px", borderRadius: 8, border: "none", background: colors.primary, color: "white", fontWeight: 700 }}>Add slot</button>
          </div>
        </section>
      </main>
    </div>
  );
}
