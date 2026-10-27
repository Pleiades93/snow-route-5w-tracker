// Route 5W service worker (v5.46, Leaflet build): lets the page open with NO
// signal, and re-uses map data already fetched (vector styles/tiles/glyphs from
// OpenFreeMap + CARTO, Esri fallback tiles, CDN libraries). Host this file in
// the SAME folder as index.html, over https. Without it the page still works
// online. Pattern carried from the v6 worker; the activate step deletes the
// v6 worker's caches (snow5w-v6, snow5w-tiles-v2) so no stale v6 page survives.
const CACHE = 'snow5w-shell-v546', TILES = 'snow5w-tiles-v3', MAX_TILES = 3000;
const CORE = [
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.css',
  'https://cdn.jsdelivr.net/npm/maplibre-gl@4.7.1/dist/maplibre-gl.js',
  'https://cdn.jsdelivr.net/gh/maplibre/maplibre-gl-leaflet@v0.0.22/leaflet-maplibre-gl.js'
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
async function netFirst(r, cacheName) {   // fresh when the network answers fast, cached otherwise
  const c = await caches.open(cacheName);
  try {
    const res = await Promise.race([fetch(r), new Promise((_, j) => setTimeout(() => j(new Error('slow')), 3500))]);
    if (res && res.ok) { c.put(r, res.clone()); return res; }
    // Server answered with an error status (503 etc.): prefer a good cached copy
    // (BUG-03, ChatGPT audit #2) - surface the error only when nothing is cached.
    // The app-shell fallback applies ONLY to page navigations (ISSUE-03,
    // audit #2): a map style or data request must never be handed HTML.
    const hitErr = await c.match(r, { ignoreSearch: true }) || (r.mode === 'navigate' ? await c.match(self.registration.scope) : undefined);
    return hitErr || res;
  } catch (e) {
    const hit = await c.match(r, { ignoreSearch: true }) || (r.mode === 'navigate' ? await c.match(self.registration.scope) : undefined);
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
      try {
        await c.put(r.url || r, res.clone());
        if (cacheName === TILES) {
          const ks = await c.keys();
          if (ks.length > MAX_TILES) await c.delete(ks[0]);
        }
      } catch (e) {}   // a failed cache write must not sink a good network response
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
  const mapHost = u.hostname === 'tiles.openfreemap.org' || u.hostname === 'basemaps.cartocdn.com' ||
    u.hostname === 'tiles.basemaps.cartocdn.com' || u.hostname === 'server.arcgisonline.com';
  if (mapHost && (u.pathname.endsWith('.json') || u.pathname.includes('/styles/'))) e.respondWith(netFirst(r, TILES));
  else if (mapHost) e.respondWith(cacheFirst(r, TILES));
  else if (u.hostname === 'unpkg.com' || u.hostname === 'cdn.jsdelivr.net') e.respondWith(cacheFirst(r, CACHE));
  else if (r.mode === 'navigate' || u.origin === self.location.origin) e.respondWith(netFirst(r, CACHE));
});
