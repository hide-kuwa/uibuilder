export type Snippet = {
  key: string
  label: string
  formula: string   // $0..$n を使うテンプレ
  inputs?: string[] // 入力ヒント（型名や意味）
  category?: 'number' | 'date' | 'format' | 'safety'
}

export const BINDING_SNIPPETS: Snippet[] = [
  // number
  { key: 'round2', label: '丸め(小数2桁)', formula: 'ROUND($0, 2)', inputs: ['number'], category: 'number' },
  { key: 'safeDiv', label: '安全な割り算',   formula: '($1==0)?0:($0/$1)', inputs: ['numerator','denominator'], category: 'number' },
  { key: 'percent', label: 'パーセント表示', formula: 'ROUND($0*100,2)', inputs: ['ratio 0..1'], category: 'number' },

  // date
  { key: 'ymd',     label: '日付→YYYY-MM-DD', formula: 'FMT_DATE($0, "YYYY-MM-DD")', inputs: ['date|string'], category: 'date' },
  { key: 'month',   label: '日付→YYYY-MM',    formula: 'FMT_DATE($0, "YYYY-MM")',    inputs: ['date|string'], category: 'date' },

  // format
  { key: 'currencyJP', label: '通貨(円/カンマ)', formula: 'FMT_NUMBER($0, "###,###,##0")', inputs: ['number'], category: 'format' },

  // safety / misc
  { key: 'coalesce', label: 'null/undefined保護', formula: 'COALESCE($0, $1)', inputs: ['value','fallback'], category: 'safety' }
]

export function findSnippetsByCategory(cat?: Snippet['category']) {
  return cat ? BINDING_SNIPPETS.filter(s => s.category === cat) : BINDING_SNIPPETS
}

