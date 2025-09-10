## 概要
Figma寄せ v0（MLP）の要件を「ドキュメントのみ（append-only）」で追加しました。

## 変更（docsのみ）
- RFC: figma-like-editor-v0 / auto-layout-lite-v0 / canvas-interactions-v0 / persistence-offline-v0 / publish-preview-v0
- Motion: motion-presets-v0 に Framer/Anime マッピング表と Reduced Motion・初期トークンを追記
- Schemas: page.meta.schema.json / node.motion.schema.json / tokens.motion.schema.json / patch.schema.json
- Tokens: tokens/motion.defaults.json

## 非スコープ
実装（/dev/figma・Zustand・ガイド描画・レンダラ・CI）、テスト追加

## ロールアウト
マージ後、feature flag（NEXT_PUBLIC_FIGMA=1）配下で /dev/figma 雛形→逐次実装PRを予定。
