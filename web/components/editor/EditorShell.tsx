'use client';
import LeftPanel from './LeftPanel';
import CanvasStage from './CanvasStage';
import RightPane from './RightPane';
import CommandPalette from './CommandPalette';
import ContextMenu from './ContextMenu';
import ShareButton from './ShareButton';
import { useState, useEffect, useRef } from 'react';
import { DeviceFrame } from '@/components/hud/DeviceFrame';
import { GridOverlay } from '@/components/hud/GridOverlay';
import { RulersOverlay } from '@/components/hud/RulersOverlay';
import { BuilderHUD } from '@/components/hud/BuilderHUD';
import { PresetApplyListener } from '@/components/editor/PresetApplyListener';
import KeyboardHandler from '@/components/shell/KeyboardHandler';

export default function EditorShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const open = () => setPaletteOpen(true);
    window.addEventListener('uibuilder:commandPalette', open);
    return () => window.removeEventListener('uibuilder:commandPalette', open);
  }, []);

  return (
    <>
      <KeyboardHandler />
      <div className="grid grid-cols-[280px_1fr_320px] h-screen text-white">
        <LeftPanel />
        <div className="relative h-full bg-[#0b1220]">
          <div className="absolute top-2 right-2 z-10"><ShareButton /></div>
          <DeviceFrame>
            <div ref={canvasRef} className="relative w-full h-full">
              <CanvasStage />
              <GridOverlay />
              <RulersOverlay containerRef={canvasRef} />
            </div>
          </DeviceFrame>
        </div>
        <RightPane />
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ContextMenu />
      <BuilderHUD />
      <PresetApplyListener canvasRef={canvasRef} />
    </>
  );
}
