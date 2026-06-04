"use client";
import { useState, useRef } from "react";
import { colors, fonts } from "@/lib/tokens";

export interface UploadedDoc {
  name:      string;
  url:       string;
  type:      string;
  size:      number;
  uploadedAt:string;
}

interface DocumentUploadProps {
  documents:   UploadedDoc[];
  onChange:    (docs: UploadedDoc[]) => void;
  label?:      string;
  maxFiles?:   number;
  accept?:     string;
}

const DOC_TYPES = [
  { value: "cnic",        label: "CNIC / B-Form",          icon: "🪪" },
  { value: "birth_cert",  label: "Birth Certificate",       icon: "📜" },
  { value: "school_cert", label: "School Certificate",      icon: "🎓" },
  { value: "photo",       label: "Passport Photo",          icon: "📷" },
  { value: "medical",     label: "Medical Document",        icon: "🏥" },
  { value: "transfer",    label: "Transfer Certificate",    icon: "📋" },
  { value: "other",       label: "Other Document",          icon: "📄" },
];

function formatSize(bytes: number) {
  if (bytes < 1024)        return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload({
  documents, onChange, label = "Documents", maxFiles = 10,
  accept = "image/jpeg,image/png,application/pdf",
}: DocumentUploadProps) {
  const [uploading,  setUploading]  = useState(false);
  const [error,      setError]      = useState("");
  const [docType,    setDocType]    = useState("cnic");
  const [docName,    setDocName]    = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const CLOUD_NAME    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "hifzpro_uploads";

  const handleFile = async (file: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError("File must be under 10MB"); return; }
    if (documents.length >= maxFiles) { setError(`Maximum ${maxFiles} documents allowed`); return; }

    setUploading(true); setError("");

    try {
      let url = "";

      if (!CLOUD_NAME) {
        // Dev fallback — use object URL
        url = URL.createObjectURL(file);
      } else {
        const formData = new FormData();
        formData.append("file",          file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder",        "hifzpro/documents");

        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
          method: "POST", body: formData,
        });
        const data = await res.json();
        url = data.secure_url;
      }

      if (url) {
        const typeConfig = DOC_TYPES.find(t => t.value === docType) || DOC_TYPES[6];
        const newDoc: UploadedDoc = {
          name:       docName || `${typeConfig.label} — ${file.name}`,
          url,
          type:       docType,
          size:       file.size,
          uploadedAt: new Date().toISOString(),
        };
        onChange([...documents, newDoc]);
        setDocName("");
      } else {
        setError("Upload failed");
      }
    } catch { setError("Upload failed"); } finally { setUploading(false); }
  };

  const removeDoc = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  const isImage = (url: string) => /\.(jpg|jpeg|png|webp|gif)(\?|$)/i.test(url);

  return (
    <div>
      <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n700, marginBottom: 12 }}>
        📁 {label}
        <span style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400, fontWeight: 400, marginLeft: 6 }}>
          ({documents.length}/{maxFiles})
        </span>
      </div>

      {/* Existing documents */}
      {documents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
          {documents.map((doc, i) => {
            const typeConfig = DOC_TYPES.find(t => t.value === doc.type) || DOC_TYPES[6];
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: colors.n50, borderRadius: 10, padding: "10px 12px", border: `1px solid ${colors.n200}` }}>
                {/* Preview or icon */}
                <div style={{ width: 36, height: 36, borderRadius: 8, background: colors.white, border: `1px solid ${colors.n200}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {isImage(doc.url) ? (
                    <img src={doc.url} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontSize: 18 }}>{typeConfig.icon}</span>
                  )}
                </div>
                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: fonts.heading, fontSize: 12, fontWeight: 600, color: colors.n800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
                  <div style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.n400, marginTop: 1 }}>
                    {typeConfig.label} · {formatSize(doc.size)} · {new Date(doc.uploadedAt).toLocaleDateString()}
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <a href={doc.url} target="_blank" rel="noopener noreferrer"
                    style={{ padding: "5px 10px", borderRadius: 6, background: colors.green50, color: colors.primary, fontSize: 10, fontWeight: 600, textDecoration: "none", fontFamily: fonts.heading }}>
                    View
                  </a>
                  <button onClick={() => removeDoc(i)}
                    style={{ padding: "5px 8px", borderRadius: 6, background: colors.errorBg, color: colors.errorText, fontSize: 10, border: "none", cursor: "pointer", fontFamily: fonts.heading }}>
                    ✕
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload new */}
      {documents.length < maxFiles && (
        <div style={{ background: colors.white, borderRadius: 10, padding: 14, border: `1.5px dashed ${colors.n200}` }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <select value={docType} onChange={e => setDocType(e.target.value)}
              style={{ flex: 1, minWidth: 140, padding: "8px 10px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 12, fontFamily: fonts.body, color: colors.n700, background: colors.white, outline: "none" }}>
              {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
            <input value={docName} onChange={e => setDocName(e.target.value)}
              placeholder="Document name (optional)"
              style={{ flex: 2, minWidth: 160, padding: "8px 10px", border: `1px solid ${colors.n200}`, borderRadius: 8, fontSize: 12, fontFamily: fonts.body, color: colors.n700, outline: "none" }}
            />
          </div>
          <button
            onClick={() => !uploading && inputRef.current?.click()}
            disabled={uploading}
            style={{ width: "100%", padding: "10px", borderRadius: 8, background: uploading ? colors.n100 : colors.green50, border: `1px solid ${uploading ? colors.n200 : colors.green200}`, color: uploading ? colors.n400 : colors.primary, fontSize: 12, fontWeight: 600, cursor: uploading ? "not-allowed" : "pointer", fontFamily: fonts.heading }}
          >
            {uploading ? "⏳ Uploading..." : "📎 Click to Upload Document"}
          </button>
          <div style={{ fontFamily: fonts.body, fontSize: 10, color: colors.n400, textAlign: "center", marginTop: 6 }}>
            JPG, PNG, PDF · Max 10MB per file
          </div>
        </div>
      )}

      {error && <div style={{ fontFamily: fonts.body, fontSize: 11, color: colors.errorText, marginTop: 8 }}>⚠ {error}</div>}

      <input ref={inputRef} type="file" accept={accept} style={{ display: "none" }}
        onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
}
