const VERSION = "v1";
const HEAVY_CACHE = `heavy-cache-${VERSION}`;


const HEAVY_ASSETS = [
  "heavy.html",
  "assets/heavy.css",
  "assets/heavy.js",
  "assets/big-data.json",
  "assets/hero.jpg",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "PRECACHE_HEAVY") {
    event.waitUntil(precacheHeavy(event.source));
  }
});

async function precacheHeavy(sourceClient) {
  const cache = await caches.open(HEAVY_CACHE);

  let cachedCount = 0;
  const total = HEAVY_ASSETS.length;

  const report = async (pct, text) => {
    try {
      sourceClient?.postMessage({ type: "PRECACHE_PROGRESS", pct, text });
    } catch {}
  };

  await report(25, "Abrindo cache…");

  for (let i = 0; i < total; i++) {
    const url = HEAVY_ASSETS[i];
    await report(25 + Math.round((60 * (i / total))), `Baixando e cacheando: ${url}`);

    const req = new Request(url, { cache: "no-store" });
    const resp = await fetch(req);
    if (resp.ok) {
      await cache.put(req, resp.clone());
      cachedCount++;
    } else {
      console.warn("Falhou ao cachear", url, resp.status);
    }
  }

  await report(90, "Finalizando…");

  try {
    sourceClient?.postMessage({ type: "PRECACHE_DONE", cachedCount });
  } catch {}
}

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (url.origin !== self.location.origin) return;

  console.log("Fetch event for", url.pathname);
  if (
    url.pathname === "/javascript/worker/service-worker/example2/heavy.html" ||
    url.pathname.startsWith("/javascript/worker/service-worker/example2/assets")
  ) {
    event.respondWith(cacheFirst(req));
  }
});

async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;

  const cache = await caches.open(HEAVY_CACHE);
  const fresh = await fetch(req);
  if (fresh.ok) cache.put(req, fresh.clone());
  return fresh;
}
