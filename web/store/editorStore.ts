import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produceWithPatches } from 'immer';
import type { EditorState, ComponentNode } from '@/types/editor';
import { idbStorage } from '@/lib/idb';
import { push, undo as undoStack, redo as redoStack } from './undoRedo';

interface EditorActions {
  select: (ids: string[] | ((prev: string[]) => string[])) => void;
  updateNode: (id: string, patch: Partial<ComponentNode>) => void;
  moveNode: (id: string, dx: number, dy: number, opts?: { snap?: boolean }) => void;
  resizeNode: (id: string, next: { w?: number; h?: number }) => void;
  rotateNode: (id: string, deg: number) => void;
  duplicate: (ids?: string[]) => void;
  remove: (ids?: string[]) => void;
  undo: () => void;
  redo: () => void;
}

function findNode(nodes: ComponentNode[], id: string): ComponentNode | null {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children) {
      const c = findNode(n.children, id);
      if (c) return c;
    }
  }
  return null;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  persist(
    (set, get) => {
      const apply = (recipe: (draft: EditorState) => void) => {
        const [next, patches, inverse] = produceWithPatches(get(), recipe);
        push(patches, inverse);
        set(next);
      };

      return {
        tree: [],
        selectedIds: [],
        hoverId: null,
        camera: { x: 0, y: 0, zoom: 1 },
        meta: { version: 1, updatedAt: Date.now() },
        select(ids) {
          set((state) => ({
            selectedIds: typeof ids === 'function' ? ids(state.selectedIds) : ids,
          }));
        },
        updateNode(id, patch) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) Object.assign(node, patch);
          });
        },
        moveNode(id, dx, dy) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = node.props || {};
              node.props.x = (node.props.x || 0) + dx;
              node.props.y = (node.props.y || 0) + dy;
            }
          });
        },
        resizeNode(id, next) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = node.props || {};
              if (next.w !== undefined) node.props.w = next.w;
              if (next.h !== undefined) node.props.h = next.h;
            }
          });
        },
        rotateNode(id, deg) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = node.props || {};
              node.props.rotation = deg;
            }
          });
        },
        duplicate(ids) {
          apply((draft) => {
            const targets = ids ?? draft.selectedIds;
            targets.forEach((id) => {
              const node = findNode(draft.tree, id);
              if (node) {
                const copy: ComponentNode = JSON.parse(JSON.stringify(node));
                copy.id = Math.random().toString(36).slice(2);
                draft.tree.push(copy);
                draft.selectedIds = [copy.id];
              }
            });
          });
        },
        remove(ids) {
          apply((draft) => {
            const targets = ids ?? draft.selectedIds;
            const removeRec = (nodes: ComponentNode[]): ComponentNode[] =>
              nodes.filter((n) => {
                if (targets.includes(n.id)) return false;
                if (n.children) n.children = removeRec(n.children);
                return true;
              });
            draft.tree = removeRec(draft.tree);
            draft.selectedIds = [];
          });
        },
        undo() {
          set((state) => undoStack(state));
        },
        redo() {
          set((state) => redoStack(state));
        },
      };
    },
    {
      name: 'uibuilder:editor',
      storage: createJSONStorage(() => idbStorage),
      version: 3,
    }
  )
);
