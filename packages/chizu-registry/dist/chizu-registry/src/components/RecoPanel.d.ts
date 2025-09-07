type Row = {
    id: string;
    amount: number;
    memo?: string;
};
type Match = {
    leftId: string;
    rightId: string;
    score: number;
};
export declare function RecoPanel({ left, right, matches, onConfirm, }: {
    left: Row[];
    right: Row[];
    matches: Match[];
    onConfirm?: (m: Match) => void;
}): import("react/jsx-runtime").JSX.Element;
export {};
