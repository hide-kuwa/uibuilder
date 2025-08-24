'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { deserialize } from '@/lib/deserialize';
import type { ComponentNode, InstanceNode } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import { resolveBinding } from '@/lib/binding/resolve';
import AnnotationsOverlay from '@/components/editor/AnnotationsOverlay';

function renderNode(node: ComponentNode, components: Record<string, any>): JSX.Element {
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.componentId];
    if (def) {
      let resolved = resolveVariant(def, inst.variant);
      if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
      if (inst.propValues) resolved = resolveBinding(resolved, inst.propValues);
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
    transform: `rotate(${node.props?.rotation || 0}deg)`
  };
  if (node.props?.visible === false) style.display = 'none';
  return (
    <div key={node.id} style={style} className={node.props?.className}>
      {node.props?.text}
      {node.children?.map((c) => renderNode(c, components))}
    </div>
  );
}

export default function SharedPreview() {
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const [data, setData] = useState<any>();
  useEffect(() => {
    fetch(`/api/share?id=${params.id}`).then((r) => r.json()).then(setData);
  }, [params.id]);
  if (!data) return null;
  const state = deserialize(data);
  const showComments = search.get('comments') === '1';
  return (
    <div className="relative w-full h-full">
      {state.tree.map((n) => renderNode(n, state.components))}
      {showComments && <AnnotationsOverlay />}
    </div>
  );
}
