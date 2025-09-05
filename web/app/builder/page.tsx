'use client';
import Link from 'next/link';
import { NodeWrapper } from '@/components/shared/NodeWrapper';
import { useBuilderLayoutStore } from '@/stores/builderLayout';

const Panel = ({ label }: { label: string }) => (
  <NodeWrapper nodeId={label}>
    <div className="p-2 bg-white border rounded text-sm">{label}</div>
  </NodeWrapper>
);

const panelMap: Record<string, JSX.Element> = {
  palette: <Panel label="palette" />,
  inspector: <Panel label="inspector" />,
  toolbar: <Panel label="toolbar" />,
  canvas: <Panel label="canvas" />,
};

export default function BuilderPage() {
  const layout = useBuilderLayoutStore((s) => s.builderLayout);
  const center = (['palette', 'inspector', 'toolbar', 'canvas'] as const).find(
    (p) => !Object.values(layout).includes(p),
  ) || 'canvas';
  return (
    <div className="h-screen grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-2 p-2">
      {layout.top && (
        <div className="col-span-3">{panelMap[layout.top]}</div>
      )}
      <div>{layout.left && panelMap[layout.left]}</div>
      <div>{panelMap[center]}</div>
      <div>{layout.right && panelMap[layout.right]}</div>
      {layout.bottom && (
        <div className="col-span-3">{panelMap[layout.bottom]}</div>
      )}
      <div className="absolute top-2 right-2">
        <Link href="/builder/layout" className="text-blue-600 underline text-xs">
          レイアウト編集
        </Link>
      </div>
    </div>
  );
}

