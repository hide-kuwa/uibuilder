'use client';
import { useEditorStore } from '@/store/editorStore';
import type { PathNode, PathPoint } from '@/types/editor';

function areMirrored(pt: PathPoint) {
  return (
    pt.in &&
    pt.out &&
    Math.abs(pt.x * 2 - pt.in.x - pt.out.x) < 1e-6 &&
    Math.abs(pt.y * 2 - pt.in.y - pt.out.y) < 1e-6
  );
}

function segToCmd(prev: PathPoint, curr: PathPoint, prevSmooth: boolean) {
  const c1 = prev.out || prev;
  const c2 = curr.in || curr;
  const useS = prevSmooth;
  if (prev.out || curr.in) {
    if (useS) return `S${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
    return `C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${curr.x} ${curr.y}`;
  }
  return `L${curr.x} ${curr.y}`;
}

function pathToD(node: PathNode) {
  const pts = node.points;
  if (!pts.length) return '';
  const cmds = [`M${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i++) {
    cmds.push(segToCmd(pts[i - 1], pts[i], areMirrored(pts[i - 1])));
  }
  if (node.closed) {
    const last = pts[pts.length - 1];
    const first = pts[0];
    cmds.push(segToCmd(last, first, areMirrored(last)));
    cmds.push('Z');
  }
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
