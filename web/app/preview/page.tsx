'use client';
import { useEditorStore } from '@/store/editorStore';
import type { ComponentNode, InstanceNode } from '@/types/editor';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';
import { DEVICE_PRESETS } from '@/lib/devicePresets';
import AnnotationsOverlay from '@/components/editor/AnnotationsOverlay';
import { useSearchParams } from 'next/navigation';
import '@/styles/preview.css';

function renderNode(
  node: ComponentNode,
  components: Record<string, any>
): JSX.Element {
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

export default function PreviewPage() {
  const tree = useEditorStore((s) => s.tree);
  const components = useEditorStore((s) => s.components);
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
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div style={style}>
        {safe}
        {tree.map((n) => renderNode(n, components))}
        {showComments && <AnnotationsOverlay />}
      </div>
    </div>
  );
}
