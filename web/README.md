## 最小運用ガイド

### 起動 / ビルド

- 起動: `pnpm -C web dev`
- ビルド: `pnpm -C web build`

### 主要URL

- `/builder`（編集 → Publish）
- `/map`（published） / `/map?preview=1`（draft）
- `/share?id=<nodeId>`（共有用単体ビュー）
- `/dev/pages`（索引・テーマ・ユーティリティ）

### 操作フロー（3ステップ）

1. `/builder` で編集（ステータス/配置）
2. **Publish** → 最終公開日時が更新
3. `/map` で確認、必要に応じて `/share` を共有

### Export / Import

- `/dev/export` でエクスポート
- `/dev/import` でインポート

### 既知の注意

- クライアント専用 UI は `'use client'` 付きの分離コンポーネントにします
- `Link` の `href` は静的文字列のみ使用可
- `dynamic import` は `ssr: false` が必要な場合があります
- StatusConfig の `compose.order === 'priority'` のとき、Overlay は priority 降順で合成します
- `mode: glow` は drop-shadow + 微少スケールアニメ を適用します（anime.js）

## Builder → Map 反映フロー

- `/builder` で各ノードの **Base/Overlay** を編集（`StatusDropdown`）。
- 右側パネルの **Status Config** で色・優先度・モードを変更（`StatusConfigPanel`）。
- `/map?preview=1` でドラフトを確認。問題なければ **Publish All** ボタン。
- `/map`（published）は、ヘッダの「/map は公開版を使用」チェックが ON のときに公開スナップショットを表示します。
- `/dev/arrange` で位置/サイズを変更 → 「位置/サイズを保存」→ Publish → `/map` に反映。

### コマンド

```bash
pnpm -C web i
pnpm -C web dev
pnpm -C web build
```

