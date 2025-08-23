'use client';
import { useEditorStore } from '@/store/editorStore';
import type { PathNode } from '@/types/editor';

function pathToD(node: PathNode) {
  if (!node.points.length) return '';
  const cmds = node.points.map((pt, i) => `${i === 0 ? 'M' : 'L'}${pt.x} ${pt.y}`);
  if (node.closed) cmds.push('Z');
  return cmds.join(' ');
}

export default function SVGLayer() {
  const paths = useEditorStore((s) =>
    s.tree.filter((n): n is PathNode => n.type === 'Path')
  );
  const selectPath = useEditorStore((s) => s.selectPath);
  return (
    <svg className="absolute inset-0 pointer-events-none">
      {paths.map((p) => (
        <path
          key={p.id}
          d={pathToD(p)}
          fill={p.props?.fill || 'none'}
          stroke={p.props?.stroke || 'none'}
          strokeWidth={p.props?.strokeWidth || 1}
          className="pointer-events-auto"
          onPointerDown={(e) => {
            selectPath(p.id);
            e.stopPropagation();
          }}
        />
      ))}
    </svg>
  );
}
