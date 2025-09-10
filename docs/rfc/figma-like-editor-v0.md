# Figma-like Editor v0 (RFC / MLP)

## Scope (v0)
- On-canvas inline editing (text, name/description), selection/move/resize, multi-select
- Smart guides & snapping (parent bounds, sibling edges, 8px grid)
- Properties panel: position/size, cornerRadius, opacity, font, color
- AutoLayout-lite: stack(h/v), spacing, padding, align, gap
- Design tokens: color/text/space tokens reference
- Motion presets (v0): appear/enter/exit/hover 等のプリセット適用（Framer優先, anime対応可）
- Persist as JSON (offline-first via IndexedDB → outbox → server), instant apply
- Publish/Deploy hook: manifest → render pipeline（CI stub 可）

## Non-goals
- Vector/boolean ops, pen tool, prototyping, complex variants, real-time multiuser

## User Journeys
1. Create Frame → add Text/Image/Button → inline edit text → move/resize with snap
2. Wrap selection into Stack(H/V) → set spacing/padding/align in panel
3. Change tokens（color/text）→ autosave → refresh後も状態保持
4. Press Publish → manifestがビルド/反映されプレビュー更新
5. Motionを右ペインで選択 → プレビュー再生 → autosave

## Data Model (manifest; excerpt)
```ts
type TokenRef = { $token: string } // e.g. { $token: 'color.brand.primary' }

type NodeBase = {
  id: string; type: 'FRAME'|'STACK'|'RECT'|'TEXT'|'IMAGE'|'COMPONENT'|'INSTANCE';
  name?: string; visible?: boolean;
  x: number; y: number; width: number; height: number; rotation?: number;
  constraints?: { horizontal: 'LEFT'|'RIGHT'|'CENTER'|'SCALE'; vertical: 'TOP'|'BOTTOM'|'CENTER'|'SCALE' };
  style?: { fill?: TokenRef; text?: TokenRef; radius?: number; opacity?: number };
  motion?: MotionRef | MotionInline; // ← Motion v0
};
type Stack = NodeBase & { type: 'STACK'; direction: 'H'|'V'; spacing: number; padding: {t:number;r:number;b:number;l:number}; align: 'START'|'CENTER'|'END'|'SPACE_BETWEEN'; children: Node[] };
type Text = NodeBase & { type: 'TEXT'; content: string; font?: { family:string; size:number; weight?:number; lineHeight?:number } };
type Frame = NodeBase & { type: 'FRAME'; children: Node[] };
type Node = Frame|Stack|Text|NodeBase;

type MotionRef = { $motion: string }
type MotionInline = {
  engine?: 'framer'|'anime'
  preset?: 'fadeIn'|'fadeOut'|'slideInUp'|'slideInDown'|'slideInLeft'|'slideInRight'|'scaleIn'|'pop'|'flipY'|'staggerChildren'
  trigger?: 'appear'|'enter'|'exit'|'hover'|'press'|'focus'|'loop'|'scroll'
  options?: {
    duration?: number | { $token: string }
    delay?: number | { $token: string }
    easeToken?: { $token: string }
    distance?: number | { $token: string }
    direction?: 'up'|'down'|'left'|'right'
    repeat?: number | 'infinite'
    staggerStep?: number | { $token: string }
    disabledOnReducedMotion?: boolean
  }
}

export type Document = { id:string; name:string; pages: Page[]; tokens?: Record<string, string|number> };
export type Page = { id:string; name:string; root: Frame };
```

## Persistence

IndexedDB（shadow）←→ outbox queue（single-flight + retry + jitter）←→ API

## UI & Interactions

Selection: click/shift+click, marquee; resize handles; alt+drag=duplicate; shift=lock aspect

Text inline edit: double-click to enter, Esc/Enter to commit

Snap: 8px grid + sibling/parent edges（pink guides）

Shortcuts: V/T/G/⌘G/⌘Z/⌘⇧Z

## Properties Panel (v0)

Position(X,Y), Size(W,H), Radius, Opacity

Stack: direction, spacing, padding, align

Text: content*, font family/size/weight, color token

Motion: preset, trigger, duration/ease/distance（token対応）, preview

## Publish/Deploy

Manifest → renderer(tsx) → preview route（/dev/preview?doc=...）

CI hook stub: emits artifact rendered.html or build log

## Telemetry / Perf

Record per action（select/move/resize/commit/motion-play）durations

Targets: P95 16/16/16/33ms（操作/コミット）; Motion初期遅延 < 50ms, 60fps維持

## Acceptance Criteria

すべてブラウザ内で完結・コード記述ゼロ

Offline edit OK; reconnect flush OK; refresh後も再現

Publish後、プレビューで最新レンダリング

Motion は prefers-reduced-motion を尊重し自動軽減

## Rollout

/dev/figma（feature flag: NEXT_PUBLIC_FIGMA=1）

E2E placeholders: inline-edit.spec, stack.spec, publish.spec, motion.spec

