export type SuggestItem = { id: string; name?: string };
export async function suggestKeys(_root: string, _path: string): Promise<SuggestItem[]> {
  return []; // dev用の空実装（必要時に実データへ差し替え）
}

// minimal snippets stub
export function suggestSnippets(_opts?: any): Array<{ key: string; label: string; category?: string; formula: string }> {
  return [
    { key: 'number.format', label: 'Number: thousand-sep', category: 'format', formula: 'new Intl.NumberFormat().format($0)' },
  ];
}
