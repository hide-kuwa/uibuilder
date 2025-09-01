import type { PrefCode } from '../types';
export const PREF_LABELS: Record<PrefCode, { x: number; y: number; name: string }> = {
  '01': { x: 50, y: 40, name: '北海道' },
  '13': { x: 140, y: 140, name: '東京' },
} as any;
export const CAPITAL_LABELS: typeof PREF_LABELS = {} as any;
