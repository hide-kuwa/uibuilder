import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore, EditorNode } from './useEditorStore';
import { getComponentById } from './componentRegistry';

function buildClass(node: EditorNode): string {
  const classes = [node.props.className || ''];
  if (node.props.variants) {
    for (const [state, cls] of Object.entries(node.props.variants)) {
      classes.push(`${state}:${cls}`);
    }
  }
  return classes.filter(Boolean).join(' ');
}

const RenderNode: React.FC<{ node: EditorNode }> = ({ node }) => {
  const select = useEditorStore((s) => s.select);
  const addSelect = useEditorStore((s) => s.addSelect);
  const toggleSelect = useEditorStore((s) => s.toggleSelect);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const Tag =
    node.type === 'group'
      ? 'div'
      : getComponentById(node.type) || (node.type as any) || 'div';
  const isSelected = selectedIds.includes(node.id);
  return (
    <Tag
      className={`${buildClass(node)} ${
        isSelected ? 'outline outline-blue-500' : ''
      } ${node.locked ? 'opacity-60' : ''}`}
      data-node-id={node.id}
      data-node-type={node.type}
      data-node-name={node.props?.name}
      data-node-locked={node.locked ? 'true' : 'false'}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        if (node.locked) return;
        if (e.shiftKey) addSelect(node.id);
        else if (e.metaKey || e.ctrlKey) toggleSelect(node.id);
        else select([node.id]);
      }}
    >
      {node.type !== 'group' && node.props.text}
      {node.children.map((c) => (
        <RenderNode key={c.id} node={c} />
      ))}
    </Tag>
  );
};

export const Canvas: React.FC = () => {
  const root = useEditorStore((s) => s.root);
  const select = useEditorStore((s) => s.select);
  const addSelect = useEditorStore((s) => s.addSelect);
  const { setNodeRef } = useDroppable({ id: 'canvas' });
  const [marquee, setMarquee] = React.useState<{
    x: number;
    y: number;
    w: number;
    h: number;
  } | null>(null);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    const origin = { x: e.clientX, y: e.clientY };
    if (!e.shiftKey) select([]);
    const move = (ev: PointerEvent) => {
      setMarquee({
        x: Math.min(origin.x, ev.clientX),
        y: Math.min(origin.y, ev.clientY),
        w: Math.abs(ev.clientX - origin.x),
        h: Math.abs(ev.clientY - origin.y),
      });
    };
    const up = (ev: PointerEvent) => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      setMarquee(null);
      const rect = {
        x: Math.min(origin.x, ev.clientX),
        y: Math.min(origin.y, ev.clientY),
        w: Math.abs(ev.clientX - origin.x),
        h: Math.abs(ev.clientY - origin.y),
      };
      const els = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>('[data-node-id]')
      );
      const ids = els
        .filter((el) => {
          const r = el.getBoundingClientRect();
          const locked = el.dataset.nodeLocked === 'true';
          return (
            !locked &&
            r.left >= rect.x &&
            r.right <= rect.x + rect.w &&
            r.top >= rect.y &&
            r.bottom <= rect.y + rect.h
          );
        })
        .map((el) => el.dataset.nodeId!);
      ids.forEach((id) => addSelect(id));
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  };

  return (
    <div
      ref={setNodeRef}
      className="h-full overflow-auto p-4 relative"
      onPointerDown={onPointerDown}
    >
      {root.children.length ? (
        root.children.map((c) => <RenderNode key={c.id} node={c} />)
      ) : (
        <div className="text-gray-400">Drop components here</div>
      )}
      {marquee && (
        <div
          className="absolute border border-blue-400 bg-blue-200/20 pointer-events-none"
          style={{
            left: marquee.x,
            top: marquee.y,
            width: marquee.w,
            height: marquee.h,
          }}
        />
      )}
    </div>
  );
};

