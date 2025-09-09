// apps/builder/lib/presets/types.ts
export type PresetOp = { op: 'attach' | 'insertAfter'; target: string; nodeId: string }
export type Preset = { name: string; nodes: any[]; ops?: PresetOp[] }

