# Japan Map Porting Decision

- **Strategy chosen:** A – shared import.
- The SVG map lives in the workspace package `@repo/comp-maps-jp` under `packages/comp-maps-jp`.
- The `web` app already depends on this package via `package.json` and Next.js `transpilePackages` option.
- Therefore, we can import `JapanMap` directly from `@repo/comp-maps-jp` without copying files.
- No `tsconfig.json` path mapping is required beyond the existing workspace setup.
- This keeps the source of truth in one place and avoids duplication.
