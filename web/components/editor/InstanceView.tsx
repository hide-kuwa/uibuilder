'use client';
import type { InstanceNode, ComponentNode } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';

interface InstanceViewProps {
  node: InstanceNode;
  components: Record<string, any>;
  render: (node: ComponentNode) => React.ReactNode;
}

export default function InstanceView({ node, components, render }: InstanceViewProps) {
  const def = components[node.componentId];
  if (!def) return null;
  let resolved = resolveVariant(def, node.variant);
  if (node.overrides) {
    resolved = applyOverrides(resolved, node.overrides);
  }
  resolved.props = { ...(resolved.props || {}), ...(node.props || {}) };
  return <>{render(resolved)}</>;
}
