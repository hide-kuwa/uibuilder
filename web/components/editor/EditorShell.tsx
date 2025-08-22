'use client';
import LeftPanel from './LeftPanel';
import CanvasStage from './CanvasStage';
import RightInspector from './RightInspector';

export default function EditorShell() {
  return (
    <div className="grid grid-cols-[280px_1fr_320px] h-screen text-white">
      <LeftPanel />
      <CanvasStage />
      <RightInspector />
    </div>
  );
}
