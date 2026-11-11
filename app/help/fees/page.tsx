import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { colors, fonts } from "@/lib/tokens";

export const metadata: Metadata = {
  title: "Fee Module Handbook — HifzPro Help",
  description:
    "A bilingual (English/Urdu) step-by-step guide to the HifzPro Fee Management module, for campus admins.",
};

export default function FeeManualPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "content/help/fee-manual.html"),
    "utf8"
  );
  return (
    <>
      <div style={{ background: colors.deep, padding: "10px max(16px, env(safe-area-inset-left,0px))" }}>
        <Link
          href="/dashboard/admin/fees"
          style={{ color: "rgba(255,255,255,0.75)", fontFamily: fonts.heading, fontSize: 13, fontWeight: 600, textDecoration: "none" }}
        >
          ← Back to HifzPro
        </Link>
      </div>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </>
  );
}
