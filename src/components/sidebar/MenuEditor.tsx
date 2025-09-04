'use client';

import { useState } from 'react';
import type { NestedMenuItem } from '../../lib/router/scanRoutes';

interface MenuEditorProps {
  items: NestedMenuItem[];
  onChange?: (items: NestedMenuItem[]) => void;
}

export default function MenuEditor({ items, onChange }: MenuEditorProps) {
  const [local, setLocal] = useState<NestedMenuItem[]>(items);

  const update = (next: NestedMenuItem[]) => {
    setLocal(next);
    onChange?.(next);
  };

  const toggleHidden = (id: string) => {
    const walk = (arr: NestedMenuItem[]): NestedMenuItem[] =>
      arr.map(n =>
        n.id === id
          ? { ...n, hidden: !n.hidden }
          : { ...n, children: n.children ? walk(n.children) : undefined }
      );
    update(walk(local));
  };

  const rename = (id: string, label: string) => {
    const walk = (arr: NestedMenuItem[]): NestedMenuItem[] =>
      arr.map(n =>
        n.id === id
          ? { ...n, label }
          : { ...n, children: n.children ? walk(n.children) : undefined }
      );
    update(walk(local));
  };

  const render = (arr: NestedMenuItem[]) => (
    <ul className="pl-4 space-y-1">
      {arr.map(n => (
        <li key={n.id} className="space-y-1">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!n.hidden}
              onChange={() => toggleHidden(n.id)}
            />
            <input
              type="text"
              value={n.label}
              onChange={e => rename(n.id, e.target.value)}
              className="border p-1 rounded flex-1"
            />
          </div>
          {n.children && n.children.length ? render(n.children) : null}
        </li>
      ))}
    </ul>
  );

  return <div>{render(local)}</div>;
}
