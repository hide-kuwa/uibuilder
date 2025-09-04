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

  undoStack: BuilderNode[][];
  redoStack: BuilderNode[][];

  setNodes: (nodes: BuilderNode[]) => void;

  updateMany: (patches: Array<Partial<BuilderNode> & { id: string }>) => void;
  setNodeStatus: (id: string, status: NodeStatus) => void;
  setStatusConfig: (updater: (draft: StatusConfig) => StatusConfig | void) => void;
  publishAll: () => void;
  setUsePublishedOnMap: (v: boolean) => void;
  undo: () => void;
  redo: () => void;
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
      undoStack: [],
      redoStack: [],

      setNodes: (nodes) =>
        set((s) => ({
          nodes,
          undoStack: [...s.undoStack, structuredClone(s.nodes)].slice(-20),
          redoStack: [],
        })),

      updateMany: (patches) =>
        set((s) => ({
          nodes: s.nodes.map((n) => {
            const p = patches.find((pp) => pp.id === n.id);
            return p ? { ...n, ...p } : n;
          }),
          undoStack: [...s.undoStack, structuredClone(s.nodes)].slice(-20),
          redoStack: [],
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

      undo: () =>
        set((s) => {
          if (s.undoStack.length === 0) return {};
          const previous = s.undoStack[s.undoStack.length - 1];
          return {
            nodes: previous,
            undoStack: s.undoStack.slice(0, -1),
            redoStack: [...s.redoStack, structuredClone(s.nodes)].slice(-20),
          };
        }),

      redo: () =>
        set((s) => {
          if (s.redoStack.length === 0) return {};
          const next = s.redoStack[s.redoStack.length - 1];
          return {
            nodes: next,
            redoStack: s.redoStack.slice(0, -1),
            undoStack: [...s.undoStack, structuredClone(s.nodes)].slice(-20),
          };
        }),

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

