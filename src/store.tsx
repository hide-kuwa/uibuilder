import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ComponentNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  bindings?: Record<string, PropBinding>;
  variants?: { hover?: { className?: string } };
  children?: ComponentNode[];
  isContainer?: boolean;
}

export interface PropBinding {
  source: string;
  endpoint: string;
  path: string;
  fallback?: string;
}

interface EditorState {
  tree: ComponentNode[];
  selectedComponentId: string | null;
  hoverPreview: boolean;
  inspectorTab: 'default' | 'hover';
}

interface EditorActions {
  selectComponent: (id: string | null) => void;
  moveComponent: (dragId: string, parentId: string | null, index: number) => void;
  moveNode: (from: number[], to: number[]) => void;
  addComponent: (type: string) => void;
  duplicateComponent: (id: string) => void;
  deleteComponent: (id: string) => void;
  setProp: (id: string, prop: string, value: any) => void;
  pushHistory: (t: ComponentNode[]) => void;
  undo: () => void;
  redo: () => void;
  loadTemplate: (t: ComponentNode[]) => void;
  setHoverPreview: (v: boolean) => void;
  setInspectorTab: (t: 'default' | 'hover') => void;
}

interface EditorContextValue {
  state: EditorState;
  actions: EditorActions;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export const EditorProvider: React.FC<{ initialTree?: ComponentNode[]; children: ReactNode }> = ({
  initialTree = [],
  children
}) => {
  const [tree, setTree] = useState<ComponentNode[]>(initialTree);
  const [history, setHistory] = useState<ComponentNode[][]>([initialTree]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'default' | 'hover'>('default');

  const pushHistory = (t: ComponentNode[]) => {
    setTree(t);
    setHistory(h => [...h.slice(0, historyIndex + 1), t]);
    setHistoryIndex(i => i + 1);
  };

  const undo = () => {
    if (historyIndex === 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    setTree(history[idx]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    setTree(history[idx]);
  };

  const loadTemplate = (t: ComponentNode[]) => {
    setTree(t);
    setHistory([t]);
    setHistoryIndex(0);
  };

  const selectComponent = (id: string | null) => setSelectedComponentId(id);

  const moveComponent = (dragId: string, parentId: string | null, index: number) => {
    const t = moveNodeById(tree, dragId, parentId, index);
    pushHistory(t);
  };

  const moveNode = (from: number[], to: number[]) => {
    setTree(prev => moveByPath(prev, from, to));
  };

  const addComponent = (type: string) => {
    const id = Math.random().toString(36).slice(2, 10);
    const node: ComponentNode = {
      id,
      type,
      isContainer: ['Sidebar', 'Section', 'Window'].includes(type)
    };
    setTree(prev => {
      if (selectedComponentId) {
        const p = findPath(prev, selectedComponentId);
        if (p) {
          const target = getNode(prev, p);
          if (target?.isContainer) return insertAt(prev, [...p, target.children ? target.children.length : 0], node);
        }
      }
      return insertAt(prev, [prev.length], node);
    });
  };

  const duplicateComponent = (id: string) => {
    const t = duplicateNode(tree, id);
    pushHistory(t);
  };

  const deleteComponent = (id: string) => {
    const t = deleteNode(tree, id);
    pushHistory(t);
    setSelectedComponentId(prev => (prev === id ? null : prev));
  };

  const setProp = (id: string, prop: string, value: any) => {
    setTree(prev => setNodeProp(prev, id, prop, value));
  };

  const value: EditorContextValue = {
    state: { tree, selectedComponentId, hoverPreview, inspectorTab },
    actions: {
      selectComponent,
      moveComponent,
      moveNode,
      addComponent,
      duplicateComponent,
      deleteComponent,
      setProp,
      pushHistory,
      undo,
      redo,
      loadTemplate,
      setHoverPreview,
      setInspectorTab
    }
  };

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>;
};

export const useEditorState = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditorState must be used within EditorProvider');
  return ctx.state;
};

export const useEditorActions = () => {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error('useEditorActions must be used within EditorProvider');
  return ctx.actions;
};

// ---------- ユーティリティ関数群 ----------
function cloneNode(node: ComponentNode): ComponentNode {
  return { ...node, children: node.children?.map(cloneNode) };
}

function deleteNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  return nodes
    .filter(n => n.id !== id)
    .map(n => (n.children ? { ...n, children: deleteNode(n.children, id) } : n));
}

function duplicateNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  const result: ComponentNode[] = [];
  for (const n of nodes) {
    if (n.id === id) {
      result.push(n);
      const copy = cloneNode(n);
      copy.id = `${n.id}_copy_${Math.random().toString(36).slice(2, 8)}`;
      result.push(copy);
    } else if (n.children) {
      result.push({ ...n, children: duplicateNode(n.children, id) });
    } else {
      result.push(n);
    }
  }
  return result;
}

function removeNode(nodes: ComponentNode[], id: string): { nodes: ComponentNode[]; removed?: ComponentNode } {
  const result: ComponentNode[] = [];
  let removed: ComponentNode | undefined;
  for (const n of nodes) {
    if (n.id === id) {
      removed = n;
      continue;
    }
    if (n.children) {
      const res = removeNode(n.children, id);
      if (res.removed) {
        removed = res.removed;
        result.push({ ...n, children: res.nodes });
      } else {
        result.push(n);
      }
    } else {
      result.push(n);
    }
  }
  return { nodes: result, removed };
}

function insertNode(nodes: ComponentNode[], parentId: string | null, index: number, node: ComponentNode): ComponentNode[] {
  if (parentId === null) {
    const arr = [...nodes];
    arr.splice(index, 0, node);
    return arr;
  }
  return nodes.map(n => {
    if (n.id === parentId) {
      const children = n.children ? [...n.children] : [];
      children.splice(index, 0, node);
      return { ...n, children };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, index, node) };
    }
    return n;
  });
}

