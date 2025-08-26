'use client';
import LeftPanel from './LeftPanel';
import CanvasStage from './CanvasStage';
import RightPane from './RightPane';
import CommandPalette from './CommandPalette';
import ContextMenu from './ContextMenu';
import ShareButton from './ShareButton';
import { useState, useEffect } from 'react';
import { getCommand } from '@/lib/keymap';
import { COMMANDS, runCommand } from '@/lib/commands';
import { useEditorStore } from '@/store/editorStore';
import { DeviceFrame } from '@/components/hud/DeviceFrame';
import { GridOverlay } from '@/components/hud/GridOverlay';
import { BuilderHUD } from '@/components/hud/BuilderHUD';

export default function EditorShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);

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
        runCommand(found.id);
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  }, []);

  return (
    <>
      <div className="grid grid-cols-[280px_1fr_320px] h-screen text-white">
        <LeftPanel />
        <div className="relative h-full bg-[#0b1220]">
          <div className="absolute top-2 right-2 z-10"><ShareButton /></div>
          <DeviceFrame>
            <div className="relative w-full h-full">
              <CanvasStage />
              <GridOverlay />
            </div>
          </DeviceFrame>
        </div>
        <RightPane />
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ContextMenu />
      <BuilderHUD />
    </>
  );
}
