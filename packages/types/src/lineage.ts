export type LineageNodeKind = 'TB' | 'Schedule' | 'Entry' | 'Calc' | 'Manual';

export interface LineageNodeMeta {
  id: string;
  label?: string;
  kind: LineageNodeKind;
  tags?: string[];
  groupId?: string;
}

export interface LineageEdgeFlags {
  rounded?: boolean;
  taxAdjust?: boolean;
  manualAdjust?: boolean;
}

export interface LineageEdge {
  from: string;
  to: string;
  transform?: string;
  flags?: LineageEdgeFlags;
}

export interface LineageGraph {
  nodes: Record<string, LineageNodeMeta>;
  edges: LineageEdge[];
}

