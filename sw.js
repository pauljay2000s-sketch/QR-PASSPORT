// Bump this number whenever you upload a new index.html so phones refresh.
const CACHE = "qr-attendance-v2";
const LIB = "https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js";
const SHELL = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(SHELL);
    try { await c.add(new Request(LIB, { mode: "no-cors" })); } catch (_) {}
  }));
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // The page itself: network first, so updates show up; cache when offline.
  if (url.origin === location.origin) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req).then(r => r || caches.match("./index.html")))
    );
    return;
  }
  // The scanner library: cache first, so the camera works without internet.
  if (req.url === LIB) {
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
  // Everything else (Google Apps Script, fonts) goes straight to the network.
});
