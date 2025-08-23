'use client';
import { COMMANDS } from '@/lib/commands';

export default function ShortcutHelp() {
  const list = COMMANDS.filter((c) => c.shortcut);
  return (
    <div className="fixed bottom-2 right-2 bg-gray-800 text-xs text-white p-2 rounded pointer-events-auto">
      <ul>
        {list.map((c) => (
          <li key={c.id} className="whitespace-nowrap">
            <span className="font-mono mr-2">{c.shortcut}</span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
