import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { ComponentLibrary } from './ComponentLibrary';
import { Canvas } from './Canvas';
import { PropertyPanel } from './PropertyPanel';
import { useEditorStore } from './useEditorStore';
import { ContextMenu } from './ContextMenu';
import { templates } from './templates';
import './registerComponents';

export const EditorShell: React.FC = () => {
  const addNode = useEditorStore((s) => s.addNode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const root = useEditorStore((s) => s.root);
  const groupSelected = useEditorStore((s) => s.groupSelected);
  const ungroup = useEditorStore((s) => s.ungroup);
  const setLocked = useEditorStore((s) => s.setLocked);

  const findNode = React.useCallback((node: any, id: string): any => {
    if (node.id === id) return node;
    for (const c of node.children || []) {
      const f = findNode(c, id);
      if (f) return f;
    }
    return null;
  }, []);
  const selectedNodes = selectedIds
    .map((id) => findNode(root, id))
    .filter(Boolean);
  const canUngroup =
    selectedNodes.length === 1 && selectedNodes[0].type === 'group';
  const allLocked =
    selectedNodes.length > 0 && selectedNodes.every((n: any) => n.locked);

  const sensors = useSensors(useSensor(PointerSensor));

  return (
    <DndContext
      sensors={sensors}
      onDragEnd={(e) => {
        if (e.over?.id === 'canvas') {
          const type = e.active.data.current?.type;
          if (type) addNode(type);
        }
      }}
    >
      <div className="grid grid-cols-[200px_1fr_250px] h-screen">
        <ComponentLibrary />
        <Canvas />
        <PropertyPanel />
      </div>
      <div className="absolute top-2 right-2 space-x-2">
        <button className="px-2 py-1 border rounded" onClick={undo}>
          Undo
        </button>
        <button className="px-2 py-1 border rounded" onClick={redo}>
          Redo
        </button>
        <button
          className="px-2 py-1 border rounded"
          disabled={selectedIds.length < 2}
          onClick={groupSelected}
        >
          Group
        </button>
        <button
          className="px-2 py-1 border rounded"
          disabled={!canUngroup}
          onClick={() => ungroup(selectedIds[0])}
        >
          Ungroup
        </button>
        <button
          className="px-2 py-1 border rounded"
          disabled={selectedIds.length === 0 || allLocked}
          onClick={() => setLocked(selectedIds, true)}
        >
          Lock
        </button>
        <button
          className="px-2 py-1 border rounded"
          disabled={selectedIds.length === 0 || !allLocked}
          onClick={() => setLocked(selectedIds, false)}
        >
          Unlock
        </button>
        {Object.entries(templates).map(([name, tmpl]) => (
          <button
            key={name}
            className="px-2 py-1 border rounded"
            onClick={() => applyTemplate(tmpl)}
          >
            {name}
          </button>
        ))}
      </div>
      <ContextMenu />
    </DndContext>
  );
};

