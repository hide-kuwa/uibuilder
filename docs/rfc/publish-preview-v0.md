# Publish / Preview v0 (RFC)

## ゴール
「Publish」を押すと、manifest スナップショットがレンダラに渡り、/dev/preview で反映される。

## フロー
1. 現在の Document を `rev` 付きでスナップショット
2. Renderer(tsx) へ引き渡し → ビルド（CI stub 可）
3. 成果物: `rendered.html`（またはビルドログ）を保存
4. 画面を `/dev/preview?doc=<id>&rev=<rev>` に更新

## エラーハンドリング
- レンダリング失敗時はログをUIに表示（成功時は非表示）

## 将来拡張（非スコープ）
- 本物のCI/CD（ブランチごとのArtifact配信、差分デプロイ）

