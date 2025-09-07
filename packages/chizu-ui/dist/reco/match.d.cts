type RecoRow = {
    id: string;
    amount: number;
    memo?: string;
};
type RecoMatch = {
    leftId: string;
    rightId: string;
    score: number;
    reason: string[];
};
declare function computeMatches(left: RecoRow[], right: RecoRow[], opts?: {
    amountTolerance?: number;
}): RecoMatch[];

export { type RecoMatch, type RecoRow, computeMatches };