function findPath(nodes: ComponentNode[], id: string, path: number[] = []): number[] | null {
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const p = [...path, i];
    if (n.id === id) return p;
    if (n.children) {
      const res = findPath(n.children, id, p);
      if (res) return res;
    }
  }
  return null;
}

function getNode(nodes: ComponentNode[], path: number[]): ComponentNode | undefined {
  let arr = nodes;
  let cur: ComponentNode | undefined;
  for (let i = 0; i < path.length; i++) {
    cur = arr[path[i]];
    if (!cur) return undefined;
    arr = cur.children || [];
  }
  return cur;
}

function removeAt(nodes: ComponentNode[], path: number[]): { nodes: ComponentNode[]; removed?: ComponentNode } {
  const [idx, ...rest] = path;
  const arr = [...nodes];
  if (rest.length === 0) {
    const [removed] = arr.splice(idx, 1);
    return { nodes: arr, removed };
  }
  const child = arr[idx];
  const res = removeAt(child.children || [], rest);
  arr[idx] = { ...child, children: res.nodes };
  return { nodes: arr, removed: res.removed };
}

function insertAt(nodes: ComponentNode[], path: number[], node: ComponentNode): ComponentNode[] {
  const [idx, ...rest] = path;
  const arr = [...nodes];
  if (rest.length === 0) {
    arr.splice(idx, 0, node);
    return arr;
  }
  const child = arr[idx];
  const children = insertAt(child.children || [], rest, node);
  arr[idx] = { ...child, children };
  return arr;
}

function adjust(from: number[], to: number[]): number[] {
  if (
    from.length === to.length &&
    from.slice(0, -1).every((v, i) => v === to[i]) &&
    to[to.length - 1] > from[from.length - 1]
  ) {
    const a = [...to];
    a[a.length - 1]--;
    return a;
  }
  return to;
}

function moveByPath(nodes: ComponentNode[], from: number[], to: number[]): ComponentNode[] {
  const { nodes: without, removed } = removeAt(nodes, from);
  if (!removed) return nodes;
  return insertAt(without, adjust(from, to), removed);
}

function moveNodeById(nodes: ComponentNode[], dragId: string, parentId: string | null, index: number): ComponentNode[] {
  const { nodes: without, removed } = removeNode(nodes, dragId);
  if (!removed) return nodes;
  return insertNode(without, parentId, index, removed);
}

function setNodeProp(nodes: ComponentNode[], id: string, prop: string, value: any): ComponentNode[] {
  return nodes.map((n) => {
    if (n.id === id) {
      const props = { ...(n.props || {}) };
      if (value === undefined) delete props[prop];
      else props[prop] = value;
      return { ...n, props };
    }
    if (n.children) return { ...n, children: setNodeProp(n.children, id, prop, value) };
    return n;
  });
}
