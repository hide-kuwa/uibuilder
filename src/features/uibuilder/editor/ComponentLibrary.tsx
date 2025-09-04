import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { getRegisteredComponents, RegisteredComponent, ComponentCategory } from './componentRegistry';
import { useEditorStore } from './useEditorStore';

const categories: (ComponentCategory | 'all')[] = ['all', 'action', 'visual', 'functional', 'layout'];

const LibraryItem: React.FC<{ comp: RegisteredComponent }> = ({ comp }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `lib-${comp.id}`, data: { type: comp.id } });
  const addNode = useEditorStore((s) => s.addNode);
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => addNode(comp.id)}
      className="p-2 border rounded bg-white cursor-move flex items-center gap-2"
    >
      <span>{comp.icon}</span>
      <span>{comp.name}</span>
    </div>
  );
};

export const ComponentLibrary: React.FC = () => {
  const [category, setCategory] = React.useState<(ComponentCategory | 'all')>('all');
  const [search, setSearch] = React.useState('');
  const components = getRegisteredComponents(category === 'all' ? undefined : category).filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="p-2 h-full bg-gray-50 flex flex-col">
      <div className="flex gap-2 mb-2">
        <select
          className="border p-1 flex-1"
          value={category}
          onChange={(e) => setCategory(e.target.value as any)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>
        <input
          className="border p-1 flex-1"
          placeholder="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="space-y-2 overflow-y-auto">
        {components.map((c) => (
          <LibraryItem key={c.id} comp={c} />
        ))}
        {!components.length && <div className="text-gray-400">No components</div>}
      </div>
    </div>
  );
};

