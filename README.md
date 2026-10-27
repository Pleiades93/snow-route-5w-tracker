# Snow Route 5W Tracker

A single-file web app for tracking driveway snow clearing on Route 5W in Vaughan, Ontario.
Built for one operator working a route of 34 streets: tap a street, mark it (or just its
left / right side), and the map, pace clock and history stay in step — designed to be used
from a phone in a truck, in the dark, with gloves-adjacent tapping and spotty signal.

## Live copies

- **Netlify (vector maps + real offline):** https://snow-route-5w.netlify.app/
- **Muse (fallback host):** https://muse.ai/s/snow-route-5w-tracker-xvxe6xjxoxixvxlxlxexd/zf3mdDG-JK2nxp2rwQ_vuBjuR1jvkiIJN4XxfMxYUC4

## What it does

- All 34 route streets drawn from real OpenStreetMap centrelines, mains first
  (yellow), side streets red, done green — with per-side marking, because the road
  plow leaves a windrow on both sides of the street.
- Pace tracking against your last full clean, GPS coverage suggestions, flags
  (car blocking / hazard / missed spot / needs salt), snow log with per-clean
  GPS paths, full backup / restore.
- Flip mode rotates the whole map 180° for starting from the far end; night mode
  for plowing in the dark; Flip and Night live in the ☰ menu, top left.
- Progress is stored **on the device only** (browser local storage). There is no
  server and no account; the backup/restore export is the way to move data.

## Files

| File | What it is |
|---|---|
| `index.html` | The deployable build: vector basemap (OpenFreeMap by day, CARTO dark at night) via MapLibre GL under Leaflet, with automatic fallback to Esri raster tiles if the vector source fails. This is what Netlify serves. |
| `sw.js` | Service worker for the deployable build: offline open + tile caching. Must sit beside `index.html` on an https host. |
| `tracker-source.html` | The canonical source build (raster basemap mode). Same app, same features; the two builds differ by one mode string plus the MapLibre tags. |
| `build-netlify.py` | Turns `tracker-source.html` into the deployable `index.html` (mode flip + tag injection) and zips it with `sw.js`. The bundle is never hand-edited. |
| `v6-index.html`, `v6-sw.js` | The retired v6 experiment (full MapLibre rewrite), kept for reference. |

## Running it

Open `index.html` from any static https host (Netlify Drop works: drag the folder
in). Without `sw.js` beside it, everything works except the offline open.

Map data © OpenStreetMap contributors; vector styles © OpenFreeMap / © CARTO;
fallback imagery-style tiles © Esri.
