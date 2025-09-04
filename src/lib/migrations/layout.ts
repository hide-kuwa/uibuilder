export const LAYOUT_VERSION = 1;

export interface LayoutState {
  left: { width: number; collapsed: boolean };
  right: { width: number; collapsed: boolean };
  status: { height: number; visible: boolean };
  rightSections?: Record<string, boolean>;
  lastResetAt?: number;
}

export interface LayoutDoc extends LayoutState {
  version: number;
}

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
    return { ...DEFAULT_LAYOUT, version: LAYOUT_VERSION };
  }
  const v = json.version ?? 0;
  if (v === LAYOUT_VERSION) {
    return { ...DEFAULT_LAYOUT, ...(json as LayoutState), version: LAYOUT_VERSION };
  }
  if (v === 0) {
    const state = json as Partial<LayoutState>;
    return { ...DEFAULT_LAYOUT, ...state, version: LAYOUT_VERSION };
  }
  throw new Error(`Unsupported layout version: ${v}`);
}
