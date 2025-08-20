import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useEditorActions } from './store';
import dashboard from '../templates/dashboard';
import { library as components } from '../lib/registry';

interface ComponentMeta {
  displayName: string;
  description?: string;
}

interface ComponentPaletteProps {
  onInsert?: (displayName: string) => void;
}

const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onInsert }) => {
  const { loadTemplate, addComponent } = useEditorActions();
  const [dynamicComponents, setDynamicComponents] = useState<ComponentMeta[]>([]);
  const [query, setQuery] = useState('');
  const [template, setTemplate] = useState('');

  // 外部の component-meta.json から追加ロード
  useEffect(() => {
    let cancelled = false;
    fetch('/component-meta.json')
      .then((res) => res.json())
      .then((data: ComponentMeta[]) => {
        if (!cancelled) setDynamicComponents(data);
      })
      .catch(() => {
        if (!cancelled) setDynamicComponents([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // registry + 外部ロード結果を統合して検索対象にする
  const allComponents = [...components, ...dynamicComponents];
  const filtered = allComponents.filter((c) =>
    c.displayName.toLowerCase().includes(query.toLowerCase())
  );

  const applyTemplate = (name: string) => {
    if (name === 'dashboard') loadTemplate(dashboard);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white p-2 space-y-2">
        <select
          value={template}
          onChange={(e) => {
            setTemplate(e.target.value);
            applyTemplate(e.target.value);
          }}
          className="w-full border rounded px-2 py-1"
        >
          <option value="">テンプレート</option>
          <option value="dashboard">Dashboard</option>
        </select>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search components..."
          className="w-full border rounded px-2 py-1"
        />
      </div>
      <DragDropContext onDragEnd={() => {}}>
        <Droppable droppableId="component-palette" isDropDisabled>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className="grid grid-cols-2 gap-2 p-2"
            >
              {filtered.map((c, idx) => (
                <Draggable
                  key={c.displayName}
                  draggableId={c.displayName}
                  index={idx}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      onClick={() =>
                        onInsert ? onInsert(c.displayName) : addComponent(c.displayName)
                      }
                      className="bg-gray-100 rounded p-2 cursor-pointer hover:bg-gray-200"
                    >
                      <div className="text-sm font-medium">{c.displayName}</div>
                      {c.description && (
                        <div className="text-xs text-gray-500">
                          {c.description}
                        </div>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default ComponentPalette;
