import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { getRegisteredComponents } from './componentRegistry';

const builtin = ['Header', 'Section', 'Button'];

const LibraryItem: React.FC<{ type: string }> = ({ type }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: `lib-${type}`, data: { type } });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="p-2 border rounded bg-white cursor-move"
    >
      {type}
    </div>
  );
};

export const ComponentLibrary: React.FC = () => {
  const registered = getRegisteredComponents().map((c) => c.name);
  const items = [...builtin, ...registered];
  return (
    <div className="p-2 space-y-2 overflow-y-auto h-full bg-gray-50">
      {items.map((t) => (
        <LibraryItem key={t} type={t} />
      ))}
    </div>
  );
};

