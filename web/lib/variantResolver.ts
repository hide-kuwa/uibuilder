import type { ComponentDefinition, ComponentNode } from '@/types/editor';

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

export function resolveVariant(
  def: ComponentDefinition,
  variant?: Record<string, string>
): ComponentNode {
  const root: ComponentNode = JSON.parse(JSON.stringify(def.root));
  if (!def.rules) return root;
  def.rules.forEach((r) => {
    const ok = Object.entries(r.when).every(
      ([k, v]) => variant && variant[k] === v
    );
    if (ok) {
      const target = findNode(root, r.node);
      if (target) applyPatch(target, r.patch);
    }
  });
  return root;
}
