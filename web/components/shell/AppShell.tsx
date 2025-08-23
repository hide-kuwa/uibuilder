'use client';
import { useState, useEffect } from 'react';
import TopBar from './TopBar';
import LeftPane from './LeftPane';
import RightPane from './RightPane';
import StatusBar from './StatusBar';
import Splitter from './Splitter';
import CanvasStage from '../editor/CanvasStage';
import KeyboardHandler from './KeyboardHandler';
import {
  LEFT_PANE_DEFAULT_WIDTH,
  LEFT_PANE_MIN_WIDTH,
  LEFT_PANE_MAX_WIDTH,
  RIGHT_PANE_DEFAULT_WIDTH,
  RIGHT_PANE_MIN_WIDTH,
  RIGHT_PANE_MAX_WIDTH,
} from '@/lib/layout/constants';
import { loadLayout, saveLayout, LayoutState } from '@/lib/layout/persist';
import '@/styles/shell.css';

export default function AppShell() {
  const [layout, setLayout] = useState<LayoutState>(() => loadLayout());

  useEffect(() => {
    saveLayout(layout);
  }, [layout]);

  const setLeftWidth = (w: number) =>
    setLayout((l) => ({ ...l, left: { ...l.left, width: Math.min(Math.max(w, LEFT_PANE_MIN_WIDTH), LEFT_PANE_MAX_WIDTH) } }));
  const setRightWidth = (w: number) =>
    setLayout((l) => ({ ...l, right: { ...l.right, width: Math.min(Math.max(w, RIGHT_PANE_MIN_WIDTH), RIGHT_PANE_MAX_WIDTH) } }));

  const toggleLeft = () => setLayout((l) => ({ ...l, left: { ...l.left, collapsed: !l.left.collapsed } }));
  const toggleRight = () => setLayout((l) => ({ ...l, right: { ...l.right, collapsed: !l.right.collapsed } }));

  const resetLeft = () => setLayout((l) => ({ ...l, left: { ...l.left, collapsed: false, width: LEFT_PANE_DEFAULT_WIDTH } }));
  const resetRight = () => setLayout((l) => ({ ...l, right: { ...l.right, collapsed: false, width: RIGHT_PANE_DEFAULT_WIDTH } }));

  return (
    <div className="flex flex-col h-screen">
      <KeyboardHandler />
      <TopBar />
      <div className="flex flex-1 min-h-0">
        {!layout.left.collapsed && (
          <div style={{ width: layout.left.width }} className="h-full">
            <LeftPane />
          </div>
        )}
        <Splitter
          onDrag={(d) => setLeftWidth(layout.left.width + d)}
          onReset={resetLeft}
          onToggleCollapse={toggleLeft}
        />
        <div className="flex-1 relative bg-black">
          <CanvasStage />
        </div>
        <Splitter
          onDrag={(d) => setRightWidth(layout.right.width - d)}
          onReset={resetRight}
          onToggleCollapse={toggleRight}
        />
        {!layout.right.collapsed && (
          <div style={{ width: layout.right.width }} className="h-full">
            <RightPane />
          </div>
        )}
      </div>
      <StatusBar />
    </div>
  );
}
