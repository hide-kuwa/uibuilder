# Testing Guide

## What we test
- Unit (apps/builder/lib/**): utilities, audit/guide logic, save queue, export guards
- E2E (apps/builder/e2e/**): edit→guide→save→export / binding→repeat→env→save / presets→gate→offline→flush

## How to run (local)
- Unit: `pnpm -w run test:unit` (or `vitest --watch`)
- E2E (dev up): `pnpm -w run test:e2e`
- One-shot (dev→wait→E2E): `pnpm -w run test:e2e:serve`
- Report: `pnpm -w run test:report`

## P95 Baseline (YYYY-MM-DD)
audit.score: ___ ms
preset.apply: ___ ms
export.zip: ___ ms
(目標: いずれも P95 < 150ms、フルページAudit < 1000ms)

## Conventions
- data-testid は E2E でのみ付与（NEXT_PUBLIC_E2E=1）
- SaveBadge exposes `data-state` / `data-outbox`
- Gate threshold is `< 70` → ChangeGate
