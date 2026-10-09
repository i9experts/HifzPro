"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

interface AvailabilitySlot {
  id: string; dayOfWeek: number; startTime: string; endTime: string; timezone: string;
}
interface Profile {
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
        {/* Listing status */}
        <div style={{ background: profile.isListed ? colors.successBg : colors.warningBg, borderRadius: 14, padding: "14px 16px" }}>
          <div style={{ fontWeight: 700, color: profile.isListed ? colors.successText : colors.warningText, fontFamily: fonts.heading }}>
            {profile.isListed ? "✅ You're listed publicly" : "⚠️ Not listed yet"}
          </div>
          {!profile.isListed && missing.length > 0 && (
            <div style={{ fontSize: 13, color: colors.warningText, marginTop: 6 }}>
              Complete: {missing.join(", ")}.
            </div>
          )}
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
