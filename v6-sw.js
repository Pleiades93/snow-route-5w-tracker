// Route 5W service worker (v6, MapLibre build): lets the page open with NO signal, and re-uses
// map data already fetched (vector tiles, satellite tiles, fonts). Host this file in the SAME
// folder as index.html, over https. Without it the page still works online.
const CACHE = 'snow5w-v6', TILES = 'snow5w-tiles-v2', MAX_TILES = 2000;
const CORE = [
  'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all([
    ...CORE.map(u => c.add(u).catch(() => {})),
    c.add(new Request(self.registration.scope, { cache: 'reload' })).catch(() => {})
  ])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('snow5w-') && k !== CACHE && k !== TILES).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
async function netFirst(r) {            // the page itself: fresh when the network answers fast, cached otherwise
  const c = await caches.open(CACHE);
  try {
    const res = await Promise.race([fetch(r), new Promise((_, j) => setTimeout(() => j(new Error('slow')), 3500))]);
    if (res && res.ok) c.put(r, res.clone());
    return res;
  } catch (e) {
    const hit = await c.match(r, { ignoreSearch: true }) || await c.match(self.registration.scope);
    return hit || Response.error();
  }
}
async function cacheFirst(r, cacheName) {
  const c = await caches.open(cacheName);
  const hit = await c.match(r.url || r);
  if (hit) return hit;
  try {
    const res = await fetch(r);
    if (res && (res.ok || res.type === 'opaque')) {
      await c.put(r.url || r, res.clone());
      if (cacheName === TILES) {
        const ks = await c.keys();
        if (ks.length > MAX_TILES) await c.delete(ks[0]);
      }
    }
    return res;
  } catch (e) {
    return Response.error();
  }
}
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.hostname === 'tiles.openfreemap.org') e.respondWith(cacheFirst(r, TILES));
  else if (u.hostname === 'server.arcgisonline.com') e.respondWith(cacheFirst(r, TILES));
  else if (u.hostname === 'cdn.jsdelivr.net') e.respondWith(cacheFirst(r, CACHE));
  else if (r.mode === 'navigate' || u.origin === self.location.origin) e.respondWith(netFirst(r));
});
