'use client';
import LeftPanel from './LeftPanel';
import CanvasStage from './CanvasStage';
import RightPane from './RightPane';
import CommandPalette from './CommandPalette';
import ContextMenu from './ContextMenu';
import ExportDialog from './ExportDialog';
import ShareButton from './ShareButton';
import { useState, useEffect } from 'react';
import { getCommand } from '@/lib/keymap';
import { COMMANDS } from '@/lib/commands';
import { useEditorStore } from '@/store/editorStore';

export default function EditorShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmd = getCommand(e);
      if (!cmd) return;
      if (cmd === 'tool.pen') {
        e.preventDefault();
        useEditorStore.getState().startPen();
        return;
      }
      if (cmd === 'tool.select') {
        e.preventDefault();
        useEditorStore.getState().cancelPen();
        return;
      }
      if (cmd === 'path.confirm') {
        e.preventDefault();
        useEditorStore.getState().closePath();
        return;
      }
      if (cmd === 'path.cancel') {
        e.preventDefault();
        useEditorStore.getState().cancelPen();
        return;
      }
      if (cmd === 'path.deleteLast') {
        e.preventDefault();
        useEditorStore.getState().deleteLast();
        return;
      }
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
      <RightPane />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ContextMenu />
      <ExportDialog open={exportOpen} onClose={() => setExportOpen(false)} />
    </div>
  );
}
