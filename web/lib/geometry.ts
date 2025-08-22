import type { ComponentNode, EditorState } from '@/types/editor';

export interface Rect { x: number; y: number; w: number; h: number }

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

export function getNodeLocalBounds(node: ComponentNode): Rect {
  return {
    x: node.props?.x || 0,
    y: node.props?.y || 0,
    w: node.props?.w || 0,
    h: node.props?.h || 0,
  };
}

export function getWorldMatrix(nodeId: string, state: EditorState): DOMMatrix {
  // simplified world matrix (no transforms)
  return new DOMMatrix();
}

export function getWorldAABB(nodeId: string, state: EditorState): Rect {
  const node = findNode(state.tree, nodeId);
  if (!node) return { x: 0, y: 0, w: 0, h: 0 };
  const b = getNodeLocalBounds(node);
  return { x: b.x, y: b.y, w: b.w, h: b.h };
}

export function hitTestPoint(nodeId: string, pt: { x: number; y: number }, state: EditorState): boolean {
  const r = getWorldAABB(nodeId, state);
  return pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
}

export function rectsIntersect(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
