export interface LayoutState {
  left: { width: number; collapsed: boolean };
  right: { width: number; collapsed: boolean };
  status: { height: number; visible: boolean };
  rightSections?: Record<string, boolean>;
  lastResetAt?: number;
}

import {
  LEFT_PANE_DEFAULT_WIDTH,
  RIGHT_PANE_DEFAULT_WIDTH,
  STATUS_BAR_HEIGHT,
} from './constants';

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
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STATE, ...parsed } as LayoutState;
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveLayout(patch: Partial<LayoutState>): void {
  if (typeof window === 'undefined') return;
  const current = loadLayout();
  const next = { ...current, ...patch };
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function resetLayout(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify({ ...DEFAULT_STATE, lastResetAt: Date.now() }));
}
