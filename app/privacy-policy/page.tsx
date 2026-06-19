"use client";
import Link from "next/link";
import MarketingNav from "@/components/ui/MarketingNav";
import MarketingFooter from "@/components/ui/MarketingFooter";
import { LegalPage } from "./legal-shared"; // adjust import to match your actual path

const TOC = [
  { label: "1. Who We Are",                 id: "priv-1" },
  { label: "2. Information We Collect",     id: "priv-2" },
  { label: "3. How We Use Your Information",id: "priv-3" },
  { label: "4. How We Share Your Information",id:"priv-4" },
  { label: "5. Data Security",             id: "priv-5" },
  { label: "6. Data Retention",            id: "priv-6" },
  { label: "7. Children's Privacy",        id: "priv-7" },
  { label: "8. Your Rights",               id: "priv-8" },
  { label: "9. Cookies",                   id: "priv-9" },
  { label: "10. International Users",      id: "priv-10" },
  { label: "11. Changes to This Policy",   id: "priv-11" },
  { label: "12. Contact Us",               id: "priv-12" },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      breadcrumb="Privacy Policy"
      eyebrow="LEGAL"
      title="Privacy Policy"
      subtitle="We are committed to protecting your privacy and the privacy of every student and parent who uses HifzPro."
      effectiveLine="🔒 Effective Date: 1 June 2026 · Last Updated: 1 June 2026"
      toc={TOC}
    >
      <p>This Privacy Policy explains how <strong>i9 Experts Private Limited</strong> ("we", "us", "our"), operating under the product name <strong>HifzPro</strong>, collects, uses, and protects the information of our users. By using HifzPro, you agree to the terms described in this policy.</p>

      <h2 id="priv-1">1. Who We Are</h2>
      <p><strong>i9 Experts Private Limited</strong><br />D-8/5, Shahrah-e-Jahangir, Gulberg Town, Karachi, Sindh, Pakistan<br /><br />Email: <a href="mailto:info@i9experts.com">info@i9experts.com</a> · WhatsApp: +92-300-2517280 · <a href="https://hifzpro.com">hifzpro.com</a></p>

      <h2 id="priv-2">2. Information We Collect</h2>
      <h3>2.1 Information Provided by Institutions</h3>
      <ul>
        <li>Institution name, address, type, and contact details</li>
        <li>Administrator name, email address, and phone number</li>
        <li>Asatidha (teacher) profiles including name, qualifications, and contact details</li>
        <li>Student profiles including name, guardian name, contact number, and enrollment information</li>
        <li>Lesson progress records (Sabaq, Sabqi, Manzil), attendance records, test results, and fee records</li>
      </ul>
      <h3>2.2 Information Provided by Parents</h3>
      <ul>
        <li>Name and WhatsApp phone number</li>
        <li>Login credentials for the Parent Portal</li>
        <li>Communication preferences</li>
      </ul>
      <h3>2.3 Automatically Collected Information</h3>
      <ul>
        <li>Browser type, device type, and operating system</li>
        <li>IP address and approximate geographic location</li>
        <li>Pages visited and features used within the platform</li>
      </ul>

      <h2 id="priv-3">3. How We Use Your Information</h2>
      <p>We use your information solely to operate and improve HifzPro:</p>
      <ul>
        <li>To provide Hifz management services described on our platform</li>
        <li>To send automated WhatsApp notifications to parents on behalf of the institution</li>
        <li>To generate reports, analytics, and certificates for institution use</li>
        <li>To process subscription payments and send billing communications</li>
        <li>To provide customer support and respond to inquiries</li>
        <li>To improve platform features and fix technical issues</li>
      </ul>

      <h2 id="priv-4">4. How We Share Your Information</h2>
      <p><strong>We do not sell, rent, or trade your personal information to any third party. Ever.</strong></p>
      <p>We share information only in these limited circumstances:</p>
      <ul>
        <li><strong>Service providers:</strong> Cloudinary (media storage), UltraMsg/Meta Cloud API (WhatsApp delivery). These providers process data only on our instructions.</li>
        <li><strong>Payment processors:</strong> Payment information is processed by our payment providers and never stored on HifzPro servers.</li>
        <li><strong>Legal compliance:</strong> We may disclose information if required by applicable Pakistani law or court order.</li>
        <li><strong>Business transfer:</strong> In the event of a merger or acquisition, users will be notified in advance.</li>
      </ul>

      <h2 id="priv-5">5. Data Security</h2>
      <p>We implement industry-standard security measures:</p>
      <ul>
        <li>All data is encrypted in transit using TLS 1.3</li>
        <li>Databases are encrypted at rest using AES-256</li>
        <li>Access to production systems is restricted to authorised personnel only</li>
        <li>Regular security audits and vulnerability assessments are conducted</li>
        <li>Password hashing using bcrypt with salting</li>
        <li>Role-based access control — each user accesses only data relevant to their role</li>
      </ul>

      <h2 id="priv-6">6. Data Retention</h2>
      <p>We retain your data for as long as your subscription is active. Upon cancellation:</p>
      <ul>
        <li>Your data remains accessible for 30 days after cancellation to allow data export</li>
        <li>After 30 days, your institution data is permanently deleted from our systems</li>
        <li>Backup copies are purged within 90 days</li>
      </ul>

      <h2 id="priv-7">7. Children's Privacy</h2>
      <p>HifzPro serves educational institutions where many students are minors. We apply the following protections:</p>
      <ul>
        <li>Student data is entered and controlled exclusively by the enrolled institution</li>
        <li>We never use student data for advertising, marketing, or any commercial purpose</li>
        <li>Student profiles are accessible only to authorised users at the relevant institution and to the student's parent via the Parent Portal</li>
        <li>We do not create profiles on students for any purpose other than educational record-keeping</li>
        <li>Parents may request access to, correction of, or deletion of their child's data at any time</li>
      </ul>
      <p>For more detail, see our <Link href="/safety-policy">Safety Policy</Link>.</p>

      <h2 id="priv-8">8. Your Rights</h2>
      <ul>
        <li><strong>Access:</strong> Request a copy of the personal data we hold about you</li>
        <li><strong>Correction:</strong> Request correction of inaccurate or incomplete data</li>
        <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
        <li><strong>Portability:</strong> Request your data in a structured, machine-readable format</li>
        <li><strong>Objection:</strong> Object to certain types of data processing</li>
      </ul>
      <p>To exercise any right, contact <a href="mailto:info@i9experts.com">info@i9experts.com</a> or WhatsApp +92-300-2517280. We will respond within 30 days.</p>

      <h2 id="priv-9">9. Cookies</h2>
      <p>HifzPro uses only essential cookies necessary for platform operation, including authentication session cookies and user preference cookies. We do not use advertising cookies or third-party tracking cookies.</p>

      <h2 id="priv-10">10. International Users</h2>
      <p>HifzPro is operated from Pakistan. By using HifzPro from outside Pakistan, you consent to the transfer and processing of your data under this Privacy Policy and applicable Pakistani law, including the Prevention of Electronic Crimes Act 2016 (PECA).</p>

      <h2 id="priv-11">11. Changes to This Policy</h2>
      <p>When we make material changes, we will notify you via email and/or a prominent notice on the platform at least 14 days before the changes take effect.</p>

      <h2 id="priv-12">12. Contact Us</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:info@i9experts.com">info@i9experts.com</a></li>
        <li><strong>WhatsApp:</strong> +92-300-2517280</li>
        <li><strong>Post:</strong> i9 Experts Private Limited, D-8/5, Shahrah-e-Jahangir, Gulberg Town, Karachi, Sindh, Pakistan</li>
      </ul>
      <p>This Privacy Policy is governed by the laws of Pakistan. Disputes are subject to the exclusive jurisdiction of the courts of Karachi, Pakistan.</p>
    </LegalPage>
  );
}
