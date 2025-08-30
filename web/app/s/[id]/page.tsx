'use client';
import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { deserialize } from '@/lib/deserialize';
import type { ComponentNode, InstanceNode } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import { resolveComponentBinding, resolveBinding } from '@/lib/binding/resolve';
import { useBindingStore } from '@/store/bindingStore';
import AnnotationsOverlay from '@/components/editor/AnnotationsOverlay';

function renderNode(
  node: ComponentNode,
  components: Record<string, any>,
  sources: ReturnType<typeof useBindingStore.getState>['sources'],
  bindings: ReturnType<typeof useBindingStore.getState>['bindings'],
): JSX.Element {
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.componentId];
    if (def) {
      let resolved = resolveVariant(def, inst.variant);
      if (inst.propValues)
        resolved = resolveComponentBinding(resolved, def.props, inst.propValues || {});
      if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
      resolved.props = { ...(resolved.props || {}), ...(inst.props || {}) };
      return renderNode(resolved, components, sources, bindings);
    }
  }
  const nodeBindings = bindings.filter((b) => b.nodeId === node.id);
  const props = resolveBinding(node.props || {}, nodeBindings, sources);
  const style: React.CSSProperties = {
    position: 'absolute',
    left: props.x || 0,
    top: props.y || 0,
    width: props.w || 0,
    height: props.h || 0,
    transform: `rotate(${props.rotation || 0}deg)`
  };
  if (props.visible === false) style.display = 'none';
  return (
    <div key={node.id} style={style} className={props.className}>
      {props.text}
      {node.children?.map((c) => renderNode(c, components, sources, bindings))}
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
  const sources = useBindingStore((s) => s.sources);
  const bindings = useBindingStore((s) => s.bindings);
  const showComments = search.get('comments') === '1';
  return (
    <div className="relative w-full h-full">
      {state.tree.map((n) => renderNode(n, state.components, sources, bindings))}
      {showComments && <AnnotationsOverlay />}
    </div>
  );
}
