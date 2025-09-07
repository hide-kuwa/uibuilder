import type { GridSchema } from '@chizu/types/gridsheet';
type Row = Record<string, any>;
type Props = {
    schema: GridSchema;
    rows?: Row[];
    dataKey?: string;
};
export declare function GridSheet({ schema, rows: initRows }: Props): import("react/jsx-runtime").JSX.Element;
export {};
