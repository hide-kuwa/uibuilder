import { layoutTemplateSchema, type LayoutTemplate } from '../../schemas/layout';
import { ZodError } from 'zod';

export const LAYOUT_VERSION = 1;

export interface LayoutState {
  left: { width: number; collapsed: boolean };
  right: { width: number; collapsed: boolean };
  status: { height: number; visible: boolean };
  rightSections?: Record<string, boolean>;
  lastResetAt?: number;
}

export type LayoutDoc = LayoutTemplate;

const DEFAULT_LAYOUT: LayoutState = {
  left: { width: 240, collapsed: false },
  right: { width: 320, collapsed: false },
  status: { height: 28, visible: true },
  rightSections: {},
};

// migrateLayout upgrades persisted layout JSON into latest format.
// v1 -> returned as-is; legacy unversioned objects are merged with defaults.
export function migrateLayout(json: any): LayoutDoc {
  if (!json || typeof json !== 'object') {
    return parse({ ...DEFAULT_LAYOUT, version: LAYOUT_VERSION });
  }
  const v = json.version ?? 0;
  if (v === LAYOUT_VERSION) {
    return parse({ ...DEFAULT_LAYOUT, ...(json as LayoutState), version: LAYOUT_VERSION });
  }
  if (v === 0) {
    const state = json as Partial<LayoutState>;
    return parse({ ...DEFAULT_LAYOUT, ...state, version: LAYOUT_VERSION });
  }
  throw new Error(`Unsupported layout version: ${v}`);
}

function parse(doc: unknown): LayoutDoc {
  try {
    return layoutTemplateSchema.parse(doc);
  } catch (err) {
    if (err instanceof ZodError) {
      const msg = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(msg);
    }
    throw err;
  }
}
