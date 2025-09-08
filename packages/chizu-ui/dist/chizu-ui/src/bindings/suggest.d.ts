import { type Snippet } from './snippets';
export type SuggestParams = {
    want?: Array<Snippet['category']>;
};
export declare function suggestSnippets(p?: SuggestParams): Snippet[];
