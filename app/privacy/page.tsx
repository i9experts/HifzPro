import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import { colors, fonts } from "@/lib/tokens";

export default function PrivacyPage() {
  const sections = [
    { title: "Information We Collect", content: "We collect information you provide directly to us when you create an account, register your institution, enrol students, or contact us for support. This includes institution name, contact details, student names, program enrollment data, and lesson records. We do not collect sensitive personal information beyond what is required to operate the platform." },
    { title: "How We Use Your Information", content: "We use the information we collect to provide, maintain, and improve the HifzPro platform; to send notifications and updates to parents via WhatsApp (with your authorization); to generate reports and analytics for your institution; to respond to your comments and questions; and to comply with legal obligations." },
    { title: "Data Storage & Security", content: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption. Each institution's data is fully isolated from other institutions. We conduct regular security audits and maintain strict access controls. We do not sell, trade, or share your data with third parties for advertising purposes." },
    { title: "Student Data", content: "We take the privacy of students — especially minors — extremely seriously. Student data is used exclusively for the purposes of Hifz management within your institution. Parents can request access to their child's data at any time. Student data is never shared with other institutions or third parties." },
    { title: "WhatsApp Communications", content: "Parent WhatsApp updates are sent only with the explicit authorization of the institution admin. Parents can opt out at any time by contacting their institution. We use the official WhatsApp Business API and comply with WhatsApp's policies on messaging." },
    { title: "Data Retention", content: "We retain your data for as long as your account is active or as needed to provide services. If you cancel your account, we will delete your data within 90 days, except where we are required to retain it for legal compliance." },
    { title: "Contact Us", content: "If you have questions about this Privacy Policy or how we handle your data, please contact us at privacy@hifzpro.com or through our contact page." },
  ];

  return (
    <main>
      <SiteNav />
      <PageHero label="LEGAL" title="Privacy Policy" subtitle="Last updated: January 2026" />
      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ background: colors.green50, borderRadius: 12, padding: 20, marginBottom: 40, border: `1px solid ${colors.green200}` }}>
            <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.primaryDark, lineHeight: 1.8, margin: 0 }}>
              HifzPro is committed to protecting the privacy of institutions, Asatidha, students, and parents who use our platform. This policy explains what information we collect, how we use it, and how we protect it.
            </p>
          </div>
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 36, paddingBottom: 36, borderBottom: i < sections.length - 1 ? `1px solid ${colors.n100}` : "none" }}>
              <h2 style={{ fontFamily: fonts.heading, fontSize: 18, fontWeight: 700, color: colors.n800, margin: "0 0 12px" }}>{s.title}</h2>
              <p style={{ fontFamily: fonts.body, fontSize: 14, color: colors.n500, lineHeight: 1.85, margin: 0 }}>{s.content}</p>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
