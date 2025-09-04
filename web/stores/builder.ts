'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { NodeStatus, StatusConfig } from '@/types/status';
import { DEFAULT_STATUS_CONFIG } from '@/types/status';

type BuilderNode = {
  id: string;
  name?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
};

type PublishedSnapshot = {
  nodes: BuilderNode[];
  statuses: Record<string, NodeStatus>;
  statusConfig: StatusConfig;
  at: number;
};

type BuilderState = {
  nodes: BuilderNode[];
  statuses: Record<string, NodeStatus>;
  statusConfig: StatusConfig;
  publishedSnapshot: PublishedSnapshot | null;
  usePublishedOnMap: boolean;

  updateMany: (patches: Array<Partial<BuilderNode> & { id: string }>) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;
  setStatusConfig: (updater: (draft: StatusConfig) => StatusConfig | void) => void;
  publishAll: () => void;
  setUsePublishedOnMap: (v: boolean) => void;
  getMapNodes: (preview?: boolean) => BuilderNode[];
  getNodeStatus: (id: string) => NodeStatus;
};

export const useBuilderStore = create<BuilderState>()(
  persist(
    (set, get) => ({
      nodes: [],
      statuses: {},
      statusConfig: DEFAULT_STATUS_CONFIG,
      publishedSnapshot: null,
      usePublishedOnMap: true,

      updateMany: (patches) =>
        set((s) => ({
          nodes: s.nodes.map((n) => {
            const p = patches.find((pp) => pp.id === n.id);
            return p ? { ...n, ...p } : n;
          }),
        })),

      setNodeStatus: (id, status) =>
        set((s) => ({
          statuses: { ...s.statuses, [id]: status },
        })),

      setStatusConfig: (updater) =>
        set((s) => {
          const next = structuredClone(s.statusConfig);
          const r = updater(next);
          return { statusConfig: (r ?? next) as StatusConfig };
        }),

      publishAll: () =>
        set((s) => ({
          publishedSnapshot: {
            nodes: s.nodes,
            statuses: s.statuses,
            statusConfig: s.statusConfig,
            at: Date.now(),
          },
        })),

      setUsePublishedOnMap: (v) => set({ usePublishedOnMap: v }),

      getMapNodes: (preview) => {
        const s = get();
        if (preview) return s.nodes;
        if (!s.usePublishedOnMap) return s.nodes;
        return s.publishedSnapshot?.nodes ?? s.nodes;
      },

      getNodeStatus: (id) => {
        const s = get();
        return (
          s.statuses[id] ?? {
            base: 'notVisited',
            overlays: [],
          }
        );
      },
    }),
    { name: 'builder-store' }
  )
);

