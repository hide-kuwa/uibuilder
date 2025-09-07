import type { LineageGraph } from '@chizu/types/lineage';
export type Adjacency = {
    up: Record<string, string[]>;
    down: Record<string, string[]>;
};
export declare function buildAdjacency(g: LineageGraph): Adjacency;
export declare function walkUp(g: LineageGraph | Adjacency, start: string): string[];
export declare function walkDown(g: LineageGraph | Adjacency, start: string): string[];
export declare function detectCycles(g: LineageGraph): string[][];
