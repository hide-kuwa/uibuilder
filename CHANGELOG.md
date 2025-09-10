## RC (YYYY-MM-DD)

- CI: Publish Perf P95 summary to Job Summary (CSV → Markdown)
- Script: Add `scripts/perf-summary.mjs` to aggregate `perf_raw.csv`
- Docs: Append P95 Baseline template to `docs/testing.md`
- Tests: Unit tests green; perf thresholds enforced in `apps/builder/e2e/perf-dod.spec.ts` (target P95 < 150ms)

Notes:
- P95 values will appear on PR Job Summary after CI runs. Copy them into `docs/testing.md` to finalize J-03.

## v1.0.0-rc.1
- RC 基盤、perf ゲート導入（DoD: P95 < 150ms）、E2E/Unit の土台整備
- CI: Playwright レポートと perf_raw.csv を Artifacts 出力
- Docs: Testing Guide の P95 Baseline テンプレ追加
- Compatibility: append-only / no breaking changes

## v1.0.0-rc.2
- Unit-only 追加（セット 6a/6b）
- Compatibility: append-only / no breaking changes

## v1.0.0-rc.3
- Unit-only 追加（セット 6c/6d）
- Compatibility: append-only / no breaking changes

## v1.0.0-rc.4
- Unit-only 追加（セット 6e: concurrency & split plan）
- Compatibility: append-only / no breaking changes

## v1.0.0-rc.5
- Unit-only: cancel/resume outbox, split manifest helpers, gate timeline markers, size boundary spec（7a–7d）
- Docs: RC ブランチで CI から P95 Baseline を自動追記
- Perf: CSV 形式を固定（カンマ区切り + ヘッダー順安定）
- Compatibility: append-only / no breaking changes
