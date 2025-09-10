# Motion Presets v0 (RFC / MLP)

本RFCは Figma-like Editor v0 に「動きのプリセット」機能を追加するもの。データモデルはランタイム非依存（抽象層）で設計し、実装は engine: 'framer' | 'anime' を切替可能とする。

## 目的
- 各ノードに対し、ドロップダウンから「動き」を選ぶだけで適用
- 典型的な登場/退場/ホバー等を プリセット として提供（微調整はトークンで）
- エクスポート時は React 向けに安全な形（Framer Motion優先）でTSXへ

## スコープ(v0)
- 対象トリガー: appear（初回描画）, enter（条件表示/マウント）, exit（アンマウント）, hover, press, focus, loop, scroll
- 基本プリセット（最少構成）
  - fadeIn, fadeOut
  - slideInUp|Down|Left|Right（距離: token/px）
  - scaleIn, pop（scale + opacity）
  - flipY（軽量）
  - staggerChildren（親に設定。子に継承）
- オプション: duration, delay, easeToken, distance, direction, repeat, staggerStep, disabledOnReducedMotion
- プロパティパネル: 「Motion」セクション（Preset, Trigger, Duration, Easing, Distance, Preview）
- Motion Tokens: motion.duration.*, motion.ease.*, motion.distance.*, motion.stagger.*
- アクセシビリティ: prefers-reduced-motion 有効時は自動で軽減/無効化

## 非スコープ(v0)
- 複雑なスクロール連動（パララックス/ピン留め）
- 物理ベース/3Dトランスフォーム多用
- TL（タイムライン）エディタ

## データモデル（抜粋）
```ts
type MotionRef = { $motion: string } // 例: { $motion: 'preset.fadeIn' }

type MotionInline = {
  engine?: 'framer' | 'anime' // 省略時既定: 'framer'
  preset?: 'fadeIn' | 'fadeOut' | 'slideInUp' | 'slideInDown' | 'slideInLeft' | 'slideInRight' | 'scaleIn' | 'pop' | 'flipY' | 'staggerChildren'
  trigger?: 'appear' | 'enter' | 'exit' | 'hover' | 'press' | 'focus' | 'loop' | 'scroll'
  options?: {
    duration?: number | { $token: string } // motion.duration.short 等
    delay?: number | { $token: string }
    easeToken?: { $token: string } // motion.ease.standard 等
    distance?: number | { $token: string } // px想定
    direction?: 'up' | 'down' | 'left' | 'right'
    repeat?: number | 'infinite'
    staggerStep?: number | { $token: string } // 親のみに有効
    disabledOnReducedMotion?: boolean
  }
}

// 既存 NodeBase に追加（manifest 観点の定義）
type NodeBaseMotion = {
  motion?: MotionRef | MotionInline
}
```

### 例: ノードへの付与（manifestサンプル）
```jsonc
{
  "id": "btn-1",
  "type": "RECT",
  "name": "CTA Button",
  "x": 120, "y": 240, "width": 200, "height": 48,
  "motion": {
    "preset": "slideInUp",
    "trigger": "appear",
    "options": {
      "duration": { "$token": "motion.duration.medium" },
      "easeToken": { "$token": "motion.ease.standard" },
      "distance": 24
    }
  }
}
```

## ランタイム方針
- v0 既定: Framer Motion（React/SSR/variants/layout適合が高い）
- 代替: anime.js（命令的アニメのニーズに応じて engine: 'anime' で適用）
- エクスポータは抽象 → 具体マッピング層を持つ

例:
- preset.fadeIn → Framer: initial={{opacity:0}} animate={{opacity:1}}
- slideInUp → {initial:{y:distance, opacity:0}, animate:{y:0, opacity:1}}
- staggerChildren → 親 transition={{staggerChildren: step}}

## プリセット・マッピング表（v0）

| Preset | Trigger | Framer initial / animate / exit | Transition | Anime.js 概念対応 |
|-------|---------|----------------------------------|------------|-------------------|
| fadeIn | appear/enter | `{opacity:0}` → `{opacity:1}` | `duration/ease` | `targets.opacity: [0,1]` |
| fadeOut | exit | `{opacity:1}` → `{opacity:0}` | `duration/ease` | `targets.opacity: [1,0]` |
| slideInUp | appear/enter | `{y:distance, opacity:0}` → `{y:0, opacity:1}` | `duration/ease` | `translateY: [distance,0]` |
| slideInDown | appear/enter | `{y:-distance, opacity:0}` → `{y:0, opacity:1}` | 同上 | `translateY: [-distance,0]` |
| slideInLeft | appear/enter | `{x:-distance, opacity:0}` → `{x:0, opacity:1}` | 同上 | `translateX: [-distance,0]` |
| slideInRight | appear/enter | `{x:distance, opacity:0}` → `{x:0, opacity:1}` | 同上 | `translateX: [distance,0]` |
| scaleIn | appear/enter | `{scale:.92, opacity:0}` → `{scale:1, opacity:1}` | 同上 | `scale: [.92,1]` |
| pop | hover/press | `{scale:1}` → `{scale:1.06}`（hover） | `duration: short` | `scale: [1,1.06]` |
| flipY | appear/enter | `{rotateX:-90, opacity:0}` → `{rotateX:0, opacity:1}` | `transformPerspective`注意 | `rotateY or rotateX` |
| staggerChildren | appear/enter | 親: `transition={{staggerChildren:step}}` | 親のみ | `delay: anime.stagger(step)` |

### Reduced Motion
- `prefers-reduced-motion` 有効時:
  - `disabledOnReducedMotion=true` → アニメ無効
  - それ以外 → フェードのみ（opacity 遷移を最短に短縮）

## トークン初期値（推奨）

| Token | 値 | 備考 |
|---|---:|---|
| `motion.duration.short` | 180 | ms |
| `motion.duration.medium` | 280 | ms |
| `motion.duration.long` | 400 | ms |
| `motion.distance.xs` | 8 | px |
| `motion.distance.sm` | 16 | px |
| `motion.distance.md` | 24 | px |
| `motion.distance.lg` | 40 | px |
| `motion.stagger.step` | 60 | ms |
| `motion.ease.standard` | `cubic-bezier(0.2,0,0,1)` | |
| `motion.ease.emphasized` | `cubic-bezier(0.2,0,0,1)` | v0は同値 |
| `motion.ease.decelerate` | `cubic-bezier(0,0,0,1)` | |

## UIフロー
1) ノードを選択 → 右パネル「Motion」
2) Preset を選ぶ（必要に応じて Trigger/Duration/Easing/Distance を微調整）
3) 「Preview」トグルで単体再生（キャンバス側で一時的にリセット）
4) Autosave → IndexedDB → Outbox → API 反映

## 受け入れ基準（追加）
- Motion の選択・保存・再現がブラウザ内で完結
- prefers-reduced-motion 有効時に自動で軽減または無効化
- P95: プリセット再生の初期遅延 < 50ms / 60fps を維持
- Publish 後のプレビューでアニメが反映される（Framer実装）

## テレメトリ / パフォーマンス
- 記録: preset名/trigger/再生ms/fps推定/環境（reduce-motion等）
- 目標: 1プレイバックあたり GC/レイアウトスパイクを最小化（Long Taskなし）

## ロールアウト
- /dev/figma の右ペインに「Motion」セクション（feature flag継続）
- トークン編集は当面 JSON 直編集 or トークンパネル stub
