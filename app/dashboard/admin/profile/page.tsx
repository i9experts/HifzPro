"use client";
// app/dashboard/admin/profile/page.tsx
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import { colors, fonts } from "@/lib/tokens";

const PROGRAMS = [
  { id:"HIFZ",    label:"Hifz ul Quran",  labelUr:"حفظ القرآن",  icon:"📖" },
  { id:"NAZRA",   label:"Nazrah",         labelUr:"ناظرہ",        icon:"👁️" },
  { id:"TAJWEED", label:"Tajweed",        labelUr:"تجوید",        icon:"✏️" },
  { id:"GIRDAAN", label:"Girdaan",        labelUr:"گردان",        icon:"🔄" },
];

const inp = (extra?: any) => ({
  width: "100%", padding: "10px 12px",
  border: `1.5px solid ${colors.n200}`, borderRadius: 8,
  fontSize: 13, fontFamily: fonts.body, color: colors.n800,
  background: colors.white, outline: "none", boxSizing: "border-box" as const,
  ...extra,
});

export default function InstitutionProfilePage() {
  const [form, setForm] = useState({
    name: "", nameArabic: "", about: "", established: "",
    city: "", address: "", phone: "", whatsapp: "",
    email: "", website: "", logo: "", programs: [] as string[],
  });
  const [slug,    setSlug]    = useState("");
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  useEffect(() => {
    fetch("/api/admin/institution")
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.institution) {
          const inst = d.data.institution;
          setSlug(inst.slug || "");
          setForm({
            name:        inst.name        || "",
            nameArabic:  inst.nameArabic  || "",
            about:       inst.about       || "",
            established: inst.established ? String(inst.established) : "",
            city:        inst.city        || "",
            address:     inst.address     || "",
            phone:       inst.phone       || "",
            whatsapp:    inst.whatsapp    || "",
            email:       inst.email       || "",
            website:     inst.website     || "",
            logo:        inst.logo        || "",
            programs:    inst.programs ? inst.programs.split(",").filter(Boolean) : [],
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (file: File) => {
    setUploading(true);
    const data = new FormData();
    data.append("file",   file);
    data.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hifzpro");
    data.append("folder", "institutions");
    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
      const json = await res.json();
      if (json.secure_url) set("logo", json.secure_url);
    } catch { setError("Logo upload failed"); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true); setError(""); setSaved(false);
    try {
      const res  = await fetch("/api/admin/institution", {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          ...form,
          established: form.established ? parseInt(form.established) : null,
          programs:    form.programs,
        }),
      });
      const data = await res.json();
      if (data.success) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
      else setError(data.error || "Save failed");
    } catch { setError("Connection error"); }
    finally { setSaving(false); }
  };

  const toggleProgram = (id: string) => {
    setForm(p => ({
      ...p,
      programs: p.programs.includes(id) ? p.programs.filter(x => x !== id) : [...p.programs, id],
    }));
  };

  const profileUrl = slug ? `https://www.hifzpro.com/${slug}` : "";

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    window.location.href = "/signin";
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: colors.n50, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: fonts.body, color: colors.n400 }}>Loading profile...</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: colors.n50 }}>

      {/* Nav */}
      <nav style={{ background: colors.deep, padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/dashboard/admin" style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", color: "white", fontSize: 16 }}>←</Link>
          <HifzMark size={30} primary="#10B981" gold={colors.gold} />
          <div>
            <div style={{ fontFamily: fonts.display, fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1 }}>Institution Profile</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 8, color: colors.gold, letterSpacing: 1 }}>PUBLIC PAGE SETTINGS</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {profileUrl && (
            <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: "7px 14px", borderRadius: 8, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.8)", fontSize: 11, fontWeight: 700, textDecoration: "none", fontFamily: fonts.heading }}>
              🔗 View Public Page ↗
            </a>
          )}
          <button onClick={handleSignOut} style={{ padding: "6px 12px", borderRadius: 6, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.6)", fontSize: 11, cursor: "pointer", fontFamily: fonts.heading }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "28px 20px" }}>

        {/* Page title */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 3, color: colors.gold, marginBottom: 6 }}>INSTITUTION PROFILE</div>
          <h1 style={{ fontFamily: fonts.display, fontSize: "2rem", fontWeight: 700, color: colors.n800, margin: 0 }}>Your Public Profile</h1>
          {profileUrl && (
            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: fonts.body, fontSize: 12, color: colors.n500 }}>Public URL:</span>
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.primary, textDecoration: "none", background: colors.green50, padding: "2px 8px", borderRadius: 5, border: `1px solid ${colors.green200}` }}>
                {profileUrl}
              </a>
              <button onClick={() => navigator.clipboard.writeText(profileUrl)} style={{ padding: "2px 8px", borderRadius: 5, border: `1px solid ${colors.n200}`, background: colors.white, fontSize: 10, cursor: "pointer", fontFamily: fonts.heading, color: colors.n600 }}>
                Copy
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Logo + Basic Info */}
          <div style={{ background: colors.white, borderRadius: 16, padding: "20px 24px", border: `1px solid ${colors.n200}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n500, marginBottom: 16 }}>LOGO & IDENTITY</div>
            <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>

              {/* Logo upload */}
              <div style={{ flexShrink: 0 }}>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{ width: 100, height: 100, borderRadius: 16, border: `2px dashed ${colors.n300}`, background: colors.n50, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
                  {form.logo
                    ? <img src={form.logo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 28 }}>{uploading ? "⏳" : "📷"}</div>
                        <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400, marginTop: 4 }}>{uploading ? "Uploading..." : "Upload Logo"}</div>
                      </div>
                  }
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }} />
                {form.logo && (
                  <button onClick={() => set("logo", "")} style={{ marginTop: 6, width: "100%", padding: "4px", borderRadius: 6, border: `1px solid ${colors.n200}`, background: colors.n50, fontSize: 10, cursor: "pointer", fontFamily: fonts.heading, color: colors.n500 }}>
                    Remove
                  </button>
                )}
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>Institution Name *</label>
                    <input value={form.name} onChange={e => set("name", e.target.value)} style={inp()} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>Arabic Name · اسم عربي</label>
                    <input value={form.nameArabic} onChange={e => set("nameArabic", e.target.value)} style={inp({ direction: "rtl", fontFamily: "'Scheherazade New',serif", fontSize: 15 })} placeholder="مدرسة نور الإسلام" />
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12 }}>
                  <div>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>City</label>
                    <input value={form.city} onChange={e => set("city", e.target.value)} placeholder="Karachi" style={inp()} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>Established</label>
                    <input type="number" value={form.established} onChange={e => set("established", e.target.value)} placeholder="2010" style={inp({ fontFamily: fonts.mono })} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About */}
          <div style={{ background: colors.white, borderRadius: 16, padding: "20px 24px", border: `1px solid ${colors.n200}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n500, marginBottom: 14 }}>ABOUT YOUR INSTITUTE</div>
            <div>
              <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>
                Description <span style={{ fontWeight: 400, color: colors.n400 }}>({form.about.length}/600)</span>
              </label>
              <textarea
                value={form.about}
                onChange={e => set("about", e.target.value)}
                maxLength={600}
                rows={4}
                placeholder="Tell parents about your Hifz program, teaching methodology, achievements, and what makes your institute unique..."
                style={{ ...inp(), resize: "vertical" as const }}
              />
            </div>
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>Full Address</label>
              <input value={form.address} onChange={e => set("address", e.target.value)} placeholder="123 Main Street, Block 5, Karachi" style={inp()} />
            </div>
          </div>

          {/* Programs */}
          <div style={{ background: colors.white, borderRadius: 16, padding: "20px 24px", border: `1px solid ${colors.n200}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n500, marginBottom: 14 }}>PROGRAMS OFFERED · پروگرام</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
              {PROGRAMS.map(p => {
                const selected = form.programs.includes(p.id);
                return (
                  <button key={p.id} onClick={() => toggleProgram(p.id)} style={{ padding: "12px 8px", borderRadius: 12, border: `2px solid ${selected ? colors.primary : colors.n200}`, background: selected ? colors.green50 : colors.n50, cursor: "pointer", textAlign: "center", transition: "all 0.15s" }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{p.icon}</div>
                    <div style={{ fontFamily: fonts.heading, fontSize: 11, fontWeight: 700, color: selected ? colors.primary : colors.n700 }}>{p.label}</div>
                    <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 12, color: selected ? colors.primary : colors.n400, marginTop: 1 }}>{p.labelUr}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div style={{ background: colors.white, borderRadius: 16, padding: "20px 24px", border: `1px solid ${colors.n200}` }}>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, color: colors.n500, marginBottom: 14 }}>CONTACT INFORMATION</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {[
                { key: "phone",    label: "Phone Number",   placeholder: "+92 300 1234567", mono: true },
                { key: "whatsapp", label: "WhatsApp",       placeholder: "+92 300 1234567", mono: true },
                { key: "email",    label: "Email Address",  placeholder: "info@institute.edu.pk" },
                { key: "website",  label: "Website",        placeholder: "https://www.institute.edu.pk" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: "block", fontFamily: fonts.heading, fontSize: 11, fontWeight: 600, color: colors.n700, marginBottom: 5 }}>{f.label}</label>
                  <input
                    value={(form as any)[f.key]}
                    onChange={e => set(f.key, e.target.value)}
                    placeholder={f.placeholder}
                    style={inp(f.mono ? { fontFamily: fonts.mono } : {})}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: colors.errorBg, border: `1px solid ${colors.error}44` }}>
              <span style={{ fontFamily: fonts.body, fontSize: 13, color: colors.errorText }}>⚠ {error}</span>
            </div>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            {profileUrl && (
              <a href={profileUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: "13px", borderRadius: 10, background: colors.n100, border: `1px solid ${colors.n200}`, color: colors.n700, fontSize: 13, fontWeight: 600, textDecoration: "none", fontFamily: fonts.heading, textAlign: "center" }}>
                🔗 Preview Public Page
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              style={{ flex: 2, padding: "13px", borderRadius: 10, fontSize: 14, fontWeight: 700, border: "none", background: saving ? colors.n300 : saved ? colors.success : colors.primary, color: "white", cursor: saving ? "not-allowed" : "pointer", fontFamily: fonts.heading, boxShadow: !saving ? "0 4px 14px rgba(13,92,58,0.3)" : "none", transition: "all 0.2s" }}>
              {saving ? "Saving..." : saved ? "✅ Saved!" : "Save Profile →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
