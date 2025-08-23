export interface Command {
  id: string;
  label: string;
  keywords?: string[];
  shortcut?: string;
  run: () => void;
}

import { useEditorStore } from '@/store/editorStore';
import * as zoom from '@/lib/zoom';

export const COMMANDS: Command[] = [
  {
    id: 'align.left',
    label: 'Align Left',
    keywords: ['align', 'left'],
    shortcut: 'Ctrl+Shift+L',
    run: () => useEditorStore.getState().align('left'),
  },
  {
    id: 'align.center.h',
    label: 'Align Horizontal Center',
    shortcut: 'Ctrl+Shift+H',
    run: () => useEditorStore.getState().align('centerH'),
  },
  {
    id: 'distribute.h',
    label: 'Distribute Horizontally',
    shortcut: 'Ctrl+Alt+H',
    run: () => useEditorStore.getState().distribute('h'),
  },
  {
    id: 'order.front',
    label: 'Bring to Front',
    shortcut: 'Ctrl+]',
    run: () => useEditorStore.getState().reorder('front'),
  },
  {
    id: 'view.toggleRulers',
    label: 'Toggle Rulers',
    shortcut: 'Ctrl+R',
    run: () => useEditorStore.getState().toggleRulers(),
  },
  {
    id: 'view.toggleGuides',
    label: 'Toggle Guides',
    shortcut: 'Ctrl+;',
    run: () => useEditorStore.getState().toggleGuides(),
  },
  {
    id: 'view.toggleOutline',
    label: 'Toggle Outline',
    shortcut: 'Ctrl+Y',
    run: () => useEditorStore.getState().toggleOutline(),
  },
  {
    id: 'view.toggleLayoutGrid',
    label: 'Toggle Layout Grid',
    shortcut: 'Ctrl+Shift+G',
    run: () => useEditorStore.getState().toggleLayoutGrid(),
  },
  {
    id: 'view.togglePixelGrid',
    label: 'Toggle Pixel Grid',
    shortcut: "Ctrl+'",
    run: () => useEditorStore.getState().togglePixelGrid(),
  },
  {
    id: 'view.toggleSnapToPixel',
    label: 'Toggle Snap To Pixel',
    shortcut: 'Ctrl+Shift+P',
    run: () => useEditorStore.getState().toggleSnapToPixel(),
  },
  {
    id: 'export',
    label: 'Export',
    shortcut: 'Ctrl+Shift+E',
    run: () => window.dispatchEvent(new CustomEvent('uibuilder:export')),
  },
  {
    id: 'zoom.in',
    label: 'Zoom In',
    shortcut: 'Ctrl++',
    run: () => zoom.zoomBy(1.1),
  },
  {
    id: 'zoom.out',
    label: 'Zoom Out',
    shortcut: 'Ctrl+-',
    run: () => zoom.zoomBy(0.9),
  },
  {
    id: 'zoom.fitAll',
    label: 'Fit All',
    shortcut: 'Shift+1',
    run: () => zoom.fitAll(),
  },
  {
    id: 'zoom.fitSelection',
    label: 'Fit Selection',
    shortcut: 'Shift+2',
    run: () => zoom.fitSelection(),
  },
  {
    id: 'zoom.to100',
    label: 'Zoom to 100%',
    shortcut: '1',
    run: () => zoom.animateZoomTo(1),
  },
];

export function runCommand(id: string): boolean {
  const cmd = COMMANDS.find((c) => c.id === id);
  if (!cmd) return false;
  cmd.run();
  useEditorStore.getState().setLastCommand(id);
  return true;
}
