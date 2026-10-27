# Snow Route 5W Tracker

A single-file web app for tracking driveway snow clearing on Route 5W in Vaughan, Ontario.
Built for one operator working a route of 34 streets: tap a street, tap **Mark completed**,
and the map, pace clock and history stay in step — designed to be used from a phone in a
truck, in the dark, with gloves-adjacent tapping and spotty signal.

## Live

- **GitHub Pages (main host):** https://pleiades93.github.io/snow-route-5w-tracker/

## What it does

- All 34 route streets drawn from real OpenStreetMap centrelines: mains (cleaned
  first) yellow, the rest red, done green. One action per street — the whole street
  turns green, because the road plow leaves a windrow on both sides and both get
  cleaned on the pass.
- Pace tracking against your last full clean, GPS coverage suggestions (a street
  that looks covered is *offered*, never auto-marked), a snow log with per-clean
  GPS paths, and full backup / restore.
- Flip mode rotates the whole map 180° for starting from the far end; night mode
  for plowing in the dark. Flip and Night live in the ☰ menu, **bottom right**,
  which opens upward.
- Progress is stored **on the device only** (browser local storage). There is no
  server and no account; the backup/restore export is the way to move data.
- Offline: after the first online open, the app quietly saves the route area's
  map tiles (day + night) so a later cold start with no signal still shows the
  map under the route.

## Backup & restore

- A backup is one JSON file holding every storage key the app uses.
- Restore validates the file first — backup version and every value's shape —
  before anything is written; a bad file changes nothing.
- Before writing, restore snapshots the current data. Each restored value is
  verified by reading it back; on any failure the snapshot is put back and that
  rollback is itself verified by reading back. The result message reports what
  actually happened, including if a rollback could not be completed.
- **Missing keys:** a key absent from a backup leaves the current value on the
  device untouched. Restore replaces what the backup contains; it does not
  clear what it does not mention. This is deliberate.
- **Legacy data:** the completion set was once stored as an object map instead
  of a list. Backups in that old format are accepted and converted on import.

## Files

| File | What it is |
|---|---|
| `index.html` | The deployable build: vector basemap (OpenFreeMap by day, CARTO dark at night) via MapLibre GL under Leaflet, with automatic fallback to Esri raster tiles if the vector source fails. This is what GitHub Pages serves. |
| `sw.js` | Service worker for the deployable build: offline open + tile caching. Must sit beside `index.html` on an https host. |
| `tracker-source.html` | The canonical source build (raster basemap mode). Same app, same features; see *Build & parity* below. |
| `manifest.json` | Home-screen install metadata (name, icons, full-screen launch). |
| `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` | App icons for the home screen. |

## Build & parity

`index.html` is **generated** from `tracker-source.html` by a private build
script — it is never hand-edited. The only intentional differences between the
two files are the basemap: `index.html` runs in vector mode with the MapLibre
GL library tags injected; `tracker-source.html` runs the raster mode used for
testing. On every release the script builds the deployable file, then reverses
those known changes and asserts the result is byte-identical to the source —
so any other difference fails the build. Parity was verified for v5.41 and
v5.42. The check proves the two files carry identical app logic; it does not
replace functional testing, which is done separately on every release.

## Running it

This repo is the main source. GitHub Pages serves `index.html` straight from the
`main` branch — pushing the updated files is the whole deploy. Without `sw.js`
beside it, everything works except the offline open; without `manifest.json`
and the icons, the home-screen install just loses its name and icon.

Map data © OpenStreetMap contributors; vector styles © OpenFreeMap / © CARTO;
fallback imagery-style tiles © Esri.
