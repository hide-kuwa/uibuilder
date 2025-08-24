'use client';
import type { InstanceNode, ComponentNode } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';

interface InstanceViewProps {
  node: InstanceNode;
  components?: Record<string, any>;
  render?: (node: ComponentNode, components: Record<string, any>) => React.ReactNode;
}

function defaultRender(node: ComponentNode, components: Record<string, any>): JSX.Element {
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.componentId];
    if (def) {
      let resolved = resolveVariant(def, inst.variant);
      if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
      resolved.props = { ...(resolved.props || {}), ...(inst.props || {}) };
      return defaultRender(resolved, components);
    }
  }
  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.props?.x || 0,
    top: node.props?.y || 0,
    width: node.props?.w || 0,
    height: node.props?.h || 0,
    transform: `rotate(${node.props?.rotation || 0}deg)`,
  };
  if (node.props?.visible === false) style.display = 'none';
  return (
    <div key={node.id} style={style} className={node.props?.className}>
      {node.props?.text}
      {node.children?.map((c) => defaultRender(c, components))}
    </div>
  );
}

export default function InstanceView({ node, components, render }: InstanceViewProps) {
  const storeComponents = useEditorStore((s) => s.components);
  const compMap = components || storeComponents;
  const def = compMap[node.componentId];
  if (!def) return null;

  let resolved = resolveVariant(def, node.variant);
  if (node.overrides) {
    resolved = applyOverrides(resolved, node.overrides);
  }
  resolved.props = { ...(resolved.props || {}), ...(node.props || {}) };

  const renderer = render || defaultRender;
  return <>{renderer(resolved, compMap)}</>;
}
