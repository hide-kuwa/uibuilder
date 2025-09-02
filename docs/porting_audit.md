# Porting Audit

## travel/
- No `travel/` directory or Firebase setup found in repository. Initial search for `travel` at root returned no results.

## web/
- `web/app/travel/demo/page.tsx` renders demo page using travel components.
- `web/components/travel/PrefGridMap.tsx` and `PrefShareBar.tsx` provide simple local painting and sharing via Base64.
- `web/store/prefPaintStore.ts` stores painted prefectures locally with import/export helpers.
- No Firebase initialization or services exist in `web/` yet.
- No `.env` files containing `NEXT_PUBLIC_FIREBASE_*` were found.

