/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // ── Prevent RSC/HTML responses from being cached by service workers ──
  async headers() {
    return [
      {
        // All HTML page routes — tell browsers and SW never to cache these
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
          {
            key: "Vary",
            value: "RSC, Next-Router-Prefetch, Next-Router-State-Tree",
          },
        ],
      },
      {
        // Next.js static assets ARE safe to cache long-term
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // API routes — no caching
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
