import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useCommands, Command } from '../commands';

function fuzzyMatch(query: string, text: string): boolean {
  let qi = 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) qi++;
  }
  return qi === q.length;
}

const CommandPalette: React.FC = () => {
  const commands = useCommands();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const results = useMemo(() => {
    if (!query) return commands;
    return commands.filter((c) => {
      const text = c.title + ' ' + (c.keywords?.join(' ') || '');
      return fuzzyMatch(query, text);
    });
  }, [commands, query]);

  const run = (cmd: Command) => {
    cmd.run();
    setOpen(false);
  };

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-24 z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white w-[560px] rounded shadow-lg overflow-hidden text-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
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
              setOpen(false);
            }
          }}
          className="w-full px-4 py-2 border-b outline-none"
          placeholder="Search commands..."
        />
        <ul className="max-h-72 overflow-y-auto">
          {results.map((c, i) => (
            <li
              key={c.id}
              className={`px-4 py-2 cursor-pointer ${
                i === index ? 'bg-gray-100' : ''
              }`}
              onMouseEnter={() => setIndex(i)}
              onClick={() => run(c)}
            >
              {c.title}
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;
