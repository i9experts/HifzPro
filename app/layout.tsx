import type { Metadata } from "next";
import { LanguageProvider } from "@/providers/LanguageProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "HifzPro — The World's Leading Hifz Management Platform",
  description: "Replace the manual diary with intelligent Sabaq–Sabqi–Manzil tracking. Built for Hifz institutes, Asatidha, and parents across Pakistan and beyond.",
  keywords: ["Hifz management", "Quran memorization", "Islamic education", "Hifz app Pakistan"],
  metadataBase: new URL("https://hifzpro.com"),
  openGraph: {
    title: "HifzPro — Memorize. Protect. Excel.",
    description: "Pakistan's first intelligent Hifz management platform.",
    url: "https://hifzpro.com",
    siteName: "HifzPro",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* English fonts */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        {/* Arabic font — Cairo supports both Arabic and Latin */}
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
