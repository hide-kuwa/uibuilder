import { BINDING_SNIPPETS } from './snippets';
export function suggestSnippets(p = {}) {
    if (!p.want || p.want.length === 0)
        return BINDING_SNIPPETS;
    const set = new Set(p.want);
    return BINDING_SNIPPETS.filter(s => set.has(s.category));
}
