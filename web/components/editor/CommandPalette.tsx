'use client';
import { useState, useMemo, useEffect } from 'react';
import { COMMANDS, Command } from '@/lib/commands';
import { useEditorStore } from '@/store/editorStore';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const setLastCommand = useEditorStore((s) => s.setLastCommand);

  const results = useMemo(() => {
    const q = query.toLowerCase();
    return COMMANDS.filter((c) =>
      c.title.toLowerCase().includes(q) || c.keywords?.some((k) => k.includes(q))
    );
  }, [query]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  const run = (cmd: Command) => {
    cmd.run();
    setLastCommand(cmd.id);
    setQuery('');
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50" onClick={onClose}>
      <div
        className="bg-gray-800 w-[560px] rounded shadow-lg" onClick={(e) => e.stopPropagation()}
      >
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIndex((i) => Math.min(i + 1, results.length - 1));
            } else if (e.key === 'ArrowUp') {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === 'Enter') {
              const cmd = results[index];
              if (cmd) run(cmd);
            } else if (e.key === 'Escape') {
              onClose();
            }
          }}
          className="w-full bg-gray-700 px-4 py-2 outline-none"
          placeholder="Search commands..."
        />
        <ul className="max-h-72 overflow-y-auto">
          {results.map((c, i) => (
            <li
              key={c.id}
              className={`px-4 py-2 cursor-pointer ${i === index ? 'bg-gray-700' : ''}`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => run(c)}
            >
              <span>{c.title}</span>
              {c.shortcut && <span className="float-right opacity-60">{c.shortcut}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
