import { BINDING_SNIPPETS, type Snippet } from './snippets'

export type SuggestParams = {
  want?: Array<Snippet['category']>
}
export function suggestSnippets(p: SuggestParams = {}): Snippet[] {
  if (!p.want || p.want.length === 0) return BINDING_SNIPPETS
  const set = new Set(p.want)
  return BINDING_SNIPPETS.filter(s => set.has(s.category!))
}

