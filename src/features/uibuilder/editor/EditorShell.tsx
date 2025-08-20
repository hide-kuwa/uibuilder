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
import { templates } from './templates';
import './registerComponents';

export const EditorShell: React.FC = () => {
  const addNode = useEditorStore((s) => s.addNode);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const applyTemplate = useEditorStore((s) => s.applyTemplate);

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
    </DndContext>
  );
};

