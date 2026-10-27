/* Increment VERSION when publishing a new offline shell. No user answers are cached. */
const VERSION = "omnimatma-v5-validator";
const SHELL = `${VERSION}-shell`;
const PAGES = `${VERSION}-pages`;
const ASSETS = `${VERSION}-assets`;
const LIMITS = { [PAGES]: 32, [ASSETS]: 96 };

// Warm resources already loaded before the first service worker took control.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) return;
  const urls = event.data.urls.slice(0, 90).filter((value) => {
    if (typeof value !== 'string') return false;
    try {
      const url = new URL(value, self.location.origin);
      return url.origin === self.location.origin && !url.search &&
        (url.pathname.startsWith('/_next/static/') || url.pathname.startsWith('/fonts/') || /^\/icon[^/]*\.(png|svg)$/.test(url.pathname));
    } catch { return false; }
  });
  event.waitUntil(Promise.allSettled(urls.map(async (url) => {
    const response = await fetch(url);
    await remember(ASSETS, url, response);
  })));
});

async function trim(cache, limit) {
  const keys = await cache.keys();
  await Promise.all(keys.slice(0, Math.max(0, keys.length - limit)).map((key) => cache.delete(key)));
}

async function remember(name, request, response) {
  if (!response.ok || response.type === "opaque" || response.headers.get("Cache-Control")?.includes("no-store")) return;
  const cache = await caches.open(name);
  await cache.put(request, response.clone());
  await trim(cache, LIMITS[name] || 8);
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL);
    const fallback = await fetch("/offline.html", { cache: "no-cache" });
    if (!fallback.ok) throw new Error("Offline fallback unavailable");
    await cache.put("/offline.html", fallback);
    // A failed home-page request must not prevent installing the offline fallback.
    try {
      const home = await fetch("/", { cache: "no-cache", headers: { Accept: "text/html" } });
      if (home.ok && home.headers.get("content-type")?.includes("text/html")) await remember(PAGES, "/", home);
    } catch { /* First usable navigation will populate the cache. */ }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const owned = [SHELL, PAGES, ASSETS];
    await Promise.all((await caches.keys()).filter((key) => key.startsWith("omnimatma-") && !owned.includes(key)).map((key) => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname === "/sw.js" || url.pathname.includes("webpack") || url.pathname.includes("hot-update") || url.pathname.startsWith("/_next/webpack-hmr") || url.searchParams.has("_rsc") || request.headers.has("RSC")) return;
  if (request.mode === "navigate") {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: "no-cache" });
        if (response.ok && response.headers.get("content-type")?.includes("text/html")) {
          event.waitUntil(remember(PAGES, request, response.clone()));
        }
        return response;
      } catch {
        return (await (await caches.open(PAGES)).match(request)) || (await (await caches.open(SHELL)).match("/offline.html")) || new Response("Offline", { status: 503 });
      }
    })());
    return;
  }
  // Cache only public static resources; never API, RSC or arbitrary fetch results.
  const staticAsset = url.pathname.startsWith("/_next/static/") || ["style", "script", "font", "image"].includes(request.destination);
  if (!staticAsset) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(ASSETS)).match(request);
    if (cached) return cached;
    const response = await fetch(request, { cache: "no-cache" });
    event.waitUntil(remember(ASSETS, request, response.clone()));
    return response;
  })());
});
