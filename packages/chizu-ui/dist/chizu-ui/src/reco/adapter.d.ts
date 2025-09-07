export type RecoRow = {
    id: string;
    amount: number;
    memo?: string;
};
export declare function projectRows<T extends Record<string, any>>(rows: T[], map: {
    id: keyof T;
    amount: keyof T;
    memo?: keyof T;
}): RecoRow[];
