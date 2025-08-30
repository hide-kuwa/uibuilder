export type UIPrimitive =
  | { kind: 'string'; title?: string; default?: string; multiline?: boolean; placeholder?: string; format?: 'color'|'text'|'url' }
  | { kind: 'number'; title?: string; default?: number; min?: number; max?: number; step?: number }
  | { kind: 'boolean'; title?: string; default?: boolean }
  | { kind: 'enum'; title?: string; options: { label: string; value: string }[]; default?: string }
  | { kind: 'object'; title?: string; properties: Record<string, UIPrimitive> }

export type UISchema = UIPrimitive
