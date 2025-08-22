'use client';
import { useState, useEffect } from 'react';
import { COMMANDS } from '@/lib/commands';

export default function ContextMenu() {
  const [pos, setPos] = useState<{x:number;y:number}|null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.button === 2) {
        e.preventDefault();
        setPos({ x: e.clientX, y: e.clientY });
      } else {
        setPos(null);
      }
    };
    window.addEventListener('contextmenu', handler);
    window.addEventListener('click', () => setPos(null));
    return () => {
      window.removeEventListener('contextmenu', handler);
      window.removeEventListener('click', () => setPos(null));
    };
  }, []);

  if (!pos) return null;

  return (
    <ul
      className="fixed bg-gray-800 text-sm rounded shadow-lg z-50"
      style={{ left: pos.x, top: pos.y }}
    >
      {COMMANDS.filter((c) => c.id.startsWith('align') || c.id.startsWith('order')).map((c) => (
        <li key={c.id} className="px-4 py-2 cursor-pointer hover:bg-gray-700" onClick={() => c.run()}>
          {c.label}
        </li>
      ))}
    </ul>
  );
}
