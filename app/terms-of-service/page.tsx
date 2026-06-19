// ─────────────────────────────────────────────────────────────
// TERMS OF SERVICE  →  app/terms-of-service/page.tsx
// ─────────────────────────────────────────────────────────────
"use client";
import Link from "next/link";
import { LegalPage } from "../privacy-policy/legal-shared"; // adjust path as needed

const TOC = [
  { label: "1. Acceptance of Terms",        id: "tos-1" },
  { label: "2. Description of Service",     id: "tos-2" },
  { label: "3. Account Registration",       id: "tos-3" },
  { label: "4. Subscriptions & Payment",    id: "tos-4" },
  { label: "5. Acceptable Use",             id: "tos-5" },
  { label: "6. Data & Content Ownership",   id: "tos-6" },
  { label: "7. Intellectual Property",      id: "tos-7" },
  { label: "8. Limitation of Liability",    id: "tos-8" },
  { label: "9. Termination",                id: "tos-9" },
  { label: "10. Governing Law",             id: "tos-10" },
  { label: "11. Changes to Terms",          id: "tos-11" },
  { label: "12. Contact",                   id: "tos-12" },
];

export default function TermsPage() {
  return (
    <LegalPage
      breadcrumb="Terms of Service"
      eyebrow="LEGAL"
      title="Terms of Service"
      subtitle="Please read these terms carefully before using HifzPro. By using our platform, you agree to be bound by these terms."
      effectiveLine="📜 Effective Date: 1 June 2026 · Last Updated: 1 June 2026"
      toc={TOC}
    >
      <h2 id="tos-1">1. Acceptance of Terms</h2>
      <p>These Terms of Service ("Terms") constitute a legally binding agreement between you and <strong>i9 Experts Private Limited</strong>, operating as <strong>HifzPro</strong>. By accessing or using hifzpro.com, you agree to be bound by these Terms. If you do not agree, do not use our services.</p>

      <h2 id="tos-2">2. Description of Service</h2>
      <p>HifzPro is a Software-as-a-Service (SaaS) platform designed to assist Islamic educational institutions in managing Quran memorization (Hifz) programmes. The platform includes student management, lesson progress tracking, attendance management, WhatsApp communication, fee management, certificate generation, and analytics modules.</p>

      <h2 id="tos-3">3. Account Registration</h2>
      <ul>
        <li>You must provide accurate and complete information when registering your institution account</li>
        <li>You are responsible for maintaining the confidentiality of your login credentials</li>
        <li>You must be at least 18 years of age and legally authorised to represent the institution</li>
        <li>You must notify us immediately of any unauthorised access to your account</li>
        <li>Each institution may have one primary admin account with sub-accounts for Asatidha and campus administrators</li>
      </ul>

      <h2 id="tos-4">4. Subscriptions & Payment</h2>
      <h3>4.1 Free Trial</h3>
      <p>We offer a 14-day free trial on all paid plans. No credit card is required. At the end of the trial, you must select a paid plan to continue using HifzPro.</p>
      <h3>4.2 Subscription Plans</h3>
      <p>HifzPro offers monthly and annual subscription plans priced in PKR (Pakistan) and GBP (international). Current pricing is displayed at <Link href="/pricing">hifzpro.com/pricing</Link>. Prices may change with 30 days' notice.</p>
      <h3>4.3 Payment Methods</h3>
      <ul>
        <li>Accepted payment methods include JazzCash, EasyPaisa, bank transfer, and credit/debit card via Stripe</li>
        <li>All fees are non-refundable except as required by applicable Pakistani consumer protection law</li>
        <li>Subscriptions are billed in advance, monthly or annually</li>
      </ul>
      <h3>4.4 Annual Plan</h3>
      <p>Annual subscriptions receive a 20% discount. Annual subscriptions are non-refundable after the first 14 days.</p>
      <h3>4.5 Cancellation</h3>
      <p>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period. Your data remains accessible for 30 days after cancellation for export purposes.</p>

      <h2 id="tos-5">5. Acceptable Use</h2>
      <p>You agree to use HifzPro only for lawful purposes. You must not:</p>
      <ul>
        <li>Use the platform for any purpose other than Hifz/Islamic education management</li>
        <li>Upload, transmit, or store content that is illegal, harmful, or violates any applicable law</li>
        <li>Attempt to gain unauthorised access to any part of the platform</li>
        <li>Use automated tools to scrape or extract platform data</li>
        <li>Use the WhatsApp integration to send unsolicited commercial messages</li>
        <li>Resell, sublicense, or otherwise transfer your HifzPro subscription</li>
      </ul>

      <h2 id="tos-6">6. Data & Content Ownership</h2>
      <p>You retain full ownership of all data you input into HifzPro, including student records, lesson data, and institution information. By using HifzPro, you grant us a limited licence to process this data solely to provide the services described in these Terms. We will never use your data for any purpose other than operating the platform for your institution.</p>

      <h2 id="tos-7">7. Intellectual Property</h2>
      <p>HifzPro, its logo, design, code, and all platform features are the intellectual property of i9 Experts Private Limited. Nothing in these Terms grants you any rights to our intellectual property. You may not copy, modify, distribute, or create derivative works from any part of HifzPro without our express written permission.</p>

      <h2 id="tos-8">8. Limitation of Liability</h2>
      <p>To the maximum extent permitted by Pakistani law, i9 Experts Private Limited shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of HifzPro. Our total liability shall not exceed the amount you paid us in the 3 months preceding the claim. The platform is provided "as is" without guarantee of uninterrupted or error-free service.</p>

      <h2 id="tos-9">9. Termination</h2>
      <p>We reserve the right to suspend or terminate your account immediately if you violate these Terms, fail to pay subscription fees, or engage in conduct harmful to the platform or other users. You may terminate your account at any time by cancelling your subscription and contacting us to delete your data.</p>

      <h2 id="tos-10">10. Governing Law</h2>
      <p>These Terms are governed by and construed in accordance with the laws of the Islamic Republic of Pakistan. Any disputes shall be subject to the exclusive jurisdiction of the competent courts of Karachi, Sindh, Pakistan.</p>

      <h2 id="tos-11">11. Changes to Terms</h2>
      <p>We will notify you of material changes via email at least 14 days before the changes take effect. Your continued use of HifzPro after the effective date constitutes your acceptance of the updated Terms.</p>

      <h2 id="tos-12">12. Contact</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:info@i9experts.com">info@i9experts.com</a></li>
        <li><strong>WhatsApp:</strong> +92-300-2517280</li>
        <li><strong>Address:</strong> i9 Experts Private Limited, D-8/5, Shahrah-e-Jahangir, Gulberg Town, Karachi, Sindh, Pakistan</li>
      </ul>
    </LegalPage>
  );
}
