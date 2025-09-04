import React, { Profiler } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  useEditorState,
  useEditorActions,
  ComponentNode
} from '../../store';
import { perfMetrics } from '../../lib/perf/metrics';

const LazyPreview: React.FC<{
  type: string;
  props: any;
  children?: React.ReactNode;
}> = ({ type, props, children }) => {
  const ref = React.useRef<HTMLElement | null>(null);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(entries => {
      if (entries[0]?.isIntersecting) {
        setVisible(true);
        obs.disconnect();
      }
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  if (!visible) {
    return <div ref={ref as any} style={{ minHeight: props?.height || 100 }} />;
  }
  return React.createElement(type as any, { ...props, ref }, children);
};

const NodeView = React.memo(
  ({
    node,
    path,
    selectedId
  }: {
    node: ComponentNode;
    path: number[];
    selectedId: string | null;
  }) => {
    const actions = useEditorActions();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
      useSortable({ id: node.id, data: { path } });

    const { setNodeRef: setDropRef } = useDroppable({
      id: `c-${path.join('.') || 'root'}`,
      data: { container: true, path, index: node.children ? node.children.length : 0 }
    });

    const style: React.CSSProperties = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      outline: selectedId === node.id ? '2px solid blue' : undefined
    };

    const children = node.children?.map((c, i) => (
      <NodeView key={c.id} node={c} path={[...path, i]} selectedId={selectedId} />
    ));

    const props = {
      ...(node.props || {}),
      onClick: (e: React.MouseEvent) => {
        e.stopPropagation();
        actions.selectComponent(node.id);
      }
    };

    const content =
      node.type === 'img' || node.type === 'iframe' ? (
        <LazyPreview type={node.type} props={props}>
          {node.isContainer ? (
            <div ref={setDropRef}>
              <SortableContext
                id={path.join('.') || 'root'}
                items={node.children?.map(n => n.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {children}
              </SortableContext>
            </div>
          ) : undefined}
        </LazyPreview>
      ) : React.createElement(
          node.type as any,
          props,
          node.isContainer ? (
            <div ref={setDropRef}>
              <SortableContext
                id={path.join('.') || 'root'}
                items={node.children?.map(n => n.id) || []}
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
  },
  (prev, next) => {
    const wasSelected = prev.selectedId === prev.node.id;
    const isSelected = next.selectedId === next.node.id;
    return (
      prev.node === next.node &&
      prev.path.join('.') === next.path.join('.') &&
      wasSelected === isSelected
    );
  }
);

const VirtualCanvas: React.FC = () => {
  const { tree, hoverPreview, selectedComponentId } = useEditorState();
  const actions = useEditorActions();
  const sensors = useSensors(useSensor(PointerSensor));

  const rootDrop = useDroppable({
    id: 'c-root',
    data: { container: true, path: [], index: tree.length }
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

  const Row = ({ index, style }: ListChildComponentProps) => {
    const node = tree[index];
    return (
      <div style={style}>
        <NodeView node={node} path={[index]} selectedId={selectedComponentId} />
      </div>
    );
  };

  return (
    <Profiler id="VirtualCanvas" onRender={perfMetrics.onRender}>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="h-full w-full">
          <div className="p-2 border-b flex items-center space-x-2">
            <input
              type="checkbox"
              checked={hoverPreview}
              onChange={e => actions.setHoverPreview(e.target.checked)}
            />
            <span className="text-sm">Hover preview</span>
          </div>
          <div ref={rootDrop.setNodeRef} className="p-4 min-h-screen">
            <SortableContext
              id="root"
              items={tree.map(n => n.id)}
              strategy={verticalListSortingStrategy}
            >
              <List height={600} itemCount={tree.length} itemSize={60} width="100%">
                {Row}
              </List>
            </SortableContext>
          </div>
        </div>
      </DndContext>
    </Profiler>
  );
};

export default VirtualCanvas;
