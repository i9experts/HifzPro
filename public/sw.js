// public/sw.js — HifzPro Service Worker
// CACHE_VERSION bump forces all clients to get fresh cache immediately
const CACHE_VERSION = "hifzpro-v3";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

const PRECACHE_URLS = [
  "/offline",
];

// ── Install ──
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: delete ALL old caches ──
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== STATIC_CACHE && k !== API_CACHE)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET over http(s)
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // ── CRITICAL: Never cache RSC / Next.js internal requests ──
  // These have special headers and must always go to the network
  if (
    request.headers.get("RSC") === "1" ||
    request.headers.get("Next-Router-Prefetch") === "1" ||
    request.headers.get("Next-Router-State-Tree") ||
    url.searchParams.has("_rsc") ||
    url.pathname.startsWith("/_next/data/")
  ) {
    event.respondWith(fetch(request));
    return;
  }

  // ── API routes: network-first, offline JSON fallback ──
  if (url.pathname.startsWith("/api/parent/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => cached ||
            new Response(
              JSON.stringify({ success: false, error: "offline", offline: true }),
              { headers: { "Content-Type": "application/json" } }
            )
          )
        )
    );
    return;
  }

  // ── Next.js static assets: cache-first (these never change) ──
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".woff2")
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // ── HTML pages: ALWAYS network-first, NEVER cache HTML responses ──
  // Caching HTML causes the RSC text bug — only cache static assets above
  if (
    url.pathname.startsWith("/dashboard/parent") ||
    url.pathname === "/signin"
  ) {
    event.respondWith(
      fetch(request)
        .catch(() =>
          caches.match("/offline").then(cached => cached ||
            new Response(
              `<!DOCTYPE html><html><head><meta charset="utf-8">
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <title>HifzPro — Offline</title>
              <style>body{font-family:system-ui,sans-serif;background:#050D0A;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}.card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px 32px;max-width:320px}h1{font-size:2rem;margin:16px 0 8px;color:#10B981}.ar{font-family:serif;font-size:1.4rem;color:#C4882A;margin-bottom:20px}.sub{color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7}</style>
              </head><body><div class="card">
              <div style="font-size:3rem">📵</div><h1>You're Offline</h1>
              <div class="ar">لا اتصال بالإنترنت</div>
              <p class="sub">No internet connection. Please check your connection and try again.</p>
              <button onclick="location.reload()" style="margin-top:20px;padding:12px 28px;border-radius:10px;background:#10B981;color:#050D0A;border:none;font-weight:700;font-size:14px;cursor:pointer">Try Again</button>
              </div></body></html>`,
              { headers: { "Content-Type": "text/html" } }
            )
          )
        )
    );
    return;
  }
});

// ── Push notifications ──
self.addEventListener("push", event => {
  try {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "HifzPro";
    const options = {
      body:     data.body || "",
      icon:     data.icon || "/icons/icon-192.png",
      badge:    "/icons/icon-192.png",
      tag:      data.tag || "hifzpro",
      renotify: true,
      vibrate:  [120, 60, 120],
      data:     { url: data.url || "/dashboard/parent" },
      actions: [
        { action: "open",    title: "📖 Open" },
        { action: "dismiss", title: "✕ Dismiss" },
      ],
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.error("Push notification error:", e);
  }
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  if (event.action === "dismiss") return;
  const url = event.notification.data?.url || "/dashboard/parent";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
      for (const client of windowClients) {
        if (client.url.includes("/dashboard/parent") && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
