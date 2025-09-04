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

注意

App Router の都合で、クライアント専用 UI は 'use client' 付きの分離コンポーネントにしています。

StatusConfig の compose.order === 'priority' のとき、Overlay は priority 降順 で合成します。

mode: glow は drop-shadow + 微少スケールアニメ を適用します（anime.js）。

