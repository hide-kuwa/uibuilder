import React, { useMemo, useState, useRef, useEffect } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import { useEditorState, useEditorActions, ComponentNode } from './store';

interface FlatNode {
  node: ComponentNode;
  depth: number;
  parentId: string | null;
  index: number;
}

const ITEM_HEIGHT = 24;

const HierarchyTree: React.FC = () => {
  const { tree, selectedComponentId } = useEditorState();
  const actions = useEditorActions();

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);
  const dragId = useRef<string | null>(null);

  const flat = useMemo(() => {
    const list: FlatNode[] = [];
    const walk = (nodes: ComponentNode[], depth: number, parentId: string | null) => {
      nodes.forEach((n, idx) => {
        list.push({ node: n, depth, parentId, index: idx });
        if (!collapsed[n.id] && n.children) {
          walk(n.children, depth + 1, n.id);
        }
      });
    };
    walk(tree, 0, null);
    return list;
  }, [tree, collapsed]);

  const useVirtual = flat.length > 200;

  useEffect(() => {
    const close = () => setContextMenu(null);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, []);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleContextMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setContextMenu({ id, x: e.clientX, y: e.clientY });
  };

  const handleDuplicate = () => {
    if (contextMenu) {
      actions.duplicateComponent(contextMenu.id);
      setContextMenu(null);
    }
  };

  const handleDelete = () => {
    if (contextMenu) {
      actions.deleteComponent(contextMenu.id);
      setContextMenu(null);
    }
  };

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    dragId.current = id;
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = (target: FlatNode) => (e: React.DragEvent) => {
    e.preventDefault();
    const id = dragId.current;
    if (!id) return;
    const reparent = e.altKey || e.metaKey || e.ctrlKey;
    const parentId = reparent ? target.node.id : target.parentId;
    const index = reparent ? 0 : target.index;
    actions.moveComponent(id, parentId, index);
    dragId.current = null;
  };

  const renderNode = (item: FlatNode) => {
    const { node, depth } = item;
    const isSelected = selectedComponentId === node.id;
    return (
      <div
        key={node.id}
        className={`flex items-center h-6 select-none cursor-pointer ${isSelected ? 'bg-blue-100' : ''}`}
        style={{ paddingLeft: depth * 16 }}
        draggable
        onDragStart={handleDragStart(node.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop(item)}
        onClick={() => actions.selectComponent(node.id)}
        onContextMenu={(e) => handleContextMenu(e, node.id)}
      >
        {node.children && node.children.length > 0 ? (
          <button
            className="mr-1 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              toggleCollapse(node.id);
            }}
          >
            {collapsed[node.id] ? '▸' : '▾'}
          </button>
        ) : (
          <span className="mr-3" />
        )}
        {node.isContainer && <span className="mr-1">📁</span>}
        <span className="text-sm">{node.type}</span>
      </div>
    );
  };

  const Row: React.FC<ListChildComponentProps> = ({ index, style }) => (
    <div style={style}>{renderNode(flat[index])}</div>
  );

  return (
    <div className="relative h-full overflow-auto" onDragOver={(e) => e.preventDefault()}>
      {useVirtual ? (
        <List
          height={Math.min(400, flat.length * ITEM_HEIGHT)}
          itemCount={flat.length}
          itemSize={ITEM_HEIGHT}
          width={'100%'}
        >
          {Row}
        </List>
      ) : (
        flat.map((item) => renderNode(item))
      )}
      {contextMenu && (
        <div
          className="absolute bg-white border shadow text-sm"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleDuplicate}>
            Duplicate
          </div>
          <div className="px-2 py-1 hover:bg-gray-100 cursor-pointer" onClick={handleDelete}>
            Delete
          </div>
        </div>
      )}
    </div>
  );
};

export default HierarchyTree;
