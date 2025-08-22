'use client';
import { useEditorStore } from '@/store/editorStore';
import SelectionBox from './SelectionBox';
import ResizeHandles from './ResizeHandles';
import type { ComponentNode, InstanceNode } from '@/types/editor';
import { sizeStyle } from '@/lib/flex';
import { resolveVariant } from '@/lib/variantResolver';
import { applyOverrides } from '@/lib/overrideMerge';

function NodeView({
  node,
  components,
  parentLayout,
  parentAxis,
}: {
  node: ComponentNode;
  components: Record<string, any>;
  parentLayout?: string;
  parentAxis?: 'horizontal' | 'vertical';
}) {
  if (node.type === 'Instance') {
    const inst = node as InstanceNode;
    const def = components[inst.componentId];
    if (def) {
      let resolved = resolveVariant(def, inst.variant);
      if (inst.overrides) resolved = applyOverrides(resolved, inst.overrides);
      resolved.props = { ...(resolved.props || {}), ...(inst.props || {}) };
      return (
        <NodeView
          node={resolved}
          components={components}
          parentLayout={parentLayout}
          parentAxis={parentAxis}
        />
      );
    }
  }
  const style: any = {};
  const layout = node.props?.layout || 'free';
  if (node.props?.visible === false) style.display = 'none';
  if (layout === 'auto') {
    style.display = 'flex';
    style.flexDirection = node.props?.axis === 'horizontal' ? 'row' : 'column';
    if (node.props?.gap !== undefined) style.gap = node.props.gap;
    if (node.props?.padding !== undefined) {
      const p = node.props.padding;
      if (typeof p === 'number') style.padding = p;
      else
        style.padding = `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px`;
    }
    if (node.props?.alignItems) style.alignItems = node.props.alignItems;
    if (node.props?.justifyContent)
      style.justifyContent = node.props.justifyContent;
    if (node.props?.wrap) style.flexWrap = 'wrap';
  } else {
    style.position = parentLayout === 'auto' ? 'absolute' : 'absolute';
    style.left = node.props?.x || 0;
    style.top = node.props?.y || 0;
    Object.assign(style, sizeStyle(node, parentAxis));
  }

  if (layout === 'auto') {
    return (
      <div
        className="border border-gray-700 text-xs text-white"
        style={style}
      >
        {node.props?.text}
        {node.children?.map((c) => (
          <NodeView
            key={c.id}
            node={c}
            components={components}
            parentLayout={layout}
            parentAxis={node.props?.axis}
          />
        ))}
      </div>
    );
  }
  return (
    <div
      className="border border-gray-700 text-xs text-white"
      style={style}
    >
      {node.props?.text || node.type}
      {node.children?.map((c) => (
        <NodeView
          key={c.id}
          node={c}
          components={components}
          parentLayout={layout}
          parentAxis={node.props?.axis}
        />
      ))}
    </div>
  );
}

export default function CanvasStage() {
  const tree = useEditorStore((s) => s.tree);
  const selected = useEditorStore((s) => s.selectedIds);
  const components = useEditorStore((s) => s.components);
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {tree.map((n) => (
        <NodeView key={n.id} node={n} components={components} />
      ))}
      {selected.length === 1 && <SelectionBox />}
      {selected.length === 1 && <ResizeHandles />}
    </div>
  );
}
