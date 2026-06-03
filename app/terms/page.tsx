import { SiteNav, SiteFooter, PageHero } from "@/components/ui/SiteLayout";
import { colors, fonts } from "@/lib/tokens";

export default function TermsPage() {
  const sections = [
    { title: "Acceptance of Terms", content: "By accessing or using HifzPro, you agree to be bound by these Terms of Use and our Privacy Policy. If you do not agree to these terms, please do not use the platform. These terms apply to all users including institution admins, Asatidha, parents, and students." },
    { title: "Account Registration", content: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. Each institution is responsible for managing the accounts of their Asatidha and students." },
    { title: "Acceptable Use", content: "You agree to use HifzPro only for its intended purpose — managing Islamic educational programs. You agree not to misuse the platform, attempt to gain unauthorized access, upload malicious content, or use the service for any unlawful purpose. You agree to use student data only for educational management purposes." },
    { title: "Subscription & Billing", content: "HifzPro is offered on a subscription basis. All plans include a 30-day free trial. After the trial period, continued use requires a paid subscription. Subscriptions are billed monthly or annually depending on your chosen plan. Prices are subject to change with 30 days notice." },
    { title: "Data Ownership", content: "You retain full ownership of all data you enter into HifzPro, including institution data, student records, and lesson data. HifzPro does not claim ownership of your data. Upon termination of your account, you may request an export of your data before deletion." },
    { title: "Service Availability", content: "We strive to maintain 99.9% uptime but cannot guarantee uninterrupted access. We perform maintenance which may cause brief service interruptions. We will notify users of planned maintenance in advance when possible." },
    { title: "Termination", content: "You may cancel your account at any time from your account settings. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, access to the platform will cease and data will be deleted after 90 days." },
    { title: "Contact", content: "Questions about these Terms of Use should be sent to legal@hifzpro.com or through our contact page at hifzpro.com/contact." },
  ];

  return (
    <main>
      <SiteNav />
      <PageHero label="LEGAL" title="Terms of Use" subtitle="Last updated: January 2026" />
      <section style={{ background: colors.white, padding: "80px 5%" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
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
