import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HifzPro — The World's Leading Hifz Management Platform",
  description:
    "Replace the manual diary with intelligent Sabaq–Sabqi–Manzil tracking. Built for Hifz institutes, Asatidha, and parents across Pakistan and beyond.",
  keywords: [
    "Hifz management", "Quran memorization", "Islamic education",
    "Hifz app Pakistan", "Sabaq Sabqi Manzil", "Hifz software",
    "madrasa management", "Quran institute",
  ],
  metadataBase: new URL("https://hifzpro.com"),
  openGraph: {
    title: "HifzPro — Memorize. Protect. Excel.",
    description:
      "Pakistan's first intelligent Hifz management platform. Sabaq, Sabqi, Manzil — digitized and protected.",
    url: "https://hifzpro.com",
    siteName: "HifzPro",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HifzPro — Memorize. Protect. Excel.",
    description: "Pakistan's first intelligent Hifz management platform.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ fontFamily: "var(--font-body)" }}>{children}</body>
    </html>
  );
}
