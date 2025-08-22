import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { produceWithPatches } from 'immer';
import type {
  EditorState,
  ComponentNode,
  ComponentDefinition,
  InstanceNode,
  SizeMode,
} from '@/types/editor';
import { idbStorage } from '@/lib/idb';
import { push, undo as undoStack, redo as redoStack } from './undoRedo';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';

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
  makeAutoLayout: (frameId?: string) => void;
  removeAutoLayout: (frameId?: string) => void;
  reorderChild: (parentId: string, from: number, to: number) => void;
  setLayoutProps: (
    id: string,
    patch: Partial<NonNullable<ComponentNode['props']>>
  ) => void;
  setSizeMode: (
    id: string,
    axis: 'w' | 'h',
    mode: SizeMode,
    value?: number
  ) => void;
  // Components
  createComponentFromSelection: (name?: string) => void;
  deleteComponent: (componentId: string) => void;
  renameComponent: (componentId: string, name: string) => void;
  createInstance: (componentId: string, pos?: { x: number; y: number }) => void;
  detachInstance: (nodeId: string) => void;
  swapInstance: (nodeId: string, nextComponentId: string) => void;
  // Variants
  defineVariantAxis: (componentId: string, axis: string, values: string[]) => void;
  setVariantRule: (
    componentId: string,
    rule: { when: Record<string, string>; node: string; patch: Partial<ComponentNode> }
  ) => void;
  removeVariantRule: (componentId: string, index: number) => void;
  setInstanceVariant: (nodeId: string, axis: string, value: string) => void;
  // Overrides
  setInstanceOverride: (
    nodeId: string,
    targetId: string,
    patch: Partial<ComponentNode>
  ) => void;
  resetInstanceOverride: (nodeId: string, targetId?: string) => void;
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

