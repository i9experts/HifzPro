"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";

const G = {
  deep: "#050D0A", dark: "#0A1510", card: "#111D16", border: "#1A2E22",
  primary: "#10B981", gold: "#C4882A", white: "#FFFFFF",
  dim: "rgba(255,255,255,0.55)", faint: "rgba(255,255,255,0.08)",
};
const sans   = "'Inter','Segoe UI',system-ui,sans-serif";
const mono   = "'JetBrains Mono','Fira Code','Courier New',monospace";
const serif  = "'Cormorant Garamond','Georgia',serif";
const arabic = "'Scheherazade New',serif";

const p = (text: string) => (
  <p style={{ fontFamily: sans, fontSize: 15, color: G.dim, lineHeight: 1.85, marginBottom: 18 }}>{text}</p>
);
const h2 = (text: string) => (
  <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 700, color: G.white, margin: "36px 0 14px", lineHeight: 1.25 }}>{text}</h2>
);
const h3 = (text: string) => (
  <h3 style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, margin: "28px 0 10px" }}>{text}</h3>
);
const blockquote = (arabic: string, translation: string, cite: string) => (
  <div style={{ background: G.card, borderLeft: `4px solid ${G.primary}`, borderRadius: "0 12px 12px 0", padding: "20px 24px", margin: "28px 0" }}>
    <div style={{ fontFamily: "'Scheherazade New',serif", fontSize: 22, color: G.gold, marginBottom: 10, direction: "rtl" as const }}>{arabic}</div>
    <p style={{ fontFamily: sans, fontSize: 14, color: G.dim, fontStyle: "italic", margin: "0 0 6px" }}>{translation}</p>
    <cite style={{ fontFamily: sans, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{cite}</cite>
  </div>
);

export default function QuranEducationArticle() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ background: G.deep, minHeight: "100vh", color: G.white, fontFamily: sans }}>
      <MarketingNav />

      <article style={{ paddingTop: 100, paddingBottom: 80, paddingLeft: 24, paddingRight: 24 }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
            <Link href="/" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Home</Link>
            <span style={{ color: G.dim, fontSize: 11 }}>/</span>
            <Link href="/blog" style={{ fontFamily: mono, fontSize: 11, color: G.dim, textDecoration: "none" }}>Blog</Link>
            <span style={{ color: G.dim, fontSize: 11 }}>/</span>
            <span style={{ fontFamily: mono, fontSize: 11, color: G.primary }}>Quran Education</span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {["Quran Education", "Featured"].map(t => (
              <span key={t} style={{ background: `${G.primary}15`, color: G.primary, fontFamily: mono, fontSize: 9, fontWeight: 700, padding: "3px 10px", borderRadius: 4, letterSpacing: 1 }}>{t.toUpperCase()}</span>
            ))}
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: serif, fontSize: isMobile ? "1.9rem" : "clamp(1.9rem,4vw,2.8rem)", fontWeight: 700, color: G.white, margin: "0 0 20px", lineHeight: 1.2 }}>
            The Importance of Quran Education in the Modern Age: Why Hifz Is More Vital Than Ever
          </h1>

          {/* Meta */}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 36, paddingBottom: 28, borderBottom: `1px solid ${G.border}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: G.primary, display: "flex", alignItems: "center", justifyContent: "center", color: G.dark, fontWeight: 700, fontSize: 14 }}>HP</div>
              <div>
                <div style={{ fontFamily: sans, fontSize: 13, fontWeight: 600, color: G.white }}>HifzPro Editorial Team</div>
                <div style={{ fontFamily: sans, fontSize: 11, color: G.dim }}>Islamic Education Insights</div>
              </div>
            </div>
            <span style={{ fontFamily: sans, fontSize: 12, color: G.dim }}>June 2026</span>
            <span style={{ background: G.faint, fontFamily: sans, fontSize: 12, color: G.dim, padding: "3px 10px", borderRadius: 6 }}>⏱ 12 min read</span>
          </div>

          {/* Cover */}
          <div style={{ background: "linear-gradient(135deg,#0A2E1A,#052e16)", borderRadius: 16, height: 280, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 40, position: "relative", overflow: "hidden" }}>
            <div style={{ fontFamily: arabic, fontSize: "8rem", color: "rgba(255,255,255,0.04)", position: "absolute", bottom: -20, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>وَلَقَدْ يَسَّرْنَا الْقُرْآنَ</div>
            <span style={{ fontSize: "5rem", opacity: 0.4 }}>📖</span>
          </div>

          {/* Article body */}
          {blockquote(
            "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
            '"And We have certainly made the Quran easy for remembrance, so is there any who will remember?"',
            "— Surah Al-Qamar, 54:17"
          )}

          {p("In a world saturated with screens, social media, and relentless digital distraction, the ancient tradition of Hifz — the complete memorization of the Holy Quran — stands as one of the most profound acts of spiritual discipline and intellectual achievement available to a Muslim. Far from being a relic of a pre-modern era, Hifz has become more vital, more relevant, and more urgently needed in the twenty-first century than at any point in recent history.")}
          {p("This is the central argument we wish to make: that the age of distraction does not diminish the importance of Quran memorization — it amplifies it. And that those who invest in Hifz education today are not preserving the past. They are building the future of the Muslim Ummah.")}

          {h2("The Quran as a Living Covenant")}
          {p("Before we discuss pedagogy, institutions, or technology, we must ground ourselves in why the Quran is memorized at all. The Quran is not merely a sacred text. It is a living covenant between the Creator and His creation — a word that was revealed orally, transmitted orally, and is meant to be held in the human heart as much as on the printed page.")}
          {p("The Prophet Muhammad ﷺ said: \"The one who is skilled in the Quran will be with the noble, righteous recording angels; and the one who recites the Quran but finds it difficult, and struggles with it, will have a double reward.\" (Sahih al-Bukhari)")}

          {blockquote(
            "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
            '"The best of you are those who learn the Quran and teach it."',
            "— Prophet Muhammad ﷺ (Sahih al-Bukhari, 5027)"
          )}

          {p("This hadith establishes Quran education not merely as a personal virtue, but as a communal obligation. The one who learns and teaches is described as the best — the khair — of the Muslim community. This is not incidental. It is foundational to how Muslims have always understood themselves.")}

          {h2("Why Modern Life Makes Hifz More Necessary")}
          {p("There is a common misconception that the digital availability of the Quran reduces the need for memorization. Why learn by heart what is a tap away on any smartphone? This argument, while superficially intuitive, profoundly misunderstands both the nature of Hifz and the nature of the human condition in the digital age.")}

          {h3("1. Memory Is Under Siege")}
          {p("Cognitive scientists and educational psychologists have documented a troubling phenomenon: the systematic atrophy of human long-term memory under the influence of digital tools. Research on \"cognitive offloading\" shows that when humans know information is stored externally, they make less effort to retain it internally. Against this backdrop, Hifz becomes an act of radical resistance. It trains the mind to retain, to internalize, to hold. A Hafiz does not merely know where the Quran is — the Hafiz is a living vessel of the Quran.")}

          {h3("2. Identity and Rootedness in an Age of Drift")}
          {p("The twenty-first century has produced a generation of Muslim youth who are, in many respects, more educated, more connected, and more globally aware than any previous generation. They are also, in many respects, more spiritually adrift. The hypnotic pull of secular materialism, the relentless identity pressure of social media, and the erasure of communal religious practice have created a deep crisis of rootedness.")}
          {p("Hifz offers an answer that no amount of digital Islamic content can provide. The Hafiz does not simply know about the Quran — they carry it. Their identity is inseparably woven into the fabric of the text. In a world that commodifies identity, the Hafiz possesses something that cannot be liked, shared, or algorithmically deprioritized.")}

          {h3("3. Preservation of the Oral Tradition")}
          {p("The Quran was revealed as an oral text, transmitted through an unbroken chain of human memory across fourteen centuries. Every Hafiz is a living link in this chain, connecting us to the Prophet ﷺ through an uninterrupted oral tradition. Digital storage is not unbreakable — manuscripts perish, servers fail, formats become obsolete. The human heart, guided by sincere intention and proper pedagogy, offers a form of preservation that no technology can replicate.")}

          {h2("The State of Hifz Education in Pakistan")}
          {p("Pakistan is home to more Huffaz than perhaps any other country on earth. The institutions that produce these Huffaz — madrasas, Hifz institutes, mosque Halqas — are among the most significant educational institutions in the country, yet they remain chronically underserved by modern management and educational technology.")}
          {p("In 2023, we visited dozens of Hifz institutes across Karachi. What we found was a consistent picture: brilliant, dedicated Asatidha carrying tremendous amounts of information in their own memory — student names, lesson progress, attendance records — with no reliable system to support them. We saw paper registers that could be lost to water damage. We saw parents who had no idea how their child's Hifz was progressing for weeks at a time.")}

          {h2("The Role of Technology in Serving Hifz")}
          {p("Technology does not memorize the Quran. It does not replace the relationship between an Ustadh and their student, the barakah of sitting in a Halqa, or the spiritual dimension of Hifz that no software can capture. What technology can do is remove the friction from everything around the Hifz process so that Asatidha can focus on what only they can do.")}

          <ul style={{ paddingLeft: 24, marginBottom: 18 }}>
            {[
              "Parent communication should be automatic — every parent should know, the same day, what their child recited, how well they performed, and whether they attended.",
              "Dropout risk should be flagged early — not after a student has missed three weeks, but in the first days of a concerning pattern.",
              "Mutashabihat — the similar verses that have confused memorizers for centuries — should be tracked systematically across all students.",
              "Fees and administration should not require a separate administrator consuming hours that could go to teaching.",
            ].map((item, i) => (
              <li key={i} style={{ fontFamily: sans, fontSize: 15, color: G.dim, lineHeight: 1.8, marginBottom: 10 }}>{item}</li>
            ))}
          </ul>

          {h2("What an Excellent Hifz Education Looks Like")}

          {h3("Strong Foundation in Tajweed")}
          {p("No student should begin Hifz without a firm grounding in Tajweed rules. Incorrect habits formed early are extraordinarily difficult to undo. Institutes that rush students into memorization before Tajweed is mastered are storing up problems for the future.")}

          {h3("The Sabaq-Sabqi-Manzil System")}
          {p("The traditional three-tier daily recitation system — new lesson (Sabaq), recent revision (Sabqi), and long-term revision (Manzil) — is a sophisticated cognitive architecture designed to move material from short-term to working to long-term memory through spaced repetition, millennia before cognitive science identified this as the optimal learning strategy.")}

          {h3("Consistent Parent Involvement")}
          {p("Research in both Islamic educational traditions and modern educational psychology consistently identifies parental involvement as one of the strongest predictors of student success. A parent who knows what their child recited that day, who celebrates the milestones, is not peripheral to the Hifz process — they are essential to it.")}

          {h2("The Opportunity Before Us")}
          {p("We are at a remarkable inflection point in the history of Quran education. For the first time, it is possible to combine the depth and integrity of traditional Hifz pedagogy with the transparency, communication, and analytical power of modern technology. Institutes that embrace this combination will not only serve their students better — they will thrive in an increasingly competitive educational environment.")}

          {blockquote(
            "وَإِنَّهُ لَكِتَابٌ عَزِيزٌ — لَّا يَأْتِيهِ الْبَاطِلُ",
            '"And indeed, it is a mighty Book. Falsehood cannot approach it from before it or from behind it."',
            "— Surah Fussilat, 41:41-42"
          )}

          {p("The Quran has been preserved across fourteen centuries through the hearts of believers. In this era, it is our privilege and our responsibility to ensure that the institutions which carry on this tradition have every tool they need to do so with excellence.")}

          <p style={{ fontFamily: sans, fontSize: 15, fontWeight: 600, color: G.primary, lineHeight: 1.85, marginBottom: 32 }}>
            This is why we built HifzPro. And this is why we believe, with every feature and every module, that technology in service of Hifz education is among the most meaningful work we can do.
          </p>

          {/* CTA box */}
          <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontSize: 40 }}>🚀</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: G.white, marginBottom: 6 }}>Ready to transform your Hifz institution?</div>
              <div style={{ fontFamily: sans, fontSize: 13, color: G.dim, marginBottom: 14 }}>Start your 14-day free trial — no credit card required.</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link href="/signup" style={{ padding: "10px 20px", borderRadius: 8, background: G.primary, color: G.dark, fontFamily: sans, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Start Free Trial →</Link>
                <Link href="/demo" style={{ padding: "10px 20px", borderRadius: 8, border: `1px solid ${G.border}`, color: G.white, fontFamily: sans, fontSize: 13, fontWeight: 600, textDecoration: "none", background: G.faint }}>Book a Demo</Link>
              </div>
            </div>
          </div>
        </div>
      </article>

      <MarketingFooter />
    </div>
  );
}
