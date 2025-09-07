import type { LineageGraph } from '@chizu/types/lineage';
export declare function useLineage(): {
    data: LineageGraph | undefined;
    error: any;
    isLoading: boolean;
};
