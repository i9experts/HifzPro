"use client";
import { useState, useRef } from "react";
import { colors, fonts } from "@/lib/tokens";

interface PhotoUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  label?: string;
  size?: number;
  shape?: "circle" | "square";
  initials?: string;
}

export default function PhotoUpload({
  value, onChange, label = "Photo", size = 80, shape = "square", initials = "?",
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hifzpro_uploads";

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate
    if (!file.type.startsWith("image/")) { setError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024)    { setError("Image must be under 5MB"); return; }

    setUploading(true);
    setError("");

    try {
      if (!CLOUD_NAME) {
        // Fallback: convert to base64 for dev/testing
        const reader = new FileReader();
        reader.onload = (e) => { onChange(e.target?.result as string); };
        reader.readAsDataURL(file);
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append("file",           file);
      formData.append("upload_preset",  UPLOAD_PRESET);
      formData.append("folder",         "hifzpro/students");
      formData.append("transformation", "w_400,h_400,c_fill,g_face,q_auto,f_auto");

      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: "POST", body: formData,
      });
      const data = await res.json();

      if (data.secure_url) onChange(data.secure_url);
      else setError("Upload failed. Please try again.");
    } catch {
      setError("Upload failed. Check your connection.");
    } finally {
      setUploading(false);
    }
  };

  const radius = shape === "circle" ? "50%" : "12px";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* Preview / Upload area */}
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          width: size, height: size, borderRadius: radius,
          background: value ? "transparent" : colors.green50,
          border: `2px dashed ${value ? colors.primary : colors.n300}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          overflow: "hidden", position: "relative", flexShrink: 0,
          transition: "all 0.2s",
        }}
      >
        {value ? (
          <img src={value} alt="Photo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : uploading ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20 }}>⏳</div>
            <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.primary, marginTop: 4 }}>Uploading...</div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: 8 }}>
            <div style={{ fontSize: size > 60 ? 24 : 16, color: colors.n300, marginBottom: 4 }}>
              {initials !== "?" ? (
                <span style={{ fontFamily: fonts.heading, fontSize: size > 60 ? 28 : 18, fontWeight: 700, color: colors.primary }}>{initials}</span>
              ) : "📷"}
            </div>
            {size > 60 && <div style={{ fontFamily: fonts.body, fontSize: 9, color: colors.n400, letterSpacing: 0.5 }}>TAP TO UPLOAD</div>}
          </div>
        )}

        {/* Edit overlay */}
        {value && !uploading && (
          <div style={{
            position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: 0, transition: "opacity 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "0")}
          >
            <span style={{ color: "white", fontSize: 20 }}>✏️</span>
          </div>
        )}
      </div>

      {/* Label + action */}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.n500 }}>{label}</div>
        {value ? (
          <button
            onClick={() => onChange("")}
            style={{ fontFamily: fonts.body, fontSize: 10, color: colors.errorText, background: "none", border: "none", cursor: "pointer", marginTop: 2 }}
          >Remove</button>
        ) : (
          <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 2 }}>JPG/PNG · Max 5MB</div>
        )}
      </div>

      {error && <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.errorText, textAlign: "center" }}>⚠ {error}</div>}

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
