'use client';
import { useEditorStore } from '@/store/editorStore';
import SelectionBox from './SelectionBox';
import ResizeHandles from './ResizeHandles';
import type { ComponentNode } from '@/types/editor';
import { sizeStyle } from '@/lib/flex';

function NodeView({
  node,
  parentLayout,
  parentAxis,
}: {
  node: ComponentNode;
  parentLayout?: string;
  parentAxis?: 'horizontal' | 'vertical';
}) {
  const style: any = {};
  const layout = node.props?.layout || 'free';
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
        {node.children?.map((c) => (
          <NodeView
            key={c.id}
            node={c}
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
      {node.type}
      {node.children?.map((c) => (
        <NodeView
          key={c.id}
          node={c}
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
  return (
    <div className="relative bg-gray-900 overflow-hidden">
      {tree.map((n) => (
        <NodeView key={n.id} node={n} />
      ))}
      {selected.length === 1 && <SelectionBox />}
      {selected.length === 1 && <ResizeHandles />}
    </div>
  );
}
