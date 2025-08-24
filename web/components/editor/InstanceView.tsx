import type { ComponentNode, InstanceNode, VariantProps } from '@/types/editor';
import { useEditorStore } from '@/store/editorStore';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';

function renderNode(node: ComponentNode, components: Record<string, any>): JSX.Element {
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.componentId];
    if (def) {
      let resolved = resolveVariant(def, inst.variant);
      if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
      resolved.props = { ...(resolved.props || {}), ...(inst.props || {}) };
      return renderNode(resolved, components);
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
      {node.children?.map((c) => renderNode(c, components))}
    </div>
  );
}

export default function InstanceView({
  defId,
  props,
}: {
  defId: string;
  props?: VariantProps;
}) {
  const components = useEditorStore((s) => s.components);
  const def = components[defId];
  if (!def) return null;
  let root = resolveVariant(def, props);
  return <div style={{ position: 'relative' }}>{renderNode(root, components)}</div>;
}
