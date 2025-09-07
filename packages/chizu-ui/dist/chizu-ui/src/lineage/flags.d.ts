import type { LineageGraph } from '@chizu/types/lineage';
export type FlagAgg = {
    rounded: boolean;
    taxAdjust: boolean;
    manualAdjust: boolean;
};
export declare function aggregateFlags(graph: LineageGraph, nodeId: string): FlagAgg;
