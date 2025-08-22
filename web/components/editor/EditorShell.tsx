'use client';
import LeftPanel from './LeftPanel';
import CanvasStage from './CanvasStage';
import RightInspector from './RightInspector';
import CommandPalette from './CommandPalette';
import ContextMenu from './ContextMenu';
import { useState, useEffect } from 'react';
import { getCommand } from '@/lib/keymap';
import { COMMANDS } from '@/lib/commands';

export default function EditorShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmd = getCommand(e);
      if (!cmd) return;
      if (cmd === 'commandPalette') {
        e.preventDefault();
        setPaletteOpen(true);
        return;
      }
      const found = COMMANDS.find((c) => c.id === cmd);
      if (found) {
        e.preventDefault();
        found.run();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="grid grid-cols-[280px_1fr_320px] h-screen text-white">
      <LeftPanel />
      <CanvasStage />
      <RightInspector />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ContextMenu />
    </div>
  );
}
