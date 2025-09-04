// web/types/status.ts
export type BaseKind = 'visited' | 'live' | 'notVisited'; // 行った/住んでる/行ってない
export type OverlayKind = 'want' | 'photo'; // 行きたい/写真あり

export type NodeStatus = {
  base: BaseKind;
  overlays: OverlayKind[]; // 重ね順は UI の並び。compose.order==='priority' の場合は後で並べ替え
};

export type ComposeMode = 'blend' | 'override' | 'glow';

export type BaseConfig = Record<BaseKind, { label: string; color: string }>;

export type OverlayConfig = {
  key: OverlayKind;
  label: string;
  color: string;
  priority: number; // 高いほど先に適用（compose.order==='priority'）
  mode: ComposeMode;
};

export type StatusConfig = {
  base: BaseConfig;
  overlays: OverlayConfig[];
  compose: { order: 'priority' | 'as-is' };
};

export const DEFAULT_STATUS_CONFIG: StatusConfig = {
  base: {
    visited: { label: '行った', color: '#16a34a' }, // emerald-600
    live: { label: '住んでる', color: '#2563eb' }, // blue-600
    notVisited: { label: '行ってない', color: '#9ca3af' }, // gray-400
  },
  overlays: [
    { key: 'want', label: '行きたい', color: '#f59e0b', priority: 10, mode: 'glow' }, // amber-500
    { key: 'photo', label: '写真あり', color: '#db2777', priority: 5, mode: 'blend' }, // pink-600
  ],
  compose: { order: 'priority' },
};

