import { L as LineageGraph } from '../lineage-DdBgGQ7F.js';

type FlagAgg = {
    rounded: boolean;
    taxAdjust: boolean;
    manualAdjust: boolean;
};
declare function aggregateFlags(graph: LineageGraph, nodeId: string): FlagAgg;

export { type FlagAgg, aggregateFlags };
