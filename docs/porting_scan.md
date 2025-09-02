# Porting Scan

## travel/
- (directory missing) Existing Firebase setup, services, Firestore rules, and env files not found.

## web/
- `components/domain/maps/JapanMap.tsx`: `Visit` union (`'none'|'passed'|'visited'|'lived'`) cycles on click via `CYCLE` array; uses `useMapUIStore` for hover.
- `app/travel/demo/page.tsx` present as demo page; no `/app/u/[uid]/m/[mapId]` route detected.
- `.env.local` located at `web/.env.local`; no other env files.
- `tsconfig.json` defines path aliases (`@core/*`, `@domain-components`, `@data`, `@/*`); none unresolved.
- `useMapUIStore` hover state in `components/domain/maps/mapStore.ts`.
- Persistent 47-prefecture paint store with bit-pack/unpack in `web/store/prefPaintStore.ts`.
