'use client';
import { useState, useMemo, useEffect } from 'react';
import { COMMANDS, Command, runCommand } from '@/lib/commands';
import { useEditorStore } from '@/store/editorStore';
import type { ComponentNode } from '@/types/editor';
import { getWorldAABB } from '@/lib/geometry';
import { fitRect } from '@/lib/zoom';

interface Item extends Command {}

function searchNodes(nodes: ComponentNode[], q: string, acc: Item[]): void {
  for (const n of nodes) {
    if (n.name && n.name.toLowerCase().includes(q)) {
      acc.push({
        id: `node.${n.id}`,
        title: n.name,
        run: () => {
          const store = useEditorStore.getState();
          store.select([n.id]);
          const rect = getWorldAABB(n.id, store);
          const cam = fitRect(store.camera, rect);
          store.tweenCamera(cam, { duration: 0 });
        },
      });
    }
    if (n.children) searchNodes(n.children, q, acc);
  }
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const tree = useEditorStore((s) => s.tree);
  const recentIds = useEditorStore((s) => s.recentCommands);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const recent = useMemo(() => {
    return recentIds
      .map((id) => COMMANDS.find((c) => c.id === id))
      .filter((c): c is Command => Boolean(c));
  }, [recentIds]);

  const sections = useMemo(() => {
    const q = query.toLowerCase();
    const cmdResults = COMMANDS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.keywords?.some((k) => k.includes(q)),
    );
    const nodeResults: Item[] = [];
    if (q) searchNodes(tree, q, nodeResults);
    const secs: { title: string; items: Item[] }[] = [];
    if (recent.length) secs.push({ title: 'Recent', items: recent });
    if (cmdResults.length) secs.push({ title: 'Commands', items: cmdResults });
    if (nodeResults.length) secs.push({ title: 'Layers', items: nodeResults });
    return secs;
  }, [query, tree, recent]);

  const items = sections.flatMap((s) => s.items);

  useEffect(() => {
    setIndex(0);
  }, [query, sections.length]);

  const run = (item: Item) => {
    if (!runCommand(item.id)) item.run();
    setOpen(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-24 pointer-events-auto"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-[560px] rounded bg-gray-800 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIndex((i) => Math.min(i + 1, items.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              const item = items[index];
              if (item) run(item);
            } else if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="w-full bg-gray-700 px-4 py-2 outline-none"
          placeholder="Search commands..."
        />
        <ul className="max-h-72 overflow-y-auto">
          {sections.map((sec, sIdx) => (
            <li key={sec.title}>
              <div className="px-4 py-1 text-xs opacity-60">{sec.title}</div>
              {sec.items.map((c, i) => {
                const pos = sections
                  .slice(0, sIdx)
                  .reduce((sum, s) => sum + s.items.length, 0) + i;
                return (
                  <div
                    key={c.id}
                    className={`px-4 py-2 cursor-pointer ${pos === index ? 'bg-gray-700' : ''}`}
                    onMouseEnter={() => setIndex(pos)}
                    onClick={() => run(c)}
                  >
                    <span>{c.title}</span>
                    {'shortcut' in c && c.shortcut && (
                      <span className="float-right opacity-60">{c.shortcut}</span>
                    )}
                  </div>
                );
              })}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
