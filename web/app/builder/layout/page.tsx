'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { NodeWrapper } from '@/components/shared/NodeWrapper';
import { useBuilderLayout, type BuilderLayout } from '@/stores/builderLayout';

const PANELS = ['palette', 'inspector', 'toolbar', 'canvas'] as const;
const ZONES = ['top', 'left', 'center', 'right', 'bottom'] as const;

type Panel = typeof PANELS[number];
type Zone = typeof ZONES[number];

function DraggablePanel({ id }: { id: Panel }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <NodeWrapper nodeId={id}>
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        className="px-2 py-1 text-sm rounded border bg-white cursor-move"
      >
        {id}
      </div>
    </NodeWrapper>
  );
}

function DropZone({ id, children }: { id: Zone; children?: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`flex items-center justify-center border rounded p-2 min-h-[60px] ${
        isOver ? 'bg-blue-50' : 'bg-gray-50'
      }`}
    >
      {children || <span className="text-xs text-zinc-400">{id}</span>}
    </div>
  );
}

export default function LayoutEditorPage() {
  const { layout, setLayout } = useBuilderLayout();
  const [draft, setDraft] = useState<BuilderLayout>(layout);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const panel = active.id as Panel;
    const zone = over.id as Zone;
    setDraft((cur) => {
      const next: BuilderLayout = { ...cur };
      const prevPos = (['left', 'right', 'top', 'bottom'] as Array<keyof BuilderLayout>).find(
        (k) => next[k] === panel,
      );
      if (zone === 'center') {
        if (prevPos) {
          delete next[prevPos];
        }
        return next;
      }
      const swapped = next[zone as keyof BuilderLayout];
      if (prevPos) {
        next[prevPos] = swapped;
      }
      next[zone as keyof BuilderLayout] = panel;
      return next;
    });
  };

  const center = PANELS.find((p) => !Object.values(draft).includes(p)) as Panel | undefined;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Builder Layout</h1>
      <DndContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-3 grid-rows-3 gap-4 max-w-xl">
          <div className="col-span-3">
            <DropZone id="top">{draft.top && <DraggablePanel id={draft.top as Panel} />}</DropZone>
          </div>
          <DropZone id="left">{draft.left && <DraggablePanel id={draft.left as Panel} />}</DropZone>
          <DropZone id="center">{center && <DraggablePanel id={center} />}</DropZone>
          <DropZone id="right">{draft.right && <DraggablePanel id={draft.right as Panel} />}</DropZone>
          <div className="col-span-3">
            <DropZone id="bottom">{draft.bottom && <DraggablePanel id={draft.bottom as Panel} />}</DropZone>
          </div>
        </div>
      </DndContext>
      <div className="flex gap-2">
        <button
          onClick={() => setLayout(draft)}
          className="px-4 py-2 rounded border bg-white"
        >
          保存
        </button>
        <Link href="/builder" className="px-4 py-2 rounded border bg-white">
          戻る
        </Link>
      </div>
    </div>
  );
}

