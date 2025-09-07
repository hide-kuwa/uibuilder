import { L as LineageGraph } from '../lineage-DdBgGQ7F.js';

type Adjacency = {
    up: Record<string, string[]>;
    down: Record<string, string[]>;
};
declare function buildAdjacency(g: LineageGraph): Adjacency;
declare function walkUp(g: LineageGraph | Adjacency, start: string): string[];
declare function walkDown(g: LineageGraph | Adjacency, start: string): string[];
declare function detectCycles(g: LineageGraph): string[][];

export { type Adjacency, buildAdjacency, detectCycles, walkDown, walkUp };
