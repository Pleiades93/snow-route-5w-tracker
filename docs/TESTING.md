# Testing

## Commands (run in CI on every push)

```
python3 scripts/build-pages.py --check   # generated files match source; parity + SRI integrity
node tests/sw.test.mjs                   # service worker fetch-strategy tests
node tests/browser/run.mjs               # deterministic browser drives (second CI job)
```

The build check rebuilds `index.html` from `src/tracker-source.html` in
memory and fails if the committed file differs, if parity breaks, or if the
service worker's integrity hashes drift from the page tags.

The service worker suite runs the worker's `cacheFirst` / `netFirst`
functions in Node with mocked caches and fetch — 14 cases: cache hits,
HTTP 503 with and without a cached copy, network failure, cache-write
failure, shell-vs-style confusion, slow-network responses (awaited, then
cached), tile error handling, and cache-write failures in `netFirst`.

## Browser tests (in this repository, run in CI)

`tests/browser/` holds browser drives ported from the maintainer's local
battery — same filenames, same test bodies; only harness plumbing differs
(browser path, source path). Each drive boots the real app from
`src/tracker-source.html` in headless Chromium (Chrome DevTools Protocol,
Node built-ins only, no added dependencies), exercises it, and prints a
JSON result block; `run.mjs` aggregates the blocks and fails if any check
fails or any page exception occurs.

Coverage:

- `drive65` — stored-data validators: corrupt completion times and history
  are sanitized on load; good records survive.
- `drive66` — backup/restore: a valid backup restores exactly; unsupported
  versions and corrupt values are rejected; a mid-write storage failure is
  reported and the pre-restore state is kept.
- `drive83` — fault battery: prototype-key and malformed street/note data
  cannot corrupt state; a failed Finish (storage error) aborts honestly;
  a post-restore flush does not clobber restored data; a fully failed
  offline prep does not mark itself done.
- `drive86` — audit regression cases: restore and trail handling under
  malformed and legacy-shaped data.
- `drive88` — per-street notes and the per-clean detail view; the street
  counter respects dismissed suggestions.
- `drive89` — the Finish flow end to end: finish, history navigation, and
  the delete/clear pathways.

Running locally:

```
node tests/browser/run.mjs            # all drives
node tests/browser/run.mjs drive83    # a single drive
```

The browser binary is chosen by the `CHROME_BIN` environment variable
when set (CI sets it by locating the runner's Chrome); otherwise the
maintainer's local Chromium is used when present, else `google-chrome`
from PATH. The drives fulfil the page's remote map/library requests
through Node fetch, so a run needs network access for those fetches; the
assertions themselves are all local app logic. The service worker file is
deliberately 404'd inside the drives to keep runs hermetic — worker
behaviour is covered by `tests/sw.test.mjs`.

## Local-only tests (not in CI)

The rest of the maintainer's drive battery runs locally on every release
but is intentionally not in CI:

- Animation and geometry drives — settings-fan geometry and measured icon
  spacing, fan open/close animation profiles, the Pace/List motion
  comparison, header layout in every state. These assert pixel positions
  and mid-animation states; they are timing-sensitive and would be flaky
  in CI, so they stay local until a deterministic CI strategy exists.
- The SRI regression drive, which verifies the page refuses tampered
  library copies served from the live CDNs (network-dependent; the static
  hash-parity half of that guarantee is in the build check).
- GPS/coverage drives and the remaining historical regression drives.

CI therefore does **not** cover animation, geometry, or GPS behaviour;
those are verified locally per release and, for layout, on device.

## Honest limitations

- A true service-worker upgrade-lifecycle test (old worker handing over to
  a new one on a real origin) has **not** been run — the local rig cannot
  host one. Upgrade behaviour rests on the versioned-cache design, code
  review, and on-device checks after each release.
- iOS installed-app behaviour (home-screen install, the standalone top
  band, update flow) is verified on a real device; no emulator covers it.
