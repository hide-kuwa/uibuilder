## RC (YYYY-MM-DD)

- CI: Publish Perf P95 summary to Job Summary (CSV → Markdown)
- Script: Add `scripts/perf-summary.mjs` to aggregate `perf_raw.csv`
- Docs: Append P95 Baseline template to `docs/testing.md`
- Tests: Unit tests green; perf thresholds enforced in `apps/builder/e2e/perf-dod.spec.ts` (target P95 < 150ms)

Notes:
- P95 values will appear on PR Job Summary after CI runs. Copy them into `docs/testing.md` to finalize J-03.
