export type RecoRow = {
    id: string;
    amount: number;
    memo?: string;
};
export type RecoMatch = {
    leftId: string;
    rightId: string;
    score: number;
    reason: string[];
};
export declare function computeMatches(left: RecoRow[], right: RecoRow[], opts?: {
    amountTolerance?: number;
}): RecoMatch[];
