import type { ComponentNode } from '@/types/editor';

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

function applyPatch(target: ComponentNode, patch: Partial<ComponentNode>) {
  if (patch.props) {
    target.props = { ...(target.props || {}), ...patch.props };
  }
  if (patch.children) target.children = patch.children;
  Object.assign(target, { ...patch, props: target.props });
}

export function applyOverrides(
  root: ComponentNode,
  overrides: Record<string, Partial<ComponentNode>>
): ComponentNode {
  const clone: ComponentNode = JSON.parse(JSON.stringify(root));
  Object.entries(overrides).forEach(([id, patch]) => {
    const target = findNode(clone, id);
    if (target) applyPatch(target, patch);
  });
  return clone;
}
