"use client";
import Link from "next/link";
import { LegalPage } from "../privacy-policy/legal-shared"; // adjust path as needed

const TOC = [
  { label: "Our Core Commitment",           id: "safe-1" },
  { label: "Five Core Safety Guarantees",   id: "safe-2" },
  { label: "Data Minimisation",             id: "safe-3" },
  { label: "Access Controls",               id: "safe-4" },
  { label: "Parental Consent",              id: "safe-5" },
  { label: "WhatsApp Communications",       id: "safe-6" },
  { label: "Third-Party Services",          id: "safe-7" },
  { label: "Data Breach Response",          id: "safe-8" },
  { label: "Reporting a Safety Concern",    id: "safe-9" },
  { label: "Compliance",                    id: "safe-10" },
];

export default function SafetyPolicyPage() {
  return (
    <LegalPage
      breadcrumb="Safety Policy"
      eyebrow="LEGAL"
      title="Student Safety & Data Protection Policy"
      subtitle="HifzPro is used by institutions that serve children and young people. We take our responsibility to protect them with the utmost seriousness."
      effectiveLine="🛡️ Effective Date: 1 June 2026 · Last Updated: 1 June 2026"
      toc={TOC}
    >
      <p>Because HifzPro serves Hifz educational institutions where many students are minors, we have developed this dedicated Student Safety and Data Protection Policy. This document supplements our <Link href="/privacy-policy">Privacy Policy</Link> and <Link href="/terms-of-service">Terms of Service</Link>.</p>

      <h2 id="safe-1">Our Core Commitment</h2>
      <p>The safety, wellbeing, and privacy of every student enrolled in a HifzPro-managed institution is our absolute priority. Every feature we build, every data decision we make, and every third-party service we integrate is evaluated through the lens of student safety first.</p>

      <h2 id="safe-2">Five Core Safety Guarantees</h2>
      <div className="legal-callout">
        <ul>
          <li><strong>No advertising:</strong> Student data is never used to serve advertisements to anyone. HifzPro has no advertising business model.</li>
          <li><strong>No data selling:</strong> We never sell, rent, or trade student data to any third party under any circumstances.</li>
          <li><strong>No data mining:</strong> We do not analyse student data to build commercial profiles or conduct behavioural research for any purpose other than operating the service.</li>
          <li><strong>Parental rights:</strong> Parents and guardians have the right to access, correct, and request deletion of their child's data at any time.</li>
          <li><strong>Encrypted storage:</strong> All student data is encrypted at rest and in transit using industry-standard encryption.</li>
        </ul>
      </div>

      <h2 id="safe-3">Data Minimisation</h2>
      <p>We collect only the minimum data necessary to operate the educational management service. For student profiles, this includes name, guardian contact information, and academic records (lesson progress, attendance, test results). We do not require or store sensitive personal data such as national ID numbers, biometric data, or financial account details.</p>

      <h2 id="safe-4">Access Controls</h2>
      <p>Student data is protected by strict role-based access controls:</p>
      <ul>
        <li>Institution administrators can access all data for students enrolled at their institution only</li>
        <li>Asatidha (teachers) can access only the records of students assigned to their Halqa</li>
        <li>Parents and guardians can access only the records of their own children via the Parent Portal</li>
        <li>HifzPro staff can access institution data only when required for technical support, and only with the institution's knowledge</li>
        <li>No user can access data belonging to a different institution</li>
      </ul>

      <h2 id="safe-5">Parental Consent</h2>
      <p>It is the responsibility of the enrolled institution to obtain appropriate parental consent before entering a minor's data into HifzPro. By enrolling a student, the institution represents that it has obtained all necessary consents from the student's parent or guardian. HifzPro provides institutions with consent template language upon request — contact <a href="mailto:info@i9experts.com">info@i9experts.com</a>.</p>

      <h2 id="safe-6">WhatsApp Communications</h2>
      <p>HifzPro's WhatsApp integration sends automated messages to parents and guardians about their child's academic progress. These messages are:</p>
      <ul>
        <li>Sent only to numbers provided and authorised by the institution</li>
        <li>Strictly limited to educational content (lesson records, attendance, test results, fee reminders, certificates)</li>
        <li>Never used to send advertising, promotional content, or third-party messages</li>
        <li>Opt-out capable — parents may ask the institution to remove their number from automated messaging at any time</li>
      </ul>

      <h2 id="safe-7">Third-Party Services</h2>
      <p>We use a small number of carefully selected third-party services:</p>
      <ul>
        <li><strong>Cloudinary</strong> — Image and document storage. Data is stored in encrypted cloud infrastructure. Cloudinary does not use uploaded content for any commercial purpose.</li>
        <li><strong>WhatsApp / Meta Cloud API / UltraMsg</strong> — Messaging delivery only. Message content is not stored beyond delivery.</li>
        <li><strong>Railway</strong> — Cloud hosting. All data is stored in encrypted PostgreSQL databases.</li>
        <li><strong>Stripe</strong> — Payment processing for international plans. Stripe is PCI-DSS compliant. Card details never pass through HifzPro servers.</li>
      </ul>

      <h2 id="safe-8">Data Breach Response</h2>
      <p>In the event of a suspected or confirmed data breach:</p>
      <ul>
        <li>We will investigate and contain the breach within 24 hours of discovery</li>
        <li>Affected institutions will be notified within 72 hours with details of the breach and affected data</li>
        <li>We will cooperate fully with Pakistani data protection authorities</li>
        <li>A post-incident review will be conducted and remediation measures implemented</li>
      </ul>

      <h2 id="safe-9">Reporting a Safety Concern</h2>
      <p>If you have a concern about the safety or privacy of a student's data, please contact us immediately:</p>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:info@i9experts.com">info@i9experts.com</a></li>
        <li><strong>WhatsApp (urgent concerns):</strong> +92-300-2517280</li>
        <li><strong>Post:</strong> i9 Experts Private Limited, D-8/5, Shahrah-e-Jahangir, Gulberg Town, Karachi, Sindh, Pakistan</li>
      </ul>
      <p>All safety concerns are treated with the highest priority and will receive a response within 4 business hours (Monday–Friday, 10am–6pm PKT).</p>

      <h2 id="safe-10">Compliance</h2>
      <p>This policy is designed to comply with:</p>
      <ul>
        <li>The Prevention of Electronic Crimes Act 2016 (PECA), Pakistan</li>
        <li>The Personal Data Protection Bill (Pakistan)</li>
        <li>Applicable international best practices for children's data protection, including principles from the UK Children's Code and GDPR Article 8 where relevant to international users</li>
      </ul>
    </LegalPage>
  );
}
