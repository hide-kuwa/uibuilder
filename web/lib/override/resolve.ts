import type { ComponentNode, OverrideMap, TextNode, ImageNode } from '@/types/editor';

function findNode(node: ComponentNode, id: string): ComponentNode | null {
  if (node.id === id) return node;
  if (node.children) {
    for (const c of node.children) {
      const r = findNode(c, id);
      if (r) return r;
    }
  }
  return null;
}

export function resolveOverrides(root: ComponentNode, overrides: OverrideMap): ComponentNode {
  const clone: ComponentNode = JSON.parse(JSON.stringify(root));
  if (!overrides) return clone;

  if (overrides.text) {
    Object.entries(overrides.text).forEach(([id, text]) => {
      const n = findNode(clone, id);
      if (n && n.type === 'Text') {
        (n as TextNode).props = { ...(n.props || {}), text };
      }
    });
  }
  if (overrides.image) {
    Object.entries(overrides.image).forEach(([id, assetId]) => {
      const n = findNode(clone, id);
      if (n && n.type === 'Image') {
        (n as ImageNode).props = { ...(n.props || {}), assetId };
      }
    });
  }
  if (overrides.visible) {
    Object.entries(overrides.visible).forEach(([id, hidden]) => {
      const n = findNode(clone, id);
      if (n) {
        n.props = { ...(n.props || {}), visible: !hidden };
      }
    });
  }
  if (overrides.style) {
    Object.entries(overrides.style).forEach(([id, style]) => {
      const n = findNode(clone, id);
      if (n) {
        n.props = { ...(n.props || {}), ...style } as any;
      }
    });
  }
  return clone;
}
