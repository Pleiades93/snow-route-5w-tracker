# Architecture

## Overview

The tracker is a single self-contained HTML file — markup, CSS and JavaScript
inline, no framework — built for one operator on one route (34 streets) from a
phone in a truck. The canonical source is `src/tracker-source.html`; the
GitHub Pages deployment (`index.html`) is generated from it by
`scripts/build-pages.py`.

## Basemap modes

The only intentional difference between source and deployment:

- **Source — `BASEMAP_MODE 'raster'`:** Leaflet with Esri raster tiles
  (World Light/Dark Gray). Also what the Muse-hosted test copy runs, because
  that host's content-security policy blocks the vector tile endpoints.
- **Deployment — `'vector'`:** MapLibre GL under Leaflet (OpenFreeMap positron
  by day, CARTO dark-matter at night), labels limited to settlement names.
  Any GL failure latches a fallback to the same Esri raster tiles.

Everything else — all application logic — is identical, and the build's
parity check proves it on every build.

## Data and persistence

All data lives on the device, in `localStorage` under the serving origin.
There is no server and no account.

| Key | Contents |
|---|---|
| `snow5w.v2` | Completed streets (set of street names) |
| `snow5w.v2.times` | Per-street completion timestamps |
| `snow5w.v2.history` | Last 10 archived cleans (only runs of 3+ streets) |
| `snow5w.v2.night` | Night mode |
| `snow5w.v4.notes` | Per-street notes and flags, filed per clean |
| `snow5w.v4.via` | How each street was marked (tap / GPS suggestion) |
| `snow5w.v4.trail` | GPS trail points for the current run |
| `snow5w.v4.cov` | GPS coverage samples |
| `snow5w.v5.start` | Current run's start time |
| `snow5w.v5.flip` | Flip mode |
| `snow5w.v5.sides` | Legacy side data, kept for backup compatibility |
| `snow5w.prep.v1` | Offline tile-prep state |

A backup is one JSON object `{app: 'snow5w-backup', v: 1, at, data}` covering
those keys. Restore is transactional: validate → snapshot current data →
write → verify each value by reading it back → on any failure, restore the
snapshot and verify the rollback. A key absent from a backup leaves the
current value untouched (deliberate). Legacy backups (completion set stored
as an object map) are converted on import.

## GPS and coverage

`watchPosition` with a stale-fix watchdog and a wake lock held only while a
run is active. Coverage samples estimate whether a street has been driven;
a covered street is *suggested* in a banner — marking is always an explicit
tap, never automatic. Each archived clean stores its GPS path (thinned,
capped) for later analysis.

## Service worker (`src/sw.js`)

- **Install:** caches the app shell. CDN libraries are cached only via
  integrity-checked fetches whose hashes match the page's SRI attributes —
  a tampered or drifted copy bricks nothing because it is never cached.
- **Strategies:** cache-first for the shell and libraries; network-first
  for map styles and tiles with cache fallback (a slow network response is
  still awaited and used after the 3.5 s race timeout — it is never
  abandoned for a stale copy).
- **Versioning:** the cache name carries the release (`snow5w-shell-vNNN`);
  activation deletes stale shell caches.
- **Offline prep:** on first online opens the app downloads the route area's
  Esri tiles (day + night) and warms the vector styles. Prep is only marked
  done when tiles actually saved; failures retry on a later open.

## Interface

Header (title, version label, List / Pace / Finish), the List sheet (street
rows, notes, export), the Pace panel (this run, pace verdict, previous
cleans with full per-clean detail), a street selection panel, and the
settings gear fan (location, home, night, flip, update app). The version
label under the title is bumped every release and is the in-app proof of
which build is running.
