# Dynamic Href Migration

This repository now enforces concrete URLs when using Next.js' App Router. Dynamic
segments such as `/users/[id]` are replaced with real values when linking or
navigating.

## Codemod

Run the codemod to rewrite existing `href` values and router calls:

```bash
pnpm codemod:href
```

Examples:

- `<Link href="/s/[pe]">` → `<Link href={`/s/${encodeURIComponent(pe)}`}>`
- `<Link href={{ pathname: '/s/[pe]', query: { pe } }} />` →
  `<Link href={{ pathname: `/s/${encodeURIComponent(pe)}`, query: {} }} />`
- `router.push('/companies/[id]')` →
  ``router.push(`/companies/${encodeURIComponent(id)}`)``

When the codemod cannot find the variable for a dynamic segment it inserts
`__MISSING_PARAM__` with a TODO comment.

## Route helpers

Dynamic routes under `web/app` generate functions in `web/lib/paths.ts`.
Regenerate when routes change:

```bash
pnpm routes:gen
```

Use these helpers instead of hard-coding paths.

## Checking for dynamic hrefs

CI should run the check script to prevent regressions:

```bash
pnpm routes:check
```

The script parses the source and fails when a literal path containing `[` is
found in `<Link>`, `router.push` or `router.replace`.

## Build integration

`typedRoutes` is enabled in `next.config.mjs` and `prebuild` runs the generator
and check:

```json
"prebuild": "pnpm routes:gen && pnpm routes:check"
```

## Notes

Legacy `as` props on `<Link>` are not transformed and should be updated
manually.

