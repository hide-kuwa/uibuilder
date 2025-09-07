type LineageNodeKind = 'TB' | 'Schedule' | 'Entry' | 'Calc' | 'Manual';
interface LineageNodeMeta {
    id: string;
    label?: string;
    kind: LineageNodeKind;
    tags?: string[];
    groupId?: string;
}
interface LineageEdgeFlags {
    rounded?: boolean;
    taxAdjust?: boolean;
    manualAdjust?: boolean;
}
interface LineageEdge {
    from: string;
    to: string;
    transform?: string;
    flags?: LineageEdgeFlags;
}
interface LineageGraph {
    nodes: Record<string, LineageNodeMeta>;
    edges: LineageEdge[];
}

declare function useLineage(): {
    data: LineageGraph | undefined;
    error: any;
    isLoading: boolean;
};

export { useLineage };
