# Changelog

User-facing changes and important reliability fixes. Versions are the
in-app labels (header, under "Route 5W"). This changelog starts at v5.47;
earlier history is in the git log.

## v5.65 — 2026-10-27
- Pace panel animation now exactly matches the List sheet's — a full-height
  sweep with the same timing in both directions, no fade.

## v5.64 — 2026-10-27
- Pace panel animates open and closed instead of popping (superseded by
  v5.65's exact-match rebuild).

## v5.63 — 2026-10-27
- Fixed the settings fan's fold-back: icons visibly fly back into the gear
  in reverse order instead of vanishing one by one.

## v5.62 — 2026-10-27
- Settings fan order: pin, home, night, flip, update (on top). Update icon
  enlarged.

## v5.61 — 2026-10-27
- The settings fan stays open when you use an item (e.g. switching night
  mode back and forth). Smoother open/close motion.

## v5.60 — 2026-10-27
- Fan icons spaced so they never overlap.

## v5.58 — 2026-10-27
- All corner controls consolidated into one settings fan at the bottom
  right; the hamburger menu is gone. The gear matches the day/night theme.

## v5.56 — 2026-10-27
- Header buttons reordered: List, Pace, Finish.

## v5.55 — 2026-10-27
- Fixed: the Undo state no longer pushes header buttons off-screen. In the
  street list, tapping a street opens its note editor.

## v5.54 — 2026-10-27
- Finish button (replaces Reset) with a confirmation pop-up summarizing
  the run. Deleting a clean returns to Previous cleans.

## v5.53 — 2026-10-27
- Per-street notes, auto-saved and filed with each archived clean. Tap a
  previous clean for full detail — per-street times and notes. Cleans can
  be deleted.

## v5.52 — 2026-10-27
- "Update app" button: checks for a newer build and reloads into it with
  confirmation. Menu and banner animations.

## v5.51 — 2026-10-27
- Reliability: clearing the GPS trail no longer reports success when the
  save failed; restore verifies its reads honestly; service-worker cache
  writes are awaited.

## v5.50 — 2026-10-27
- Installed-app header fixed (content sits below the iOS top band).
  Version label added under the title.

## v5.48 — 2026-10-27
- Visual polish: shared design tokens, panel accents, progress percentage
  in the header count.

## v5.47 — 2026-10-27
- Security hardening: offline caching accepts only integrity-verified
  library copies; notes and restore robustness fixes from an external
  audit.
