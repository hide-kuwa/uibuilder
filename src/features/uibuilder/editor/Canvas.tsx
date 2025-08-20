import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useEditorStore, EditorNode } from './useEditorStore';
import { getComponentByName } from './componentRegistry';

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
  const selectedId = useEditorStore((s) => s.selectedId);
  const Tag = getComponentByName(node.type) || (node.type as any) || 'div';
  return (
    <Tag
      className={`${buildClass(node)} ${selectedId === node.id ? 'outline outline-blue-500' : ''}`}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation();
        select(node.id);
      }}
    >
      {node.props.text}
      {node.children.map((c) => (
        <RenderNode key={c.id} node={c} />
      ))}
    </Tag>
  );
};

export const Canvas: React.FC = () => {
  const root = useEditorStore((s) => s.root);
  const { setNodeRef } = useDroppable({ id: 'canvas' });
  return (
    <div ref={setNodeRef} className="h-full overflow-auto p-4">
      {root.children.length ? (
        root.children.map((c) => <RenderNode key={c.id} node={c} />)
      ) : (
        <div className="text-gray-400">Drop components here</div>
      )}
    </div>
  );
};

