import type { PrefCode } from '../types';
export const PREF_PATHS: Record<PrefCode, string> = {
  '01': 'M10,10 h80 v60 h-80 z', // TODO: real SVG path
  '13': 'M120,120 h40 v30 h-40 z', // …
  // 以外はとりあえず四角 or 空文字でも可（描画されなくてもビルドは通る）
} as any;
