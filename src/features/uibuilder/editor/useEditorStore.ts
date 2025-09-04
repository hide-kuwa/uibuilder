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
  selectedId: string | null;
  history: EditorNode[];
  future: EditorNode[];
  select: (id: string | null) => void;
  addNode: (type: string, parentId?: string) => void;
  updateProps: (id: string, props: Partial<EditorNode['props']>) => void;
  updateVariant: (id: string, variant: string, className: string) => void;
  removeNode: (id: string) => void;
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
  selectedId: null,
  history: [],
  future: [],
  select: (id) => set({ selectedId: id }),
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
  removeNode: (id) =>
    set((state) => {
      const root = cloneTree(state.root);
      const remove = (parent: EditorNode) => {
        parent.children = parent.children.filter((c) => c.id !== id);
        parent.children.forEach(remove);
      };
      remove(root);
      return { root, history: pushHistory(state.history, state.root), future: [] };
    }),
  applyTemplate: (root) =>
    set((state) => ({
      root: cloneTree(root),
      history: pushHistory(state.history, state.root),
      future: [],
      selectedId: null,
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

