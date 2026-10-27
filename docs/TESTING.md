# Testing

## Commands (run in CI on every push)

```
python3 scripts/build-pages.py --check   # generated files match source; parity + SRI integrity
node tests/sw.test.mjs                   # service worker fetch-strategy tests
```

The build check rebuilds `index.html` from `src/tracker-source.html` in
memory and fails if the committed file differs, if parity breaks, or if the
service worker's integrity hashes drift from the page tags.

The service worker suite runs the worker's `cacheFirst` / `netFirst`
functions in Node with mocked caches and fetch — 14 cases: cache hits,
HTTP 503 with and without a cached copy, network failure, cache-write
failure, shell-vs-style confusion, slow-network responses (awaited, then
cached), tile error handling, and cache-write failures in `netFirst`.

## Release regression drives

Every release is additionally verified with a browser-driven battery
(headless Chromium over CDP) run against `src/tracker-source.html` before
publishing. It exercises, among other things:

- backup/restore fault cases (malformed notes, failed writes, rollback),
- notes and per-clean detail, the Finish / Undo flow,
- header layout in every state (nothing pushed off-screen),
- the settings fan: geometry, measured icon spacing, open/close animation
  profiles, stay-open behaviour,
- the Pace and List animations, compared side by side,
- an SRI regression: the page must refuse tampered library copies.

The drives live in the maintainer's working harness rather than this
repository; their results are reported with each release.

## Honest limitations

- A true service-worker upgrade-lifecycle test (old worker handing over to
  a new one on a real origin) has **not** been run — the local rig cannot
  host one. Upgrade behaviour rests on the versioned-cache design, code
  review, and on-device checks after each release.
- iOS installed-app behaviour (home-screen install, the standalone top
  band, update flow) is verified on a real device; no emulator covers it.
- The browser drive battery is not yet part of CI.
