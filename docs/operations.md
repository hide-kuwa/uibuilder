# Operations Runbook

## Environments
- Mock / Live toggle (EnvToggle `data-env`)
- Offline queue (Dexie outbox) → Auto flush on reconnect

## Change Gate
- Trigger: audit score < 70
- Approve flow: modal Approve → /api/audit-log に bypass 記録

## Export
- JSON / ZIP (stable contentHash, size guard)
- For large trees: split/stream roadmap (post-1.0)

