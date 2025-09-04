import {
  LEFT_PANE_DEFAULT_WIDTH,
  RIGHT_PANE_DEFAULT_WIDTH,
  STATUS_BAR_HEIGHT,
} from './constants';
import {
  migrateLayout,
  LAYOUT_VERSION,
  type LayoutState,
  type LayoutDoc,
} from '../../../src/lib/migrations/layout';

export type { LayoutState } from '../../../src/lib/migrations/layout';

const KEY = 'uibuilder:layout';

const DEFAULT_STATE: LayoutState = {
  left: { width: LEFT_PANE_DEFAULT_WIDTH, collapsed: false },
  right: { width: RIGHT_PANE_DEFAULT_WIDTH, collapsed: false },
  status: { height: STATUS_BAR_HEIGHT, visible: true },
  rightSections: {},
};

export function loadLayout(): LayoutState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATE;
    const doc = migrateLayout(JSON.parse(raw));
    const { version, ...state } = doc as LayoutDoc;
    return { ...DEFAULT_STATE, ...state };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveLayout(patch: Partial<LayoutState>): void {
  if (typeof window === 'undefined') return;
  const current = loadLayout();
  const next = { ...current, ...patch };
  const doc: LayoutDoc = { version: LAYOUT_VERSION, ...next };
  window.localStorage.setItem(KEY, JSON.stringify(doc));
}

export function resetLayout(): void {
  if (typeof window === 'undefined') return;
  const doc: LayoutDoc = {
    version: LAYOUT_VERSION,
    ...DEFAULT_STATE,
    lastResetAt: Date.now(),
  };
  window.localStorage.setItem(KEY, JSON.stringify(doc));
}
