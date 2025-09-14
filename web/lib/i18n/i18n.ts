type Dict = Record<string, string>

const en: Dict = {
  copyCss: 'Copy CSS',
  export: 'Export',
  import: 'Import',
  keyboardShortcuts: 'Keyboard Shortcuts',
  close: 'Close',
  skipToCanvas: 'Skip to canvas',
  styleTools: 'Style tools',
  rightPanel: 'Right panel',
  language: 'Language',
  add: 'Add',
  apply: 'Apply',
  remove: 'Remove',
  duplicate: 'Duplicate',
  moveUp: 'Move up',
  moveDown: 'Move down',
  inset: 'Inset',
  color: 'Color',
  gradient: 'Gradient',
  linear: 'Linear',
  radial: 'Radial',
  angle: 'Angle',
  shape: 'Shape',
  size: 'Size',
  addStop: 'Add stop',
}

const ja: Dict = {
  copyCss: 'CSSをコピー',
  export: 'エクスポート',
  import: 'インポート',
  keyboardShortcuts: 'キーボードショートカット',
  close: '閉じる',
  skipToCanvas: 'キャンバスへスキップ',
  styleTools: 'スタイルツール',
  rightPanel: '右ペイン',
  language: '言語',
  add: '追加',
  apply: '適用',
  remove: '削除',
  duplicate: '複製',
  moveUp: '上へ',
  moveDown: '下へ',
  inset: 'インセット',
  color: '色',
  gradient: 'グラデーション',
  linear: 'リニア',
  radial: 'ラジアル',
  angle: '角度',
  shape: '形状',
  size: 'サイズ',
  addStop: '色停止を追加',
}

const KEY = 'i18n:locale'
const hasWin = typeof window !== 'undefined'
let cached = (hasWin && localStorage.getItem(KEY)) || (hasWin ? navigator.language.slice(0, 2) : 'en')

export function getLocale(): 'en' | 'ja' {
  return (cached === 'ja' ? 'ja' : 'en')
}

export function setLocale(l: 'en' | 'ja') {
  cached = l
  if (hasWin) {
    try { localStorage.setItem(KEY, l) } catch {}
    try { document.documentElement.lang = l } catch {}
  }
}

export function t(k: keyof typeof en): string {
  const d = getLocale() === 'ja' ? ja : en
  return d[k] ?? (en as Dict)[k] ?? String(k)
}

export const messages = { en, ja }
