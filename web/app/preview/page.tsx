'use client';
import { useEditorStore } from '@/store/editorStore';
import type { ComponentNode } from '@/types/editor';

function renderNode(node: ComponentNode) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: node.props?.x || 0,
    top: node.props?.y || 0,
    width: node.props?.w || 0,
    height: node.props?.h || 0,
    transform: `rotate(${node.props?.rotation || 0}deg)`
  };
  return (
    <div key={node.id} style={style} className={node.props?.className}>
      {node.children?.map(renderNode)}
    </div>
  );
}

export default function PreviewPage() {
  const tree = useEditorStore((s) => s.tree);
  return <div className="relative w-full h-full">{tree.map(renderNode)}</div>;
}
