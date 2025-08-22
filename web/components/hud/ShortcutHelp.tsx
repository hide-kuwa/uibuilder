'use client';
import { Command } from '@/lib/keymap';

const shortcuts: [string, string][] = [
  ['V', 'Select'],
  ['F', 'Frame'],
  ['R', 'Rect'],
  ['T', 'Text'],
  ['Cmd/Ctrl + D', 'Duplicate'],
  ['Delete', 'Remove'],
];

export default function ShortcutHelp() {
  return (
    <div className="fixed bottom-2 right-2 bg-gray-800 text-xs text-white p-2 rounded pointer-events-auto">
      <ul>
        {shortcuts.map(([k, d]) => (
          <li key={k}>
            <span className="font-mono mr-2">{k}</span>
            {d}
          </li>
        ))}
      </ul>
    </div>
  );
}
