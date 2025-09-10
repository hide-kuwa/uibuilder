# API Quick Reference

## POST /api/audit-log
- Payload: { action: 'gate-approve', slug, score, user, ts }
- Response: 200 OK

## GET /api/exports.zip/:slug
- Params: slug
- Guards: size <= 2MB (roadmap: split/stream over 2MB)
- Response: application/zip (contentHash-stable filenames)

