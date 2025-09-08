export type Snippet = {
    key: string;
    label: string;
    formula: string;
    inputs?: string[];
    category?: 'number' | 'date' | 'format' | 'safety';
};
export declare const BINDING_SNIPPETS: Snippet[];
export declare function findSnippetsByCategory(cat?: Snippet['category']): Snippet[];
