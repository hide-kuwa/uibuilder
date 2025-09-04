import React, { useEffect, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PageRenderer from './PageRenderer';
import {
  useEditorState,
  useEditorActions,
  ComponentNode,
} from './store';
import { t, setLanguage } from './lib/i18n';

function NodeView({ node, path }: { node: ComponentNode; path: number[] }) {
  const actions = useEditorActions();
  const { selectedComponentId } = useEditorState();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, data: { path } });

  const { setNodeRef: setDropRef } = useDroppable({
    id: `c-${path.join('.') || 'root'}`,
    data: {
      container: true,
      path,
      index: node.children ? node.children.length : 0,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    outline: selectedComponentId === node.id ? '2px solid blue' : undefined,
  };

  const children = node.children?.map((c, i) => (
    <NodeView key={c.id} node={c} path={[...path, i]} />
  ));

  const translatedProps: Record<string, any> = { ...(node.props || {}) };
  for (const [k, v] of Object.entries(translatedProps)) {
    if (v && typeof v === 'object' && typeof (v as any).key === 'string') {
      translatedProps[k] = t((v as any).key);
    }
  }

  const content = React.createElement(
    node.type as any,
    {
      ...translatedProps,
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.selectComponent(node.id);
      },
    },
    node.isContainer ? (
      <div ref={setDropRef}>
        <SortableContext
          id={path.join('.') || 'root'}
          items={node.children?.map((n) => n.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {children}
        </SortableContext>
      </div>
    ) : undefined
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {content}
    </div>
  );
}

const Canvas: React.FC = () => {
  const { tree, hoverPreview } = useEditorState();
  const actions = useEditorActions();
  const sensors = useSensors(useSensor(PointerSensor));
  const [lang, setLang] = useState<'ja' | 'en'>('ja');

  useEffect(() => {
    setLanguage(lang);
  }, [lang]);

  const rootDrop = useDroppable({
    id: 'c-root',
    data: { container: true, path: [], index: tree.length },
  });

  const handleDragEnd = (e: DragEndEvent) => {
    const from = e.active.data.current?.path as number[] | undefined;
    if (!from) return;

    let to: number[] | null = null;

    if (e.over?.data.current?.sortable) {
      const s = e.over.data.current.sortable;
      const container =
        s.containerId === 'root' ? [] : s.containerId.split('.').map(Number);
      to = [...container, s.index];
    } else if (e.over?.data.current?.container) {
      const p = e.over.data.current.path as number[];
      const idx = e.over.data.current.index as number;
      to = [...p, idx];
    }

    if (to) actions.moveNode(from, to);
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="h-full w-full">
        {/* ヘッダー */}
        <div className="p-2 border-b flex items-center space-x-2">
          <input
            type="checkbox"
            checked={hoverPreview}
            onChange={(e) => actions.setHoverPreview(e.target.checked)}
          />
          <span className="text-sm">Hover preview</span>
          <select
            className="border px-2 py-1 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value as 'ja' | 'en')}
          >
            <option value="ja">ja</option>
            <option value="en">en</option>
          </select>
        </div>

        {/* キャンバス */}
        <div ref={rootDrop.setNodeRef} className="p-4 min-h-screen">
          <SortableContext
            id="root"
            items={tree.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            {tree.map((n, i) => (
              <NodeView key={n.id} node={n} path={[i]} />
            ))}
          </SortableContext>
        </div>
      </div>
    </DndContext>
  );
};

export default Canvas;
