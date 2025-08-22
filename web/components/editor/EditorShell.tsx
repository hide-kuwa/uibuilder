'use client';
import LeftPanel from './LeftPanel';
import CanvasStage from './CanvasStage';
import RightInspector from './RightInspector';
import CommandPalette from './CommandPalette';
import ContextMenu from './ContextMenu';
import ExportDialog from './ExportDialog';
import ShareButton from './ShareButton';
import { useState, useEffect } from 'react';
import { getCommand } from '@/lib/keymap';
import { COMMANDS } from '@/lib/commands';

export default function EditorShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

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
    const openListener = () => setExportOpen(true);
    window.addEventListener('uibuilder:export', openListener as any);
    return () => {
      window.removeEventListener('keydown', handler);
      window.removeEventListener('uibuilder:export', openListener as any);
    };
  }, []);

  return (
    <div className="grid grid-cols-[280px_1fr_320px] h-screen text-white">
      <LeftPanel />
      <div className="relative">
        <div className="absolute top-2 right-2 z-10"><ShareButton /></div>
        <CanvasStage />
      </div>
      <RightInspector />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ContextMenu />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
