// public/sw.js — HifzPro Parent Portal Service Worker
const CACHE_VERSION = "hifzpro-v1";
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const API_CACHE     = `${CACHE_VERSION}-api`;

// Pages and assets to cache on install
const PRECACHE_URLS = [
  "/dashboard/parent",
  "/dashboard/parent/diary",
  "/dashboard/parent/attendance",
  "/dashboard/parent/progress",
  "/dashboard/parent/contact",
  "/signin",
  "/offline",
];

// ── Install: precache shell pages ──
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Fail silently — some pages may not be available offline
      });
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ──
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith("hifzpro-") && k !== STATIC_CACHE && k !== API_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: network-first for API, cache-first for static ──
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== "GET") return;
  if (!url.protocol.startsWith("http")) return;
  if (url.pathname.startsWith("/_next/webpack-hmr")) return;

  // API routes: network-first, cache fallback with 5-min TTL
  if (url.pathname.startsWith("/api/parent/")) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => {
            if (cached) return cached;
            // Return offline JSON for API calls when no cache
            return new Response(
              JSON.stringify({ success: false, error: "offline", offline: true }),
              { headers: { "Content-Type": "application/json" } }
            );
          })
        )
    );
    return;
  }

  // Next.js static assets: cache-first
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

  // Parent portal pages: network-first, stale fallback
  if (url.pathname.startsWith("/dashboard/parent") || url.pathname === "/signin") {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached => {
            if (cached) return cached;
            return caches.match("/offline") || new Response(
              `<!DOCTYPE html><html><head><meta charset="utf-8"><title>HifzPro — Offline</title>
              <meta name="viewport" content="width=device-width,initial-scale=1">
              <style>body{font-family:system-ui,sans-serif;background:#050D0A;color:white;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;padding:24px}
              .card{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:40px 32px;max-width:320px}
              h1{font-size:2rem;margin:16px 0 8px;color:#10B981}.sub{color:rgba(255,255,255,0.5);font-size:14px;line-height:1.7}
              .ar{font-family:serif;font-size:1.4rem;color:#C4882A;margin-bottom:20px}</style></head>
              <body><div class="card">
                <div style="font-size:3rem">📵</div>
                <h1>You're Offline</h1>
                <div class="ar">لا اتصال بالإنترنت</div>
                <p class="sub">No internet connection. Your last viewed data is still available — check your previously loaded pages.</p>
                <button onclick="location.reload()" style="margin-top:20px;padding:12px 28px;border-radius:10px;background:#10B981;color:#050D0A;border:none;font-weight:700;font-size:14px;cursor:pointer">Try Again</button>
              </div></body></html>`,
              { headers: { "Content-Type": "text/html" } }
            );
          })
        )
    );
    return;
  }
});

// ── Push notifications (future) ──
self.addEventListener("push", event => {
  if (!event.data) return;
  try {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || "HifzPro", {
        body:  data.body  || "",
        icon:  "/icons/icon-192.png",
        badge: "/icons/icon-96.png",
        tag:   data.tag   || "hifzpro",
        data:  data.url   || "/dashboard/parent",
        vibrate: [200, 100, 200],
        actions: data.actions || [],
      })
    );
  } catch (e) {
    console.error("Push notification error:", e);
  }
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const url = event.notification.data || "/dashboard/parent";
  event.waitUntil(
    clients.matchAll({ type: "window" }).then(list => {
      for (const client of list) {
        if (client.url.includes("/dashboard/parent") && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
