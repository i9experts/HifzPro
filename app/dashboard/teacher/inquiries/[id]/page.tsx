"use client";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import HifzMark from "@/components/ui/HifzMark";
import BookingPanel from "@/components/marketplace/BookingPanel";
import { colors, fonts } from "@/lib/tokens";

interface Message { id: string; body: string; senderId: string; createdAt: string }
interface InquiryDetail {
  id: string; status: string;
  teacher: { userId: string }; parent: { userId: string };
}

export default function TeacherInquiryThreadPage() {
  const params = useParams();
  const id = params.id as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch(`/api/marketplace/inquiries/${id}/messages`)
      .then(r => r.json())
      .then(d => { if (d.success) { setMessages(d.data.messages); setMyUserId((d.data.inquiry as InquiryDetail).teacher.userId); } })
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/marketplace/inquiries/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.error || "Failed to send"); return; }
      setReply("");
      load();
    } catch {
      setError("Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.n50, fontFamily: fonts.body, display: "flex", flexDirection: "column" }}>
      <header style={{ background: colors.primary, padding: "18px 20px", display: "flex", alignItems: "center", gap: 10 }}>
        <Link href="/dashboard/teacher/inquiries" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <HifzMark size={28} />
          <span style={{ color: "white", fontFamily: fonts.heading, fontWeight: 700 }}>← Inquiries</span>
        </Link>
      </header>

      <main style={{ maxWidth: 640, margin: "0 auto", padding: "20px 16px", flex: 1, width: "100%", display: "flex", flexDirection: "column" }}>
        {loading && <div style={{ color: colors.n500, textAlign: "center", padding: 30 }}>Loading…</div>}

        {myUserId && <BookingPanel inquiryId={id} myUserId={myUserId} />}

        <div style={{ flex: 1, display: "grid", gap: 10, marginBottom: 14 }}>
          {messages.map(m => {
            const mine = m.senderId === myUserId;
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "75%", padding: "10px 14px", borderRadius: 14,
                  background: mine ? colors.primary : colors.white,
                  color: mine ? "white" : colors.n800,
                  border: mine ? "none" : `1px solid ${colors.n200}`,
                  fontSize: 14,
                }}>
                  {m.body}
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4 }}>{new Date(m.createdAt).toLocaleString()}</div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {error && <div style={{ color: colors.errorText, fontSize: 13, marginBottom: 8 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, position: "sticky", bottom: 16 }}>
          <input
            value={reply}
            onChange={e => setReply(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") send(); }}
            placeholder="Type a reply…"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${colors.n200}`, fontSize: 14 }}
          />
          <button onClick={send} disabled={sending || !reply.trim()}
            style={{ padding: "0 20px", borderRadius: 10, border: "none", background: colors.primary, color: "white", fontWeight: 700, cursor: "pointer" }}>
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
