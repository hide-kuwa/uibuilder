'use client';
import { useBuilderStore } from '@/store/builderStore';
import { NodeRendererCompat } from '@/components/NodeRendererCompat';
import { ENABLE_UNIFIED_PREVIEW } from '@/lib/flags';
import { useEditorStore } from '@/store/editorStore';
import type { ComponentNode, InstanceNode } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import { resolveComponentBinding, resolveBinding } from '@/lib/binding/resolve';
import { useBindingStore } from '@/store/bindingStore';
import { DEVICE_PRESETS } from '@/lib/devicePresets';
import AnnotationsOverlay from '@/components/editor/AnnotationsOverlay';
import { useSearchParams } from 'next/navigation';
import '@/styles/preview.css';
import ActionGate from '@/components/interaction/ActionGate';
import PresetApplyBus from '@/components/interaction/PresetApplyBus';

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
    transform: `rotate(${props.rotation || 0}deg)`,
  };
  if (props.visible === false) style.display = 'none';
  return (
    <div key={node.id} style={style} className={props.className}>
      {props.text}
      {node.children?.map((c) => renderNode(c, components, sources, bindings))}
    </div>
  );
}

export default function PreviewPage() {
  const elements = useBuilderStore((s) => s.elements);
  if (ENABLE_UNIFIED_PREVIEW) {
    return (
      <div data-actions-enabled="true" className="w-full h-screen relative">
        {elements.filter((e: any) => !e.parentId).map((n: any) => (
          <NodeRendererCompat key={String(n.id)} node={n} />
        ))}
      </div>
    );
  }
  const tree = useEditorStore((s) => s.tree);
  const components = useEditorStore((s) => s.components);
  const sources = useBindingStore((s) => s.sources);
  const bindings = useBindingStore((s) => s.bindings);
  const params = useSearchParams();
  const device = (params.get('device') as 'desktop' | 'tablet' | 'mobile') || 'desktop';
  const zoom = parseFloat(params.get('zoom') || '1');
  const showBorder = params.get('border') === '1';
  const showSafe = params.get('safe') === '1';
  const showComments = params.get('comments') === '1';
  const preset = DEVICE_PRESETS[device];
  const style: React.CSSProperties = {
    width: preset.width,
    height: preset.height,
    transform: `scale(${zoom})`,
    transformOrigin: 'top left',
    position: 'relative',
    background: '#fff',
    border: showBorder ? '1px solid #ddd' : undefined,
  };
  const safe = showSafe && preset.safeArea ? (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: preset.safeArea.top,
        bottom: preset.safeArea.bottom,
        border: '1px dashed rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }}
    />
  ) : null;
  return (
    <ActionGate enabled>
      <PresetApplyBus />
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div style={style}>
          {safe}
          {tree.map((n) => renderNode(n, components, sources, bindings))}
          {showComments && <AnnotationsOverlay />}
        </div>
      </div>
    </ActionGate>
  );
}
