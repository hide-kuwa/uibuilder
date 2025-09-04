'use client';
import { useBuilderStore } from '@/stores/builder';
import Link from 'next/link';

export default function ArrangePage() {
  const nodes = useBuilderStore((s) => s.nodes);
  const updateMany = useBuilderStore((s) => s.updateMany);
  const publishAll = useBuilderStore((s) => s.publishAll);

  const onSave = () => {
    // 実際は canvasStore から取得して updateMany へ。ここでは nodes をそのまま保存例示。
    updateMany(nodes.map((n) => ({ id: n.id, x: n.x, y: n.y, w: n.w, h: n.h })));
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Arrange</h1>
        <div className="flex gap-2">
          <button onClick={onSave} className="px-3 py-2 rounded-lg border">位置/サイズを保存</button>
          <button onClick={publishAll} className="px-3 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black">Publish</button>
          <Link href="/map" className="px-3 py-2 rounded-lg border">/map</Link>
          <Link href="/map?preview=1" className="px-3 py-2 rounded-lg border">/map?preview=1</Link>
        </div>
      </div>

      <div className="text-sm text-zinc-500">
        ※ ここに ZoomPanCanvas / DraggableNode の実装を配置してください（既存流用）。保存は updateMany() を呼ぶだけ。
      </div>
    </div>
  );
}

