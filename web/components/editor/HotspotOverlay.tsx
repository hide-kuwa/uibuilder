'use client';
import { useMemo } from 'react';
import { useEditorStore } from '@/store/editorStore';
import type { ComponentNode, PrototypeLink } from '@/types/editor';

function collect(nodes: ComponentNode[], out: ComponentNode[]) {
  for (const n of nodes) {
    if ((n as any).prototypeLink) out.push(n);
    if (n.children) collect(n.children as ComponentNode[], out);
  }
}

export default function HotspotOverlay(props: {
  onHover?: (nodeId: string, link: PrototypeLink) => void;
} = {}) {
  const tree = useEditorStore((s) => s.tree);
  const hotspots = useMemo(() => {
    const arr: ComponentNode[] = [];
    collect(tree, arr);
    return arr;
  }, [tree]);
  if (!hotspots.length) return null;
  return (
    <>
      {hotspots.map((n) => {
        const { x = 0, y = 0, w = 0, h = 0 } = n.props || {};
        const link = (n as any).prototypeLink as PrototypeLink | undefined;
        const pe = props.onHover ? 'pointer-events-auto' : 'pointer-events-none';
        return (
          <div
            key={n.id}
            className={`absolute border border-sky-400/60 bg-sky-400/10 ${pe}`}
            style={{ left: x, top: y, width: w, height: h }}
            onMouseEnter={() => {
              if (props.onHover && link?.trigger?.type === 'hover')
                props.onHover(n.id, link);
            }}
          />
        );
      })}
    </>
  );
}
