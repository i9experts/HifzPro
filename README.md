# HifzPro

**The World's Leading Hifz Management Platform**

> Memorize. Protect. Excel.

Pakistan's first intelligent Hifz management system — replacing the manual diary with smart Sabaq–Sabqi–Manzil tracking, Manzil health scoring, WhatsApp parent updates, and institutional analytics.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Variables (Emerald Manuscript theme)
- **Fonts**: Cormorant Garamond · Outfit · DM Sans · JetBrains Mono
- **Deployment**: Vercel

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
hifzpro/
├── app/
│   ├── page.tsx          ← Landing page
│   ├── layout.tsx        ← Root layout + metadata
│   └── globals.css       ← Brand tokens + base styles
├── components/
│   ├── ui/
│   │   └── HifzMark.tsx  ← The Sealed Quran logo SVG
│   └── landing/
│       ├── Nav.tsx       ← Fixed navigation
│       ├── Hero.tsx      ← Full-screen hero
│       └── Pricing.tsx   ← Pricing with toggle
├── lib/
│   └── tokens.ts         ← Design tokens (colors, fonts, shadows)
├── tailwind.config.ts    ← Brand colors configured
└── next.config.mjs
```

## Brand

- **Theme**: Emerald Manuscript
- **Primary**: `#0D5C3A`
- **Gold**: `#C4882A`
- **Logo**: The Sealed Quran (octagonal seal + open Quran pages)

## Programs Supported

- Hifz ul Quran
- Nazra
- Tajweed / Qaidah
- Girdaan / Dohraai

---

© 2026 HifzPro. Built with care for the Huffaz of the Ummah.
