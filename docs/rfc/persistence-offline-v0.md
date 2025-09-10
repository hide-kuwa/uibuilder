# Persistence & Offline v0 (RFC)

## 目的
オフラインでも編集可能にし、再接続時に outbox を安全にフラッシュする。

## IndexedDB スキーマ（提案）
- DB: `figma_v0`
  - `documents` { key: docId, value: DocumentSnapshot }
  - `patches` { key: auto, value: Patch, index: docId, createdAt }
  - `outbox`  { key: auto, value: PatchRef, index: docId, enqueuedAt }
  - `meta`    { key: name, value: any } // clientId, lastFlushAt 等

## パッチ
- 形式は `docs/schemas/patch.schema.json` を参照（JSON Pointer/ドットパス想定）
- マージ: last-writer-wins（`ts` 比較）+ 同一ノード内はパスごとに上書き
- トリガー: idle/online/手動「Sync Now」
- 失敗:指数バックオフ + ジッター、最大リトライ後はユーザ通知

## API インタフェース（v0）
- `POST /api/figma/patch` : { docId, clientId, patches[] } → { ok, serverVersion }
- `GET /api/figma/doc?docId=...` : 最新 Document を返す（復旧用）

## 受け入れ基準
- 機内モードで編集 → 復帰後に変更が反映
- リロードしてもローカル変更が保持

