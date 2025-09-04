import { create } from 'zustand';
import { getRegisteredComponent } from './componentRegistry';

export interface EditorNode {
  id: string;
  type: string;
  props: {
    text?: string;
    className?: string;
    variants?: Record<string, string>;
    [key: string]: any;
  };
  children: EditorNode[];
  locked?: boolean;
}

const createNode = (type: string, overrides: Partial<EditorNode> = {}): EditorNode => ({
  id: `node-${Math.random().toString(36).slice(2, 9)}`,
  type,
  props: { text: type, className: '', variants: {}, ...(overrides.props || {}) },
  children: overrides.children || [],
  ...overrides,
});

function cloneTree<T>(tree: T): T {
  return JSON.parse(JSON.stringify(tree));
}

function findNode(node: EditorNode, id: string): EditorNode | null {
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

function updateNode(node: EditorNode, id: string, updater: (n: EditorNode) => void): EditorNode {
  if (node.id === id) {
    updater(node);
  } else {
    node.children = node.children.map((c) => updateNode(c, id, updater));
  }
  return node;
}

export interface EditorState {
  root: EditorNode;
  selectedIds: string[];
  history: EditorNode[];
  future: EditorNode[];
  select: (ids: string[] | null) => void;
  addSelect: (id: string) => void;
  toggleSelect: (id: string) => void;
  groupSelected: () => void;
  ungroup: (id: string) => void;
  setLocked: (ids: string[], locked: boolean) => void;
  removeSelected: () => void;
  addNode: (type: string, parentId?: string) => void;
  updateProps: (id: string, props: Partial<EditorNode['props']>) => void;
  updateVariant: (id: string, variant: string, className: string) => void;
  applyTemplate: (root: EditorNode) => void;
  undo: () => void;
  redo: () => void;
}

const pushHistory = (history: EditorNode[], node: EditorNode): EditorNode[] => {
  const next = [...history, cloneTree(node)];
  return next.length > 10 ? next.slice(next.length - 10) : next;
};

export const useEditorStore = create<EditorState>((set, get) => ({
  root: createNode('div', { id: 'root' }),
  selectedIds: [],
  history: [],
  future: [],
  select: (ids) => set({ selectedIds: ids ? [...ids] : [] }),
  addSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds
        : [...s.selectedIds, id],
    })),
  toggleSelect: (id) =>
    set((s) => ({
      selectedIds: s.selectedIds.includes(id)
        ? s.selectedIds.filter((x) => x !== id)
        : [...s.selectedIds, id],
    })),
  groupSelected: () =>
    set((state) => {
      if (state.selectedIds.length < 2) return state;
      const root = cloneTree(state.root);
      const ids = state.selectedIds;
      const findParent = (node: EditorNode, childId: string): EditorNode | null => {
        for (const child of node.children) {
          if (child.id === childId) return node;
          const res = findParent(child, childId);
          if (res) return res;
        }
        return null;
      };
      const parent = findParent(root, ids[0]);
      if (!parent) return state;
      if (!ids.every((id) => findParent(root, id) === parent)) return state;
      const group: EditorNode = {
        id: `group-${Math.random().toString(36).slice(2, 9)}`,
        type: 'group',
        props: {},
        children: [],
      };
      parent.children = parent.children.reduce<EditorNode[]>((arr, c) => {
        if (ids.includes(c.id)) {
          group.children.push(c);
        } else {
          arr.push(c);
        }
        return arr;
      }, []);
      parent.children.push(group);
      return {
        root,
        selectedIds: [group.id],
        history: pushHistory(state.history, state.root),
        future: [],
      };
    }),
  ungroup: (id) =>
    set((state) => {
      const root = cloneTree(state.root);
      const ungroupRec = (node: EditorNode): boolean => {
        const idx = node.children.findIndex((c) => c.id === id && c.type === 'group');
        if (idx >= 0) {
          const grp = node.children[idx];
          node.children.splice(idx, 1, ...grp.children);
          return true;
        }
        return node.children.some((c) => ungroupRec(c));
      };
      if (!ungroupRec(root)) return state;
      return {
        root,
        selectedIds: [],
        history: pushHistory(state.history, state.root),
        future: [],
      };
    }),
  setLocked: (ids, locked) =>
    set((state) => {
      const root = cloneTree(state.root);
      ids.forEach((id) => updateNode(root, id, (n) => (n.locked = locked)));
      return {
        root,
        history: pushHistory(state.history, state.root),
        future: [],
      };
    }),
  removeSelected: () =>
    set((state) => {
      if (!state.selectedIds.length) return state;
      const root = cloneTree(state.root);
      const remove = (node: EditorNode) => {
        node.children = node.children.filter((c) => !state.selectedIds.includes(c.id));
        node.children.forEach(remove);
      };
      remove(root);
      return {
        root,
        selectedIds: [],
        history: pushHistory(state.history, state.root),
        future: [],
      };
    }),
  addNode: (type, parentId = 'root') =>
    set((state) => {
      const root = cloneTree(state.root);
      const parent = findNode(root, parentId);
      if (parent) {
        const meta = getRegisteredComponent(type);
        const props = meta?.defaultProps || {};
        parent.children.push(
          createNode(type, { props: { text: meta?.name || type, ...props } })
        );
      }
      return { root, history: pushHistory(state.history, state.root), future: [] };
    }),
  updateProps: (id, props) =>
    set((state) => {
      const root = cloneTree(state.root);
      updateNode(root, id, (n) => {
        n.props = { ...n.props, ...props };
      });
      return { root, history: pushHistory(state.history, state.root), future: [] };
    }),
  updateVariant: (id, variant, className) =>
    set((state) => {
      const root = cloneTree(state.root);
      updateNode(root, id, (n) => {
        n.props.variants = { ...(n.props.variants || {}), [variant]: className };
      });
      return { root, history: pushHistory(state.history, state.root), future: [] };
    }),
  applyTemplate: (root) =>
    set((state) => ({
      root: cloneTree(root),
      history: pushHistory(state.history, state.root),
      future: [],
      selectedIds: [],
    })),
  undo: () =>
    set((state) => {
      if (!state.history.length) return state;
      const prev = state.history[state.history.length - 1];
      const history = state.history.slice(0, -1);
      return { root: cloneTree(prev), history, future: [cloneTree(state.root), ...state.future] };
    }),
  redo: () =>
    set((state) => {
      if (!state.future.length) return state;
      const [next, ...rest] = state.future;
      return { root: cloneTree(next), history: pushHistory(state.history, state.root), future: rest };
    }),
}));

export { createNode };

