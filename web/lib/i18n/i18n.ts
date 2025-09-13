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

