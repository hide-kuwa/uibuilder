# Canvas Interactions v0 (RFC)

## 選択/移動/リサイズ
- Click = 単一選択、Shift+Click = 追加選択、ドラッグ矩形 = 範囲選択
- Alt+Drag = 複製、矢印キー = 1px移動（Shift+矢印 = 10px）
- リサイズハンドル（四隅+四辺）。Shift = アスペクト固定（TEXT除く）

## スナップ & ガイド
- 8px グリッドにスナップ
- 親境界/兄弟のエッジ/センターラインにスナップ
- 視覚ガイドはピンク。重なり優先は「対象→親→兄弟→グリッド」

## ヒットテスト
- `visible !== false` のノードのみ対象
- z-order は親の children 配列順（後方が前面）

## ショートカット
- `V`(選択), `T`(テキスト), `G`(フレーム), `⌘G`(グループ), `⌘Z/⌘⇧Z`(Undo/Redo)

## パフォーマンス指標
- P95: 選択/移動/リサイズの応答 < 16ms、コミット < 33ms
- 計測は `performance.mark/measure` を使用（action名/所要msをテレメトリへ）
