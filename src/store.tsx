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
  duplicateComponent: (id: string) => void;
  deleteComponent: (id: string) => void;
  setHoverPreview: (v: boolean) => void;
  setInspectorTab: (t: 'default' | 'hover') => void;
}

interface EditorContextValue {
  state: EditorState;
  actions: EditorActions;
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export const EditorProvider: React.FC<{ initialTree?: ComponentNode[]; children: ReactNode }>=({
  initialTree = [],
  children,
}) => {
  const [tree, setTree] = useState<ComponentNode[]>(initialTree);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [hoverPreview, setHoverPreview] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<'default' | 'hover'>('default');

  const selectComponent = (id: string | null) => setSelectedComponentId(id);

  const moveComponent = (dragId: string, parentId: string | null, index: number) => {
    setTree((prev) => moveNode(prev, dragId, parentId, index));
  };

  const duplicateComponent = (id: string) => {
    setTree((prev) => duplicateNode(prev, id));
  };

  const deleteComponent = (id: string) => {
    setTree((prev) => deleteNode(prev, id));
    setSelectedComponentId((prev) => (prev === id ? null : prev));
  };

  const value: EditorContextValue = {
    state: { tree, selectedComponentId, hoverPreview, inspectorTab },
    actions: { selectComponent, moveComponent, duplicateComponent, deleteComponent, setHoverPreview, setInspectorTab },
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

// Helper functions for tree manipulation
function cloneNode(node: ComponentNode): ComponentNode {
  return {
    ...node,
    children: node.children ? node.children.map(cloneNode) : undefined,
  };
}

function deleteNode(nodes: ComponentNode[], id: string): ComponentNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) =>
      n.children
        ? { ...n, children: deleteNode(n.children, id) }
        : n
    );
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
  return nodes.map((n) => {
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

function moveNode(nodes: ComponentNode[], dragId: string, parentId: string | null, index: number): ComponentNode[] {
  const { nodes: without, removed } = removeNode(nodes, dragId);
  if (!removed) return nodes;
  return insertNode(without, parentId, index, removed);
}
