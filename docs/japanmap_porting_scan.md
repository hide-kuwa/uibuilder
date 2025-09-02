# Japan Map Porting Scan

- Source components located in `packages/comp-maps-jp/src/`.
  - `JapanMap.tsx`: renders `<svg>` with prefecture paths.
    - Props: `values`, `showLabels`, `palette`, `strokeWidth`, `labelKind`, `onChange`, `onHover`.
    - Iterates `PrefShape` for each `PrefCode` using `PREF_PATHS` data.
    - Uses `colorOf` utility to derive fill color from `values` + `palette`.
    - Click handling: `PrefShape` receives `onClick` calling local `handleClick` which cycles status via `onChange` callback.
  - `components/PrefShape.tsx`: simple wrapper for `<path>` element.
    - Props: `{ code, d, fill, stroke, strokeWidth, onClick, onEnter, onLeave }`.
    - Emits `onClick(code)`, `onEnter(code)`, `onLeave()`.
    - Currently no `data-code` attribute; accessible interaction limited to mouse.
  - `data/prefPaths.ts`: mapping from `PrefCode` to SVG path strings.
    - Placeholder data for now (only a couple of prefectures defined).

- Prefecture codes handled by TypeScript `PrefCode` union types. No DOM `data-code` attributes.
- Lacks keyboard accessibility; paths are not focusable.
- To integrate with builder enum store:
  - Need adapter to convert numeric enum states (0–3) to `VisitStatus` strings used in map.
  - May patch map to accept `getFill(code)` and `onPrefClick(code)` for direct store linkage.
  - Consider adding `tabIndex` and keyboard handlers for accessibility.