function findNodeWithParent(
  nodes: ComponentNode[],
  id: string,
  parent: ComponentNode | null = null
): { node: ComponentNode; parent: ComponentNode | null; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (n.id === id) return { node: n, parent, index: i };
    if (n.children) {
      const c = findNodeWithParent(n.children, id, n);
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
        components: {},
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
        makeAutoLayout(frameId) {
          apply((draft) => {
            const target = frameId
              ? findNode(draft.tree, frameId)
              : findNode(draft.tree, draft.selectedIds[0]);
            if (target) {
              target.props = target.props || {};
              target.props.layout = 'auto';
              if (!target.props.axis) target.props.axis = 'vertical';
            }
          });
        },
        removeAutoLayout(frameId) {
          apply((draft) => {
            const target = frameId
              ? findNode(draft.tree, frameId)
              : findNode(draft.tree, draft.selectedIds[0]);
            if (target && target.props) {
              target.props.layout = 'free';
            }
          });
        },
        reorderChild(parentId, from, to) {
          apply((draft) => {
            const parent = parentId
              ? findNode(draft.tree, parentId)
              : ({ children: draft.tree } as ComponentNode);
            if (parent && parent.children) {
              const c = parent.children.splice(from, 1)[0];
              parent.children.splice(to, 0, c);
            }
          });
        },
        setLayoutProps(id, patch) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (node) {
              node.props = { ...(node.props || {}), ...patch };
            }
          });
        },
        setSizeMode(id, axis, mode, value) {
          apply((draft) => {
            const node = findNode(draft.tree, id);
            if (!node) return;
            node.props = node.props || {};
            if (axis === 'w') {
              node.props.widthMode = mode;
              if (mode === 'FIXED' && value !== undefined) node.props.w = value;
            } else {
              node.props.heightMode = mode;
              if (mode === 'FIXED' && value !== undefined) node.props.h = value;
            }
          });
        },
        createComponentFromSelection(name) {
          apply((draft) => {
            const sel = draft.selectedIds[0];
            const res = findNodeWithParent(draft.tree, sel);
            if (!res) return;
            const { node, parent, index } = res;
            const compId = Math.random().toString(36).slice(2);
            draft.components[compId] = {
              id: compId,
              name: name || node.name || 'Component',
              root: node,
            } as ComponentDefinition;
            const instId = Math.random().toString(36).slice(2);
            const instance: InstanceNode = {
              id: instId,
              type: 'Instance',
              componentId: compId,
              props: { ...node.props },
            };
            if (parent && parent.children) parent.children[index] = instance;
            else draft.tree[index] = instance;
            draft.selectedIds = [instId];
          });
        },
        deleteComponent(componentId) {
          apply((draft) => {
            delete draft.components[componentId];
          });
        },
        renameComponent(componentId, name) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (c) c.name = name;
          });
        },
        createInstance(componentId, pos) {
          apply((draft) => {
            if (!draft.components[componentId]) return;
            const id = Math.random().toString(36).slice(2);
            const inst: InstanceNode = {
              id,
              type: 'Instance',
              componentId,
              variant: {},
              overrides: {},
              props: { x: pos?.x || 0, y: pos?.y || 0 },
            };
            draft.tree.push(inst);
            draft.selectedIds = [id];
          });
        },
        detachInstance(nodeId) {
          apply((draft) => {
            const res = findNodeWithParent(draft.tree, nodeId);
            if (!res) return;
            const inst = res.node as InstanceNode;
            const def = draft.components[inst.componentId];
            if (!def) return;
            let resolved = resolveVariant(def, inst.variant);
            if (inst.overrides) {
              resolved = applyOverrides(resolved, inst.overrides);
            }
            if (res.parent && res.parent.children)
              res.parent.children[res.index] = resolved;
            else draft.tree[res.index] = resolved;
          });
        },
        swapInstance(nodeId, nextComponentId) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst) return;
            inst.componentId = nextComponentId;
            const def = draft.components[nextComponentId];
            if (def?.axes) {
              inst.variant = inst.variant || {};
              // remove axes not in new component
              Object.keys(inst.variant).forEach((k) => {
                if (!def.axes || !def.axes[k]) delete inst.variant![k];
              });
              Object.entries(def.axes).forEach(([k, vals]) => {
                if (!inst.variant![k]) inst.variant![k] = vals[0];
              });
            }
          });
        },
        defineVariantAxis(componentId, axis, values) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (!c) return;
            c.axes = c.axes || {};
            c.axes[axis] = values;
          });
        },
        setVariantRule(componentId, rule) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (!c) return;
            c.rules = c.rules || [];
            c.rules.push(rule);
          });
        },
        removeVariantRule(componentId, index) {
          apply((draft) => {
            const c = draft.components[componentId];
            if (c?.rules) c.rules.splice(index, 1);
          });
        },
        setInstanceVariant(nodeId, axis, value) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst) return;
            inst.variant = inst.variant || {};
            inst.variant[axis] = value;
          });
        },
        setInstanceOverride(nodeId, targetId, patch) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst) return;
            inst.overrides = inst.overrides || {};
            const prev = inst.overrides[targetId] || {};
            inst.overrides[targetId] = { ...prev, ...patch };
          });
        },
        resetInstanceOverride(nodeId, targetId) {
          apply((draft) => {
            const inst = findNode(draft.tree, nodeId) as InstanceNode | null;
            if (!inst || !inst.overrides) return;
            if (targetId) delete inst.overrides[targetId];
            else inst.overrides = {};
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
      version: 5,
      migrate: (persisted, version) => {
        if (!persisted) return persisted;
        const state = persisted as EditorState;
        if (version < 4) {
          const setLayout = (nodes: ComponentNode[]) => {
            nodes.forEach((n) => {
              n.props = n.props || {};
              if (!n.props.layout) n.props.layout = 'free';
              if (n.children) setLayout(n.children);
            });
          };
          setLayout(state.tree);
        }
        if (version < 5) {
          if (!state.components) state.components = {} as any;
          const ensureVisible = (nodes: ComponentNode[]) => {
            nodes.forEach((n) => {
              if (!n.props) n.props = {};
              if (n.props.visible === undefined) n.props.visible = true;
              if (n.children) ensureVisible(n.children);
            });
          };
          ensureVisible(state.tree);
        }
        return state;
      },
    }
  )
);
