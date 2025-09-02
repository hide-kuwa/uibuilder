# Travel MVP Audit (Phase 1: Read-only)

This report inventories the current implementation status for the “Map Collection MVP” (Google login / 47 prefectures paint + save + URL share / photo upload / follow request-approve / visibility). No app code was changed; only docs and logs were added.

Generated: see commit timestamp

## Summary
- Painting UI exists as a reusable Japan map component (`web/components/domain/maps/JapanMap.tsx`) with interactive toggle logic; however, a dedicated “pref paint store”, share bar, and pack/unpack are not present in `web/`.
- Authentication, persistence services, and Firebase client setup for `web/` are not found (no `lib/firebase.ts`, no `services/travel.ts`).
- Visibility/follow rules and routes are not present in `web/` (no Firestore/Storage rules files, no `/u/[uid]/m/[mapId]` route).
- UI Builder presets and filters related to “travel” are not present.
- Build fails due to missing internal module aliases (e.g. `@core/action-bus`, `@domain-components`). See build log for details.

## Blocking Issues
- Build errors: module not found for internal aliases in `web` (see docs/build_and_types.log).
- No Firebase client config in `web/`; environment variables not defined for `web` (`.env.local.example` missing).
- Dev server should be avoided for logs (it blocks); build logs collected via `next build` instead.

## Feature Matrix (A–F)
| Key | Area | Status | Concern |
| --- | ---- | ------ | ------- |
| A | Paint (store/share) | Partial | JapanMap toggle exists, but no `prefPaintStore`, `japanPrefs`, `PrefGridMap`, or `PrefShareBar` in `web/` |
| B | Auth/Save | Missing | No `web/lib/firebase.ts`, no `services/travel.ts`; env example not found |
| C | Visibility/Follow | Missing | No Firestore/Storage rules; no schema for `users/{uid}/maps/{mapId}` visibility or followers collections |
| D | Routing | Partial | No `/u/[uid]/m/[mapId]`; demo page exists: `web/app/dev/actions/page.tsx` |
| E | UI Builder presets | Missing | No `web/lib/presets.ts`, PresetsFilterBar/presetsFilterStore/workspaceStore not found |
| F | Dependencies | Mixed | `next`, `react`, `tailwind`, `@tanstack/react-query` present; `firebase` and `zustand` not directly in `web` deps |

## File Map (key files found/missing)
- web/components/domain/maps/JapanMap.tsx: Interactive SVG of 47 prefectures with click-cycle (`none → passed → visited → lived`).
- web/app/dev/actions/page.tsx: Demo UI for interaction presets (unrelated to travel MVP persistence).
- Missing in `web/`: stores/prefPaintStore.ts, lib/japanPrefs.ts, PrefGridMap.tsx, PrefShareBar.tsx, lib/firebase.ts, services/travel.ts, visibility routes and rules.
- travel/ (separate sample app): contains Firebase usage (Firestore/Functions), chat, expense list, maps tooling (useful references, but not wired into `web/`).

## Next Info Needed
- Target route scheme for map details (e.g. `/u/[uid]/m/[mapId]`) and expected public URL format for `?p=` sharing.
- Visibility defaults and follow workflow (public/followers/private flag placement and approval model) for Firestore schema.
- Whether to reuse `travel/functions` logic (route calc, settlement) or keep MVP minimal.
- Decision on where to host Firebase client config for `web` and exact env var names.

## Build & Type Logs
- See `docs/build_and_types.log` (includes `pnpm -C web install`, `tsc -v`, `pnpm -C web build`).

*** End of Report ***
