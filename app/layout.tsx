import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/providers/LanguageProvider";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)",  color: "#050D0A" },
    { media: "(prefers-color-scheme: light)", color: "#0D5C3A" },
  ],
};

export const metadata: Metadata = {
  title: "HifzPro — The World's Leading Hifz Management Platform",
  description:
    "Replace the manual diary with intelligent Sabaq–Sabqi–Manzil tracking. Built for Hifz institutes, Asatidha, and parents across Pakistan and beyond.",
  keywords: ["Hifz management", "Quran memorization", "Islamic education", "Hifz app Pakistan"],
  metadataBase: new URL("https://hifzpro.com"),

  // PWA
  manifest: "/manifest.json",
  appleWebApp: {
    capable:       true,
    statusBarStyle: "black-translucent",
    title:         "HifzPro",
    startupImage: [
      {
        url: "/icons/splash-1170x2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/icons/splash-1284x2778.png",
        media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },

  // Open Graph
  openGraph: {
    title:       "HifzPro — Memorize. Protect. Excel.",
    description: "Pakistan's first intelligent Hifz management platform.",
    url:         "https://hifzpro.com",
    siteName:    "HifzPro",
    type:        "website",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "HifzPro" }],
  },

  // Icons
  icons: {
    icon:        [
      { url: "/icons/icon-32.png",  sizes: "32x32",   type: "image/png" },
      { url: "/icons/icon-96.png",  sizes: "96x96",   type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple:       [
      { url: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut:    "/icons/icon-96.png",
  },

  other: {
    "mobile-web-app-capable":          "yes",
    "msapplication-TileColor":         "#0D5C3A",
    "msapplication-TileImage":         "/icons/icon-144.png",
    "msapplication-config":            "none",
    "format-detection":                "telephone=no",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@400;500;600;700&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* Scheherazade for Arabic Quran text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
