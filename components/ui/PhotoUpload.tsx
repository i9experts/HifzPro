"use client";
import { useState, useRef } from "react";
import { colors, fonts } from "@/lib/tokens";

interface PhotoUploadProps {
  value?:    string | null;
  onChange:  (url: string) => void;
  label?:    string;
  size?:     number;
  shape?:    "circle" | "square";
  initials?: string;
}

export default function PhotoUpload({
  value, onChange, label = "Photo", size = 80, shape = "square", initials = "?",
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hifzpro_uploads";
  const radius = shape === "circle" ? "50%" : "12px";

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload  = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // If Cloudinary is configured, try it first
      if (CLOUD_NAME && CLOUD_NAME.length > 3) {
        try {
          setProgress(30);
          const formData = new FormData();
          formData.append("file",          file);
          formData.append("upload_preset",  UPLOAD_PRESET);
          formData.append("folder",         "hifzpro/students");

          const res  = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
            { method: "POST", body: formData }
          );
          setProgress(80);
          const data = await res.json();

          if (data.secure_url) {
            setProgress(100);
            onChange(data.secure_url);
            return;
          }
          // If Cloudinary failed, fall through to base64
        } catch {
          // Cloudinary failed — use base64 fallback
        }
      }

      // Base64 fallback — always works
      setProgress(50);
      const base64 = await toBase64(file);
      setProgress(100);
      onChange(base64);

    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Upload area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: size, height: size, borderRadius: radius,
          background: value ? "transparent" : colors.green50,
          border: `2px ${value ? "solid" : "dashed"} ${value ? colors.primary : colors.n300}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: uploading ? "wait" : "pointer",
          overflow: "hidden", position: "relative", flexShrink: 0,
          transition: "all 0.2s",
        }}
      >
        {value ? (
          <>
            <img src={value} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {/* Edit overlay */}
            <div
              className="edit-overlay"
              style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}
              onMouseEnter={e => { (e.currentTarget.style.background = "rgba(0,0,0,0.45)"); }}
              onMouseLeave={e => { (e.currentTarget.style.background = "rgba(0,0,0,0)"); }}
            >
              <span style={{ color: "white", fontSize: 20, opacity: 0 }}
                onMouseEnter={e => { (e.currentTarget.style.opacity = "1"); }}
                onMouseLeave={e => { (e.currentTarget.style.opacity = "0"); }}
              >✏️</span>
            </div>
          </>
        ) : uploading ? (
          <div style={{ textAlign: "center", padding: 8 }}>
            {/* Progress ring */}
            <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="14" fill="none" stroke={colors.n200} strokeWidth="3"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke={colors.primary} strokeWidth="3"
                strokeDasharray={`${(progress / 100) * 88} 88`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: "stroke-dasharray 0.3s" }}
              />
            </svg>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.primary, marginTop: 2 }}>{progress}%</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 8 }}>
            {initials && initials !== "?" ? (
              <div>
                <span style={{ fontFamily: fonts.heading, fontSize: size > 60 ? 28 : 18, fontWeight: 700, color: colors.primary }}>{initials}</span>
                {size > 60 && <div style={{ fontFamily: fonts.body, fontSize: 8, color: colors.n400, marginTop: 4, letterSpacing: 0.5 }}>TAP TO UPLOAD</div>}
              </div>
            ) : (
              <div>
                <span style={{ fontSize: size > 60 ? 22 : 16 }}>📷</span>
                {size > 60 && <div style={{ fontFamily: fonts.body, fontSize: 8, color: colors.n400, marginTop: 4, letterSpacing: 0.5 }}>TAP TO UPLOAD</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Label */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>{label}</div>
        {value ? (
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 3 }}>
            <button onClick={() => inputRef.current?.click()} style={{ fontFamily: fonts.body, fontSize: 10, color: colors.primary, background: "none", border: "none", cursor: "pointer" }}>Change</button>
            <button onClick={() => onChange("")} style={{ fontFamily: fonts.body, fontSize: 10, color: colors.errorText, background: "none", border: "none", cursor: "pointer" }}>Remove</button>
          </div>
        ) : (
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 2 }}>JPG/PNG · Max 5MB</div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
